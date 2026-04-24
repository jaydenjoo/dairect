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

// Studio Anthem 매핑: sent → amber(signal) / 나머지 semantic
export const contractStatusColors: Record<ContractStatus, string> = {
  draft: "bg-[rgba(20,20,20,0.06)] text-[#8B8680]",
  sent: "bg-[rgba(255,184,0,0.12)] text-[#141414] border border-[#FFB800]",
  signed: "bg-green-50 text-green-700",
  archived: "bg-[rgba(20,20,20,0.04)] text-[#8B8680]",
};

export const ipOwnerships = ["client", "developer", "shared"] as const;
export type IpOwnership = (typeof ipOwnerships)[number];
export const ipOwnershipSchema = z.enum(ipOwnerships);

export const ipOwnershipLabels: Record<IpOwnership, string> = {
  client: "갑 (고객)",
  developer: "을 (공급자)",
  shared: "공동 소유",
};

// guardMultiLine이 BiDi(\u202A-\u202E, \u2066-\u2069)/제어문자는 이미 **거부**하므로,
// 여기 transform은 **통과한 문자열에 남은 zero-width(\u200B-\u200D)와 BOM(\uFEFF)만** 제거.
// defense-in-depth: 사용자가 의도치 않게 복붙한 보이지 않는 문자가 PDF/이메일로 확산 차단.
const stripZeroWidth = (s: string): string => s.replace(/[\u200B-\u200D\uFEFF]/g, "");

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
  // stripZeroWidth는 guard 통과 후 zero-width/BOM 제거 (transform 단계, defense-in-depth).
  specialTerms: guardMultiLine(z.string().max(5000), "특약 조건")
    .optional()
    .default("")
    .transform(stripZeroWidth),
});

export type ContractFormData = z.infer<typeof contractFormSchema>;
