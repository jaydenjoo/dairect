import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { portalTokens, projects } from "@/lib/db/schema";

// 토큰 형식: crypto.randomUUID() (UUID v4). Zod uuid 검증으로 malformed/injection 시도는 DB 진입 전 차단.
const tokenSchema = z.string().uuid();

export type PortalTokenPayload = {
  tokenId: string;
  projectId: string;
  projectOwnerId: string; // 프로젝트 소유자(프리랜서 PM). 피드백 제출 시 알림 대상.
  issuedAt: Date;
  expiresAt: Date;
};

// ─── 포털 토큰 검증 ───
//
// 공개 라우트(`/portal/[token]`) Server Component에서 호출. 유효하면 payload, 아니면 null.
// 체크: UUID 형식 · revokedAt IS NULL · expiresAt > now · 프로젝트 미삭제.
// last_accessed_at 갱신은 fire-and-forget (감사용, 실패 시 본 흐름 영향 없음).

export async function validatePortalToken(
  rawToken: string,
): Promise<PortalTokenPayload | null> {
  const parsed = tokenSchema.safeParse(rawToken);
  if (!parsed.success) return null;

  const now = new Date();

  const [row] = await db
    .select({
      tokenId: portalTokens.id,
      projectId: portalTokens.projectId,
      projectOwnerId: projects.userId,
      issuedAt: portalTokens.issuedAt,
      expiresAt: portalTokens.expiresAt,
    })
    .from(portalTokens)
    .innerJoin(projects, eq(projects.id, portalTokens.projectId))
    .where(
      and(
        eq(portalTokens.token, parsed.data),
        isNull(portalTokens.revokedAt),
        gt(portalTokens.expiresAt, now),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return null;

  // 감사용 last_accessed_at 갱신. 실패해도 본 렌더는 계속. n8n/client.ts의 fire-and-forget 패턴.
  void (async () => {
    try {
      await db
        .update(portalTokens)
        .set({ lastAccessedAt: now })
        .where(eq(portalTokens.id, row.tokenId));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error({ event: "portal_token_last_accessed_update_failed", message });
    }
  })();

  return {
    tokenId: row.tokenId,
    projectId: row.projectId,
    projectOwnerId: row.projectOwnerId,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt,
  };
}
