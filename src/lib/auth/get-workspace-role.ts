import { cache } from "react";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";

// Phase 5 Task 5-1-7: 현재 user의 workspace 내 역할 조회.
//
// PRD 섹션 10 C2 결정: owner/admin/member 3 역할.
//   - owner: 결제 + 멤버관리 + 전체 write
//   - admin: 멤버관리 + 전체 write
//   - member: 자기 생성 프로젝트 + 하위 엔티티만 write, 다른 멤버 데이터는 read only
//
// React cache()로 request 스코프 메모이제이션 (getCurrentWorkspaceId와 동일 패턴).
//
// Why isNull(workspaces.deletedAt):
//   get-workspace-id.ts와 정합성 유지 — soft-delete된 workspace는 역할도 유효하지 않음.
//
// 현재 single-user 시점: 모든 user는 자기 default workspace의 owner (Task 5-1-3 backfill).
// 실제 multi-member 상황은 Epic 5-2 (invite + member 도입) 이후 발생.

export type WorkspaceRole = "owner" | "admin" | "member";

export const getCurrentWorkspaceRole = cache(
  async (userId: string, workspaceId: string): Promise<WorkspaceRole | null> => {
    const rows = await db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
          isNull(workspaces.deletedAt),
        ),
      )
      .limit(1);

    const role = rows[0]?.role;
    if (role === "owner" || role === "admin" || role === "member") return role;
    return null;
  },
);
