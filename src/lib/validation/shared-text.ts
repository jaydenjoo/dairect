import { z } from "zod";

// ─── 사용자 입력 텍스트 필드 공통 방어 정규식 ───
//
// LLM 프롬프트 · PDF 고객 발송 · CSV/이메일 export 등 2차 신뢰 경계로 확산되는
// 내부 입력 필드에 공통 적용. Task 3-3 보안 리뷰 H3 대응.
//
// 차단 범위:
// - C0 제어문자(\x00-\x1F) + DEL(\x7F)    — 터미널/PDF 렌더 이상, 헤더 injection
// - HTML 태그 시도: `<` / `>`              — XSS 2차 경계
// - U+0085 (NEL), U+2028/U+2029 (LS/PS)   — PDF/에디터에서 예상 밖 줄바꿈·스푸핑
// - BiDi override/embedding (U+202A-E, U+2066-9) — 텍스트 방향 역전 공격
// - CSV 리딩(=/+/-/@/탭/CR)               — Excel/Sheets 자동 수식 실행
//
// singleline: 탭·개행·CR 모두 차단 (form 텍스트 필드)
// multiline:  탭·개행·CR 허용, 나머지 제어문자는 차단 (textarea)

export const SAFE_SINGLE_LINE_FORBIDDEN =
  /[\x00-\x1F\x7F<>\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/u;
export const SAFE_MULTI_LINE_FORBIDDEN =
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F<>\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/u;
export const SAFE_CSV_LEADING = /^[=+\-@\t\r]/;

// ─── 체이닝 가능한 가드 헬퍼 ───
//
// 사용: `guardSingleLine(z.string().min(1).max(100), "프로젝트명").optional().default("")`
// 빈 문자열은 CSV leading 검사에서 자동 통과 (empty string doesn't start with forbidden char).

export function guardSingleLine<T extends z.ZodString>(schema: T, label: string) {
  return schema
    .refine(
      (v) => !SAFE_SINGLE_LINE_FORBIDDEN.test(v),
      `${label}에 허용되지 않는 문자가 포함되어 있습니다`,
    )
    .refine(
      (v) => v === "" || !SAFE_CSV_LEADING.test(v),
      `${label}이(가) 허용되지 않는 문자로 시작합니다`,
    );
}

export function guardMultiLine<T extends z.ZodString>(schema: T, label: string) {
  return schema
    .refine(
      (v) => !SAFE_MULTI_LINE_FORBIDDEN.test(v),
      `${label}에 허용되지 않는 문자가 포함되어 있습니다`,
    )
    .refine(
      (v) => v === "" || !SAFE_CSV_LEADING.test(v),
      `${label}이(가) 허용되지 않는 문자로 시작합니다`,
    );
}
