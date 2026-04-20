import { eq, type AnyColumn, type SQL } from "drizzle-orm";

// Phase 5 Task 5-1-6: Drizzle 쿼리 .where() 절에 workspace 스코프 조건 주입.
//
// Why a thin wrapper around eq():
//   1. grep 용이성 — `workspaceScope` 문자열로 앱 전역 migrate 범위 추적
//   2. 의도 명시 — 단순 비교가 아니라 "워크스페이스 격리" 의도가 읽힘
//   3. 향후 확장 지점 — 감사 로그 / RLS 2중 방어 / 성능 hint 주입 가능
//
// 호출 전에 반드시 getCurrentWorkspaceId() null 가드 통과.
//
// @example
//   const wsId = await getCurrentWorkspaceId();
//   if (!wsId) return [];
//   db.select().from(clients).where(and(
//     eq(clients.userId, uid),
//     workspaceScope(clients.workspaceId, wsId),
//   ))
export function workspaceScope(
  workspaceColumn: AnyColumn,
  workspaceId: string,
): SQL {
  return eq(workspaceColumn, workspaceId);
}

// workspace 컨텍스트가 반드시 존재한다는 내부 invariant assertion.
// Server Action read 경로는 null → 빈 결과 반환이 UX 자연스러움.
// Write 경로도 사용자 피드백 위해 throw 대신 ActionResult 에러 반환 권장.
// 이 함수는 "호출 시점 이전에 이미 workspace 확정" 로직 (예: 이미 workspace row
// 조회 성공한 이후의 update transaction 내부) 전용.
export function assertWorkspaceContext(
  workspaceId: string | null,
): asserts workspaceId is string {
  if (!workspaceId) {
    throw new Error("Workspace 컨텍스트가 확인되지 않았습니다");
  }
}
