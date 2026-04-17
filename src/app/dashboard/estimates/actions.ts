"use server";

import { db } from "@/lib/db";
import {
  estimates,
  estimateItems,
  clients,
  projects,
  userSettings,
  contracts,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import {
  estimateFormSchema,
  estimateStatusSchema,
  type EstimateFormData,
  type EstimateStatus,
} from "@/lib/validation/estimates";
import { paymentSplitItemSchema } from "@/lib/validation/settings";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string; id?: string };

const uuidSchema = z.string().uuid();

// ─── 채번: EST-2026-001 (트랜잭션 내에서 호출) ───

async function generateEstimateNumber(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
): Promise<string> {
  const settingsRows = await tx
    .select({ estimateNumberPrefix: userSettings.estimateNumberPrefix })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const prefix = settingsRows[0]?.estimateNumberPrefix ?? "EST";
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

  const maxRows = await tx
    .select({
      maxNum: sql<string>`max(substring(${estimates.estimateNumber} from '\\d+$'))`,
    })
    .from(estimates)
    .where(
      and(
        eq(estimates.userId, userId),
        like(estimates.estimateNumber, pattern),
      ),
    );

  const nextNum = (parseInt(maxRows[0]?.maxNum ?? "0", 10) || 0) + 1;
  return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
}

// ─── PDF 생성용 사업자 정보 ───

export async function getUserCompanyInfo(): Promise<CompanyInfo | null> {
  try {
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
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return rows[0] ?? null;
  } catch (err) {
    console.error("[getUserCompanyInfo]", err);
    return null;
  }
}

export type CompanyInfo = {
  companyName: string | null;
  representativeName: string | null;
  businessNumber: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
};

// ─── 설정 기본값 (일 단가, 수금 비율) ───

export async function getEstimateDefaults() {
  const userId = await getUserId();
  if (!userId) return { dailyRate: 700000, paymentSplit: [
    { label: "착수금", percentage: 30 },
    { label: "중도금", percentage: 40 },
    { label: "잔금", percentage: 30 },
  ] };

  const rows = await db
    .select({
      dailyRate: userSettings.dailyRate,
      defaultPaymentSplit: userSettings.defaultPaymentSplit,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const row = rows[0];
  const defaultSplit = [
    { label: "착수금", percentage: 30 },
    { label: "중도금", percentage: 40 },
    { label: "잔금", percentage: 30 },
  ];

  if (!row) return { dailyRate: 700000, paymentSplit: defaultSplit };

  const parsedSplit = z.array(paymentSplitItemSchema).safeParse(row.defaultPaymentSplit);

  return {
    dailyRate: row.dailyRate ?? 700000,
    paymentSplit: parsedSplit.success ? parsedSplit.data : defaultSplit,
  };
}

// ─── 고객/프로젝트 드롭다운용 ───

export async function getClientsForSelect() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({ id: clients.id, companyName: clients.companyName })
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.companyName);
}

export async function getProjectsForSelect() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

// ─── 견적서 목록 ───

export async function getEstimates() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({
      id: estimates.id,
      estimateNumber: estimates.estimateNumber,
      title: estimates.title,
      status: estimates.status,
      totalAmount: estimates.totalAmount,
      totalDays: estimates.totalDays,
      validUntil: estimates.validUntil,
      createdAt: estimates.createdAt,
      clientName: clients.companyName,
    })
    .from(estimates)
    .leftJoin(clients, eq(clients.id, estimates.clientId))
    .where(eq(estimates.userId, userId))
    .orderBy(desc(estimates.createdAt));
}

// ─── 견적서 상세 (I2: UUID 검증 추가) ───

