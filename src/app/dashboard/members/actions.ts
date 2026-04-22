"use server";

import { randomUUID } from "crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  activityLogs,
  users,
  workspaceInvitations,
  workspaceMembers,
  workspaceSettings,
  workspaces,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import { canManageMembers } from "@/lib/auth/workspace-permissions";
import { sendInvitationEmail } from "@/lib/email/resend";
import { getMaxMembers, getPlanLabel, suggestUpgradeTarget } from "@/lib/plans";
import { checkAndIncrementRateLimit } from "@/lib/rate-limit";
import {
  createInvitationInputSchema,
  invitationIdSchema,
} from "@/lib/validation/invitation";

// Phase 5 Task 5-2-4: workspace 멤버 초대 Server Actions.
//
// 10패턴 준수:
//  1) "use server" + async function만 export (type/const 외부 노출 금지 — Turbopack 변환 유지)
//  2) getUserId + getCurrentWorkspaceId 인증
//  3) getCurrentWorkspaceRole + canManageMembers 권한 체크 (owner/admin만)
//  4) Zod .strict() 입력 검증
//  5) UNIQUE 위반(중복 활성 초대)은 PostgreSQL code 23505로 구분 → 사용자 친화 메시지
//  6) Resend 발송 실패 시 soft revoke로 일관성 복구 (DB에는 row 남김, 감사 경로 보존)
//  7) invited_by = 현재 userId (FK set null 시 audit 기록 유지)
//  8) token = crypto.randomUUID() 122-bit 엔트로피 (portal_tokens 패턴 재사용, PRD 섹션 3)
//  9) 로그는 에러 이름/짧은 메시지만 (email/token 등 민감 데이터 제외)
// 10) revalidatePath 후 클라이언트 router.refresh()로 목록 갱신

type ActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code?:
        | "AUTH"
        | "FORBIDDEN"
        | "INVALID_INPUT"
        | "DUPLICATE"
        | "NOT_FOUND"
        | "EMAIL_FAILED"
        | "LIMIT_EXCEEDED"
        | "RATE_LIMITED"
        | "UNKNOWN";
    };

// Phase 5.5 Task 5-5-4: createInvitationAction abuse 방어용 한도.
// userId 기반 분/시간 두 단계 — 정상 admin은 절대 도달하지 않을 값.
//   분당 5회: 자동화/스크립트 차단
//   시간당 20회: 단일 admin이 정상 운영하기에 충분 + 누적 abuse 방어
// 한도값 변경 시 docs/env-setup.md 또는 운영 가이드 동기화 권장.
const INVITE_RATE_LIMITS = {
  perMinute: { windowSec: 60, limit: 5 },
  perHour: { windowSec: 3600, limit: 20 },
} as const;

// Phase 5.5 Task 5-5-2: plan별 멤버 수 상한 도달 시 트랜잭션 안에서 throw → 외부 catch에서 분기.
// transaction 내부에서 throw하면 drizzle이 자동 ROLLBACK + 외부로 propagate.
class MemberLimitExceededError extends Error {
  readonly code = "MEMBER_LIMIT_EXCEEDED" as const;
  constructor(
    readonly used: number,
    readonly limit: number,
    readonly plan: string,
  ) {
    super("MEMBER_LIMIT_EXCEEDED");
    this.name = "MemberLimitExceededError";
  }
}

const INVITE_TTL_DAYS = 7;

function computeExpiresAt(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + INVITE_TTL_DAYS);
  return d;
}

// security-reviewer H2 + code-reviewer HIGH-1 반영 (2026-04-22):
// NEXT_PUBLIC_APP_URL 누락 시 "/invite/<token>" 상대 경로로 발송되어 수신자 클릭 불가 +
// DB에 "발송됨" 기록만 남음 → 토큰 영구 교착. fail-fast로 전환해 Server Action이
// early throw → email try/catch → soft revoke 경로로 일관성 있게 처리.
function buildInviteUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_APP_URL not configured");
  if (!/^https?:\/\//.test(base)) {
    throw new Error("NEXT_PUBLIC_APP_URL must be absolute http(s) URL");
  }
  return `${base}/invite/${token}`;
}

