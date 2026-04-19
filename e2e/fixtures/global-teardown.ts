/**
 * Playwright globalTeardown hook — 모든 spec 종료 후 1회 호출.
 *
 * 의도:
 *   - spec의 afterAll cleanup이 미호출되는 모든 시나리오(테스트 crash, Ctrl+C, OOM,
 *     `--grep` 부분 실행, `--last-failed` 단일 실행)에서 cleanup 보장.
 *   - 멱등 — 잔류 row 0이어도 성공.
 *   - 환경변수는 globalSetup에서 이미 로드됨.
 */
import { cleanupPortalFixtures } from "./seed-portal";

async function globalTeardown(): Promise<void> {
  try {
    await cleanupPortalFixtures();
    console.log("✓ globalTeardown — e2e seed cleanup 완료");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("⚠️ globalTeardown cleanup 실패 (수동 정리 필요):", message);
    // 종료 코드 0 — 테스트 자체는 통과했어도 cleanup만 실패한 경우 CI를 빨갛게 만들지 않음.
    // 잔류 row는 다음 e2e 실행의 seedPortalFixtures() → cleanup 먼저 단계에서 정리됨.
  }
}

export default globalTeardown;
