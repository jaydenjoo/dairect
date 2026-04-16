import { z } from "zod";

export const bankInfoSchema = z.object({
  bankName: z.string().max(50).optional().default(""),
  accountNumber: z.string().max(30).optional().default(""),
  accountHolder: z.string().max(30).optional().default(""),
});

export const paymentSplitItemSchema = z.object({
  label: z.string().min(1).max(20),
  percentage: z.number().int().min(0).max(100),
});

export const settingsFormSchema = z.object({
  // 회사 정보
  companyName: z.string().max(100).optional().default(""),
  representativeName: z.string().max(50).optional().default(""),
  businessNumber: z
    .string()
    .max(12)
    .optional()
    .default(""),
  businessAddress: z.string().max(200).optional().default(""),
  businessPhone: z.string().max(20).optional().default(""),
  businessEmail: z.string().email().or(z.literal("")).optional().default(""),
  bankInfo: bankInfoSchema.optional().default({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  }),

  // 견적서 기본값
  estimateNumberPrefix: z.string().max(10).optional().default("EST"),
  contractNumberPrefix: z.string().max(10).optional().default("CON"),
  invoiceNumberPrefix: z.string().max(10).optional().default("INV"),
  dailyRate: z.number().int().min(0).max(100_000_000).optional().default(700000),
  defaultPaymentSplit: z
    .array(paymentSplitItemSchema)
    .optional()
    .default([
      { label: "착수금", percentage: 30 },
      { label: "중도금", percentage: 40 },
      { label: "잔금", percentage: 30 },
    ]),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
export type BankInfo = z.infer<typeof bankInfoSchema>;
export type PaymentSplitItem = z.infer<typeof paymentSplitItemSchema>;
