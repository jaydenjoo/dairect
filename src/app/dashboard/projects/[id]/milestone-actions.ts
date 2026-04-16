"use server";

import { db } from "@/lib/db";
import { milestones, projects } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { milestoneFormSchema, type MilestoneFormData } from "@/lib/validation/milestones";
import { eq, and, asc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { success: boolean; error?: string };

/** 프로젝트 소유권 검증 */
async function verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);
  return rows.length > 0;
}

export async function getMilestones(projectId: string) {
  const userId = await getUserId();
  if (!userId) return [];

  if (!(await verifyProjectOwnership(projectId, userId))) return [];

  const rows = await db
    .select({
      id: milestones.id,
      title: milestones.title,
      description: milestones.description,
      isCompleted: milestones.isCompleted,
      dueDate: milestones.dueDate,
      completedAt: milestones.completedAt,
      sortOrder: milestones.sortOrder,
    })
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.sortOrder), asc(milestones.createdAt));

  // isCompleted null → false 변환 (DB default는 false이지만 Drizzle 추론이 nullable)
  return rows.map((r) => ({ ...r, isCompleted: r.isCompleted ?? false }));
}

export async function createMilestoneAction(
  projectId: string,
  data: MilestoneFormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return { success: false, error: "권한이 없습니다" };
  }

  // Client→Server 경계 재검증: TypeScript 타입은 런타임 보장이 없으므로 Server Action에서 항상 Zod 재검증
  const parsed = milestoneFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" };

  const v = parsed.data;

  try {
    await db.insert(milestones).values({
      projectId,
      title: v.title,
      description: v.description || null,
      dueDate: v.dueDate || null,
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (err) {
    console.error("[createMilestoneAction]", err);
    return { success: false, error: "마일스톤 생성 중 오류가 발생했습니다" };
  }
}

export async function toggleMilestoneAction(
  milestoneId: string,
  projectId: string,
  isCompleted: boolean,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return { success: false, error: "권한이 없습니다" };
  }

  try {
    await db
      .update(milestones)
      .set({
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)));

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (err) {
    console.error("[toggleMilestoneAction]", err);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

export async function deleteMilestoneAction(
  milestoneId: string,
  projectId: string,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  if (!(await verifyProjectOwnership(projectId, userId))) {
    return { success: false, error: "권한이 없습니다" };
  }

  try {
    await db
      .delete(milestones)
      .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)));

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (err) {
    console.error("[deleteMilestoneAction]", err);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
