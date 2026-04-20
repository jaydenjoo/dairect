import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, workspaceMembers, workspaces } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";

// Phase 5 Task 5-1-6 + 5-2-3-A: 현재 request의 활성 workspace ID 조회.
//
// React cache()로 request 스코프 메모이제이션 — getUserId와 동일 패턴.
// Server Component + 여러 Server Action이 같은 request 안에서 호출해도
// DB 조회는 1회로 수렴.
//
// 조회 우선순위 (Task 5-2-3-A, PRD 섹션 10 결정):
//   1순위: users.last_workspace_id (마지막 접속 workspace) — 현재 소속 + soft-delete 아닌 경우만
//   2순위: 소속 workspace 중 workspace_members.joined_at MIN + id ASC (최초 소속, 결정적)
//
// 1순위 쿼리가 멤버십 JOIN + deleted_at IS NULL 동시 검증하는 이유:
//   - last_workspace_id가 남아 있어도 사용자가 그 workspace를 탈퇴했거나 workspace가 soft-delete된 경우
//     자연스럽게 2순위 폴백으로 진입. "유령 workspace에 갇히는" 상황 방지.
//
// 2차 orderBy key (id) 유지:
//   joinedAt 동률(backfill 일괄 INSERT) 시 DB 임의 행 선택 → request마다 다른 workspace 반환 가능.
//   id ASC로 결정적(deterministic) 선택 보장.
export const getCurrentWorkspaceId = cache(async (): Promise<string | null> => {
  const userId = await getUserId();
  if (!userId) return null;

  // 1순위: users.last_workspace_id. 현재 소속 + soft-delete 아닌 경우만 유효.
  const lastRows = await db
    .select({ workspaceId: users.lastWorkspaceId })
    .from(users)
    .innerJoin(
      workspaceMembers,
      and(
        eq(workspaceMembers.userId, users.id),
        eq(workspaceMembers.workspaceId, users.lastWorkspaceId),
      ),
    )
    .innerJoin(
      workspaces,
      and(eq(workspaces.id, users.lastWorkspaceId), isNull(workspaces.deletedAt)),
    )
    .where(eq(users.id, userId))
    .limit(1);

  if (lastRows[0]?.workspaceId) return lastRows[0].workspaceId;

  // 2순위 폴백: 소속 workspace 중 joined_at MIN + id ASC.
  const rows = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        isNull(workspaces.deletedAt),
      ),
    )
    .orderBy(asc(workspaceMembers.joinedAt), asc(workspaceMembers.id))
    .limit(1);

  return rows[0]?.workspaceId ?? null;
});
