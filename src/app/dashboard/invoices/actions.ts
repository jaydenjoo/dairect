"use server";

import { db } from "@/lib/db";
import {
  invoices,
  estimates,
  projects,
  clients,
  userSettings,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import {
  invoiceManualFormSchema,
  invoiceFromEstimateSchema,
  markPaidSchema,
  invoiceStatusSchema,
  type InvoiceManualFormData,
  type InvoiceFromEstimateData,
  type MarkPaidData,
  type InvoiceStatus,
  type InvoiceType,
} from "@/lib/validation/invoices";
import {
  paymentSplitItemSchema,
  bankInfoSchema,
  type BankInfo,
} from "@/lib/validation/settings";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
  ids?: string[];
};

const uuidSchema = z.string().uuid();

// ─── 상태 전이 규칙 (정산 증빙 무결성) ───
const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  pending: ["sent", "cancelled"],
  sent: ["paid", "cancelled"],
  paid: [],
  overdue: ["paid", "cancelled"],
  cancelled: [],
};

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

// ─── 채번: INV-2026-001 (트랜잭션 내에서 호출) ───

async function generateInvoiceNumber(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  offset: number = 0,
): Promise<string> {
  const settingsRows = await tx
    .select({ invoiceNumberPrefix: userSettings.invoiceNumberPrefix })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const prefix = settingsRows[0]?.invoiceNumberPrefix ?? "INV";
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

  const maxRows = await tx
    .select({
      maxNum: sql<string>`max(substring(${invoices.invoiceNumber} from '\\d+$'))`,
    })
    .from(invoices)
    .where(
      and(eq(invoices.userId, userId), like(invoices.invoiceNumber, pattern)),
    );

  // 같은 트랜잭션 내 N회 호출 시 직전 INSERT가 커밋 전이라 MAX에 반영 안됨.
  // offset으로 중복을 방어 (자동 3분할 등 일괄 INSERT 시나리오)
  const nextNum = (parseInt(maxRows[0]?.maxNum ?? "0", 10) || 0) + 1 + offset;
  return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
}

// ─── 청구서 PDF용 사업자 정보 + 송금계좌 ───

export type BillingInfo = {
  companyName: string | null;
  representativeName: string | null;
  businessNumber: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  bankInfo: BankInfo | null;
};

export async function getUserBillingInfo(): Promise<BillingInfo | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const rows = await db
    .select({
      companyName: userSettings.companyName,
      representativeName: userSettings.representativeName,
      businessNumber: userSettings.businessNumber,
      businessAddress: userSettings.businessAddress,
      businessPhone: userSettings.businessPhone,
      businessEmail: userSettings.businessEmail,
      bankInfo: userSettings.bankInfo,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (!rows[0]) return null;

  const bankParsed = bankInfoSchema.safeParse(rows[0].bankInfo);

  return {
    companyName: rows[0].companyName,
    representativeName: rows[0].representativeName,
    businessNumber: rows[0].businessNumber,
    businessAddress: rows[0].businessAddress,
    businessPhone: rows[0].businessPhone,
    businessEmail: rows[0].businessEmail,
    bankInfo: bankParsed.success ? bankParsed.data : null,
  };
}

// ─── 목록 (overdue는 쿼리 시점 계산) ───

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issuedDate: string | null;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: Date | null;
  projectName: string | null;
  clientName: string | null;
  isOverdue: boolean;
};

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      type: invoices.type,
      status: invoices.status,
      amount: invoices.amount,
      taxAmount: invoices.taxAmount,
      totalAmount: invoices.totalAmount,
      issuedDate: invoices.issuedDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      createdAt: invoices.createdAt,
      projectName: projects.name,
      clientName: clients.companyName,
    })
    .from(invoices)
    .leftJoin(projects, eq(projects.id, invoices.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));

  const today = new Date().toISOString().slice(0, 10);

  return rows.map((r) => ({
    ...r,
    status: (r.status ?? "pending") as InvoiceStatus,
    isOverdue:
      r.status === "sent" && r.dueDate !== null && r.dueDate < today,
  }));
}

// ─── 생성 폼 옵션: 프로젝트 + accepted 견적서 ───

