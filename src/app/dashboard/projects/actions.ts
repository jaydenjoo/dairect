"use server";

import { db } from "@/lib/db";
import { projects, clients, milestones } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import {
  projectFormSchema,
  projectStatusSchema,
  type ProjectFormData,
  type ProjectStatus,
} from "@/lib/validation/projects";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string; id?: string };

// ─── 프로젝트 목록 ───

export async function getProjects() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      expectedAmount: projects.expectedAmount,
      contractAmount: projects.contractAmount,
      startDate: projects.startDate,
      endDate: projects.endDate,
      createdAt: projects.createdAt,
      clientName: clients.companyName,
      milestoneTotal: sql<number>`count(${milestones.id})::int`,
      milestoneCompleted: sql<number>`count(case when ${milestones.isCompleted} = true then 1 end)::int`,
    })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(milestones, eq(milestones.projectId, projects.id))
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
    .groupBy(projects.id, clients.companyName)
    .orderBy(desc(projects.createdAt));
}

// ─── 프로젝트 상세 ───

export async function getProject(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      expectedAmount: projects.expectedAmount,
      contractAmount: projects.contractAmount,
      startDate: projects.startDate,
      endDate: projects.endDate,
      memo: projects.memo,
      clientId: projects.clientId,
      createdAt: projects.createdAt,
      clientName: clients.companyName,
    })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)),
    )
    .limit(1);

  return rows[0] ?? null;
}

// ─── 고객 드롭다운용 ───

export async function getClientsForSelect() {
  const userId = await getUserId();
  if (!userId) return [];

  return db
    .select({ id: clients.id, companyName: clients.companyName })
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.companyName);
}

// ─── 생성 ───

export async function createProjectAction(data: ProjectFormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const parsed = projectFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" };

  const v = parsed.data;

  try {
    const [row] = await db
      .insert(projects)
      .values({
        userId,
        name: v.name,
        clientId: v.clientId ?? null,
        description: v.description || null,
        status: v.status,
        expectedAmount: v.expectedAmount ?? null,
        startDate: v.startDate || null,
        endDate: v.endDate || null,
        memo: v.memo || null,
      })
      .returning({ id: projects.id });

    revalidatePath("/dashboard/projects");
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[createProjectAction]", err);
    return { success: false, error: "프로젝트 생성 중 오류가 발생했습니다" };
  }
}

// ─── 상태 변경 ───

export async function updateProjectStatusAction(
  id: string,
  status: ProjectStatus,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  // [CRITICAL 2] 서버 측 상태값 Zod 검증
  const parsed = projectStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "올바르지 않은 상태값입니다" };

  try {
    await db
      .update(projects)
      .set({ status: parsed.data, updatedAt: new Date() })
      .where(
        and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)),
      );

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[updateProjectStatusAction]", err);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

// ─── 소프트 삭제 ───

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  try {
    await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(
        // [CRITICAL 1] 이미 삭제된 레코드 재삭제 방지
        and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)),
      );

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (err) {
    console.error("[deleteProjectAction]", err);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
