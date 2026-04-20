"use server";

import { db } from "@/lib/db";
import { projects, portalTokens, activityLogs } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import { and, eq, gte, isNull, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectIdSchema = z.string().uuid();

// 토큰 만료 기본값: 발급 시점 + 365일. 앱 레이어에서 명시 저장해 정책 변경 유연성 확보.
const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;

// 발급 DoS 방어 — 단일 사용자가 1분 내 5회 초과 발급 시 거부.
// 트랜잭션 외부에서 먼저 체크해 락 리소스 점유 시간 최소화.
// revoked 토큰도 count — "취소 후 재발급" 반복으로 한도 우회 시도 방어.
const ISSUE_RATE_WINDOW_MS = 60 * 1000;
const ISSUE_RATE_MAX = 5;

export type IssuePortalTokenResult =
  | { success: true; token: string; expiresAt: string }
  | { success: false; error: string };

export type RevokePortalTokenResult =
  | { success: true }
  | { success: false; error: string };

export type ActivePortalTokenSummary = {
  token: string;
  issuedAt: string;
  expiresAt: string;
  lastAccessedAt: string | null;
};

// ─── 조회: 프로젝트의 활성 토큰 1건 (있으면 가장 최근 발급) ───

export async function getActivePortalToken(
  projectId: string,
): Promise<ActivePortalTokenSummary | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const idCheck = projectIdSchema.safeParse(projectId);
  if (!idCheck.success) return null;

  // 소유권 + 활성 토큰을 단일 쿼리로 검증 — projects JOIN 대신 서브쿼리 대신
  // "activity 토큰은 항상 프로젝트 소유자 확인 후 조회"라는 앱 레이어 계약을 유지.
  // 같은 프로젝트에 활성 토큰이 2건 이상이 되면 버그이나, 안전망으로 가장 최근 1건만 반환.
  const [owned] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, idCheck.data),
        eq(projects.userId, userId),
        workspaceScope(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!owned) return null;

  const [row] = await db
    .select({
      token: portalTokens.token,
      issuedAt: portalTokens.issuedAt,
      expiresAt: portalTokens.expiresAt,
      lastAccessedAt: portalTokens.lastAccessedAt,
    })
    .from(portalTokens)
    .where(
      and(
        eq(portalTokens.projectId, idCheck.data),
        workspaceScope(portalTokens.workspaceId, workspaceId),
        isNull(portalTokens.revokedAt),
      ),
    )
    .orderBy(desc(portalTokens.issuedAt))
    .limit(1);

  if (!row) return null;

  return {
    token: row.token,
    issuedAt: row.issuedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    lastAccessedAt: row.lastAccessedAt ? row.lastAccessedAt.toISOString() : null,
  };
}

// ─── 발급 (재발급 포함) ───
//
// 동작: 기존 활성 토큰 전부 revokedAt=now → 신규 토큰 INSERT → activity_logs 감사.
// 트랜잭션 + projects FOR UPDATE 락으로 동시 발급 요청 직렬화 (updateProjectStatusAction 패턴).