// ─── 초대 생성 ───
//
// 플로우:
//   1. 인증 + 권한 체크
//   2. 입력 검증 (email 정규화 + role 화이트리스트)
//   3. workspace/inviter 메타 조회 (이메일 본문용)
//   4. workspace_invitations INSERT (partial unique idx로 중복 차단)
//   5. Resend 발송 (실패 시 row soft revoke로 일관성 복구)
//   6. revalidatePath
export async function createInvitationAction(formData: FormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다", code: "AUTH" };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return { success: false, error: "워크스페이스를 확인할 수 없습니다", code: "AUTH" };
  }

  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (!canManageMembers(role)) {
    return { success: false, error: "멤버 초대 권한이 없습니다", code: "FORBIDDEN" };
  }

  const parsed = createInvitationInputSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues.find((i) => i.code !== "unrecognized_keys");
    return {
      success: false,
      error: issue?.message ?? "입력값이 올바르지 않습니다",
      code: "INVALID_INPUT",
    };
  }

  // Phase 5.5 Task 5-5-4: rate limit (validation 통과 후 — 오타로 자기 자신 차단 방지).
  // Short-circuit: 분 한도 차단 시 시간 카운트 skip → 정상 admin이 분 차단 후 시간 한도까지
  // 부당하게 도달하는 부작용 방지 (HIGH-1 reviewer 반영). abuser가 "분당 5회 → 1분 쉬고 반복"
  // 패턴으로 시간 한도 우회 시도 가능하지만 4분만에 시간 한도(20) 도달 — 큰 우회 아님.
  const minuteCheck = await checkAndIncrementRateLimit(
    `invite:user:${userId}:m`,
    INVITE_RATE_LIMITS.perMinute,
  );
  if (!minuteCheck.allowed) {
    return {
      success: false,
      error: `초대 발송 횟수가 너무 많습니다. ${minuteCheck.retryAfterSec}초 후 다시 시도해주세요.`,
      code: "RATE_LIMITED",
    };
  }
  const hourCheck = await checkAndIncrementRateLimit(
    `invite:user:${userId}:h`,
    INVITE_RATE_LIMITS.perHour,
  );
  if (!hourCheck.allowed) {
    return {
      success: false,
      error: `초대 발송 횟수가 너무 많습니다. ${hourCheck.retryAfterSec}초 후 다시 시도해주세요.`,
      code: "RATE_LIMITED",
    };
  }

  // 이메일 템플릿에 표시할 workspace name + inviter 이름
  const [wsRow] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), isNull(workspaces.deletedAt)))
    .limit(1);
  if (!wsRow) {
    return { success: false, error: "워크스페이스를 찾을 수 없습니다", code: "NOT_FOUND" };
  }

  const [inviterRow] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const inviterName = inviterRow?.name || inviterRow?.email || "팀 관리자";

  const token = randomUUID();
  const expiresAt = computeExpiresAt();

  // security-reviewer H2: INSERT 전에 URL 생성해서 env 누락 시 early throw.
  // DB row 먼저 만들고 이메일 실패하는 순서를 피해 감사 경로 단순화.
  let inviteUrl: string;
  try {
    inviteUrl = buildInviteUrl(token);
  } catch (err) {
    console.error("[createInvitationAction] url build error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "이메일 발송 설정이 미완료 상태입니다. 관리자에게 문의해주세요.",
      code: "UNKNOWN",
    };
  }

  // Phase 5.5 Task 5-5-2: plan별 멤버 한도 게이트 + 기존 INSERT를 단일 트랜잭션에 묶음.
  // - advisory lock으로 workspace 단위 잠금 → 동시에 들어온 초대 INSERT 직렬화 (TOCTOU 방어).
  // - workspace_settings.plan SELECT → getMaxMembers로 한도 산출.
  // - workspace_members count + workspace_invitations pending count 합산 → used.
  // - used >= limit이면 MemberLimitExceededError throw → 트랜잭션 ROLLBACK → 외부 catch에서 분기.
  try {
    await db.transaction(async (tx) => {
      // hashtext()는 PG 내장 함수 — bigint 해시 → advisory lock key. xact 변형은 트랜잭션 종료 시 자동 해제.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${workspaceId}))`);

      const [settingsRow] = await tx
        .select({ plan: workspaceSettings.plan })
        .from(workspaceSettings)
        .where(eq(workspaceSettings.workspaceId, workspaceId))
        .limit(1);
      const plan = settingsRow?.plan ?? "free";
      const limit = getMaxMembers(plan);

      const [memberCountRow] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));
      const memberCount = memberCountRow?.count ?? 0;

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
      const pendingCount = pendingCountRow?.count ?? 0;

      const used = memberCount + pendingCount;
      if (used >= limit) {
        throw new MemberLimitExceededError(used, limit, plan);
      }

      const [inserted] = await tx
        .insert(workspaceInvitations)
        .values({
          workspaceId,
          email: parsed.data.email,
          role: parsed.data.role,
          token,
          invitedBy: userId,
          expiresAt,
        })
        .returning({ id: workspaceInvitations.id });

      // Phase 5.5 Task 5-5-3: 감사 로그 기록 (같은 transaction → atomicity 보장).
      // metadata에 raw email/role 저장 — RLS로 workspace 멤버만 조회 가능 (PRD-erd:326).
      await tx.insert(activityLogs).values({
        userId,
        workspaceId,
        entityType: "workspace_invitation",
        entityId: inserted.id,
        action: "workspace_invitation.created",
        description: "멤버 초대 발송",
        metadata: {
          email: parsed.data.email,
          role: parsed.data.role,
          inviterName,
        },
      });
    });
  } catch (err) {
    // 한도 초과 분기 (가장 먼저 — instanceof 매칭이 빠름)
    if (err instanceof MemberLimitExceededError) {
      const planLabel = getPlanLabel(err.plan);
      const upgradeTo = suggestUpgradeTarget(err.plan);
      const limitText = Number.isFinite(err.limit) ? `${err.limit}명` : "무제한";
      return {
        success: false,
        error: `현재 ${planLabel} 플랜의 멤버 한도(${limitText})에 도달했습니다. 기존 멤버나 발송된 초대를 정리하거나 ${upgradeTo} 플랜으로 업그레이드해주세요.`,
        code: "LIMIT_EXCEEDED",
      };
    }

    // 중복 활성 초대 판정 — Drizzle ORM은 원본 PostgresError를 err.cause에 담고
    // 자체 "Failed query: ..." 메시지로 wrap함 (name="Error"). 최상위 err.code는 null.
    // 2026-04-22 1차 hotfix(7618c0d)가 최상위만 봐서 miss 확인 → cause까지 unwrap.
    //   (1) err.code === "23505" || err.cause.code === "23505"
    //   (2) err.message + err.cause.message 결합에서 PG 표준 문구 매칭
    //   (3) constraint 이름 "workspace_invitations_pending_idx" 포함
    const rootCause = (err as { cause?: unknown })?.cause;
    const pgCode =
      (err as { code?: unknown })?.code ??
      (rootCause as { code?: unknown })?.code;
    const errMsg = err instanceof Error ? err.message : String(err);
    const causeMsg = rootCause instanceof Error ? rootCause.message : "";
    const combinedMsg = `${errMsg}\n${causeMsg}`;
    const isDuplicate =
      pgCode === "23505" ||
      /duplicate key value violates unique constraint/i.test(combinedMsg) ||
      /workspace_invitations_pending_idx/.test(combinedMsg);
    if (isDuplicate) {
      return {
        success: false,
        error: "이미 발송된 초대가 있습니다. 먼저 취소하고 다시 보내주세요.",
        code: "DUPLICATE",
      };
    }
    console.error("[createInvitationAction] insert error", {
      name: err instanceof Error ? err.name : typeof err,
      message: errMsg.slice(0, 200),
      pgCode: typeof pgCode === "string" ? pgCode : null,
      causeName: rootCause instanceof Error ? rootCause.name : null,
      causeMessage: causeMsg.slice(0, 200),
    });
    return { success: false, error: "초대 생성 중 오류가 발생했습니다", code: "UNKNOWN" };
  }

  try {
    await sendInvitationEmail({
      to: parsed.data.email,
      workspaceName: wsRow.name,
      inviterName,
      inviteUrl,
      expiresAt,
    });
  } catch (err) {
    // 이메일 실패 → row soft revoke로 일관성 복구 (재발송 경로 열림).
    // security-reviewer H1: revoke UPDATE 자체가 실패하면 pending idx 영구 잠금 → 중첩 try/catch로
    //                        double-fault를 로그로만 남기고 상위는 EMAIL_FAILED 반환 유지.
    try {
      await db
        .update(workspaceInvitations)
        .set({ revokedAt: new Date() })
        .where(eq(workspaceInvitations.token, token));
    } catch (revokeErr) {
      console.error("[createInvitationAction] revoke after email failure also failed", {
        name: revokeErr instanceof Error ? revokeErr.name : typeof revokeErr,
      });
    }
    console.error("[createInvitationAction] email error", {
      name: err instanceof Error ? err.name : typeof err,
    });
    return {
      success: false,
      error: "초대 저장은 되었지만 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
      code: "EMAIL_FAILED",
    };
  }

  revalidatePath("/dashboard/members");
  return { success: true };
}

