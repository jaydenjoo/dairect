// Phase 5 Task 5-2-1: 사용자 입력 텍스트 → workspace slug 변환.
//
// 용도:
//   - /onboarding 폼의 실시간 slug 프리뷰 (클라이언트)
//   - saveOnboardingAction Zod refine 검증 (서버)
//
// 정책:
//   - 영문 소문자 + 숫자 + 하이픈만 허용 (URL-safe ASCII subset)
//   - 한글/이모지/특수문자는 하이픈으로 치환 후 중복 하이픈 축약
//   - 선행/후행 하이픈 제거
//   - 최대 40자 (workspaces.slug 운영 한도)

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// 입력이 유효한 slug 형태인지 검사 — 엄격 검증 (토큰 단위 하이픈 구분 강제).
// toSlug 결과물은 항상 통과하지만 사용자가 직접 입력한 경우 `--`/`-foo` 같은 형태를 거른다.
export function isValidSlug(slug: string): boolean {
  if (slug.length < 2 || slug.length > 40) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