export async function issuePortalTokenAction(
  projectId: string,
): Promise<IssuePortalTokenResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = projectIdSchema.safeParse(projectId);
  if (!idCheck.success)
    return { success: false, error: "프로젝트 식별자가 올바르지 않습니다" };

  try {
    // Rate limit — 트랜잭션 외부 선검사로 락 점유 최소화.
    // userId 기준: 한 사용자가 여러 프로젝트에 동시 폭주 발급하는 경우도 방어.
    const windowStart = new Date(Date.now() - ISSUE_RATE_WINDOW_MS);
    const [rateRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(portalTokens)
      .where(
        and(
          eq(portalTokens.issuedBy, userId),
          gte(portalTokens.issuedAt, windowStart),
        ),
      );
    if ((rateRow?.count ?? 0) >= ISSUE_RATE_MAX) {
      return {
        success: false,
        error: "짧은 시간 내 발급 요청이 너무 많습니다. 잠시 후 다시 시도해주세요",
      };
    }

    const result = await db.transaction(async (tx) => {
      // 소유권 확인 + 행 락 — 동시 발급/재발급 직렬화.
      // 현재 발급/취소 경로 모두 projects 행 FOR UPDATE를 거치므로 직렬화됨.
      // 향후 cron/외부 경로 추가 시 portal_tokens 부분 유니크 인덱스
      // (0013: `UNIQUE (project_id) WHERE revoked_at IS NULL`)가 DB 레벨 불변식 강제.
      const [owned] = await tx
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.id, idCheck.data),
            eq(projects.userId, userId),
            workspaceScope(projects.workspaceId, workspaceId),
            isNull(projects.deletedAt),
          ),
        )
        .for("update", { of: projects })
        .limit(1);

      if (!owned) return null;

      const now = new Date();

      // 기존 활성 토큰 전부 revoke — 동시 여러 활성 토큰 존재 가능성을 원천 차단.
      // returning으로 revoke된 tokenId 수집 → activity_logs metadata 감사 추적.
      const previousRevoked = await tx
        .update(portalTokens)
        .set({ revokedAt: now })
        .where(
          and(
            eq(portalTokens.projectId, idCheck.data),
            workspaceScope(portalTokens.workspaceId, workspaceId),
            isNull(portalTokens.revokedAt),
          ),
        )
        .returning({ id: portalTokens.id });

      // 신규 토큰 INSERT — crypto.randomUUID()는 UUID v4 (122bit 무작위). 하이픈 외 특수문자 없어 URL-safe.
      const token = crypto.randomUUID();
      const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

      const [tokenRow] = await tx
        .insert(portalTokens)
        .values({
          projectId: idCheck.data,
          workspaceId,
          token,
          issuedBy: userId,
          issuedAt: now,
          expiresAt,
        })
        .returning({ id: portalTokens.id });

      // 감사 메타: 토큰 원본 값은 절대 포함하지 말 것(로그 열람자가 URL 재구성 가능).
      // `reissue`와 `revokedTokenIds`로 "어느 토큰이 어느 토큰을 교체했는지" 역추적 가능.
      await tx.insert(activityLogs).values({
        userId,
        workspaceId,
        projectId: idCheck.data,
        entityType: "portal_token",
        entityId: tokenRow.id,
        action: "portal_token.issued",
        description: "고객 포털 링크 발급",
        metadata: {
          expiresAt: expiresAt.toISOString(),
          reissue: previousRevoked.length > 0,
          revokedTokenIds: previousRevoked.map((r) => r.id),
        },
      });

      return { token, expiresAt };
    });

    if (!result) {
      return { success: false, error: "프로젝트를 찾을 수 없습니다" };
    }

    revalidatePath(`/dashboard/projects/${idCheck.data}`);
    return {
      success: true,
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "issue_portal_token_failed", message });
    return { success: false, error: "포털 링크 발급 중 오류가 발생했습니다" };
  }
}

// ─── 수동 취소 ───

export async function revokePortalTokenAction(
  projectId: string,
): Promise<RevokePortalTokenResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = projectIdSchema.safeParse(projectId);
  if (!idCheck.success)
    return { success: false, error: "프로젝트 식별자가 올바르지 않습니다" };

  try {
    const result = await db.transaction(async (tx) => {
      const [owned] = await tx
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.id, idCheck.data),
            eq(projects.userId, userId),
            workspaceScope(projects.workspaceId, workspaceId),
            isNull(projects.deletedAt),
          ),
        )
        .for("update", { of: projects })
        .limit(1);

      if (!owned) return null;

      const revoked = await tx
        .update(portalTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(portalTokens.projectId, idCheck.data),
            workspaceScope(portalTokens.workspaceId, workspaceId),
            isNull(portalTokens.revokedAt),
          ),
        )
        .returning({ id: portalTokens.id });

      if (revoked.length === 0) return { revokedCount: 0 };

      await tx.insert(activityLogs).values({
        userId,
        workspaceId,
        projectId: idCheck.data,
        entityType: "portal_token",
        action: "portal_token.revoked",
        description: "고객 포털 링크 취소",
        metadata: {
          revokedCount: revoked.length,
          revokedTokenIds: revoked.map((r) => r.id),
        },
      });

      return { revokedCount: revoked.length };
    });

    if (!result) {
      return { success: false, error: "프로젝트를 찾을 수 없습니다" };
    }

    revalidatePath(`/dashboard/projects/${idCheck.data}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "revoke_portal_token_failed", message });
    return { success: false, error: "포털 링크 취소 중 오류가 발생했습니다" };
  }
}
