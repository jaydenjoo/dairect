"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/auth/get-user-id";
import { updateLastWorkspaceId } from "@/lib/auth/update-last-workspace";

// Phase 5 Task 5-2-3-B: Workspace 전환 Server Action.
//
// 흐름:
//   1) Zod로 workspaceId UUID 검증
//   2) 로그인 확인 (getUserId)
//   3) updateLastWorkspaceId 헬퍼 호출 (멤버십 + soft-delete 재검증 후 users.last_workspace_id UPDATE)
//   4) 성공 시 `/dashboard` layout revalidate → getCurrentWorkspaceId 1순위가 새 값으로 갱신됨
//
// 에러 정책: ActionResult 형태로 반환 (throw 금지) — 클라이언트가 토스트로 처리.

const SwitchSchema = z.object({
  workspaceId: z.string().uuid(),
});

// Task 5-2-2e: "use server" 파일 export 규칙(10패턴 1) 준수 — client(workspace-picker.tsx)는 함수만 import.
type SwitchWorkspaceResult =
  | { ok: true }
  | { ok: false; error: string };

export async function switchWorkspaceAction(
  input: z.infer<typeof SwitchSchema>,
): Promise<SwitchWorkspaceResult> {
  const parsed = SwitchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "잘못된 워크스페이스 ID입니다." };
  }

  const userId = await getUserId();
  if (!userId) {
    return { ok: false, error: "로그인이 필요합니다." };
  }

  const result = await updateLastWorkspaceId(userId, parsed.data.workspaceId);
  if (!result.ok) {
    const reasonKr: Record<typeof result.reason, string> = {
      not_member: "해당 워크스페이스에 소속되어 있지 않습니다.",
      workspace_deleted: "삭제된 워크스페이스입니다.",
      db_error: "DB 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
    return { ok: false, error: reasonKr[result.reason] };
  }

  // "/dashboard" 하위 전체 (layout 포함) — Server Component가 다시 데이터 로드하도록 강제.
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
