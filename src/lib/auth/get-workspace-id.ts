import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";

// Phase 5 Task 5-1-6: 현재 request의 활성 workspace ID 조회.
//
// React cache()로 request 스코프 메모이제이션 — getUserId와 동일 패턴.
// Server Component + 여러 Server Action이 같은 request 안에서 호출해도
// DB 조회는 1회로 수렴.
//
// Why fallback-only now:
//   Epic 5-2 Task 5-2-3에서 users.last_workspace_id 컬럼 + workspace picker UI
//   도입 예정. 그 시점 1순위 조회 로직을 이 함수에 추가하고, 현 fallback은
//   2순위로 밀려남 (members.joined_at MIN — 최초 소속 workspace).
//
// Why innerJoin + isNull(deletedAt):
//   workspaces.deletedAt 소프트 삭제(R7 30일 유예)된 workspace를 fallback으로
//   선택하면 이후 read/write가 모두 실패. 삭제된 workspace는 필터링.
//
// Why 2차 orderBy key (id):
//   joinedAt 동률(backfill 일괄 INSERT) 시 DB 임의 행 선택 → request마다
//   다른 workspace 반환 가능. id ASC로 결정적(deterministic) 선택 보장.
export const getCurrentWorkspaceId = cache(async (): Promise<string | null> => {
  const userId = await getUserId();
  if (!userId) return null;

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
