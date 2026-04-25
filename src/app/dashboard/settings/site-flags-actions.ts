"use server";

/**
 * Epic Site-Flags (2026-04-25): /dashboard/settings 의 "사이트 노출" 섹션 서버 액션.
 *
 * 공개 페이지 노출 토글 (현재 PWA install prompt). single-user 가정 — 자기
 * workspace_settings 의 단일 row 업데이트.
 */

import { db } from "@/lib/db";
import { workspaceSettings } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

export async function setPwaInstallPromptEnabledAction(
  enabled: boolean,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId)
    return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  if (typeof enabled !== "boolean") {
    return { success: false, error: "올바르지 않은 값입니다" };
  }

  try {
    await db
      .update(workspaceSettings)
      .set({
        pwaInstallPromptEnabled: enabled,
        updatedAt: new Date(),
      })
      .where(eq(workspaceSettings.workspaceId, workspaceId));

    // 공개 페이지 즉시 반영
    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "set_pwa_install_prompt_enabled_failed", message });
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
