/**
 * Timing oracle 방어 + 봇 timing guard 통합.
 *
 * 의도:
 *   1. 폼 mount~제출 사이 경과 시간(`elapsed`)을 sanity 검증해 즉시 제출하는 봇 차단.
 *   2. 응답 시간을 일정 범위에서 정규화해 success/실패/드롭 경로 간 timing 분포 일치.
 *      → 공격자가 응답 시간으로 토큰 유효성/honeypot 트리거를 추측 불가.
 *
 * 사용:
 *   - portal 피드백 (3초 가드 + normalizeTiming)
 *   - landing contact 폼 (3초 가드만, normalizeTiming 옵션)
 *   - 향후 모든 공개 폼 baseline
 */

export const FEEDBACK_MIN_SUBMIT_MS = 3000;
export const STARTED_AT_MAX_AGE_MS = 30 * 60 * 1000; // 30분 — 폼을 더 오래 켜둔 startedAt은 공격자 임의 값으로 추정

const NORMALIZE_MIN_MS = 400;
const NORMALIZE_MAX_MS = 600;

/**
 * elapsed 검증 — 음수/NaN/Infinity 차단 + 하한/상한 sanity.
 *
 * `startedAt: 0` 우회 방어: elapsed가 매우 큰 양수가 되어 STARTED_AT_MAX_AGE_MS
 * 상한에 걸려 차단됨. 미래 시각(`startedAt > now`)은 음수 elapsed → 차단.
 *
 * @param elapsed 폼 mount~제출 사이 경과 시간 (ms). 보통 `Date.now() - submission.startedAt`.
 * @returns 유효(정상 사용자 가능성 높음) → true
 */
export function isValidElapsed(elapsed: number): boolean {
  return (
    Number.isFinite(elapsed) &&
    elapsed >= FEEDBACK_MIN_SUBMIT_MS &&
    elapsed <= STARTED_AT_MAX_AGE_MS
  );
}

/**
 * 응답 시간을 [NORMALIZE_MIN_MS, NORMALIZE_MAX_MS) 사이 랜덤 지연으로 정규화.
 *
 * 성공/실패/드롭 모든 경로에서 호출 → 일관된 시간 분포로 timing oracle 방어.
 * DB insert가 빠를 때/느릴 때/honeypot 드롭 모두 관측 가능한 응답 시간이 비슷해짐.
 *
 * @param t0 핸들러 진입 시각 (`Date.now()` 결과)
 */
export async function normalizeTiming(t0: number): Promise<void> {
  const elapsed = Date.now() - t0;
  const target =
    NORMALIZE_MIN_MS +
    Math.floor(Math.random() * (NORMALIZE_MAX_MS - NORMALIZE_MIN_MS));
  if (elapsed < target) {
    await new Promise((resolve) => setTimeout(resolve, target - elapsed));
  }
}
