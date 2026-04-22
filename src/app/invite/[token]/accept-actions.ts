"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  activityLogs,
  users,
  workspaceInvitations,
  workspaceMembers,
  workspaceSettings,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getMaxMembers, getPlanLabel, suggestUpgradeTarget } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitationInputSchema } from "@/lib/validation/invite-accept";

// Phase 5 Task 5-2-5: 초대 수락 Server Action.
//
// 트랜잭션 설계:
//   1) 인증 확인 → user.email 획득
//   2) Zod 토큰 검증
//   3) (트랜잭션 시작) workspace_invitations UPDATE SET accepted_at=NOW()
//      WHERE token + pending + not revoked + not expired + email 일치(소문자 비교)
//      → 단일 UPDATE로 "상태 조회 + 수락" 원자화. 0 rows = race/invalid.
//      → RETURNING workspace_id, role, email
//   4) workspace_members INSERT (workspace_id + user_id + role)
//      → UNIQUE (workspace_id, user_id) ON CONFLICT DO NOTHING (이중 수락 방어)
//   5) users UPDATE last_workspace_id = workspace_id (자동 스위치 UX)
//   6) 트랜잭션 commit + revalidatePath + return workspaceId
//
// 만료 판정:
//   DB 레벨 `expires_at <= NOW()` 사용 (Date.now() 금지).
//   앱 서버 시계 drift 시 false negative/positive 방지.
//
// email 매칭 정책 (엄격):
//   - invitation.email (저장 시 lowercase) vs user.email (supabase auth, 대소문자 그대로)
//   - lower(email) = lower(user.email) 비교로 case-insensitive.
//   - 불일치 시 UPDATE의 WHERE가 0 rows 반환 → MISMATCH 에러.
//   - 에러 메시지에 invitation.email 노출 금지 (email enumeration 방지).
//
// role='owner' 차단 (defense-in-depth):
//   - 현재 inviteRoleSchema가 admin|member로만 허용.
//   - 과거 데이터/직접 INSERT 우회 시나리오 대비해 수락 시점에도 재차 차단.

type AcceptResult =
  | { success: true; workspaceId: string }
  | {
      success: false;
      error: string;
      code:
        | "AUTH"
        | "INVALID_INPUT"
        | "INVALID_TOKEN"
        | "EXPIRED"
        | "REVOKED"
        | "ALREADY_ACCEPTED"
        | "EMAIL_MISMATCH"
        | "LIMIT_EXCEEDED"
        | "UNKNOWN";
    };

// Phase 5.5 Task 5-5-2: 수락 측 plan 한도 게이트 (code-reviewer CRIT-1 반영).
// 발송 시점에 통과한 초대도 plan downgrade(pro→free) 또는 SQL 직접 INSERT 우회 시
// 수락 시점에 한도가 깨질 수 있음 → defense-in-depth로 transaction 안에서 재검증.
class AcceptLimitExceededError extends Error {
  readonly code = "ACCEPT_LIMIT_EXCEEDED" as const;
  constructor(
    readonly memberCount: number,
    readonly limit: number,
    readonly plan: string,
  ) {
    super("ACCEPT_LIMIT_EXCEEDED");
    this.name = "AcceptLimitExceededError";
  }
}

