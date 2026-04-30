/**
 * Journal/Build slug 검증 — client-safe (폼에서 실시간 검증 가능).
 *
 * 동일 규칙: src/lib/content/types.ts의 slugRegex.
 * 한글·공백·대문자 입력을 폼 단계에서 차단 → Vercel ISR 한글 슬러그 회귀
 * (learnings.md 2026-04-29) 재발 방지.
 *
 * 비유: "URL에 들어갈 수 있는 이름표 검사" — 영문 소문자·숫자·하이픈만 통과.
 */

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*$/;
export const SLUG_MAX_LENGTH = 80;

export type SlugValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateSlug(input: string): SlugValidation {
  if (input.length === 0) {
    return { ok: false, message: "slug는 필수입니다." };
  }
  if (input.length > SLUG_MAX_LENGTH) {
    return {
      ok: false,
      message: `slug는 ${SLUG_MAX_LENGTH}자 이하여야 합니다 (현재 ${input.length}자).`,
    };
  }
  if (!SLUG_REGEX.test(input)) {
    return {
      ok: false,
      message:
        "slug는 영문 소문자·숫자·하이픈만 가능합니다 (한글·공백·대문자·특수문자 금지). 첫 글자는 영문 또는 숫자.",
    };
  }
  return { ok: true };
}

/**
 * 제목에서 slug 후보 자동 제안. 사용자가 직접 수정 가능.
 *
 * 의도: 한글 → 로마자 자동 변환은 하지 않는다.
 *  - 한글 제목이면 빈 문자열 반환 → 사용자가 영문 slug 직접 입력.
 *  - 영문 제목이면 소문자화 + 비영문 문자를 하이픈으로 치환.
 */
export function suggestSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH);
}
