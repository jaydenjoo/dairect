import { z } from "zod";

export const projectStatuses = [
  "lead", "consulting", "estimate", "contract",
  "in_progress", "review", "completed", "warranty", "closed",
  "cancelled", "failed",
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export const projectStatusSchema = z.enum(projectStatuses);

export const projectStatusLabels: Record<ProjectStatus, string> = {
  lead: "리드",
  consulting: "상담",
  estimate: "견적",
  contract: "계약",
  in_progress: "진행",
  review: "검수",
  completed: "완료",
  warranty: "하자보수",
  closed: "종료",
  cancelled: "취소",
  failed: "실패",
};

// 칸반 뷰용 4개 그룹
export const kanbanColumns = [
  { key: "waiting", label: "대기", statuses: ["lead", "consulting", "estimate", "contract"] },
  { key: "active", label: "진행", statuses: ["in_progress", "review"] },
  { key: "done", label: "완료", statuses: ["completed", "warranty", "closed"] },
  { key: "settled", label: "정산완료", statuses: ["cancelled", "failed"] },
] as const;

// 날짜: 빈 문자열 또는 YYYY-MM-DD
const dateOrEmpty = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
]);

export const projectFormSchema = z.object({
  name: z.string().min(1, "프로젝트명을 입력해주세요").max(100),
  clientId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  description: z.string().max(2000).optional().default(""),
  status: projectStatusSchema.optional().default("lead"),
  expectedAmount: z.number().int().min(0).max(10_000_000_000).optional(),
  startDate: dateOrEmpty.optional().default(""),
  endDate: dateOrEmpty.optional().default(""),
  memo: z.string().max(2000).optional().default(""),
}).refine(
  (d) => !d.startDate || !d.endDate || d.startDate <= d.endDate,
  { message: "종료일이 시작일보다 빠를 수 없습니다", path: ["endDate"] },
);

export type ProjectFormData = z.infer<typeof projectFormSchema>;
