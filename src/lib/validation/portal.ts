import { z } from "zod";
import { guardMultiLine } from "./shared-text";

// ─── 포털 피드백 입력 검증 ───
//
// 공개 라우트(`/portal/[token]`)의 textarea 제출. Task 2-7 Contact 폼과 동일한 공개
// 엔드포인트 baseline 적용: honeypot + timing guard + Zod .strict() + guardMultiLine.
//
// ⚠️ 토큰은 path param으로만 서버에서 읽음. 폼 데이터/hidden input에 절대 포함 금지
// (path param 기반 접근이라 토큰 유출 경로가 URL/history/Referer로 한정됨).

export const FEEDBACK_MESSAGE_MAX = 2000;

// FEEDBACK_MIN_SUBMIT_MS는 src/lib/security/timing-oracle.ts로 이전됨 (공개 폼 4종 baseline 통합).
// 사용처는 거기서 import: `import { FEEDBACK_MIN_SUBMIT_MS } from "@/lib/security/timing-oracle"`

export const portalFeedbackSchema = z
  .object({
    message: guardMultiLine(
      z
        .string()
        .min(1, "내용을 입력해주세요")
        .max(FEEDBACK_MESSAGE_MAX, `최대 ${FEEDBACK_MESSAGE_MAX}자까지 입력할 수 있어요`),
      "피드백",
    ),
    // honeypot — 봇이 아니라면 절대 채워지지 않는 필드. 값이 있으면 드롭(성공 위장).
    website: z.string().max(0).optional().default(""),
    // timing guard — 폼 첫 렌더 시각. 서버에서 Date.now()와 비교해 FEEDBACK_MIN_SUBMIT_MS
    // 미만이면 bot 추정으로 드롭. 0/음수는 공격자가 3초 가드 우회 용도로 전송할 수
    // 있으므로 positive 강제. 서버 측에도 sanity 상한/하한 체크 추가됨(feedback-actions.ts).
    startedAt: z.coerce.number().int().positive(),
  })
  .strict();

export type PortalFeedbackInput = z.infer<typeof portalFeedbackSchema>;
