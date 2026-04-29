import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  journalFrontmatterSchema,
  isValidMarkdownFile,
  PUBLISHED_STATUS,
  type JournalPost,
} from "./types";

/**
 * Journal 글 데이터 액세스 레이어.
 * 옵시디언에서 작성된 src/content/journal/*.md 파일을 읽어 검증·파싱.
 *
 * 핵심 정책:
 * - status: "draft"는 자동 제외 (실수 발행 방지)
 * - frontmatter 검증 실패 시 빌드 명시적 에러 (silent failure 차단)
 * - 폴더 비어있으면 빈 배열 반환 (빌드 통과)
 *
 * 비유: "도서관 사서" — 책들의 표지(frontmatter)만 먼저 확인,
 *       문제 있는 책은 빨리 골라내고, 발행 가능한 책만 진열대(사이트)로.
 */

const JOURNAL_DIR = path.join(process.cwd(), "src/content/journal");

/**
 * 모든 published 상태의 Journal 글을 최신순으로 반환.
 * draft는 자동 제외.
 */
export async function getAllJournalPosts(): Promise<JournalPost[]> {
  let files: string[];
  try {
    files = await fs.readdir(JOURNAL_DIR);
  } catch {
    // 폴더 없거나 비어있음 — 빌드 통과 위해 빈 배열
    return [];
  }

  const posts: JournalPost[] = [];

  for (const file of files) {
    if (!isValidMarkdownFile(file)) continue;

    const filePath = path.join(JOURNAL_DIR, file);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) continue;

    const raw = await fs.readFile(filePath, "utf8");

    // 빈 파일은 frontmatter 자체가 없음 → 검증 시 자동 실패 → skip
    if (raw.trim().length === 0) continue;

    const parsed = matter(raw);

    // frontmatter 자체가 없으면 (data === {}) skip
    if (Object.keys(parsed.data).length === 0) continue;

    const result = journalFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      // 빌드 시 명시적 실패 — 운영자가 즉시 인지 가능
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(
        `[journal] frontmatter 검증 실패: ${file}\n${issues}`,
      );
    }

    // draft는 빌드에서 제외 (status: "published"만 통과)
    if (result.data.status !== PUBLISHED_STATUS) continue;

    posts.push({
      frontmatter: result.data,
      content: parsed.content,
      filePath: file,
    });
  }

  // 최신순 정렬 (date desc)
  return posts.sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date),
  );
}

/**
 * 특정 slug의 Journal 글 1건. 없으면 null.
 */
export async function getJournalPostBySlug(
  slug: string,
): Promise<JournalPost | null> {
  const posts = await getAllJournalPosts();
  return posts.find((p) => p.frontmatter.slug === slug) ?? null;
}

/**
 * generateStaticParams 용 — 모든 published slug.
 */
export async function getAllJournalSlugs(): Promise<{ slug: string }[]> {
  const posts = await getAllJournalPosts();
  return posts.map((p) => ({ slug: p.frontmatter.slug }));
}
