"use server";

import { db } from "@/lib/db";
import { leads, clients, projects } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import {
  leadFormSchema,
  leadStatusUpdateSchema,
  leadSourceSchema,
  leadStatusSchema,
  type LeadFormData,
  type LeadStatusUpdate,
} from "@/lib/validation/leads";
import { eq, and, desc, or, ilike, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult = { success: boolean; error?: string; id?: string };

const idSchema = z.string().uuid();

async function verifyLeadOwnership(
  leadId: string,
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: leads.id })
    .from(leads)
    .where(
      and(
        eq(leads.id, leadId),
        eq(leads.userId, userId),
        workspaceScope(leads.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

function reportIssue(issues: { code: string; message: string }[], tag: string): string {
  const userIssue = issues.find((i) => i.code !== "unrecognized_keys");
  if (!userIssue) console.error(`[${tag}] unrecognized_keys`, issues);
  return userIssue?.message ?? "입력값이 올바르지 않습니다";
}

// ─── READ ───

type LeadListFilters = {
  source?: string;
  status?: string;
  q?: string;
};

export async function getLeads(filters: LeadListFilters = {}) {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const conditions = [
    eq(leads.userId, userId),
    workspaceScope(leads.workspaceId, workspaceId),
  ];

  const sourceParse = leadSourceSchema.safeParse(filters.source);
  if (sourceParse.success) conditions.push(eq(leads.source, sourceParse.data));

  const statusParse = leadStatusSchema.safeParse(filters.status);
  if (statusParse.success) conditions.push(eq(leads.status, statusParse.data));

  const q = filters.q?.trim();
  if (q && q.length > 0 && q.length <= 100) {
    const pattern = `%${q.replace(/[%_]/g, "\\$&")}%`;
    const search = or(
      ilike(leads.name, pattern),
      ilike(leads.email, pattern),
      ilike(leads.phone, pattern),
      ilike(leads.projectType, pattern),
    );
    if (search) conditions.push(search);
  }

  return db
    .select({
      id: leads.id,
      name: leads.name,
      source: leads.source,
      status: leads.status,
      email: leads.email,
      phone: leads.phone,
      projectType: leads.projectType,
      budgetRange: leads.budgetRange,
      createdAt: leads.createdAt,
      convertedToProjectId: leads.convertedToProjectId,
    })
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt));
}

export async function getLead(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return null;

  const rows = await db
    .select({
      id: leads.id,
      userId: leads.userId,
      name: leads.name,
      source: leads.source,
      status: leads.status,
      email: leads.email,
      phone: leads.phone,
      projectType: leads.projectType,
      budgetRange: leads.budgetRange,
      description: leads.description,
      failReason: leads.failReason,
      convertedToProjectId: leads.convertedToProjectId,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(
      and(
        eq(leads.id, idCheck.data),
        eq(leads.userId, userId),
        workspaceScope(leads.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

// ─── CREATE ───

export async function createLeadAction(data: LeadFormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = leadFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: reportIssue(parsed.error.issues, "createLeadAction") };
  }
  const v = parsed.data;

  try {
    const [row] = await db
      .insert(leads)
      .values({
        userId,
        workspaceId,
        source: v.source,
        name: v.name,
        email: v.email || null,
        phone: v.phone || null,
        projectType: v.projectType || null,
        budgetRange: v.budgetRange || null,
        description: v.description || null,
        status: "new",
      })
      .returning({ id: leads.id });

    revalidatePath("/dashboard/leads");
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[createLeadAction]", err);
    return { success: false, error: "리드 생성 중 오류가 발생했습니다" };
  }
}

// ─── UPDATE (기본 정보) ───

export async function updateLeadAction(id: string, data: LeadFormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "잘못된 요청입니다" };

  const parsed = leadFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: reportIssue(parsed.error.issues, "updateLeadAction") };
  }
  const v = parsed.data;

  try {
    await db
      .update(leads)
      .set({
        source: v.source,
        name: v.name,
        email: v.email || null,
        phone: v.phone || null,
        projectType: v.projectType || null,
        budgetRange: v.budgetRange || null,
        description: v.description || null,
      })
      .where(
        and(
          eq(leads.id, idCheck.data),
          eq(leads.userId, userId),
          workspaceScope(leads.workspaceId, workspaceId),
        ),
      );

    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${idCheck.data}`);
    return { success: true };
  } catch (err) {
    console.error("[updateLeadAction]", err);
    return { success: false, error: "리드 수정 중 오류가 발생했습니다" };
  }
}

// ─── UPDATE (상태 전이) ───

export async function updateLeadStatusAction(
  id: string,
  data: LeadStatusUpdate,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "잘못된 요청입니다" };

  const parsed = leadStatusUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: reportIssue(parsed.error.issues, "updateLeadStatusAction") };
  }
  const v = parsed.data;

  if (!(await verifyLeadOwnership(idCheck.data, userId, workspaceId))) {
    return { success: false, error: "권한이 없습니다" };
  }

  try {
    await db
      .update(leads)
      .set({
        status: v.status,
        failReason: v.status === "failed" ? v.failReason || null : null,
      })
      .where(
        and(
          eq(leads.id, idCheck.data),
          eq(leads.userId, userId),
          workspaceScope(leads.workspaceId, workspaceId),
        ),
      );

    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${idCheck.data}`);
    return { success: true };
  } catch (err) {
    console.error("[updateLeadStatusAction]", err);
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

// ─── CONVERT TO PROJECT ───

export async function convertLeadToProjectAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "잘못된 요청입니다" };

  const leadRows = await db
    .select({
      id: leads.id,
      userId: leads.userId,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      projectType: leads.projectType,
      description: leads.description,
      convertedToProjectId: leads.convertedToProjectId,
    })
    .from(leads)
    .where(
      and(
        eq(leads.id, idCheck.data),
        eq(leads.userId, userId),
        workspaceScope(leads.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  const lead = leadRows[0];
  if (!lead) return { success: false, error: "리드를 찾을 수 없습니다" };

  if (lead.convertedToProjectId) {
    return { success: false, error: "이미 프로젝트로 전환된 리드입니다" };
  }

  try {
    const newProjectId = await db.transaction(async (tx) => {
      let clientId: string | null = null;

      if (lead.email) {
        const existing = await tx
          .select({ id: clients.id })
          .from(clients)
          .where(
            and(
              eq(clients.userId, userId),
              eq(clients.email, lead.email),
              workspaceScope(clients.workspaceId, workspaceId),
            ),
          )
          .limit(1);
        clientId = existing[0]?.id ?? null;
      }

      if (!clientId) {
        const [newClient] = await tx
          .insert(clients)
          .values({
            userId,
            workspaceId,
            companyName: lead.name,
            contactName: null,
            email: lead.email ?? null,
            phone: lead.phone ?? null,
            status: "prospect",
          })
          .returning({ id: clients.id });
        clientId = newClient.id;
      }

      const projectName = lead.projectType?.trim() || `${lead.name} 프로젝트`;
      const [newProject] = await tx
        .insert(projects)
        .values({
          userId,
          workspaceId,
          clientId,
          name: projectName,
          description: lead.description,
          status: "lead",
        })
        .returning({ id: projects.id });

      // 트랜잭션 내부 UPDATE에 isNull 가드 → 더블클릭/동시 요청 레이스 차단
      const updateResult = await tx
        .update(leads)
        .set({
          status: "contracted",
          convertedToProjectId: newProject.id,
        })
        .where(
          and(
            eq(leads.id, idCheck.data),
            eq(leads.userId, userId),
            workspaceScope(leads.workspaceId, workspaceId),
            isNull(leads.convertedToProjectId),
          ),
        )
        .returning({ id: leads.id });

      if (updateResult.length === 0) {
        // 다른 요청이 먼저 전환 완료 → 전체 롤백 (client/project INSERT도 취소)
        throw new Error("ALREADY_CONVERTED");
      }

      return newProject.id;
    });

    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${idCheck.data}`);
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/clients");

    return { success: true, id: newProjectId };
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_CONVERTED") {
      return { success: false, error: "이미 프로젝트로 전환된 리드입니다" };
    }
    console.error("[convertLeadToProjectAction]", err);
    return { success: false, error: "프로젝트 전환 중 오류가 발생했습니다" };
  }
}

// ─── DELETE ───

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "잘못된 요청입니다" };

  try {
    await db
      .delete(leads)
      .where(
        and(
          eq(leads.id, idCheck.data),
          eq(leads.userId, userId),
          workspaceScope(leads.workspaceId, workspaceId),
        ),
      );

    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (err) {
    console.error("[deleteLeadAction]", err);
    return { success: false, error: "리드 삭제 중 오류가 발생했습니다" };
  }
}