export async function getInvoiceFormOptions() {
  const userId = await getUserId();
  if (!userId) return { projects: [], estimates: [] };

  const [projectRows, estimateRows] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        clientName: clients.companyName,
      })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: estimates.id,
        estimateNumber: estimates.estimateNumber,
        title: estimates.title,
        supplyAmount: estimates.supplyAmount,
        taxAmount: estimates.taxAmount,
        totalAmount: estimates.totalAmount,
        paymentSplit: estimates.paymentSplit,
        projectId: estimates.projectId,
        projectName: projects.name,
        clientName: clients.companyName,
      })
      .from(estimates)
      .leftJoin(projects, eq(projects.id, estimates.projectId))
      .leftJoin(clients, eq(clients.id, estimates.clientId))
      .where(
        and(
          eq(estimates.userId, userId),
          eq(estimates.status, "accepted"),
        ),
      )
      .orderBy(desc(estimates.createdAt)),
  ]);

  return { projects: projectRows, estimates: estimateRows };
}

// ─── 상세 (회사 정보 + 프로젝트/고객/견적서 스냅샷) ───

export async function getInvoice(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  if (!uuidSchema.safeParse(id).success) return null;

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      type: invoices.type,
      status: invoices.status,
      amount: invoices.amount,
      taxAmount: invoices.taxAmount,
      totalAmount: invoices.totalAmount,
      issuedDate: invoices.issuedDate,
      dueDate: invoices.dueDate,
      sentAt: invoices.sentAt,
      paidDate: invoices.paidDate,
      paidAmount: invoices.paidAmount,
      taxInvoiceIssued: invoices.taxInvoiceIssued,
      memo: invoices.memo,
      createdAt: invoices.createdAt,
      projectId: invoices.projectId,
      estimateId: invoices.estimateId,
      projectName: projects.name,
      projectStartDate: projects.startDate,
      projectEndDate: projects.endDate,
      clientName: clients.companyName,
      clientContactName: clients.contactName,
      clientBusinessNumber: clients.businessNumber,
      clientAddress: clients.address,
      estimateNumber: estimates.estimateNumber,
      estimateTitle: estimates.title,
    })
    .from(invoices)
    .leftJoin(projects, eq(projects.id, invoices.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(estimates, eq(estimates.id, invoices.estimateId))
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;

  const today = new Date().toISOString().slice(0, 10);
  const status = (rows[0].status ?? "pending") as InvoiceStatus;
  const isOverdue =
    status === "sent" && rows[0].dueDate !== null && rows[0].dueDate < today;

  return { ...rows[0], status, isOverdue };
}

// ─── 수동 생성 (프로젝트 + type + 금액 직접 입력) ───

export async function createInvoiceAction(
  data: InvoiceManualFormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const parsed = invoiceManualFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };

  const v = parsed.data;

  // 프로젝트 소유권 검증
  const projectRows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, v.projectId), eq(projects.userId, userId)))
    .limit(1);

  if (projectRows.length === 0)
    return { success: false, error: "유효하지 않은 프로젝트입니다" };

  // 견적서 소유권 검증 (있는 경우)
  if (v.estimateId) {
    const estimateRows = await db
      .select({ id: estimates.id })
      .from(estimates)
      .where(and(eq(estimates.id, v.estimateId), eq(estimates.userId, userId)))
      .limit(1);

    if (estimateRows.length === 0)
      return { success: false, error: "유효하지 않은 견적서입니다" };
  }

  const totalAmount = v.amount + v.taxAmount;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const row = await db.transaction(async (tx) => {
        const invoiceNumber = await generateInvoiceNumber(tx, userId);
        const [inserted] = await tx
          .insert(invoices)
          .values({
            userId,
            projectId: v.projectId,
            estimateId: v.estimateId ?? null,
            invoiceNumber,
            type: v.type,
            status: "pending",
            amount: v.amount,
            taxAmount: v.taxAmount,
            totalAmount,
            issuedDate: v.issuedDate,
            dueDate: v.dueDate,
            memo: v.memo || null,
          })
          .returning({ id: invoices.id });
        return inserted;
      });

      revalidatePath("/dashboard/invoices");
      return { success: true, id: row.id };
    } catch (err) {
      if (isUniqueViolation(err) && attempt === 0) continue;
      console.error("[createInvoiceAction]", err);
      return { success: false, error: "청구서 생성 중 오류가 발생했습니다" };
    }
  }

  return { success: false, error: "청구서 생성 중 오류가 발생했습니다" };
}

