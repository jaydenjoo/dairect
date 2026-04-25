/**
 * 공개 영역 노출 토글 — single-user 모드 사이트 전역 플래그.
 *
 * Epic Site-Flags (2026-04-25): Jayden이 dashboard/settings 에서 ON/OFF 한 후
 * 공개 페이지(SSR)에서 server-side 로 읽어 conditional 렌더.
 *
 * Single-user 가정: workspace_settings 가 1건만 존재. limit(1) 로 첫 row 사용.
 * 향후 multi-tenant 전환 시 도메인·subdomain 기반 라우팅으로 확장.
 *
 * 캐싱 정책:
 *   - revalidate 60s (페이지의 revalidate 와 일치) 권장
 *   - 즉시 반영 필요 시 settings 저장 후 revalidatePath("/") 호출
 */
import "server-only";
import { db } from "@/lib/db";
import { workspaceSettings } from "@/lib/db/schema";

export type SiteFlags = {
  pwaInstallPromptEnabled: boolean;
};

const DEFAULT_FLAGS: SiteFlags = {
  pwaInstallPromptEnabled: false,
};

export async function getSiteFlags(): Promise<SiteFlags> {
  try {
    const rows = await db
      .select({
        pwaInstallPromptEnabled: workspaceSettings.pwaInstallPromptEnabled,
      })
      .from(workspaceSettings)
      .limit(1);
    const row = rows[0];
    if (!row) return DEFAULT_FLAGS;
    return {
      pwaInstallPromptEnabled: row.pwaInstallPromptEnabled ?? false,
    };
  } catch {
    // DB 장애 시 기본값(전부 OFF) 반환 — 사이트는 살아있어야 함.
    return DEFAULT_FLAGS;
  }
}
