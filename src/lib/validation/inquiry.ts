import { z } from "zod";
import { guardSingleLine, guardMultiLine } from "./shared-text";

export const inquiryFormSchema = z
  .object({
    name: guardSingleLine(
      z.string().trim().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
      "이름",
    ),
    contact: guardSingleLine(
      z.string().trim().min(1, "연락처를 입력해주세요").max(100, "연락처는 100자 이내로 입력해주세요"),
      "연락처",
    ),
    ideaSummary: guardSingleLine(
      z.string().trim().max(100, "100자 이내로 입력해주세요"),
      "아이디어 요약",
    )
      .optional()
      .default(""),
    description: guardMultiLine(
      z.string().trim().max(2000, "2000자 이내로 입력해주세요"),
      "상세 설명",
    )
      .optional()
      .default(""),
    budgetRange: z
      .enum(["under_100", "100_to_300", "over_300", "unsure"])
      .optional(),
    schedule: z
      .enum(["within_1month", "1_to_3months", "flexible"])
      .optional(),
    package: z
      .enum(["diagnosis", "mvp", "expansion"])
      .optional(),
  })
  .strict();

export type InquiryFormData = z.infer<typeof inquiryFormSchema>;

// Task 5-2-2e: "use server" 파일(about/actions.ts)에서 export type 금지(10패턴 1) 준수 —
// client(contact-form.tsx)에서 import하는 타입을 여기로 이관.
export type InquirySubmission = InquiryFormData & {
  website?: string;
  startedAt?: number;
};

export type PackageId = NonNullable<InquiryFormData["package"]>;
export type BudgetId = NonNullable<InquiryFormData["budgetRange"]>;
export type ScheduleId = NonNullable<InquiryFormData["schedule"]>;

export const packageLabel: Record<PackageId, string> = {
  diagnosis: "진단 패키지",
  mvp: "MVP 패키지",
  expansion: "확장 패키지",
};

export const budgetLabel: Record<BudgetId, string> = {
  under_100: "100만원 미만",
  "100_to_300": "100~300만원",
  over_300: "300만원 이상",
  unsure: "잘 모르겠음",
};

export const scheduleLabel: Record<ScheduleId, string> = {
  within_1month: "1개월 내",
  "1_to_3months": "1~3개월",
  flexible: "여유 있음",
};
