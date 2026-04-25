/**
 * /projects 페이지용 공개 포트폴리오 쿼리 — Epic Portfolio v2 (2026-04-25).
 *
 * 변경: 기존엔 `projects.is_public + portfolio_meta(jsonb)` 를 읽었지만,
 * v2 부터는 별도 `portfolio_items` 테이블에서 직접 조회. 고객 프로젝트(`projects`)와
 * 라이프사이클 분리.
 *
 * 디자인 제약: /projects 시각 렌더 결과 1픽셀도 변경 없음 — 번들 classname 유지,
 * 데이터 소스만 portfolio_items 로 교체.
 */
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/db/schema";
import { parseEmphasis } from "./emphasis";
import { fallbackProjects } from "./fallback-projects";
import type { Project } from "./types";
import type {
  PortfolioCategory,
  PortfolioStatusType,
} from "@/lib/validation/portfolio-item";

const MAX_VISIBLE = 10; // 번들 디자인 "Ten projects. / 10 records" 카피 유지

type DbRow = {
  id: string;
  slug: string | null;
  name: string;
  nameAmber: string | null;
  description: string | null;
  cat: string | null;
  year: string | null;
  duration: string | null;
  stack: string | null;
  statusText: string | null;
  statusType: string | null;
  badge: string | null;
  metaHint: string | null;
  liveUrl: string | null;
  demoUrl: string | null;
  displayOrder: number;
};

function rowToProject(row: DbRow, num: string): Project {
  // demoUrl 우선 → liveUrl → 없으면 undefined (link wrap 비활성)
  const linkUrl = row.demoUrl || row.liveUrl || undefined;

  return {
    num,
    slug: row.slug ?? row.id,
    cat: (row.cat ?? "saas") as PortfolioCategory,
    name: row.name,
    nameAmber: row.nameAmber ?? "",
    ko: "", // v2 에서는 ko 서브타이틀 미사용 — description 단일 필드로 평탄화
    badge: row.badge ?? "",
    desc: parseEmphasis(row.description ?? ""),
    year: row.year ?? "",
    dur: row.duration ?? "",
    stack: row.stack ?? "",
    status: row.statusText ?? "",
    statusType: (row.statusType ?? "live") as PortfolioStatusType,
    meta: row.metaHint ?? "",
    linkUrl,
  };
}

/**
 * 공개 포트폴리오 항목 목록.
 *
 * 정렬: display_order ASC (낮은 숫자 먼저).
 * 한도: 10개. 11개 이상 등록되어 있으면 11번째부터 미노출.
 * 데이터 0건 → fallbackProjects 반환 (사이트 빈 화면 방지).
 * DB 장애 → fallbackProjects 반환 (사이트 우선 살림).
 */
export async function getPublicPortfolioProjects(): Promise<readonly Project[]> {
  try {
    const rows = await db
      .select({
        id: portfolioItems.id,
        slug: portfolioItems.slug,
        name: portfolioItems.name,
        nameAmber: portfolioItems.nameAmber,
        description: portfolioItems.description,
        cat: portfolioItems.cat,
        year: portfolioItems.year,
        duration: portfolioItems.duration,
        stack: portfolioItems.stack,
        statusText: portfolioItems.statusText,
        statusType: portfolioItems.statusType,
        badge: portfolioItems.badge,
        metaHint: portfolioItems.metaHint,
        liveUrl: portfolioItems.liveUrl,
        demoUrl: portfolioItems.demoUrl,
        displayOrder: portfolioItems.displayOrder,
      })
      .from(portfolioItems)
      .where(
        and(
          eq(portfolioItems.isPublic, true),
          isNull(portfolioItems.deletedAt),
        ),
      )
      .orderBy(portfolioItems.displayOrder)
      .limit(MAX_VISIBLE);

    if (rows.length === 0) return fallbackProjects;

    return rows.map((row, i) => {
      const num = `N°${String(i + 1).padStart(2, "0")}`;
      return rowToProject(row, num);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "getPublicPortfolioProjects_failed", message });
    return fallbackProjects;
  }
}
