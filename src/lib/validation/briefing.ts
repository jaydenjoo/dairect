import { z } from "zod";

// ─── 공통 제약 ───

export const BRIEFING_LIST_LIMIT = 10;

// title/reason/summary 공통 방어 정규식 (AI 응답 2차 공격 벡터 차단)
// - C0 제어문자 및 DEL: \x00-\x08\x0B\x0C\x0E-\x1F\x7F
// - HTML 태그 시도: < >
// - BiDi override/embedding: U+202A–202E, U+2066–2069
// - Unicode 라인 종결자: U+0085 (NEL), U+2028 (LS), U+2029 (PS) — PDF/이메일 export 시 예상 밖 줄바꿈·스푸핑 차단
// title/reason은 단일 라인이므로 탭/개행(\t\n\r)도 차단. summary는 \n 허용.
const BRIEFING_SINGLELINE_FORBIDDEN = /[\x00-\x1F\x7F<>\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/u;
const BRIEFING_MULTILINE_FORBIDDEN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F<>\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/u;
const BRIEFING_CSV_LEADING = /^[=+\-@\t\r]/;

// ─── Claude 응답 스키마 (tool_use input 검증) ───

const focusItemSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(80)
      .refine((v) => !BRIEFING_SINGLELINE_FORBIDDEN.test(v), "제목에 허용되지 않는 문자가 포함되어 있습니다")
      .refine((v) => !BRIEFING_CSV_LEADING.test(v), "제목이 허용되지 않는 문자로 시작합니다"),
    reason: z
      .string()
      .min(1)
      .max(200)
      .refine((v) => !BRIEFING_SINGLELINE_FORBIDDEN.test(v), "사유에 허용되지 않는 문자가 포함되어 있습니다")
      .refine((v) => !BRIEFING_CSV_LEADING.test(v), "사유가 허용되지 않는 문자로 시작합니다"),
    priority: z.number().int().min(1).max(3),
  })
  .strict();

export type BriefingFocusItem = z.infer<typeof focusItemSchema>;

export const briefingResponseSchema = z
  .object({
    focusItems: z.array(focusItemSchema).length(3, "focusItems는 정확히 3개여야 합니다"),
    summary: z
      .string()
      .min(1)
      .max(500)
      // MULTILINE regex가 탭/개행/CR은 허용하므로 별도 replace 불필요 (리뷰 M4).
      .refine((v) => !BRIEFING_MULTILINE_FORBIDDEN.test(v), "요약에 허용되지 않는 문자가 포함되어 있습니다")
      .refine((v) => !BRIEFING_CSV_LEADING.test(v), "요약이 허용되지 않는 문자로 시작합니다")
      // Claude가 개행을 literal `\n` 두 글자로 반환하는 경우가 있음 → 실제 개행으로 정규화
      .transform((v) => v.replace(/\\n/g, "\n").replace(/\\t/g, "\t")),
  })
  .strict();

export type BriefingResponse = z.infer<typeof briefingResponseSchema>;

// ─── DB 저장용 contentJson 스키마 (읽기 시 재검증) ───
// 저장 경로는 briefingResponseSchema와 동일하지만, 이후 schema 진화 시 분리 유지를 위해 별도 export.
export const briefingContentSchema = briefingResponseSchema;
export type BriefingContent = z.infer<typeof briefingContentSchema>;

// ─── 주간 집계 데이터 타입 (프롬프트 입력용) ───

export type WeeklyPayment = {
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string | null;
  clientName: string | null;
  projectName: string | null;
};

export type WeeklyOverdue = WeeklyPayment & {
  overdueDays: number;
};

export type WeeklyProjectDeadline = {
  name: string;
  endDate: string | null;
  clientName: string | null;
};

export type WeeklyMilestone = {
  title: string;
  projectName: string;
  dueDate: string | null;
  isCompleted: boolean;
};

export type WeeklyBriefingData = {
  weekStartDate: string; // "YYYY-MM-DD" (KST 월요일)
  weekEndDate: string; // "YYYY-MM-DD" (KST 일요일)
  today: string; // "YYYY-MM-DD" (KST 오늘)
  upcomingPayments: WeeklyPayment[];
  overdueInvoices: WeeklyOverdue[];
  nearingDeadlines: WeeklyProjectDeadline[];
  weekMilestones: WeeklyMilestone[];
};

// 집계 데이터가 모두 비어있는지 판정 → AI 호출 생략 최적화
export function isWeeklyDataEmpty(data: WeeklyBriefingData): boolean {
  return (
    data.upcomingPayments.length === 0 &&
    data.overdueInvoices.length === 0 &&
    data.nearingDeadlines.length === 0 &&
    data.weekMilestones.length === 0
  );
}
