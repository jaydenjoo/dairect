import { z } from "zod";

const SAFE_LINE = /^[^\r\n\t<>]+$/;

export const leadSourceSchema = z.enum([
  "wishket",
  "kmong",
  "referral",
  "direct",
  "landing_form",
  "other",
]);
export type LeadSource = z.infer<typeof leadSourceSchema>;

export const leadStatusSchema = z.enum([
  "new",
  "scheduled",
  "consulted",
  "estimated",
  "contracted",
  "failed",
]);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const leadFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "이름을 입력해주세요")
      .max(50, "이름은 50자 이내로 입력해주세요")
      .regex(SAFE_LINE, "이름에 허용되지 않은 문자가 있습니다"),
    source: leadSourceSchema,
    email: z
      .string()
      .trim()
      .max(100)
      .email("올바른 이메일 형식이 아닙니다")
      .or(z.literal(""))
      .optional()
      .default(""),
    phone: z
      .string()
      .trim()
      .max(50, "50자 이내로 입력해주세요")
      .regex(SAFE_LINE, "연락처에 허용되지 않은 문자가 있습니다")
      .or(z.literal(""))
      .optional()
      .default(""),
    projectType: z
      .string()
      .trim()
      .max(100, "100자 이내로 입력해주세요")
      .regex(SAFE_LINE, "프로젝트 유형에 허용되지 않은 문자가 있습니다")
      .or(z.literal(""))
      .optional()
      .default(""),
    budgetRange: z
      .string()
      .trim()
      .max(100, "100자 이내로 입력해주세요")
      .regex(SAFE_LINE, "예산 정보에 허용되지 않은 문자가 있습니다")
      .or(z.literal(""))
      .optional()
      .default(""),
    description: z
      .string()
      .trim()
      .max(2000, "2000자 이내로 입력해주세요")
      .optional()
      .default(""),
  })
  .strict();
export type LeadFormData = z.infer<typeof leadFormSchema>;

export const leadStatusUpdateSchema = z
  .object({
    status: leadStatusSchema,
    failReason: z
      .string()
      .trim()
      .max(500, "500자 이내로 입력해주세요")
      .regex(SAFE_LINE, "실패 사유에 허용되지 않은 문자가 있습니다")
      .or(z.literal(""))
      .optional()
      .default(""),
  })
  .strict()
  .refine(
    (v) =>
      v.status !== "failed" || (typeof v.failReason === "string" && v.failReason.length > 0),
    { message: "실패 사유를 입력해주세요", path: ["failReason"] },
  );
export type LeadStatusUpdate = z.infer<typeof leadStatusUpdateSchema>;

export const leadSourceLabels: Record<LeadSource, string> = {
  wishket: "위시켓",
  kmong: "크몽",
  referral: "소개",
  direct: "직접 문의",
  landing_form: "랜딩 폼",
  other: "기타",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "신규",
  scheduled: "상담 예정",
  consulted: "상담 완료",
  estimated: "견적 발송",
  contracted: "계약",
  failed: "실패",
};

export const leadStatusOrder: LeadStatus[] = [
  "new",
  "scheduled",
  "consulted",
  "estimated",
  "contracted",
  "failed",
];
