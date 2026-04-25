import "server-only";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/db/schema";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import { and, asc, desc, eq, isNull } from "drizzle-orm";

/**
 * /dashboard/portfolio 목록 조회 — 자기 워크스페이스의 모든 (활성) portfolio_items.
 * 정렬: display_order ASC → createdAt DESC tie-break.
 */
export async function listPortfolioItemsForDashboard() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  return db
    .select()
    .from(portfolioItems)
    .where(
      and(
        workspaceScope(portfolioItems.workspaceId, workspaceId),
        isNull(portfolioItems.deletedAt),
      ),
    )
    .orderBy(asc(portfolioItems.displayOrder), desc(portfolioItems.createdAt));
}

/**
 * /dashboard/portfolio/[id] 단건 조회 (편집용).
 * 다른 워크스페이스 row 는 null 반환 → 404 처리.
 */
export async function getPortfolioItem(id: string) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const rows = await db
    .select()
    .from(portfolioItems)
    .where(
      and(
        eq(portfolioItems.id, id),
        workspaceScope(portfolioItems.workspaceId, workspaceId),
        isNull(portfolioItems.deletedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}
