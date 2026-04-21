import "server-only";
import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";

// Phase 5 Task 5-2-3-B: 현재 user가 소속된 workspace 목록 + 역할 조회.
//
// React cache()로 request 스코프 메모이제이션 — Header Server Component와
// Sidebar(향후 workspace 표시) 등 여러 곳에서 같은 request 안에 호출돼도 1회 조회로 수렴.
//
// soft-delete 제외 + 이름 오름차순 정렬 — picker dropdown에서 일관된 순서 보장.

export type WorkspaceRole = "owner" | "admin" | "member";

export type UserWorkspace = {
  id: string;
  name: string;
  role: WorkspaceRole;
};

export const listUserWorkspaces = cache(async (): Promise<UserWorkspace[]> => {
  const userId = await getUserId();
  if (!userId) return [];

  const rows = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(
      and(eq(workspaceMembers.userId, userId), isNull(workspaces.deletedAt)),
    )
    .orderBy(asc(workspaces.name), asc(workspaces.id));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role as WorkspaceRole,
  }));
});
