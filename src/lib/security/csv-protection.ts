/**
 * CSV/스프레드시트 자동 수식 실행 방어.
 *
 * 공격 시나리오: 사용자 입력 `=HYPERLINK("evil.com")` → DB → PM 대시보드의
 * CSV export → Excel/Numbers 등에서 자동 실행되어 피싱·자료 유출·RCE.
 *
 * 첫 줄만 막으면 `"안녕\n=SUM(...)"` 같은 mid-body 트리거가 통과 → export 단
 * 셀 재파싱 시 살아남음. **각 줄 leading char를 모두 strip**.
 *
 * 통합 출처:
 *   - src/lib/portal/feedback-actions.ts (라인별 split 강화 버전)
 *   - src/app/(public)/about/actions.ts (단일 leading만 처리하던 약한 버전)
 * → 신규 통합본은 강화 버전 채택 (about도 자동 강화 효과).
 */
export function stripFormulaTriggers(s: string): string {
  return s
    .split(/\r?\n/)
    .map((line) => line.replace(/^[=+\-@\t\r]+/, ""))
    .join("\n");
}