export async function getEstimate(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  if (!uuidSchema.safeParse(id).success) return null;

  const rows = await db
    .select({
      id: estimates.id,
      estimateNumber: estimates.estimateNumber,
      title: estimates.title,
      status: estimates.status,
      validUntil: estimates.validUntil,
      inputMode: estimates.inputMode,
      paymentSplit: estimates.paymentSplit,
      supplyAmount: estimates.supplyAmount,
      taxAmount: estimates.taxAmount,
      totalAmount: estimates.totalAmount,
      totalDays: estimates.totalDays,
      notes: estimates.notes,
      clientId: estimates.clientId,
      projectId: estimates.projectId,
      createdAt: estimates.createdAt,
      sentAt: estimates.sentAt,
      acceptedAt: estimates.acceptedAt,
      clientName: clients.companyName,
      projectName: projects.name,
    })
    .from(estimates)
    .leftJoin(clients, eq(clients.id, estimates.clientId))
    .leftJoin(projects, eq(projects.id, estimates.projectId))
    .where(and(eq(estimates.id, id), eq(estimates.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;

  const items = await db
    .select({
      id: estimateItems.id,
      name: estimateItems.name,
      description: estimateItems.description,
      category: estimateItems.category,
      manDays: estimateItems.manDays,
      difficulty: estimateItems.difficulty,
      unitPrice: estimateItems.unitPrice,
      quantity: estimateItems.quantity,
      subtotal: estimateItems.subtotal,
      sortOrder: estimateItems.sortOrder,
    })
    .from(estimateItems)
    .where(eq(estimateItems.estimateId, id))
    .orderBy(estimateItems.sortOrder);

  const parsedSplit = z.array(paymentSplitItemSchema).safeParse(rows[0].paymentSplit);

  return {
    ...rows[0],
    paymentSplit: parsedSplit.success ? parsedSplit.data : [],
    items,
  };
}

// ─── 생성 (C3: 트랜잭션 / I3: 채번 트랜잭션 내 / I4: projectId 소유권) ───

export async function createEstimateAction(
  data: EstimateFormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const parsed = estimateFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };

  const v = parsed.data;

  // 소유권 검증: clientId
  const clientRows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, v.clientId), eq(clients.userId, userId)))
    .limit(1);

  if (clientRows.length === 0)
    return { success: false, error: "유효하지 않은 고객입니다" };

  // I4: 소유권 검증: projectId
  if (v.projectId) {
    const projectRows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, v.projectId), eq(projects.userId, userId)))
      .limit(1);

    if (projectRows.length === 0)
      return { success: false, error: "유효하지 않은 프로젝트입니다" };
  }

  // 서버에서 금액 재계산 (클라이언트 값 신뢰 X)
  let supplyAmount = 0;
  let totalDays = 0;
  const itemValues = v.items.map((item, index) => {
    const subtotal = Math.round(item.manDays * (item.difficulty ?? 1.0) * item.unitPrice * (item.quantity ?? 1));
    supplyAmount += subtotal;
    totalDays += item.manDays * (item.quantity ?? 1);
    return { ...item, subtotal, sortOrder: index };
  });
  const taxAmount = Math.round(supplyAmount * 0.1);
  const totalAmount = supplyAmount + taxAmount;

  // 수금 비율 합계 검증
  const splitTotal = v.paymentSplit.reduce((s, i) => s + i.percentage, 0);
  if (splitTotal !== 100)
    return {
      success: false,
      error: `수금 비율 합계가 ${splitTotal}%입니다. 100%여야 합니다.`,
    };

  try {
    // C3: 트랜잭션으로 원자적 처리 (I3: 채번도 트랜잭션 내)
    const row = await db.transaction(async (tx) => {
      const estimateNumber = await generateEstimateNumber(tx, userId);

      const [inserted] = await tx
        .insert(estimates)
        .values({
          userId,
          clientId: v.clientId,
          projectId: v.projectId ?? null,
          estimateNumber,
          title: v.title,
          status: "draft",
          inputMode: "manual",
          validUntil: v.validUntil,
          paymentSplit: v.paymentSplit,
          supplyAmount,
          taxAmount,
          totalAmount,
          totalDays: String(totalDays),
          notes: v.notes || null,
        })
        .returning({ id: estimates.id });

      if (itemValues.length > 0) {
        await tx.insert(estimateItems).values(
          itemValues.map((item) => ({
            estimateId: inserted.id,
            name: item.name,
            description: item.description || null,
            category: item.category || null,
            manDays: String(item.manDays),
            difficulty: String(item.difficulty ?? 1.0),
            unitPrice: item.unitPrice,
            quantity: item.quantity ?? 1,
            subtotal: item.subtotal,
            sortOrder: item.sortOrder,
          })),
        );
      }

      return inserted;
    });

    revalidatePath("/dashboard/estimates");
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[createEstimateAction]", err);
    return { success: false, error: "견적서 생성 중 오류가 발생했습니다" };
  }
}

// ─── 상태 변경 (C2: UUID 검증 추가) ───

export async function updateEstimateStatusAction(
  id: string,
  status: EstimateStatus,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  const parsed = estimateStatusSchema.safeParse(status);
  if (!parsed.success)
    return { success: false, error: "올바르지 않은 상태값입니다" };

  // M1: accepted 상태에서 다른 상태로 전환 시 계약서 참조 확인
  if (parsed.data !== "accepted") {
    const referencingContracts = await db
      .select({ id: contracts.id })
      .from(contracts)
      .where(and(eq(contracts.estimateId, id), eq(contracts.userId, userId)))
      .limit(1);

    if (referencingContracts.length > 0)
      return {
        success: false,
        error: "이 견적서를 참조하는 계약서가 있어 상태를 변경할 수 없습니다",
      };
  }

  try {
    const setValues: Record<string, unknown> = { status: parsed.data };
    if (parsed.data === "sent") setValues.sentAt = new Date();
    if (parsed.data === "accepted") setValues.acceptedAt = new Date();

    await db
      .update(estimates)
      .set(setValues)
      .where(and(eq(estimates.id, id), eq(estimates.userId, userId)));

    revalidatePath("/dashboard/estimates");
    revalidatePath(`/dashboard/estimates/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[updateEstimateStatusAction]", err);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

// ─── 삭제 (C1: 소유권 검증 선행 / C2: UUID 검증 / C3: 트랜잭션) ───

export async function deleteEstimateAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  // C1: 소유권 검증을 삭제 전에 수행
  const ownerRows = await db
    .select({ id: estimates.id })
    .from(estimates)
    .where(and(eq(estimates.id, id), eq(estimates.userId, userId)))
    .limit(1);

  if (ownerRows.length === 0)
    return { success: false, error: "권한이 없거나 존재하지 않는 견적서입니다" };

  // M1: 연결된 계약서가 있으면 삭제 차단 (법적 증빙 보호)
  const referencingContracts = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(and(eq(contracts.estimateId, id), eq(contracts.userId, userId)))
    .limit(1);

  if (referencingContracts.length > 0)
    return {
      success: false,
      error: "이 견적서를 참조하는 계약서가 있어 삭제할 수 없습니다",
    };

  try {
    // C3: 트랜잭션으로 원자적 삭제
    await db.transaction(async (tx) => {
      await tx.delete(estimateItems).where(eq(estimateItems.estimateId, id));
      await tx.delete(estimates).where(eq(estimates.id, id));
    });

    revalidatePath("/dashboard/estimates");
    return { success: true };
  } catch (err) {
    console.error("[deleteEstimateAction]", err);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
