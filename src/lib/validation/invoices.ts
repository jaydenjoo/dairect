import { z } from "zod";

export const invoiceStatuses = [
  "pending",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const invoiceStatusSchema = z.enum(invoiceStatuses);

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  pending: "미청구",
  sent: "청구 발행",
  paid: "입금 완료",
  overdue: "연체",
  cancelled: "취소",
};

export const invoiceStatusColors: Record<InvoiceStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-gray-50 text-gray-500",
};

export const invoiceTypes = ["advance", "interim", "final"] as const;

export type InvoiceType = (typeof invoiceTypes)[number];

export const invoiceTypeSchema = z.enum(invoiceTypes);

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  advance: "착수금",
  interim: "중도금",
  final: "잔금",
};

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다");

const stripInvisibleChars = (s: string): string =>
  s.replace(/[\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g, "");

// ─── 수동 생성 폼 (프로젝트 선택 + type + 금액 직접 입력) ───

export const invoiceManualFormSchema = z.object({
  projectId: z.string().uuid("프로젝트를 선택해주세요"),
  estimateId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  type: invoiceTypeSchema,
  amount: z.number().int().min(0).max(100_000_000_000),
  taxAmount: z.number().int().min(0).max(100_000_000_000),
  issuedDate: dateString,
  dueDate: dateString,
  memo: z.string().max(1000).optional().default("").transform(stripInvisibleChars),
});

export type InvoiceManualFormData = z.infer<typeof invoiceManualFormSchema>;

// ─── 견적서 자동 3분할 생성 ───

export const invoiceFromEstimateSchema = z.object({
  estimateId: z.string().uuid("견적서를 선택해주세요"),
  issuedDate: dateString,
  dueDateIntervalDays: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .default(30),
});

export type InvoiceFromEstimateData = z.infer<typeof invoiceFromEstimateSchema>;

// ─── 입금 확인 ───

export const markPaidSchema = z.object({
  paidDate: dateString,
  paidAmount: z.number().int().min(0).max(100_000_000_000),
});

export type MarkPaidData = z.infer<typeof markPaidSchema>;
