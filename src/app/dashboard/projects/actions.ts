"use server";

import { db } from "@/lib/db";
import { projects, clients, milestones } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import {
  projectFormSchema,
  projectStatusSchema,
  publicFieldsSchema,
  type ProjectFormData,
  type ProjectStatus,
} from "@/lib/validation/projects";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { emitN8nEvent } from "@/lib/n8n/client";

// Task 5-2-2e: "use server" 파일 export 규칙(10패턴 1) 준수 — 외부 import 없음.
type ActionResult = { success: boolean; error?: string; id?: string };

const projectIdSchema = z.string().uuid();
const TAGS_RAW_MAX = 500;

// ─── 프로젝트 목록 ───

export async function getProjects() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

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
    .where(
      and(
        eq(projects.userId, userId),
        workspaceScope(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
      ),
    )
    .groupBy(projects.id, clients.companyName)
    .orderBy(desc(projects.createdAt));
}

// ─── 프로젝트 상세 ───

export async function getProject(id: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

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
      isPublic: projects.isPublic,
      publicAlias: projects.publicAlias,
      publicDescription: projects.publicDescription,
      publicTags: projects.publicTags,
      publicLiveUrl: projects.publicLiveUrl,
    })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(
      and(
        eq(projects.id, id),
        eq(projects.userId, userId),
        workspaceScope(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

// ─── 고객 드롭다운용 ───

export async function getClientsForSelect() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  return db
    .select({ id: clients.id, companyName: clients.companyName })
    .from(clients)
    .where(
      and(
        eq(clients.userId, userId),
        workspaceScope(clients.workspaceId, workspaceId),
      ),
    )
    .orderBy(clients.companyName);
}

// ─── 생성 ───

export async function createProjectAction(data: ProjectFormData): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = projectFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" };

  const v = parsed.data;

  try {
    // clientId 소유권 검증 — DevTools로 타인 client UUID 삽입 시 타인 회사명이 후속 PDF/견적서에
    // 노출되는 경로 차단 (Task 3-3 보안 리뷰 M1). workspace 조건 추가로 cross-workspace 방어.
    if (v.clientId) {
      const [owned] = await db
        .select({ id: clients.id })
        .from(clients)
        .where(
          and(
            eq(clients.id, v.clientId),
            eq(clients.userId, userId),
            workspaceScope(clients.workspaceId, workspaceId),
          ),
        )
        .limit(1);
      if (!owned) {
        return { success: false, error: "선택한 고객사에 접근할 수 없습니다" };
      }
    }

    const [row] = await db
      .insert(projects)
      .values({
        userId,
        workspaceId,
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

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  // [CRITICAL 2] 서버 측 상태값 Zod 검증
  const parsed = projectStatusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "올바르지 않은 상태값입니다" };

  const idCheck = projectIdSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "프로젝트 식별자가 올바르지 않습니다" };

  try {
    // H2: SELECT→UPDATE race 방지 — 트랜잭션 + projects 행 FOR UPDATE 락.
    //     동시 상태 변경 시 이벤트의 from_status가 실제 변경 직전 값과 일치하도록 보장.
    //     `for("update", { of: projects })`로 clients JOIN 행은 락에서 제외.
    const snapshot = await db.transaction(async (tx) => {
      const [row] = await tx
        .select({
          status: projects.status,
          name: projects.name,
          clientCompanyName: clients.companyName,
          clientContactName: clients.contactName,
          clientEmail: clients.email,
        })
        .from(projects)
        .leftJoin(
          clients,
          and(
            eq(projects.clientId, clients.id),
            eq(clients.userId, userId),
            workspaceScope(clients.workspaceId, workspaceId),
          ),
        )
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

      if (!row) return null;

      await tx
        .update(projects)
        .set({ status: parsed.data, updatedAt: new Date() })
        .where(
          and(
            eq(projects.id, idCheck.data),
            eq(projects.userId, userId),
            workspaceScope(projects.workspaceId, workspaceId),
            isNull(projects.deletedAt),
          ),
        );

      return row;
    });

    if (!snapshot) {
      return { success: false, error: "프로젝트를 찾을 수 없습니다" };
    }

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${idCheck.data}`);

    // n8n 이벤트 발사 — fire-and-forget. 상태 동일 시 skip (중복 알림 방지).
    // emitN8nEvent는 절대 throw 하지 않으므로 try/catch 불필요, await 금지.
    if (snapshot.status !== parsed.data) {
      void emitN8nEvent("project_status_changed", "project.status_changed", {
        user_id: userId,
        project_id: idCheck.data,
        project_name: snapshot.name,
        client_name: snapshot.clientCompanyName ?? null,
        from_status: snapshot.status,
        to_status: parsed.data,
      });

      if (parsed.data === "completed") {
        void emitN8nEvent("project_completed", "project.completed", {
          user_id: userId,
          project_id: idCheck.data,
          project_name: snapshot.name,
          client_company_name: snapshot.clientCompanyName ?? null,
          client_contact_name: snapshot.clientContactName ?? null,
          client_email: snapshot.clientEmail ?? null,
          completed_at: new Date().toISOString(),
        });
      }
    }

    return { success: true };
  } catch (err) {
    // M4: err 객체 전체 덤프 회피 — message만 기록 (Sentry scrubber 전 1차 방어).
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "update_project_status_failed", message });
    return { success: false, error: "상태 변경 중 오류가 발생했습니다" };
  }
}

// ─── 공개 프로필 필드 업데이트 ───

// Task 5-2-2e: "use server" 파일 export 규칙(10패턴 1) 준수 — 외부 import 없음.
type PublicFieldsFormData = {
  isPublic: boolean;
  publicAlias: string;
  publicDescription: string;
  publicLiveUrl: string;
  publicTagsRaw: string; // 쉼표 구분 입력
};

function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(",")) {
    const tag = piece.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

export async function updateProjectPublicFieldsAction(
  projectId: string,
  data: PublicFieldsFormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = projectIdSchema.safeParse(projectId);
  if (!idCheck.success) return { success: false, error: "프로젝트 식별자가 올바르지 않습니다" };

  if (typeof data.publicTagsRaw !== "string" || data.publicTagsRaw.length > TAGS_RAW_MAX) {
    return { success: false, error: "태그 입력이 너무 깁니다" };
  }

  const parsed = publicFieldsSchema.safeParse({
    isPublic: data.isPublic,
    publicAlias: data.publicAlias.trim(),
    publicDescription: data.publicDescription,
    publicLiveUrl: data.publicLiveUrl.trim(),
    publicTags: parseTags(data.publicTagsRaw),
  });
  if (!parsed.success) {
    const userIssue = parsed.error.issues.find((i) => i.code !== "unrecognized_keys");
    if (!userIssue) console.error("[updateProjectPublicFields] unrecognized_keys", parsed.error.issues);
    return {
      success: false,
      error: userIssue?.message ?? "입력값이 올바르지 않습니다",
    };
  }

  const v = parsed.data;

  try {
    const result = await db
      .update(projects)
      .set({
        isPublic: v.isPublic,
        publicAlias: v.publicAlias || null,
        publicDescription: v.publicDescription || null,
        publicLiveUrl: v.publicLiveUrl || null,
        publicTags: v.publicTags.length > 0 ? v.publicTags : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, idCheck.data),
          eq(projects.userId, userId),
          workspaceScope(projects.workspaceId, workspaceId),
          isNull(projects.deletedAt),
        ),
      )
      .returning({ id: projects.id });

    if (result.length === 0) {
      return { success: false, error: "프로젝트를 찾을 수 없습니다" };
    }

    revalidatePath("/projects");
    revalidatePath(`/projects/${idCheck.data}`);
    revalidatePath(`/dashboard/projects/${idCheck.data}`);
    return { success: true };
  } catch (err) {
    console.error("[updateProjectPublicFieldsAction]", err);
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}

// ─── 소프트 삭제 ───

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  try {
    await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(
        // [CRITICAL 1] 이미 삭제된 레코드 재삭제 방지
        and(
          eq(projects.id, id),
          eq(projects.userId, userId),
          workspaceScope(projects.workspaceId, workspaceId),
          isNull(projects.deletedAt),
        ),
      );

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (err) {
    console.error("[deleteProjectAction]", err);
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
