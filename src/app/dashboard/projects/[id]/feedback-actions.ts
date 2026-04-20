"use server";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  activityLogs,
  portalFeedbacks,
  projects,
} from "@/lib/db/schema";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";

// 정책: portal_feedbacks 테이블은 workspace_id 컬럼 없음 (Task 5-1-2 범위 외).
//   projects 경유 간접 격리 — 소유권 체크 시 projects.workspace_id 조건 추가.
//   activity_logs INSERT 시 workspaceId 주입.

const uuidSchema = z.string().uuid();

// 조회 상한 — 현재 규모 대비 방어적. Phase 5에서 검색/필터 + 페이지네이션 도입.
const FEEDBACKS_LIMIT = 50;

// 정책 주석: soft-delete된 프로젝트(projects.deletedAt IS NOT NULL)의 피드백은 M6에서
// 관리 불가 (조회/읽음 처리 모두 소유권 JOIN에서 차단). 복구 전까지는 감사 로그로만 추적.
// M5 validatePortalToken과 일관된 정책.

export type ProjectFeedbackItem = {
  id: string;
  message: string;
  clientIp: string | null;
  userAgent: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type ProjectFeedbackSummary = {
  items: ProjectFeedbackItem[];
  total: number;
  unread: number;
};

// ─── 조회: 프로젝트 피드백 목록 + 미확인 카운트 ───
//
// 소유권 검증: projects.user_id = session.user_id 를 JOIN 조건으로 강제.
// 호출자 미인증/UUID 불량/미소유 시 빈 결과 반환 (information disclosure 방지).
// Feedback 탭 활성 시에만 호출 — 타 탭에서는 getUnreadFeedbackCount만 호출.
export async function getProjectFeedbacks(
  projectId: string,
): Promise<ProjectFeedbackSummary> {
  const empty: ProjectFeedbackSummary = { items: [], total: 0, unread: 0 };

  const userId = await getUserId();
  if (!userId) return empty;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return empty;

  const idCheck = uuidSchema.safeParse(projectId);
  if (!idCheck.success) return empty;

  // 소유권 확인 — 타 사용자/워크스페이스 프로젝트의 피드백 열람 방지. soft-delete 포함 필터.
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
  if (!owned) return empty;

  // 목록 — 최신순 + LIMIT 50 방어. 같은 트랜잭션으로 unread count도 함께 계산.
  const rows = await db
    .select({
      id: portalFeedbacks.id,
      message: portalFeedbacks.message,
      clientIp: portalFeedbacks.clientIp,
      userAgent: portalFeedbacks.userAgent,
      isRead: portalFeedbacks.isRead,
      readAt: portalFeedbacks.readAt,
      createdAt: portalFeedbacks.createdAt,
    })
    .from(portalFeedbacks)
    .where(eq(portalFeedbacks.projectId, idCheck.data))
    .orderBy(desc(portalFeedbacks.createdAt))
    .limit(FEEDBACKS_LIMIT);

  // 전체/미확인 카운트는 LIMIT에 영향받지 않도록 별도 count 쿼리.
  const [totalRow] = await db
    .select({ total: count() })
    .from(portalFeedbacks)
    .where(eq(portalFeedbacks.projectId, idCheck.data));

  const [unreadRow] = await db
    .select({ unread: count() })
    .from(portalFeedbacks)
    .where(
      and(
        eq(portalFeedbacks.projectId, idCheck.data),
        eq(portalFeedbacks.isRead, false),
      ),
    );

  return {
    items: rows.map((r) => ({
      id: r.id,
      message: r.message,
      clientIp: r.clientIp,
      userAgent: r.userAgent,
      isRead: r.isRead,
      readAt: r.readAt ? r.readAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    })),
    total: totalRow?.total ?? 0,
    unread: unreadRow?.unread ?? 0,
  };
}

// ─── 조회: 사용자 전체 미확인 카운트 (사이드바 뱃지용) ───
//
// 로그인 사용자가 소유한 모든 (non-deleted) 프로젝트의 미확인 피드백 합계.
// dashboard layout에서 호출해 Sidebar 프로젝트 메뉴에 뱃지 바인딩.
// 쿼리 실패가 dashboard 전체를 500으로 만들지 않도록 내부에서 catch → 0 fallback.
export async function getTotalUnreadFeedbackForUser(): Promise<number> {
  try {
    const userId = await getUserId();
    if (!userId) return 0;

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return 0;

    const [row] = await db
      .select({ cnt: count() })
      .from(portalFeedbacks)
      .innerJoin(projects, eq(projects.id, portalFeedbacks.projectId))
      .where(
        and(
          eq(projects.userId, userId),
          workspaceScope(projects.workspaceId, workspaceId),
          isNull(projects.deletedAt),
          eq(portalFeedbacks.isRead, false),
        ),
      );

    return row?.cnt ?? 0;
  } catch (err) {
    const errName = err instanceof Error ? err.name : "unknown";
    console.error({
      event: "dashboard_badge_query_failed",
      errName,
    });
    return 0;
  }
}

// ─── 조회: 미확인 카운트만 (탭 뱃지용 경량 쿼리) ───
//
// feedback 탭이 아닌 경로에서 "미확인 N" 뱃지만 표시하기 위한 경량 count-only 쿼리.
export async function getUnreadFeedbackCount(projectId: string): Promise<number> {
  const userId = await getUserId();
  if (!userId) return 0;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return 0;

  const idCheck = uuidSchema.safeParse(projectId);
  if (!idCheck.success) return 0;

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
  if (!owned) return 0;

  const [row] = await db
    .select({ cnt: count() })
    .from(portalFeedbacks)
    .where(
      and(
        eq(portalFeedbacks.projectId, idCheck.data),
        eq(portalFeedbacks.isRead, false),
      ),
    );

  return row?.cnt ?? 0;
}

// ─── 액션: 읽음/읽지 않음 토글 ───

// Zod .strict() 객체 파싱 — TS 시그니처만으로는 런타임 보장 불가.
// non-TS 호출자가 null/undefined/이상값을 넘길 경우 대비한 방어선.
const markActionSchema = z
  .object({
    feedbackId: z.string().uuid(),
    action: z.enum(["read", "unread"]),
  })
  .strict();

export type MarkFeedbackReadInput = z.infer<typeof markActionSchema>;

export type MarkFeedbackReadResult =
  | { success: true }
  | { success: false; error: string };

const GENERIC_ERROR = "잠시 후 다시 시도해주세요";

export async function markFeedbackReadAction(
  input: MarkFeedbackReadInput,
): Promise<MarkFeedbackReadResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = markActionSchema.safeParse(input);
  if (!parsed.success) {
    console.error({
      event: "portal_feedback_mark_invalid_input",
      issueCodes: parsed.error.issues.map((i) => i.code),
    });
    return { success: false, error: GENERIC_ERROR };
  }
  const { feedbackId, action } = parsed.data;
  const nextIsRead = action === "read";

  // 소유권 + 프로젝트 조회 — 이중 단계로 분리해 metadata 기록 시 projectId 확보.
  const [fb] = await db
    .select({
      id: portalFeedbacks.id,
      projectId: portalFeedbacks.projectId,
      isRead: portalFeedbacks.isRead,
    })
    .from(portalFeedbacks)
    .innerJoin(projects, eq(projects.id, portalFeedbacks.projectId))
    .where(
      and(
        eq(portalFeedbacks.id, feedbackId),
        eq(projects.userId, userId),
        workspaceScope(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!fb) return { success: false, error: GENERIC_ERROR };

  // 멱등 — 이미 원하는 상태면 DB 쓰기 생략 (불필요한 activity_log 방지).
  // 소유권 JOIN 이후에 수행되므로 멱등 경로로 IDOR 탐지 불가.
  if (fb.isRead === nextIsRead) {
    return { success: true };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(portalFeedbacks)
        .set({
          isRead: nextIsRead,
          readAt: nextIsRead ? new Date() : null,
        })
        .where(eq(portalFeedbacks.id, feedbackId));

      await tx.insert(activityLogs).values({
        userId,
        workspaceId,
        projectId: fb.projectId,
        entityType: "portal_feedback",
        entityId: fb.id,
        action: nextIsRead ? "portal_feedback.read" : "portal_feedback.unread",
        description: nextIsRead ? "고객 피드백 읽음 처리" : "고객 피드백 읽음 해제",
        metadata: { from: fb.isRead, to: nextIsRead },
      });
    });
  } catch (err) {
    // Dashboard는 내부 개발자 로그라 err.message 기록 OK (포털과 달리 클라이언트 응답엔
    // 반영되지 않음). 디버깅 시간 단축을 위해 원문 보존.
    const errName = err instanceof Error ? err.name : "unknown";
    const errMessage = err instanceof Error ? err.message : String(err);
    console.error({
      event: "portal_feedback_read_toggle_failed",
      feedbackId: fb.id,
      errName,
      errMessage,
    });
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath(`/dashboard/projects/${fb.projectId}`);
  return { success: true };
}
