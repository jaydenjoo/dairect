import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  workspaceInvitations,
  workspaceMembers,
  workspaceSettings,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import { canManageMembers } from "@/lib/auth/workspace-permissions";
import { getMaxMembers, getPlanLabel, suggestUpgradeTarget } from "@/lib/plans";
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

  // ─── Phase 5.5 Task 5-5-2 후속 HIGH-1: 4개 SELECT를 단일 transaction + REPEATABLE READ로 묶음 ───
  // 기존 구조는 memberRows / invitationRows / settingsRow / pendingCountRow 4개가 독립 statement.
  // 4 SELECT 사이에 다른 세션의 INSERT/UPDATE가 끼어들면 "members.length + pendingCount"가
  // 실제 DB 상태와 일시 불일치 → 화면 "N/M" 표시값이 1-2명 어긋남 (UX 영향만, server transaction이
  // INSERT 경로의 실제 정합은 보장). REPEATABLE READ는 transaction 시작 시점 snapshot 고정 →
  // 4 SELECT가 같은 시점을 본다고 보장. read-only라 직렬화 충돌 위험 ~0.
  //
  // Drizzle 공식 config 인자 사용 (code-reviewer LOW-1):
  //   - isolationLevel: "repeatable read" → BEGIN 직후 SET TRANSACTION 자동 발행 (실수/순서 방지)
  //   - accessMode: "read only" → 실수로 INSERT/UPDATE가 섞이면 PG가 거부 (타입+런타임 이중 방어)
  //
  // statement_timeout 3s (security-reviewer M1): 병렬 탭/스크립트 연속 호출로 connection 슬롯을
  // 오래 점유하는 DoS 벡터 경화. 정상 render는 ms 단위라 3s 여유 충분.
  //
  // 만료/pending 판정은 NOW() = transaction_timestamp() (REPEATABLE READ snapshot 시점 고정) 사용
  // (security-reviewer M3) → 4 SELECT 모두 동일 시각 기준 → Server Component Date.now() purity 위반도 회피.
  const snapshot = await db.transaction(
    async (tx) => {
      await tx.execute(sql`SET LOCAL statement_timeout = '3s'`);

      const memberRows = await tx
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

      const invitationRows = await tx
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

      const [settingsRow] = await tx
        .select({ plan: workspaceSettings.plan })
        .from(workspaceSettings)
        .where(eq(workspaceSettings.workspaceId, workspaceId))
        .limit(1);

      const [pendingCountRow] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(workspaceInvitations)
        .where(
          and(
            eq(workspaceInvitations.workspaceId, workspaceId),
            isNull(workspaceInvitations.acceptedAt),
            isNull(workspaceInvitations.revokedAt),
            sql`${workspaceInvitations.expiresAt} > NOW()`,
          ),
        );

      return {
        memberRows,
        invitationRows,
        plan: settingsRow?.plan ?? null,
        pendingCount: pendingCountRow?.count ?? 0,
      };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" },
  );

  const members: MemberRow[] = snapshot.memberRows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    isMe: r.id === userId,
    joinedAtIso: r.joinedAt.toISOString(),
  }));

  // status 판정은 client에서 수행: Server Component는 React purity 규칙상 Date.now() 호출 금지.
  // 대신 raw 필드(acceptedAtIso/revokedAtIso/expiresAtIso) 모두 넘겨 client가 현재 시각과 비교.
  const invitations: InvitationRow[] = snapshot.invitationRows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    expiresAtIso: r.expiresAt.toISOString(),
    createdAtIso: r.createdAt.toISOString(),
    acceptedAtIso: r.acceptedAt ? r.acceptedAt.toISOString() : null,
    revokedAtIso: r.revokedAt ? r.revokedAt.toISOString() : null,
  }));

  // Task 5-5-5 HIGH-4: workspace_settings row 누락 시 silent fallback 대신 알림.
  // (transaction 바깥으로 이동 — side effect는 트랜잭션 커밋 후 처리가 안전.)
  if (snapshot.plan === null) {
    console.error("[members/page] workspace_settings row missing — fallback to 'free'", {
      event: "workspace_settings.missing_fallback",
      workspaceId,
    });
  }
  const plan = snapshot.plan ?? "free";
  const planLabel = getPlanLabel(plan);
  const upgradeTarget = suggestUpgradeTarget(plan);
  const limit = getMaxMembers(plan);

  const used = members.length + snapshot.pendingCount;
  // Infinity는 JSON 직렬화 시 null로 변환되므로 client prop은 number|null로 정규화.
  const limitForClient = Number.isFinite(limit) ? limit : null;

  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        팀 멤버
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        워크스페이스 멤버를 초대하고 관리하세요. 초대 링크는 7일간 유효합니다.
      </p>

      <div className="mt-8">
        <MembersClient
          members={members}
          invitations={invitations}
          planLabel={planLabel}
          upgradeTarget={upgradeTarget}
          limit={limitForClient}
          used={used}
        />
      </div>
    </div>
  );
}
