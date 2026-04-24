// Phase 5.5 Task 5-5-5: 자유 텍스트 sanitize util.
//
// 사용처
//  - audit log metadata에 저장하는 user.name 등 (XSS/제어문자 우회 방어)
//  - 향후 client_notes / lead notes 등 자유 텍스트 입력
//
// 정책 — 차단 대상
//  - 제어문자 (\x00-\x08\x0B\x0C\x0E-\x1F\x7F): 탭/줄바꿈 제외 (자연 입력 허용)
//  - BiDi override/embedding (U+202A-202E, U+2066-2069): 시각적 스푸핑 차단
//
// 통과 대상 (의도적 허용)
//  - HTML 특수문자 (<, >, &): React 렌더링 시 자동 escape됨. 차단하면 정상 텍스트도 손상.
//  - 따옴표/콜론/슬래시: 자연 입력에 흔함.
//
// 비고
//  - 일반 화면 표시(React)에서는 자동 escape로 XSS 방어됨.
//  - 이 util은 "JSON 저장된 metadata가 향후 다른 컨텍스트(이메일 본문 raw HTML, CSV export,
//    PDF 등)로 흘러갈 때의 위험"을 사전 차단하는 defense-in-depth.

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const BIDI_OVERRIDES = /[\u202A-\u202E\u2066-\u2069]/g;

export function sanitizeFreeText(text: string): string {
  return text.replace(CONTROL_CHARS, "").replace(BIDI_OVERRIDES, "");
}

// null/undefined fallback 포함 — DB row의 nullable text 필드용.
export function sanitizeFreeTextOrNull(text: string | null | undefined): string | null {
  if (!text) return null;
  return sanitizeFreeText(text);
}

// ─── 로그 전용 sanitize ───
//
// Task 5-5-5 sec M-1: console.error 로 넘기는 외부 유입 문자열(err.message, causeMessage 등)에
// 적용. Vercel/Datadog 로그 sink에서의 라인 오염 + ANSI escape 인젝션 + BiDi 스푸핑 방어.
//
// sanitizeFreeText와의 차이 — tab/newline/CR/ANSI escape(\x1B)까지 모두 공백으로 치환.
// 자연 입력 보존 대상이 아니라 "한 줄 로그"가 되어야 하므로.
//
// 사용 패턴:
//   err instanceof Error ? sanitizeLogMessage(err.message).slice(0, 200) : ""
//   (sanitize 후 slice — sanitize가 길이를 늘리지 않으므로 순서 무관)
const LOG_UNSAFE_CHARS = /[\x00-\x1F\x7F]/g;

export function sanitizeLogMessage(text: string): string {
  return text.replace(LOG_UNSAFE_CHARS, " ").replace(BIDI_OVERRIDES, "");
}
