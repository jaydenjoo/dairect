import { z } from "zod";
import { paymentSplitItemSchema } from "./settings";

export const estimateStatuses = [
  "draft", "sent", "accepted", "rejected", "expired",
] as const;

export type EstimateStatus = (typeof estimateStatuses)[number];

export const estimateStatusSchema = z.enum(estimateStatuses);

export const estimateStatusLabels: Record<EstimateStatus, string> = {
  draft: "초안",
  sent: "발송",
  accepted: "수락",
  rejected: "거절",
  expired: "만료",
};

export const estimateStatusColors: Record<EstimateStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-amber-50 text-amber-700",
};

export const estimateItemSchema = z.object({
  name: z.string().min(1, "항목명을 입력해주세요").max(200),
  description: z.string().max(500).optional().default(""),
  category: z.string().max(50).optional().default(""),
  manDays: z.number().min(0.1).max(9999),
  difficulty: z.number().min(0.1).max(10).optional().default(1.0),
  unitPrice: z.number().int().min(0).max(100_000_000),
  quantity: z.number().int().min(1).max(9999).optional().default(1),
});

export type EstimateItemFormData = z.infer<typeof estimateItemSchema>;

export const estimateFormSchema = z.object({
  title: z.string().min(1, "견적서 제목을 입력해주세요").max(200),
  clientId: z.string().uuid("고객을 선택해주세요"),
  projectId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
  notes: z.string().max(2000).optional().default(""),
  paymentSplit: z.array(paymentSplitItemSchema).min(1),
  items: z.array(estimateItemSchema).min(1, "최소 1개 항목을 추가해주세요"),
});

export type EstimateFormData = z.infer<typeof estimateFormSchema>;