// ─── 견적서 기반 3분할 자동 생성 (advance/interim/final) ───

function splitAmountByRatio(
  total: number,
  percentages: number[],
): number[] {
  const raws = percentages.map((p) => Math.floor((total * p) / 100));
  const diff = total - raws.reduce((a, b) => a + b, 0);
  if (raws.length > 0) raws[raws.length - 1] += diff;
  return raws;
}

const TYPE_BY_INDEX: InvoiceType[] = ["advance", "interim", "final"];

export async function generateInvoicesFromEstimateAction(
  data: InvoiceFromEstimateData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const parsed = invoiceFromEstimateSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };

  const v = parsed.data;

  // 견적서 소유권 + accepted 상태 + 금액/분할 정보 조회
  const estimateRows = await db
    .select({
      id: estimates.id,
      status: estimates.status,
      projectId: estimates.projectId,
      paymentSplit: estimates.paymentSplit,
      supplyAmount: estimates.supplyAmount,
      taxAmount: estimates.taxAmount,
    })
    .from(estimates)
    .where(
      and(eq(estimates.id, v.estimateId), eq(estimates.userId, userId)),
    )
    .limit(1);

  if (estimateRows.length === 0)
    return { success: false, error: "유효하지 않은 견적서입니다" };

  const e = estimateRows[0];

  if (e.status !== "accepted")
    return {
      success: false,
      error: "수락된 견적서만 청구서로 전환할 수 있습니다",
    };

  if (e.projectId === null)
    return {
      success: false,
      error: "견적서에 연결된 프로젝트가 없습니다",
    };

  if (e.supplyAmount === null || e.taxAmount === null)
    return { success: false, error: "견적서에 금액 정보가 없습니다" };

  if (e.supplyAmount <= 0)
    return {
      success: false,
      error: "금액이 0원 이하인 견적서는 청구서로 전환할 수 없습니다",
    };

  // paymentSplit 안전 파싱 (JSONB → 배열)
  const splitParsed = z.array(paymentSplitItemSchema).safeParse(e.paymentSplit);
  const splitItems = splitParsed.success ? splitParsed.data : [];

  if (splitItems.length === 0)
    return {
      success: false,
      error: "견적서에 수금 비율이 설정되어 있지 않습니다",
    };

  if (splitItems.length > 3)
    return {
      success: false,
      error: "청구서 자동 생성은 최대 3분할까지 지원합니다",
    };

  const supplySplits = splitAmountByRatio(
    e.supplyAmount,
    splitItems.map((s) => s.percentage),
  );
  const taxSplits = splitAmountByRatio(
    e.taxAmount,
    splitItems.map((s) => s.percentage),
  );

  const issuedBase = new Date(v.issuedDate);
  if (Number.isNaN(issuedBase.getTime()))
    return { success: false, error: "발행일 형식이 올바르지 않습니다" };

  const due = new Date(issuedBase);
  due.setDate(due.getDate() + v.dueDateIntervalDays);
  const dueDate = due.toISOString().slice(0, 10);

  const createdIds: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ids = await db.transaction(async (tx) => {
        const inserted: string[] = [];
        for (let i = 0; i < splitItems.length; i++) {
          const invoiceNumber = await generateInvoiceNumber(tx, userId, i);
          const type = TYPE_BY_INDEX[i] ?? "final";
          const amount = supplySplits[i];
          const taxAmount = taxSplits[i];
          const totalAmount = amount + taxAmount;

          const [row] = await tx
            .insert(invoices)
            .values({
              userId,
              projectId: e.projectId,
              estimateId: e.id,
              invoiceNumber,
              type,
              status: "pending",
              amount,
              taxAmount,
              totalAmount,
              issuedDate: v.issuedDate,
              dueDate,
              memo: `${splitItems[i].label} (견적서 자동 생성)`,
            })
            .returning({ id: invoices.id });

          inserted.push(row.id);
        }
        return inserted;
      });

      createdIds.push(...ids);
      revalidatePath("/dashboard/invoices");
      return { success: true, ids: createdIds };
    } catch (err) {
      if (isUniqueViolation(err) && attempt === 0) continue;
      console.error("[generateInvoicesFromEstimateAction]", err);
      return {
        success: false,
        error: "청구서 자동 생성 중 오류가 발생했습니다",
      };
    }
  }

  return { success: false, error: "청구서 자동 생성 중 오류가 발생했습니다" };
}

