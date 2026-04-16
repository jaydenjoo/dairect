"use server";

import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  settingsFormSchema,
  bankInfoSchema,
  paymentSplitItemSchema,
  type SettingsFormData,
} from "@/lib/validation/settings";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type SettingsActionResult = {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const rows = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, user.id))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];

  // [HIGH 3] Zod 파싱으로 JSONB 안전 변환
  const parsedBank = bankInfoSchema.safeParse(row.bankInfo);
  const parsedSplit = z.array(paymentSplitItemSchema).safeParse(row.defaultPaymentSplit);

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

export async function saveSettings(data: SettingsFormData): Promise<SettingsActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };
  }

  const parsed = settingsFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "입력값이 올바르지 않습니다" };
  }

  const values = parsed.data;

  // 수금 비율 합계 검증
  const totalPercentage = values.defaultPaymentSplit.reduce(
    (sum, item) => sum + item.percentage,
    0,
  );
  if (totalPercentage !== 100) {
    return { success: false, error: `수금 비율 합계가 ${totalPercentage}%입니다. 100%여야 합니다.` };
  }

  try {
    await db
      .insert(userSettings)
      .values({
        userId: user.id,
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
        target: userSettings.userId,
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
