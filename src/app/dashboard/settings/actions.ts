"use server";

import { db } from "@/lib/db";
import { workspaceSettings } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import {
  settingsFormSchema,
  bankInfoSchema,
  paymentSplitItemSchema,
  type SettingsFormData,
} from "@/lib/validation/settings";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Phase 5 Task 5-2-2 + 5-2-2b: user_settings → workspace_settings 이관 완료 (AI 한도 2필드 포함).
// user_settings 13+2 컬럼은 Parallel Change로 유지 중 — Phase 5.5 billing 이관 후 별도 Task에서 일괄 DROP.
// 권한 정책: 조회+편집 모두 owner/admin만 — 사업자번호/은행계좌 민감정보 방어.

// 로컬 타입 — "use server" 파일에서는 export 금지 (Next.js 16 번들러 제약, 10패턴 1).
// Task 5-2-2d: export type을 남겨두면 Turbopack이 saveSettings를 Server Action reference로 변환 실패
// → 클라이언트에서 호출해도 fetch 요청 발생 안 함(silent no-op). export 제거로 해결.
type SettingsActionResult = {
  success: boolean;
  error?: string;
};

const defaultBankInfo = { bankName: "", accountNumber: "", accountHolder: "" };
const defaultPaymentSplit = [
  { label: "착수금", percentage: 30 },
  { label: "중도금", percentage: 40 },
  { label: "잔금", percentage: 30 },
];

export async function getSettings(): Promise<SettingsFormData | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  // 권한 가드: member는 설정 조회 불가 (민감정보 차단)
  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (role !== "owner" && role !== "admin") return null;

  const rows = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.workspaceId, workspaceId))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];

  const parsedBank = bankInfoSchema.safeParse(row.bankInfo);
  const parsedSplit = z
    .array(paymentSplitItemSchema)
    .safeParse(row.defaultPaymentSplit);

  return {
    companyName: row.companyName ?? "",
    representativeName: row.representativeName ?? "",
    businessNumber: row.businessNumber ?? "",
    businessAddress: row.businessAddress ?? "",
    businessPhone: row.businessPhone ?? "",
    businessEmail: row.businessEmail ?? "",
    bankInfo: parsedBank.success ? parsedBank.data : defaultBankInfo,
    estimateNumberPrefix: row.estimateNumberPrefix ?? "EST",
    contractNumberPrefix: row.contractNumberPrefix ?? "CON",
    invoiceNumberPrefix: row.invoiceNumberPrefix ?? "INV",
    dailyRate: row.dailyRate ?? 700000,
    defaultPaymentSplit: parsedSplit.success ? parsedSplit.data : defaultPaymentSplit,
  };
}

export async function saveSettings(
  data: SettingsFormData,
): Promise<SettingsActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return { success: false, error: "워크스페이스를 찾을 수 없습니다" };
  }

  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (role !== "owner" && role !== "admin") {
    return { success: false, error: "설정을 변경할 권한이 없습니다" };
  }

  const parsed = settingsFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "입력값이 올바르지 않습니다" };
  }

  const values = parsed.data;

  const totalPercentage = values.defaultPaymentSplit.reduce(
    (sum, item) => sum + item.percentage,
    0,
  );
  if (totalPercentage !== 100) {
    return {
      success: false,
      error: `수금 비율 합계가 ${totalPercentage}%입니다. 100%여야 합니다.`,
    };
  }

  try {
    // upsert — 0020 backfill로 row가 있어야 정상이지만, 신규 workspace 케이스 방어.
    //
    // Task 5-2-2b 잔여 C-H1 (마이그레이션 0032): workspace_settings.plan 컬럼은
    // 이 UPSERT의 insert/set 어디에도 포함하지 않음 (의도적 누락).
    // 근거:
    //   - insert 경로: 신규 row 생성 시 DB default 'free' 자동 적용 (ADD COLUMN DEFAULT).
    //   - set 경로: 설정 폼은 AI 한도 변경 수단이 아님 → plan을 건드리지 않고 기존 값 보존.
    // Phase 5.5 billing 도입 시 plan은 별도 billing webhook/action에서만 write하도록 유지.
    // 이 UPSERT에 plan을 추가하면 폼 제출 시마다 plan이 덮어쓰여 billing 경로가 무력화됨.
    await db
      .insert(workspaceSettings)
      .values({
        workspaceId,
        companyName: values.companyName || null,
        representativeName: values.representativeName || null,
        businessNumber: values.businessNumber || null,
        businessAddress: values.businessAddress || null,
        businessPhone: values.businessPhone || null,
        businessEmail: values.businessEmail || null,
        bankInfo: values.bankInfo,
        estimateNumberPrefix: values.estimateNumberPrefix,
        contractNumberPrefix: values.contractNumberPrefix,
        invoiceNumberPrefix: values.invoiceNumberPrefix,
        dailyRate: values.dailyRate,
        defaultPaymentSplit: values.defaultPaymentSplit,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: workspaceSettings.workspaceId,
        set: {
          companyName: values.companyName || null,
          representativeName: values.representativeName || null,
          businessNumber: values.businessNumber || null,
          businessAddress: values.businessAddress || null,
          businessPhone: values.businessPhone || null,
          businessEmail: values.businessEmail || null,
          bankInfo: values.bankInfo,
          estimateNumberPrefix: values.estimateNumberPrefix,
          contractNumberPrefix: values.contractNumberPrefix,
          invoiceNumberPrefix: values.invoiceNumberPrefix,
          dailyRate: values.dailyRate,
          defaultPaymentSplit: values.defaultPaymentSplit,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("[saveSettings]", err);
    return { success: false, error: "설정 저장 중 오류가 발생했습니다" };
  }
}
