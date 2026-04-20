import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, workspaceMembers, workspaces } from "@/lib/db/schema";

// Phase 5 Task 5-2-3-A: `users.last_workspace_id` 업데이트 헬퍼.
//
// 호출 시점 (Task 5-2-3-B picker UI 구현 시점에 연결 예정):
//   - 헤더 workspace picker dropdown에서 사용자가 다른 workspace 선택 시 Server Action 내부 호출
//   - `/invite/[token]` 수락 성공 후 가입된 workspace를 바로 활성화할 때
//
// Why 여기서 멤버십 + soft-delete 재검증:
//   race condition 방어 — UI에서 선택한 workspace가 마침 삭제/탈퇴된 경우,
//   UPDATE 성공으로 위장하면 이후 getCurrentWorkspaceId 1순위 조회가 NULL 폴백으로 빠지긴 하나
//   명시적 거부 응답이 디버깅에 유리.
//
// ActionResult 대신 boolean 반환:
//   호출자가 Server Action 맥락에서 필요 시 revalidatePath + redirect를 직접 처리.
//   헬퍼는 "성공 여부"만 책임.

export type UpdateLastWorkspaceResult =
  | { ok: true }
  | { ok: false; reason: "not_member" | "workspace_deleted" | "db_error"; error?: string };

/**
 * users.last_workspace_id를 주어진 workspaceId로 갱신.
 * 호출 전 조건:
 *   1) userId가 해당 workspace의 member여야 함
 *   2) workspace가 soft-delete 상태가 아니어야 함
 * 두 조건 미충족 시 UPDATE 안 하고 `ok: false` 반환.
 */
export async function updateLastWorkspaceId(
  userId: string,
  workspaceId: string,
): Promise<UpdateLastWorkspaceResult> {
  try {
    // 소속 + soft-delete 검증 (2 조건 단일 쿼리)
    const valid = await db
      .select({ id: workspaceMembers.id, deletedAt: workspaces.deletedAt })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (!valid[0]) return { ok: false, reason: "not_member" };
    if (valid[0].deletedAt) return { ok: false, reason: "workspace_deleted" };

    await db
      .update(users)
      .set({ lastWorkspaceId: workspaceId })
      .where(eq(users.id, userId));

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[updateLastWorkspaceId]", { userId, workspaceId, error: message });
    return { ok: false, reason: "db_error", error: message };
  }
}
