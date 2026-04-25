"use server";

/**
 * Epic Portfolio v2 (2026-04-25): /dashboard/portfolio 서버 액션.
 *
 * 고객 프로젝트(`projects`) 와 분리된 portfolio_items 테이블의 CRUD.
 * /projects 공개 페이지 노출용 마케팅 자산 관리.
 */

import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import { portfolioItemFormSchema } from "@/lib/validation/portfolio-item";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const idSchema = z.string().uuid();

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

// 폼 데이터 형태 — 외부 import 금지("use server" export 규칙) 위해 internal 타입.
type FormData = {
  slug: string;
  name: string;
  nameAmber: string;
  description: string;
  cat: string;
  year: string;
  duration: string;
  stack: string;
  statusText: string;
  statusType: string;
  badge: string;
  metaHint: string;
  liveUrl: string;
  demoUrl: string;
  isPublic: boolean;
  displayOrder: number | string;
};

function safeParseForm(input: FormData) {
  return portfolioItemFormSchema.safeParse({
    ...input,
    slug: input.slug.trim().toLowerCase(),
    name: input.name.trim(),
    nameAmber: input.nameAmber.trim(),
    description: input.description,
    year: input.year.trim(),
    duration: input.duration.trim(),
    stack: input.stack.trim(),
    statusText: input.statusText.trim(),
    badge: input.badge.trim(),
    metaHint: input.metaHint.trim(),
    liveUrl: input.liveUrl.trim(),
    demoUrl: input.demoUrl.trim(),
  });
}

export async function createPortfolioItemAction(
  data: FormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const parsed = safeParseForm(data);
  if (!parsed.success) {
    const issue = parsed.error.issues.find((i) => i.code !== "unrecognized_keys");
    return { success: false, error: issue?.message ?? "입력값이 올바르지 않습니다" };
  }
  const v = parsed.data;

  try {
    const result = await db
      .insert(portfolioItems)
      .values({
        userId,
        workspaceId,
        slug: v.slug || null,
        name: v.name,
        nameAmber: v.nameAmber,
        description: v.description,
        cat: v.cat,
        year: v.year,
        duration: v.duration,
        stack: v.stack,
        statusText: v.statusText,
        statusType: v.statusType,
        badge: v.badge,
        metaHint: v.metaHint,
        liveUrl: v.liveUrl || null,
        demoUrl: v.demoUrl || null,
        isPublic: v.isPublic,
        displayOrder: v.displayOrder,
      })
      .returning({ id: portfolioItems.id });

    revalidatePath("/projects");
    revalidatePath("/dashboard/portfolio");
    return { success: true, id: result[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // slug unique 위반 등은 사용자 친화 메시지로 변환.
    if (/portfolio_items_workspace_slug_unique/.test(message)) {
      return { success: false, error: "이미 사용 중인 slug입니다" };
    }
    console.error({ event: "create_portfolio_item_failed", message });
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}

export async function updatePortfolioItemAction(
  id: string,
  data: FormData,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "식별자가 올바르지 않습니다" };

  const parsed = safeParseForm(data);
  if (!parsed.success) {
    const issue = parsed.error.issues.find((i) => i.code !== "unrecognized_keys");
    return { success: false, error: issue?.message ?? "입력값이 올바르지 않습니다" };
  }
  const v = parsed.data;

  try {
    const result = await db
      .update(portfolioItems)
      .set({
        slug: v.slug || null,
        name: v.name,
        nameAmber: v.nameAmber,
        description: v.description,
        cat: v.cat,
        year: v.year,
        duration: v.duration,
        stack: v.stack,
        statusText: v.statusText,
        statusType: v.statusType,
        badge: v.badge,
        metaHint: v.metaHint,
        liveUrl: v.liveUrl || null,
        demoUrl: v.demoUrl || null,
        isPublic: v.isPublic,
        displayOrder: v.displayOrder,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(portfolioItems.id, idCheck.data),
          workspaceScope(portfolioItems.workspaceId, workspaceId),
          isNull(portfolioItems.deletedAt),
        ),
      )
      .returning({ id: portfolioItems.id });

    if (result.length === 0) {
      return { success: false, error: "포트폴리오 항목을 찾을 수 없습니다" };
    }

    revalidatePath("/projects");
    revalidatePath("/dashboard/portfolio");
    revalidatePath(`/dashboard/portfolio/${idCheck.data}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/portfolio_items_workspace_slug_unique/.test(message)) {
      return { success: false, error: "이미 사용 중인 slug입니다" };
    }
    console.error({ event: "update_portfolio_item_failed", message });
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}

export async function deletePortfolioItemAction(id: string): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const idCheck = idSchema.safeParse(id);
  if (!idCheck.success) return { success: false, error: "식별자가 올바르지 않습니다" };

  try {
    const result = await db
      .update(portfolioItems)
      .set({ deletedAt: new Date(), isPublic: false, updatedAt: new Date() })
      .where(
        and(
          eq(portfolioItems.id, idCheck.data),
          workspaceScope(portfolioItems.workspaceId, workspaceId),
          isNull(portfolioItems.deletedAt),
        ),
      )
      .returning({ id: portfolioItems.id });

    if (result.length === 0) {
      return { success: false, error: "포트폴리오 항목을 찾을 수 없습니다" };
    }

    revalidatePath("/projects");
    revalidatePath("/dashboard/portfolio");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "delete_portfolio_item_failed", message });
    return { success: false, error: "삭제 중 오류가 발생했습니다" };
  }
}