// ─── 초대 취소 (soft revoke) ───
//
// WHERE에 workspace + not-accepted + not-revoked 3중 조건. 이미 수락됐거나 취소된 초대는
// NOT_FOUND로 반환되어 멱등성 유지.
export async function revokeInvitationAction(invitationId: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다", code: "AUTH" };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return { success: false, error: "워크스페이스를 확인할 수 없습니다", code: "AUTH" };
  }

  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (!canManageMembers(role)) {
    return { success: false, error: "초대 취소 권한이 없습니다", code: "FORBIDDEN" };
  }

  const idCheck = invitationIdSchema.safeParse(invitationId);
  if (!idCheck.success) {
    return { success: false, error: "잘못된 초대 ID입니다", code: "INVALID_INPUT" };
  }

  // Phase 5.5 Task 5-5-3: revoke + activity_log를 단일 transaction으로 묶어 atomicity 보장.
  // 0 rows 반환 케이스(이미 수락/취소됨)는 transaction 안에서 null 반환 → 외부에서 NOT_FOUND.
  // (실제 변경 없음 → audit log도 남기지 않음 — 멱등성 일관)
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(workspaceInvitations)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(workspaceInvitations.id, idCheck.data),
          eq(workspaceInvitations.workspaceId, workspaceId),
          isNull(workspaceInvitations.acceptedAt),
          isNull(workspaceInvitations.revokedAt),
        ),
      )
      .returning({
        id: workspaceInvitations.id,
        email: workspaceInvitations.email,
        role: workspaceInvitations.role,
        invitedBy: workspaceInvitations.invitedBy,
      });

    if (!row) return null;

    await tx.insert(activityLogs).values({
      userId,
      workspaceId,
      entityType: "workspace_invitation",
      entityId: row.id,
      action: "workspace_invitation.revoked",
      description: "멤버 초대 취소",
      metadata: {
        email: row.email,
        role: row.role,
        // 원래 발송자 — revoke한 사람(userId)과 다를 수 있음 (다른 admin이 취소).
        originalInviterUserId: row.invitedBy,
      },
    });

    return row;
  });

  if (!updated) {
    return { success: false, error: "취소할 수 있는 초대가 아닙니다", code: "NOT_FOUND" };
  }

  revalidatePath("/dashboard/members");
  return { success: true };
}
