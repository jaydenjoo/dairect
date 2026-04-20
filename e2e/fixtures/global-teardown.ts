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
import { cleanupWorkspaceFixtures } from "./seed-workspaces";

async function globalTeardown(): Promise<void> {
  // portal + workspace 각각 독립 cleanup — 한쪽 실패해도 다른 쪽은 진행.
  // allSettled로 실패 격리: 한 시드가 잔류해도 다른 시드는 정리 완료 보장.
  const results = await Promise.allSettled([
    cleanupPortalFixtures(),
    cleanupWorkspaceFixtures(),
  ]);

  const labels = ["portal", "workspace"] as const;
  let allOk = true;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") continue;
    allOk = false;
    const message = r.reason instanceof Error ? r.reason.message : String(r.reason);
    console.error(`⚠️ globalTeardown ${labels[i]} cleanup 실패 (수동 정리 필요):`, message);
  }
  if (allOk) {
    console.log("✓ globalTeardown — e2e seed cleanup 완료 (portal + workspace)");
  }
  // 종료 코드 0 유지 — 테스트 통과 후 cleanup만 실패한 경우 CI red 방지.
  // 잔류 row는 다음 seed* 호출의 cleanup 먼저 단계에서 정리됨.
}

export default globalTeardown;
