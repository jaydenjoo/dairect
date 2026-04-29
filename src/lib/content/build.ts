import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  buildFrontmatterSchema,
  isValidMarkdownFile,
  PUBLISHED_STATUS,
  type BuildPost,
} from "./types";

/**
 * Build 글 데이터 액세스 레이어.
 * 한 프로젝트는 여러 빌드 로그를 시간순으로 가질 수 있음.
 *
 * 비유: "프로젝트 일지" — 한 권의 일지에 여러 날의 기록.
 *       /build 인덱스는 일지 표지들, /build/[project] 상세는 한 일지의 전체 내용.
 *
 * 관련 PRD: docs/PRD-journal-build.md (Section 4 Build 로그)
 */

const BUILD_DIR = path.join(process.cwd(), "src/content/build");

/**
 * 모든 published Build 글 반환 (날짜 최신순, 프로젝트 무관).
 */
export async function getAllBuildPosts(): Promise<BuildPost[]> {
  let files: string[];
  try {
    files = await fs.readdir(BUILD_DIR);
  } catch {
    return [];
  }

  const posts: BuildPost[] = [];

  for (const file of files) {
    if (!isValidMarkdownFile(file)) continue;

    const filePath = path.join(BUILD_DIR, file);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) continue;

    const raw = await fs.readFile(filePath, "utf8");
    if (raw.trim().length === 0) continue;

    const parsed = matter(raw);
    if (Object.keys(parsed.data).length === 0) continue;

    const result = buildFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(
        `[build] frontmatter 검증 실패: ${file}\n${issues}`,
      );
    }

    if (result.data.status !== PUBLISHED_STATUS) continue;

    posts.push({
      frontmatter: result.data,
      content: parsed.content,
      filePath: file,
    });
  }

  return posts.sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date),
  );
}

/**
 * 프로젝트별 그룹.
 * /build 인덱스에서 프로젝트 카드별로 노출하기 위함.
 */
export type BuildProjectGroup = {
  project: string;
  posts: BuildPost[];
  latestTitle: string;
  latestPhase: BuildPost["frontmatter"]["phase"];
  latestProgress: number;
  latestDate: string;
  totalLogs: number;
};

/**
 * 프로젝트별로 그룹핑된 빌드 로그 (최신 활동 순).
 */
export async function getAllBuildProjects(): Promise<BuildProjectGroup[]> {
  const posts = await getAllBuildPosts();
  const grouped = new Map<string, BuildPost[]>();

  for (const post of posts) {
    const key = post.frontmatter.project;
    const existing = grouped.get(key) ?? [];
    grouped.set(key, [...existing, post]);
  }

  const groups: BuildProjectGroup[] = [];
  for (const [project, projectPosts] of grouped.entries()) {
    // 각 프로젝트 내 최신순
    const sorted = [...projectPosts].sort((a, b) =>
      b.frontmatter.date.localeCompare(a.frontmatter.date),
    );
    const latest = sorted[0];
    if (!latest) continue;

    groups.push({
      project,
      posts: sorted,
      latestTitle: latest.frontmatter.title,
      latestPhase: latest.frontmatter.phase,
      latestProgress: latest.frontmatter.progress,
      latestDate: latest.frontmatter.date,
      totalLogs: sorted.length,
    });
  }

  // 프로젝트 정렬: 최신 활동순
  return groups.sort((a, b) => b.latestDate.localeCompare(a.latestDate));
}

/**
 * 특정 project slug의 빌드 로그 모음 (시간순). 없으면 null.
 */
export async function getBuildProjectBySlug(
  projectSlug: string,
): Promise<BuildProjectGroup | null> {
  const groups = await getAllBuildProjects();
  return groups.find((g) => g.project === projectSlug) ?? null;
}

/**
 * generateStaticParams 용 — 모든 unique project slug.
 * Note: Next.js 16의 dynamic segment 이름이 "project-slug"라 키도 동일.
 */
export async function getAllBuildProjectSlugs(): Promise<
  { "project-slug": string }[]
> {
  const groups = await getAllBuildProjects();
  return groups.map((g) => ({ "project-slug": g.project }));
}
