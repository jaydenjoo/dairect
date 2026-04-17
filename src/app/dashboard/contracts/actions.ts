"use server";

import { db } from "@/lib/db";
import {
  contracts,
  estimates,
  clients,
  projects,
  userSettings,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import {
  contractFormSchema,
  contractStatusSchema,
  type ContractFormData,
  type ContractStatus,
} from "@/lib/validation/contracts";
import { paymentSplitItemSchema } from "@/lib/validation/settings";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string; id?: string };

const uuidSchema = z.string().uuid();

// ─── 상태 전이 규칙 (법적 증빙 무결성) ───
const ALLOWED_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  draft: ["sent"],
  sent: ["signed", "draft"], // sent 단계 실수 교정 허용
  signed: ["archived"],
  archived: [],
};

// Postgres unique_violation
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

// ─── 채번: CON-2026-001 (트랜잭션 내에서 호출) ───

async function generateContractNumber(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
): Promise<string> {
  const settingsRows = await tx
    .select({ contractNumberPrefix: userSettings.contractNumberPrefix })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const prefix = settingsRows[0]?.contractNumberPrefix ?? "CON";
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-%`;

  const maxRows = await tx
    .select({
      maxNum: sql<string>`max(substring(${contracts.contractNumber} from '\\d+$'))`,
    })
    .from(contracts)
    .where(
      and(
        eq(contracts.userId, userId),
        like(contracts.contractNumber, pattern),
      ),
    );

  const nextNum = (parseInt(maxRows[0]?.maxNum ?? "0", 10) || 0) + 1;
  return `${prefix}-${year}-${String(nextNum).padStart(3, "0")}`;
}

// ─── 계약서 목록 ───

export async function getContracts() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      status: contracts.status,
      warrantyMonths: contracts.warrantyMonths,
      ipOwnership: contracts.ipOwnership,
      liabilityLimit: contracts.liabilityLimit,
      signedAt: contracts.signedAt,
      createdAt: contracts.createdAt,
      estimateNumber: estimates.estimateNumber,
      estimateTitle: estimates.title,
      totalAmount: estimates.totalAmount,
      clientName: clients.companyName,
    })
    .from(contracts)
    .leftJoin(estimates, eq(estimates.id, contracts.estimateId))
    .leftJoin(clients, eq(clients.id, estimates.clientId))
    .where(eq(contracts.userId, userId))
    .orderBy(desc(contracts.createdAt));
}

// ─── 견적서 드롭다운 (accepted만) ───

export async function getAcceptedEstimatesForContract() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({
      id: estimates.id,
      estimateNumber: estimates.estimateNumber,
      title: estimates.title,
      totalAmount: estimates.totalAmount,
      clientName: clients.companyName,
    })
    .from(estimates)
    .leftJoin(clients, eq(clients.id, estimates.clientId))
    .where(and(eq(estimates.userId, userId), eq(estimates.status, "accepted")))
    .orderBy(desc(estimates.createdAt));
}

// ─── 계약서 상세 (견적서 스냅샷 포함) ───

export async function getContract(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  if (!uuidSchema.safeParse(id).success) return null;

  const rows = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      status: contracts.status,
      warrantyMonths: contracts.warrantyMonths,
      ipOwnership: contracts.ipOwnership,
      liabilityLimit: contracts.liabilityLimit,
      specialTerms: contracts.specialTerms,
      signedAt: contracts.signedAt,
      createdAt: contracts.createdAt,
      estimateId: contracts.estimateId,
      estimateNumber: estimates.estimateNumber,
      estimateTitle: estimates.title,
      estimatePaymentSplit: estimates.paymentSplit,
      estimateSupplyAmount: estimates.supplyAmount,
      estimateTaxAmount: estimates.taxAmount,
      estimateTotalAmount: estimates.totalAmount,
      estimateTotalDays: estimates.totalDays,
      projectName: projects.name,
      projectStartDate: projects.startDate,
      projectEndDate: projects.endDate,
      clientName: clients.companyName,
      clientContactName: clients.contactName,
      clientBusinessNumber: clients.businessNumber,
      clientAddress: clients.address,
    })
    .from(contracts)
    .leftJoin(estimates, eq(estimates.id, contracts.estimateId))
    .leftJoin(projects, eq(projects.id, estimates.projectId))
    .leftJoin(clients, eq(clients.id, estimates.clientId))
    .where(and(eq(contracts.id, id), eq(contracts.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;

  const parsedSplit = z
    .array(paymentSplitItemSchema)
    .safeParse(rows[0].estimatePaymentSplit);

  return {
    ...rows[0],
    estimatePaymentSplit: parsedSplit.success ? parsedSplit.data : [],
  };
}

// ─── 생성 (견적서 자동 복사 + 트랜잭션 + 소유권 + accepted 검증) ───

export async function createContractAction(
  data: ContractFormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const parsed = contractFormSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };

  const v = parsed.data;

  // 견적서 소유권 + accepted 상태 검증
  const estimateRows = await db
    .select({
      id: estimates.id,
      status: estimates.status,
      projectId: estimates.projectId,
    })
    .from(estimates)
    .where(and(eq(estimates.id, v.estimateId), eq(estimates.userId, userId)))
    .limit(1);

  if (estimateRows.length === 0)
    return { success: false, error: "유효하지 않은 견적서입니다" };

  if (estimateRows[0].status !== "accepted")
    return {
      success: false,
      error: "수락된 견적서만 계약서로 전환할 수 있습니다",
    };

  // H1: 채번 경합 시 1회 재시도 (unique_violation 23505)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const row = await db.transaction(async (tx) => {
        const contractNumber = await generateContractNumber(tx, userId);

        const [inserted] = await tx
          .insert(contracts)
          .values({
            userId,
            estimateId: v.estimateId,
            projectId: estimateRows[0].projectId,
            contractNumber,
            status: "draft",
            warrantyMonths: v.warrantyMonths,
            ipOwnership: v.ipOwnership,
            liabilityLimit: v.liabilityLimit,
            specialTerms: v.specialTerms || null,
          })
          .returning({ id: contracts.id });

        return inserted;
      });

      revalidatePath("/dashboard/contracts");
      return { success: true, id: row.id };
    } catch (err) {
      if (isUniqueViolation(err) && attempt === 0) continue;
      console.error("[createContractAction]", err);
      return { success: false, error: "계약서 생성 중 오류가 발생했습니다" };
    }
  }

  return { success: false, error: "계약서 생성 중 오류가 발생했습니다" };
}

// ─── 상태 변경 ───

export async function updateContractStatusAction(
  id: string,
  status: ContractStatus,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  const parsed = contractStatusSchema.safeParse(status);
  if (!parsed.success)
    return { success: false, error: "올바르지 않은 상태값입니다" };

  // H2: 현재 상태 조회 + 전이 허용 여부 검증
  const currentRows = await db
    .select({ status: contracts.status })
    .from(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.userId, userId)))
    .limit(1);

  if (currentRows.length === 0)
    return { success: false, error: "권한이 없거나 존재하지 않는 계약서입니다" };

  const currentStatus = currentRows[0].status as ContractStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(parsed.data))
    return {
      success: false,
      error: `${currentStatus} 상태에서 ${parsed.data}로 변경할 수 없습니다`,
    };

  try {
    const setValues: { status: ContractStatus; signedAt?: Date } = {
      status: parsed.data,
    };
    if (parsed.data === "signed") setValues.signedAt = new Date();

    await db
      .update(contracts)
      .set(setValues)
      .where(and(eq(contracts.id, id), eq(contracts.userId, userId)));

    revalidatePath("/dashboard/contracts");
    revalidatePath(`/dashboard/contracts/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[updateContractStatusAction]", err);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

// ─── 삭제 (소유권 선행 검증 + 트랜잭션) ───

export async function deleteContractAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!uuidSchema.safeParse(id).success)
    return { success: false, error: "유효하지 않은 식별자입니다" };

  // H3: 소유권 + draft 상태 동시 확인 (법적 증빙 보호)
  const ownerRows = await db
    .select({ id: contracts.id, status: contracts.status })
    .from(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.userId, userId)))
    .limit(1);

  if (ownerRows.length === 0)
    return { success: false, error: "권한이 없거나 존재하지 않는 계약서입니다" };

  if (ownerRows[0].status !== "draft")
    return {
      success: false,
      error: "초안 상태의 계약서만 삭제할 수 있습니다",
    };

  try {
    await db.delete(contracts).where(eq(contracts.id, id));
    revalidatePath("/dashboard/contracts");
    return { success: true };
  } catch (err) {
    console.error("[deleteContractAction]", err);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
