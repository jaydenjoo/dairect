import { z } from "zod";

// ─── AI 호출 제약 ───

// Task 5-2-2b에서 workspace_settings로 이관되어 workspace 공유 카운터가 됨.
// 1인 기준 50 → 멤버 N명 체감 50/N 문제(C-H1)를 단순 상향으로 완화.
// 플랜별 세분화 한도는 Phase 5.5 billing에서 재설계.
export const AI_DAILY_LIMIT = 200;
export const AI_REQUIREMENTS_MIN = 100;
export const AI_REQUIREMENTS_MAX = 2000;
export const AI_TIMEOUT_MS = 30_000;

// ─── 응답 타입: 난이도 ───

export const aiDifficultyLevels = ["low", "medium", "high"] as const;
export type AiDifficulty = (typeof aiDifficultyLevels)[number];

export const aiDifficultyLabels: Record<AiDifficulty, string> = {
  low: "쉬움",
  medium: "보통",
  high: "어려움",
};

// difficulty → 견적 계수 (estimate_items.difficulty decimal(3,1)과 매핑)
export const aiDifficultyCoefficient: Record<AiDifficulty, number> = {
  low: 0.8,
  medium: 1.0,
  high: 1.5,
};

// ─── 응답 타입: 카테고리 ───

export const aiCategoryValues = [
  "auth",
  "ui",
  "db",
  "api",
  "payment",
  "admin",
  "etc",
] as const;
export type AiCategory = (typeof aiCategoryValues)[number];

export const aiCategoryLabels: Record<AiCategory, string> = {
  auth: "인증",
  ui: "UI",
  db: "DB",
  api: "API",
  payment: "결제",
  admin: "관리자",
  etc: "기타",
};

// ─── 입력 스키마 ───

export const aiEstimateInputSchema = z
  .object({
    requirements: z
      .string()
      .min(AI_REQUIREMENTS_MIN, `요구사항을 ${AI_REQUIREMENTS_MIN}자 이상 입력해주세요`)
      .max(AI_REQUIREMENTS_MAX, `요구사항은 ${AI_REQUIREMENTS_MAX}자 이내로 입력해주세요`)
      .regex(/^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F]*$/u, "허용되지 않는 문자가 포함되어 있습니다"),
  })
  .strict();

export type AiEstimateInput = z.infer<typeof aiEstimateInputSchema>;

// ─── 응답 스키마 (Claude tool_use input 검증) ───

// name 필드는 AI 응답을 통해 견적 항목·PDF·향후 CSV/이메일 export 경로로 확산되므로
// 2차 공격 벡터(XSS, CSV injection, BiDi 스푸핑) 원천 차단.
//   - 제어문자: \x00-\x08\x0B\x0C\x0E-\x1F\x7F (탭·줄바꿈 제외해도 단일라인이므로 배제)
//   - HTML 태그 시도: < >
//   - BiDi override/embedding: U+202A–202E, U+2066–2069
//   - 리드 CSV 트리거: =, +, -, @, \t, \r (excel/sheets 자동 수식 실행)
const AI_NAME_FORBIDDEN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F<>\u202A-\u202E\u2066-\u2069]/u;
const AI_NAME_CSV_LEADING = /^[=+\-@\t\r]/;

export const aiEstimateItemSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(100)
      .refine((v) => !AI_NAME_FORBIDDEN.test(v), "항목명에 허용되지 않는 문자가 포함되어 있습니다")
      .refine((v) => !AI_NAME_CSV_LEADING.test(v), "항목명이 허용되지 않는 문자로 시작합니다"),
    manDays: z.number().min(0.5).max(30),
    difficulty: z.enum(aiDifficultyLevels),
    category: z.enum(aiCategoryValues),
  })
  .strict();

export type AiEstimateItem = z.infer<typeof aiEstimateItemSchema>;

export const aiEstimateResponseSchema = z
  .object({
    items: z.array(aiEstimateItemSchema).min(1).max(30),
  })
  .strict();

export type AiEstimateResponse = z.infer<typeof aiEstimateResponseSchema>;