export async function acceptInvitationAction(token: string): Promise<AcceptResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다", code: "AUTH" };
  }

  // Supabase auth.getUser()로 최신 email 획득 (user_metadata가 아닌 verified email).
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userEmail = authData?.user?.email;
  if (!userEmail) {
    return { success: false, error: "로그인이 필요합니다", code: "AUTH" };
  }

  const parsed = acceptInvitationInputSchema.safeParse({ token });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "잘못된 초대 링크입니다",
      code: "INVALID_INPUT",
    };
  }

  // 진단용: 토큰 row의 현재 상태를 미리 조회하여 정확한 에러 코드 반환.
  // (UPDATE만으로는 "왜 0 rows인지"를 구분 불가 → expired/revoked/accepted/mismatch 4종 분기 필요)
  // 만료 판정은 DB의 NOW() 사용 — page.tsx와 동일 방식으로 통일, 앱 시계 drift 제거.
  const [existing] = await db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      workspaceId: workspaceInvitations.workspaceId,
      role: workspaceInvitations.role,
      isExpired: sql<boolean>`${workspaceInvitations.expiresAt} <= NOW()`,
      acceptedAt: workspaceInvitations.acceptedAt,
      revokedAt: workspaceInvitations.revokedAt,
    })
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, parsed.data.token))
    .limit(1);

  if (!existing) {
    return { success: false, error: "초대 링크가 유효하지 않습니다", code: "INVALID_TOKEN" };
  }
  // role='owner'는 UI에서 생성 불가 상태지만 defense-in-depth — 직접 DB INSERT 경로 차단.
  if (existing.role === "owner") {
    return { success: false, error: "초대 링크가 유효하지 않습니다", code: "INVALID_TOKEN" };
  }
  if (existing.revokedAt) {
    return { success: false, error: "취소된 초대입니다", code: "REVOKED" };
  }
  if (existing.acceptedAt) {
    return { success: false, error: "이미 수락된 초대입니다", code: "ALREADY_ACCEPTED" };
  }
  if (existing.isExpired) {
    return { success: false, error: "초대 링크가 만료되었습니다", code: "EXPIRED" };
  }
  if (existing.email.toLowerCase() !== userEmail.toLowerCase()) {
    // 에러 메시지에 invitation.email 노출 금지 — 공격자가 임의 토큰으로 수신자 email
    // 열람을 시도하는 enumeration 방지.
    return {
      success: false,
      error: "이 초대는 다른 이메일로 발송되었습니다. 로그아웃 후 초대받은 이메일로 다시 로그인해주세요.",
      code: "EMAIL_MISMATCH",
    };
  }

  try {
    const workspaceId = await db.transaction(async (tx) => {
      // ─── Phase 5.5 Task 5-5-2: 수락 측 plan 한도 게이트 ───
      // advisory lock으로 동시 다수 수락 직렬화 → race로 한도 초과 방지.
      // hashtext()는 32-bit 해시 (워크스페이스 1만 개 시점에 충돌 우려 — Phase 5.5 ToDo).
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${existing.workspaceId}))`);

      // 이미 멤버라면 한도 체크 skip — onConflictDoNothing이 INSERT skip하므로 idempotent 보장.
      // page render와 accept 사이의 race(동시 다른 탭 수락)에서 한도 도달 false positive 차단.
      const [existingMember] = await tx
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, existing.workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        )
        .limit(1);

      if (!existingMember) {
        const [settingsRow] = await tx
          .select({ plan: workspaceSettings.plan })
          .from(workspaceSettings)
          .where(eq(workspaceSettings.workspaceId, existing.workspaceId))
          .limit(1);
        const plan = settingsRow?.plan ?? "free";
        const limit = getMaxMembers(plan);

        const [memberCountRow] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(workspaceMembers)
          .where(eq(workspaceMembers.workspaceId, existing.workspaceId));
        const memberCount = memberCountRow?.count ?? 0;

        // memberCount >= limit이면 자기 자신 추가 시 한도 초과 → 거부.
        // pending 초대 수는 빼지 않음: 자기 invitation은 곧 accept되어 member로 전환되므로
        // pending - 1 + member + 1 = 합 동일. members만 보면 충분.
        if (memberCount >= limit) {
          throw new AcceptLimitExceededError(memberCount, limit, plan);
        }
      }

      // 1) invitations UPDATE — WHERE 조건으로 race safety 확보 (동시 수락 시 1건만 성공).
      //    email은 다시 한 번 DB 레벨에서 검증 (TOCTOU 방어).
      //    role != 'owner' 조건도 WHERE에 포함 — pre-query 이후 DB가 바뀌었을 가능성 차단.
      const accepted = await tx
        .update(workspaceInvitations)
        .set({ acceptedAt: sql`NOW()` })
        .where(
          and(
            eq(workspaceInvitations.token, parsed.data.token),
            isNull(workspaceInvitations.acceptedAt),
            isNull(workspaceInvitations.revokedAt),
            sql`${workspaceInvitations.expiresAt} > NOW()`,
            sql`LOWER(${workspaceInvitations.email}) = LOWER(${userEmail})`,
            sql`${workspaceInvitations.role} IN ('admin', 'member')`,
          ),
        )
        .returning({
          id: workspaceInvitations.id,
          workspaceId: workspaceInvitations.workspaceId,
          role: workspaceInvitations.role,
        });

      if (accepted.length === 0) {
        // 동시 수락 등 race 상황 — 트랜잭션 롤백
        throw new Error("ACCEPT_RACE");
      }
      const { id: invitationId, workspaceId: acceptedWsId, role: acceptedRole } = accepted[0];

      // 2) workspace_members INSERT — UNIQUE (workspace_id, user_id) 이중 수락 방어
      await tx
        .insert(workspaceMembers)
        .values({
          workspaceId: acceptedWsId,
          userId,
          role: acceptedRole,
        })
        .onConflictDoNothing({
          target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        });

      // 3) users.last_workspace_id 업데이트 — 수락 직후 자동 workspace 스위치 UX
      await tx
        .update(users)
        .set({ lastWorkspaceId: acceptedWsId })
        .where(eq(users.id, userId));

      // 4) Phase 5.5 Task 5-5-3: 감사 로그 기록 (같은 transaction → atomicity).
      // metadata.email은 invitation의 저장된 email (이미 lowercase 정규화됨).
      // metadata.inviteeUserId는 수락자 본인 — invitedBy(원래 발송자)와 분리되어 추적 가능.
      await tx.insert(activityLogs).values({
        userId,
        workspaceId: acceptedWsId,
        entityType: "workspace_invitation",
        entityId: invitationId,
        action: "workspace_invitation.accepted",
        description: "멤버 초대 수락",
        metadata: {
          email: existing.email,
          role: acceptedRole,
          inviteeUserId: userId,
        },
      });

      return acceptedWsId;
    });

    revalidatePath("/dashboard");
    return { success: true, workspaceId };
  } catch (err) {
    // Phase 5.5 Task 5-5-2: 한도 초과 분기 (instanceof 매칭 — DUPLICATE/RACE 분기보다 먼저).
    if (err instanceof AcceptLimitExceededError) {
      const planLabel = getPlanLabel(err.plan);
      const upgradeTo = suggestUpgradeTarget(err.plan);
      const limitText = Number.isFinite(err.limit) ? `${err.limit}명` : "무제한";
      return {
        success: false,
        error: `워크스페이스 멤버 한도(${planLabel} 플랜 ${limitText})에 도달했습니다. 워크스페이스 관리자가 ${upgradeTo} 플랜으로 업그레이드하거나 기존 멤버를 정리한 후 다시 시도해주세요.`,
        code: "LIMIT_EXCEEDED",
      };
    }

    if (err instanceof Error && err.message === "ACCEPT_RACE") {
      // race 발생 시 row 상태를 재조회하여 정확한 code 반환
      // 만료 판정도 DB NOW() 기준으로 통일.
      const [after] = await db
        .select({
          acceptedAt: workspaceInvitations.acceptedAt,
          revokedAt: workspaceInvitations.revokedAt,
          isExpired: sql<boolean>`${workspaceInvitations.expiresAt} <= NOW()`,
        })
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.token, parsed.data.token))
        .limit(1);
      if (!after) return { success: false, error: "초대 링크가 유효하지 않습니다", code: "INVALID_TOKEN" };
      if (after.acceptedAt) return { success: false, error: "이미 수락된 초대입니다", code: "ALREADY_ACCEPTED" };
      if (after.revokedAt) return { success: false, error: "취소된 초대입니다", code: "REVOKED" };
      if (after.isExpired) return { success: false, error: "초대 링크가 만료되었습니다", code: "EXPIRED" };
      return { success: false, error: "초대 수락에 실패했습니다. 다시 시도해주세요.", code: "UNKNOWN" };
    }
    // 에러 로그에 token 포함 금지 — Vercel 로그 유출 시 무자격 수락 위험.
    console.error("[acceptInvitationAction] error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "초대 수락 중 오류가 발생했습니다",
      code: "UNKNOWN",
    };
  }
}
