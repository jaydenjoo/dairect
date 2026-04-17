import { z } from "zod";

// ─── 공통 제약 ───

export const REPORT_ACTIVITY_LIMIT = 20;
export const REPORT_MILESTONE_LIMIT = 20;

// title/description/summary 공통 방어 (Task 3-2 briefing 정규식과 동일 — Unicode 라인 종결자 포함)
const REPORT_SINGLELINE_FORBIDDEN =
  /[\x00-\x1F\x7F<>\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/u;
const REPORT_MULTILINE_FORBIDDEN =
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F<>\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/u;
const REPORT_CSV_LEADING = /^[=+\-@\t\r]/;

function singleline(min: number, max: number, label: string) {
  return z
    .string()
    .min(min)
    .max(max)
    .refine((v) => !REPORT_SINGLELINE_FORBIDDEN.test(v), `${label}에 허용되지 않는 문자가 포함되어 있습니다`)
    .refine((v) => !REPORT_CSV_LEADING.test(v), `${label}이(가) 허용되지 않는 문자로 시작합니다`);
}

function multiline(min: number, max: number, label: string) {
  return z
    .string()
    .min(min)
    .max(max)
    .refine((v) => !REPORT_MULTILINE_FORBIDDEN.test(v), `${label}에 허용되지 않는 문자가 포함되어 있습니다`)
    .refine((v) => !REPORT_CSV_LEADING.test(v), `${label}이(가) 허용되지 않는 문자로 시작합니다`)
    // Claude가 개행을 literal `\n`으로 반환하는 경우 → 실제 개행 정규화 (Task 3-2 교훈)
    .transform((v) => v.replace(/\\n/g, "\n").replace(/\\t/g, "\t"));
}

// ─── 응답 스키마 (Claude tool_use input 검증) ───

const bulletItemSchema = z
  .object({
    title: singleline(1, 100, "항목명"),
    // Claude가 개행을 literal `\n`으로 반환할 가능성 있어 transform 포함 multiline 사용 (리뷰 H2).
    // 200자 이하 단문이지만 summary/issue.detail와 동일 정책으로 일관.
    description: multiline(0, 300, "설명").optional().default(""),
  })
  .strict();

export type ReportBulletItem = z.infer<typeof bulletItemSchema>;

const issueItemSchema = z
  .object({
    title: singleline(1, 100, "이슈 제목"),
    detail: multiline(1, 400, "상세 내용"),
  })
  .strict();

export type ReportIssueItem = z.infer<typeof issueItemSchema>;

export const reportResponseSchema = z
  .object({
    completedThisWeek: z.array(bulletItemSchema).min(0).max(8),
    plannedNextWeek: z.array(bulletItemSchema).min(0).max(8),
    issuesRisks: z.array(issueItemSchema).min(0).max(5),
    summary: multiline(1, 600, "요약"),
  })
  .strict();

export type ReportResponse = z.infer<typeof reportResponseSchema>;

export const reportContentSchema = reportResponseSchema;
export type ReportContent = z.infer<typeof reportContentSchema>;

// ─── 주간 집계 입력 타입 (프롬프트 전달용) ───

export type WeeklyCompletedMilestone = {
  title: string;
  description: string | null;
  completedAt: string | null; // ISO
};

export type WeeklyPlannedMilestone = {
  title: string;
  description: string | null;
  dueDate: string | null; // YYYY-MM-DD
};

export type WeeklyActivity = {
  action: string;
  description: string | null;
  createdAt: string | null; // ISO
};

export type WeeklyReportInput = {
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string;
  nextWeekStart: string;
  nextWeekEnd: string;
  projectName: string;
  projectDescription: string | null;
  clientName: string | null;
  milestoneProgress: {
    completed: number;
    total: number;
    percent: number | null;
  };
  completedThisWeek: WeeklyCompletedMilestone[];
  plannedNextWeek: WeeklyPlannedMilestone[];
  recentActivity: WeeklyActivity[];
};

// 집계가 모두 비었는지 판정 → AI 호출 생략 최적화 (Task 3-2 패턴)
export function isReportInputEmpty(input: WeeklyReportInput): boolean {
  return (
    input.completedThisWeek.length === 0 &&
    input.plannedNextWeek.length === 0 &&
    input.recentActivity.length === 0
  );
}
