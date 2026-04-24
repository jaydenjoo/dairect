/**
 * /projects 페이지용 공개 포트폴리오 쿼리.
 *
 * Task 6-ext-2 (2026-04-25): DB 에서 is_public=true + portfolioMeta 가 채워진
 * projects 를 끌어와 번들 디자인 Project 타입으로 변환. DB 0건이면 fallback.
 *
 * 디자인 제약: /projects 시각 렌더 결과 1픽셀도 변경 없음 — 번들 classname 유지,
 * 데이터 소스만 정적 배열 → DB 쿼리로 교체.
 */
import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects as projectsTable } from "@/lib/db/schema";
import { parsePortfolioMeta } from "@/lib/validation/portfolio";
import { parseEmphasis } from "./emphasis";
import { fallbackProjects } from "./fallback-projects";
import type { Project } from "./types";

const MAX_VISIBLE = 10; // 번들 디자인 "Ten projects. / 10 records" 카피 유지

type DbRow = {
  id: string;
  publicAlias: string | null;
  publicDescription: string | null;
  portfolioMeta: unknown;
};

/**
 * DB row 를 번들 Project 타입으로 변환. 필수 필드 (publicAlias, publicDescription) 가
 * 비면 null 반환 → 호출부에서 제외. "is_public=true 인데 alias 비어있음" 은
 * 데이터 불완전 상태 → silent skip.
 */
function rowToProject(row: DbRow, num: string): Project | null {
  if (!row.publicAlias || !row.publicDescription) return null;

  const meta = parsePortfolioMeta(row.portfolioMeta);

  return {
    num,
    slug: row.id,
    cat: meta.cat,
    name: row.publicAlias,
    nameAmber: meta.nameAmber,
    // publicDescription 단일 필드를 desc 로 사용 (번들의 ko 서브타이틀은 Korean-in-mono
    // 섹션이고 badge 하단에 위치. DB 로 전환하면서 번들 2-라인(en + ko) 구조를
    // 단일 desc 로 평탄화 — UX 단순화)
    ko: "",
    badge: meta.badge,
    desc: parseEmphasis(row.publicDescription),
    year: meta.year,
    dur: meta.dur,
    stack: meta.stack,
    status: meta.status,
    statusType: meta.statusType,
    meta: meta.meta,
  };
}

/**
 * 공개 포트폴리오 프로젝트 목록.
 *
 * 순서: portfolioMeta->order ASC → createdAt DESC tie-break.
 * DB 0건이면 fallbackProjects 반환.
 * 상한: 10개.
 */
export async function getPublicPortfolioProjects(): Promise<
  readonly Project[]
> {
  try {
    const rows = await db
      .select({
        id: projectsTable.id,
        publicAlias: projectsTable.publicAlias,
        publicDescription: projectsTable.publicDescription,
        portfolioMeta: projectsTable.portfolioMeta,
      })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.isPublic, true),
          isNotNull(projectsTable.publicAlias)
        )
      )
      .orderBy(desc(projectsTable.createdAt))
      .limit(50);

    // order 필드로 정렬 (jsonb path 정렬을 앱 측에서 — 50개 이하 데이터에서 DB orderBy 복잡도 < 앱 정렬)
    const sorted = rows
      .slice()
      .sort((a, b) => {
        const orderA = parsePortfolioMeta(a.portfolioMeta).order;
        const orderB = parsePortfolioMeta(b.portfolioMeta).order;
        return orderA - orderB;
      })
      .slice(0, MAX_VISIBLE);

    const projects = sorted
      .map((row, i) => {
        const num = `N°${String(i + 1).padStart(2, "0")}`;
        return rowToProject(row, num);
      })
      .filter((p): p is Project => p !== null);

    if (projects.length === 0) return fallbackProjects;
    return projects;
  } catch {
    // DB 장애 시 사이트가 먼저 살아있어야 하므로 fallback 반환
    return fallbackProjects;
  }
}
