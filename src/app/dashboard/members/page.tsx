import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  workspaceInvitations,
  workspaceMembers,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import { canManageMembers } from "@/lib/auth/workspace-permissions";
import { MembersClient, type MemberRow, type InvitationRow } from "./members-client";

export const metadata: Metadata = {
  title: "팀 멤버",
};

// Phase 5 Task 5-2-4: /dashboard/members 페이지.
//
// 권한 가드 (PRD 섹션 10 C2):
//   - 미인증 → /login
//   - workspace 없음 → /onboarding
//   - member role → /dashboard (멤버 관리 권한 없음)
//   - owner/admin → 정상 진입
//
// 서버에서 Drizzle 집계 → 직렬화 가능 객체(ISO 날짜 문자열)로 client prop 전달.
//   Date 그대로 넘기면 Client Boundary serialize 에러 발생 위험.
export default async function MembersPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (!canManageMembers(role)) redirect("/dashboard");

  // ─── 현재 멤버 목록 (workspace_members + users join) ───
  const memberRows = await db
    .select({
      id: workspaceMembers.userId,
      email: users.email,
      name: users.name,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(desc(workspaceMembers.joinedAt));

  const members: MemberRow[] = memberRows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    isMe: r.id === userId,
    joinedAtIso: r.joinedAt.toISOString(),
  }));

  // ─── 초대 내역 (pending/accepted/revoked/expired 모두 표시) ───
  // status 판정은 client에서 수행: Server Component는 React purity 규칙상 Date.now() 호출 금지.
  // 대신 raw 필드(acceptedAtIso/revokedAtIso/expiresAtIso) 모두 넘겨 client가 현재 시각과 비교.
  const invitationRows = await db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      expiresAt: workspaceInvitations.expiresAt,
      createdAt: workspaceInvitations.createdAt,
      acceptedAt: workspaceInvitations.acceptedAt,
      revokedAt: workspaceInvitations.revokedAt,
    })
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.workspaceId, workspaceId))
    .orderBy(desc(workspaceInvitations.createdAt));

  const invitations: InvitationRow[] = invitationRows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    expiresAtIso: r.expiresAt.toISOString(),
    createdAtIso: r.createdAt.toISOString(),
    acceptedAtIso: r.acceptedAt ? r.acceptedAt.toISOString() : null,
    revokedAtIso: r.revokedAt ? r.revokedAt.toISOString() : null,
  }));

  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        팀 멤버
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        워크스페이스 멤버를 초대하고 관리하세요. 초대 링크는 7일간 유효합니다.
      </p>

      <div className="mt-8">
        <MembersClient members={members} invitations={invitations} />
      </div>
    </div>
  );
}
