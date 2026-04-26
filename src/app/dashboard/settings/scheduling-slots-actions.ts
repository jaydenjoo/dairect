"use server";

/**
 * Epic Scheduling-Slots (2026-04-26): /dashboard/settings 의 "스케줄링 슬롯" 카드 서버 액션.
 *
 * 공개 영역 Pricing 섹션의 "REAL-TIME SCHEDULING" 박스 데이터 편집.
 * single-user 가정 — 자기 workspace_settings 의 단일 row 업데이트.
 * Site-flags-actions 와 동일 패턴 (인증 → 워크스페이스 → 검증 → 저장 → revalidate).
 */

import { db } from "@/lib/db";
import { workspaceSettings } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slotsSchema, type Slot } from "@/lib/scheduling-slots";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateSchedulingSlotsAction(
  slots: readonly Slot[],
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId)
    return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId)
    return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = slotsSchema.safeParse(slots);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "올바르지 않은 슬롯 데이터입니다",
    };
  }

  try {
    await db
      .update(workspaceSettings)
      .set({
        schedulingSlots: parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(workspaceSettings.workspaceId, workspaceId));

    // 공개 페이지(/) 의 Pricing 섹션 즉시 반영
    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "update_scheduling_slots_failed", message });
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
