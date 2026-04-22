// Phase 5 Task 5-2-5: open redirect 방어 공통 유틸.
//
// 주 위협 벡터:
//   1) `//evil.com`          → protocol-relative URL (`https://evil.com`으로 해석)
//   2) `/\evil.com`          → WHATWG URL parser가 backslash를 `/`로 정규화
//                              `new URL("/\\evil.com", "https://dairect.kr").href`
//                              → `https://evil.com/`  (Chromium/Firefox 공통)
//   3) 제어문자 포함          → 파서마다 해석 달라 우회 가능
//   4) `/`로 시작하지 않음    → absolute URL로 해석 (예: `http://evil.com`)
//
// 모든 인증/리다이렉트 경로(login, signup, auth callback, signout)에서
// 동일 규칙을 적용하기 위해 단일 지점으로 추출. 각 호출부에 흩어진
// 구현이 drift하면 한 곳의 수정이 다른 곳에는 반영되지 않아 재발 위험.
export function safeNext(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;

  // 제어문자(NUL~US + DEL) 포함 시 거부 — 파서별 해석 상이로 우회 가능
  if (/[\x00-\x1f\x7f]/.test(raw)) return fallback;

  // 첫 글자가 '/'가 아니면 거부 (http://evil.com, javascript:, evil.com 등)
  if (raw[0] !== "/") return fallback;

  // 두 번째 글자가 '/' 또는 '\' (백슬래시) 이면 거부
  //  - '//evil.com'  = protocol-relative
  //  - '/\evil.com'  = WHATWG 정규화 시 'https://evil.com/'로 해석
  if (raw.length > 1 && (raw[1] === "/" || raw[1] === "\\")) return fallback;

  return raw;
}
