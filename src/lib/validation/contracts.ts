import { z } from "zod";
import { guardMultiLine } from "./shared-text";

export const contractStatuses = [
  "draft",
  "sent",
  "signed",
  "archived",
] as const;

export type ContractStatus = (typeof contractStatuses)[number];

export const contractStatusSchema = z.enum(contractStatuses);

export const contractStatusLabels: Record<ContractStatus, string> = {
  draft: "초안",
  sent: "발송",
  signed: "서명 완료",
  archived: "보관",
};

export const contractStatusColors: Record<ContractStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  signed: "bg-green-50 text-green-700",
  archived: "bg-gray-50 text-gray-500",
};

export const ipOwnerships = ["client", "developer", "shared"] as const;
export type IpOwnership = (typeof ipOwnerships)[number];
export const ipOwnershipSchema = z.enum(ipOwnerships);

export const ipOwnershipLabels: Record<IpOwnership, string> = {
  client: "갑 (고객)",
  developer: "을 (공급자)",
  shared: "공동 소유",
};

// 계약서 의미 반전/숨김 공격 방지: 방향성 제어 + zero-width 문자 제거
const stripInvisibleChars = (s: string): string =>
  s.replace(/[\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g, "");

export const contractFormSchema = z.object({
  estimateId: z.string().uuid("견적서를 선택해주세요"),
  warrantyMonths: z
    .number()
    .int("정수로 입력해주세요")
    .min(0, "0개월 이상")
    .max(60, "최대 60개월"),
  ipOwnership: ipOwnershipSchema,
  liabilityLimit: z
    .number()
    .int()
    .min(0)
    .max(100_000_000_000),
  // shared-text는 제어문자·HTML·BiDi·CSV 리딩 차단 (검증 단계).
  // stripInvisibleChars는 guard 통과 후 zero-width 문자 제거 (transform 단계, defense-in-depth).
  specialTerms: guardMultiLine(z.string().max(5000), "특약 조건")
    .optional()
    .default("")
    .transform(stripInvisibleChars),
});

export type ContractFormData = z.infer<typeof contractFormSchema>;
