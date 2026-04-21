"use server";

import { db } from "@/lib/db";
import { clients, clientNotes, projects } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import { clientFormSchema, clientNoteSchema, type ClientFormData, type ClientNoteData } from "@/lib/validation/clients";
import { eq, and, desc, isNull, sql, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Task 5-2-2e: "use server" 파일 export 규칙(10패턴 1) 준수 — client import 없어 로컬 type으로 강등.
type ActionResult = { success: boolean; error?: string; id?: string };

/** clientId가 현재 workspace + user의 고객인지 검증 (defense-in-depth: userId + workspaceId) */
async function verifyClientOwnership(
  clientId: string,
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.userId, userId),
        workspaceScope(clients.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

// ─── 고객 CRUD ───

export async function getClients() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  return db
    .select({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      phone: clients.phone,
      status: clients.status,
      memo: clients.memo,
      createdAt: clients.createdAt,
      projectCount: sql<number>`count(${projects.id})::int`,
      totalRevenue: sql<number>`coalesce(sum(${projects.contractAmount}), 0)::int`,
    })
    .from(clients)
    .leftJoin(
      projects,
      and(eq(projects.clientId, clients.id), isNull(projects.deletedAt)),
    )
    .where(
      and(
        eq(clients.userId, userId),
        workspaceScope(clients.workspaceId, workspaceId),
      ),
    )
    .groupBy(clients.id)
    .orderBy(desc(clients.createdAt));
}

export async function getClient(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const rows = await db
    .select({
      id: clients.id,
      companyName: clients.companyName,
      contactName: clients.contactName,
      email: clients.email,
      phone: clients.phone,
      status: clients.status,
      memo: clients.memo,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(
      and(
        eq(clients.id, id),
        eq(clients.userId, userId),
        workspaceScope(clients.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getClientProjects(clientId: string) {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  if (!(await verifyClientOwnership(clientId, userId, workspaceId))) return [];

  return db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      contractAmount: projects.contractAmount,
      startDate: projects.startDate,
      endDate: projects.endDate,
    })
    .from(projects)
    .where(
      and(
        eq(projects.clientId, clientId),
        eq(projects.userId, userId),
        workspaceScope(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(desc(projects.createdAt));
}

export async function getClientNotes(clientId: string) {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  if (!(await verifyClientOwnership(clientId, userId, workspaceId))) return [];

  return db
    .select({
      id: clientNotes.id,
      content: clientNotes.content,
      createdAt: clientNotes.createdAt,
    })
    .from(clientNotes)
    .where(
      and(
        eq(clientNotes.clientId, clientId),
        eq(clientNotes.userId, userId),
        workspaceScope(clientNotes.workspaceId, workspaceId),
      ),
    )
    .orderBy(asc(clientNotes.createdAt));
}

export async function createClientAction(data: ClientFormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  // Task 5-1-6 예시 migrate: workspace 스코프 주입 (write 경로 → null은 ActionResult 에러).
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return { success: false, error: "워크스페이스를 확인할 수 없습니다" };
  }

  const parsed = clientFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "입력값이 올바르지 않습니다" };

  const v = parsed.data;

  try {
    const [row] = await db
      .insert(clients)
      .values({
        userId,
        workspaceId,
        companyName: v.companyName,
        contactName: v.contactName || null,
        email: v.email || null,
        phone: v.phone || null,
        businessNumber: v.businessNumber || null,
        address: v.address || null,
        status: v.status,
        memo: v.memo || null,
      })
      .returning({ id: clients.id });

    revalidatePath("/dashboard/clients");
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[createClientAction]", err);
    return { success: false, error: "고객 생성 중 오류가 발생했습니다" };
  }
}

export async function updateClientAction(id: string, data: ClientFormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = clientFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "입력값이 올바르지 않습니다" };

  const v = parsed.data;

  try {
    await db
      .update(clients)
      .set({
        companyName: v.companyName,
        contactName: v.contactName || null,
        email: v.email || null,
        phone: v.phone || null,
        businessNumber: v.businessNumber || null,
        address: v.address || null,
        status: v.status,
        memo: v.memo || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.id, id),
          eq(clients.userId, userId),
          workspaceScope(clients.workspaceId, workspaceId),
        ),
      );

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${id}`);
    return { success: true };
  } catch (err) {
    console.error("[updateClientAction]", err);
    return { success: false, error: "고객 수정 중 오류가 발생했습니다" };
  }
}

// ─── 메모 CRUD ───

export async function addNoteAction(clientId: string, data: ClientNoteData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = clientNoteSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "내용을 입력해주세요" };

  if (!(await verifyClientOwnership(clientId, userId, workspaceId))) {
    return { success: false, error: "권한이 없습니다" };
  }

  try {
    await db.insert(clientNotes).values({
      clientId,
      userId,
      workspaceId,
      content: parsed.data.content,
    });

    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true };
  } catch (err) {
    console.error("[addNoteAction]", err);
    return { success: false, error: "메모 추가 중 오류가 발생했습니다" };
  }
}

export async function deleteNoteAction(noteId: string, clientId: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  try {
    await db
      .delete(clientNotes)
      .where(
        and(
          eq(clientNotes.id, noteId),
          eq(clientNotes.userId, userId),
          workspaceScope(clientNotes.workspaceId, workspaceId),
        ),
      );

    revalidatePath(`/dashboard/clients/${clientId}`);
    return { success: true };
  } catch (err) {
    console.error("[deleteNoteAction]", err);
    return { success: false, error: "메모 삭제 중 오류가 발생했습니다" };
  }
}