// ─── 상태 전이 (sentAt 자동 기록) ───

export async function updateInvoiceStatusAction(
  id: string,
  status: InvoiceStatus,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  const parsed = invoiceStatusSchema.safeParse(status);
  if (!parsed.success)
    return { success: false, error: "올바르지 않은 상태값입니다" };

  const currentRows = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (currentRows.length === 0)
    return {
      success: false,
      error: "권한이 없거나 존재하지 않는 청구서입니다",
    };

  const currentStatus = (currentRows[0].status ?? "pending") as InvoiceStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(parsed.data))
    return {
      success: false,
      error: `${currentStatus} 상태에서 ${parsed.data}로 변경할 수 없습니다`,
    };

  try {
    const setValues: {
      status: InvoiceStatus;
      sentAt?: Date;
      updatedAt: Date;
    } = {
      status: parsed.data,
      updatedAt: new Date(),
    };
    if (parsed.data === "sent") setValues.sentAt = new Date();

    await db
      .update(invoices)
      .set(setValues)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[updateInvoiceStatusAction]", err);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

// ─── 입금 확인 (paid로 전이 + paidDate/paidAmount 기록) ───

export async function markPaidAction(
  id: string,
  data: MarkPaidData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  const parsed = markPaidSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };

  const currentRows = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (currentRows.length === 0)
    return {
      success: false,
      error: "권한이 없거나 존재하지 않는 청구서입니다",
    };

  const currentStatus = (currentRows[0].status ?? "pending") as InvoiceStatus;
  if (!ALLOWED_TRANSITIONS[currentStatus].includes("paid"))
    return {
      success: false,
      error: `${currentStatus} 상태에서는 입금 처리할 수 없습니다`,
    };

  try {
    await db
      .update(invoices)
      .set({
        status: "paid",
        paidDate: parsed.data.paidDate,
        paidAmount: parsed.data.paidAmount,
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[markPaidAction]", err);
    return { success: false, error: "입금 처리 중 오류가 발생했습니다" };
  }
}

// ─── 세금계산서 발행 여부 토글 ───

export async function toggleTaxInvoiceAction(
  id: string,
  issued: boolean,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  // 소유권 + 상태 검증 (세무 감사 증빙 무결성)
  const rows = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (rows.length === 0)
    return {
      success: false,
      error: "권한이 없거나 존재하지 않는 청구서입니다",
    };

  const s = (rows[0].status ?? "pending") as InvoiceStatus;

  if (s === "cancelled")
    return {
      success: false,
      error: "취소된 청구서의 세금계산서 상태는 변경할 수 없습니다",
    };

  // 발행 완료 표시는 입금 완료된 청구서만 허용 (세무 감사 대비)
  if (issued && s !== "paid")
    return {
      success: false,
      error: "입금 완료된 청구서만 세금계산서 발행 처리할 수 있습니다",
    };

  try {
    await db
      .update(invoices)
      .set({ taxInvoiceIssued: issued, updatedAt: new Date() })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    revalidatePath(`/dashboard/invoices/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[toggleTaxInvoiceAction]", err);
    return { success: false, error: "세금계산서 상태 변경 실패" };
  }
}

// ─── 삭제 (pending/cancelled만 허용) ───

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  const ownerRows = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (ownerRows.length === 0)
    return {
      success: false,
      error: "권한이 없거나 존재하지 않는 청구서입니다",
    };

  const s = (ownerRows[0].status ?? "pending") as InvoiceStatus;
  if (s !== "pending" && s !== "cancelled")
    return {
      success: false,
      error: "미청구 또는 취소 상태의 청구서만 삭제할 수 있습니다",
    };

  try {
    // 방어적 이중 필터: 선행 소유권 조회가 리팩토링으로 제거돼도 보호
    await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    revalidatePath("/dashboard/invoices");
    return { success: true };
  } catch (err) {
    console.error("[deleteInvoiceAction]", err);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
