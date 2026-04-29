import { z } from "zod";

/**
 * Journal/Build 글의 frontmatter 스키마.
 * 옵시디언에서 작성된 마크다운 파일의 YAML frontmatter를 검증.
 *
 * 비유: "글의 명함" — 제목·날짜·태그·발행 여부 등 글에 대한 정보를 담는다.
 *
 * 검증 정책:
 * - 빌드 시 잘못된 frontmatter는 명시적 에러 (silent failure 방지)
 * - status: "draft" 글은 빌드에서 제외 (실수 발행 방지)
 *
 * 관련 PRD: docs/PRD-journal-build.md (Section 4)
 */

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const slugRegex = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Date preprocess — YAML 1.1 timestamp가 자동으로 Date 객체로 파싱되는 문제 방어.
 *
 * 옵시디언 frontmatter에서 `date: 2026-04-29`처럼 따옴표 없이 쓰면 gray-matter
 * 내부 js-yaml이 Date 객체로 파싱한다. 우리 스키마는 string 기대 → 실패.
 *
 * 해결: Date 객체로 들어온 경우 ISO string(YYYY-MM-DD)으로 변환 후 검증.
 *
 * 비유: "달력에 적힌 날짜를 텍스트로 옮기기" — 어떤 형태로 들어와도 표준화.
 */
const dateField = z.preprocess(
  (val) => {
    if (val instanceof Date && !Number.isNaN(val.getTime())) {
      const year = val.getUTCFullYear();
      const month = String(val.getUTCMonth() + 1).padStart(2, "0");
      const day = String(val.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return val;
  },
  z.string().regex(dateRegex, "date는 YYYY-MM-DD 형식이어야 합니다"),
);

// 공통 필드
const baseFrontmatterSchema = z.object({
  title: z.string().min(1, "title은 필수입니다"),
  date: dateField,
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  slug: z
    .string()
    .min(1, "slug는 필수입니다")
    .regex(slugRegex, "slug는 영문 소문자·숫자·하이픈만 가능합니다"),
  cover: z.string().optional(),
});

// Journal frontmatter — 가벼운 노트
export const journalFrontmatterSchema = baseFrontmatterSchema;
export type JournalFrontmatter = z.infer<typeof journalFrontmatterSchema>;

// Build frontmatter — 프로젝트 빌드 로그 (project + phase + progress 추가)
export const buildFrontmatterSchema = baseFrontmatterSchema.extend({
  project: z
    .string()
    .min(1, "project는 필수입니다")
    .regex(slugRegex, "project는 영문 소문자·숫자·하이픈만 가능합니다"),
  phase: z.enum(["idea", "building", "shipped"]).default("building"),
  progress: z
    .number()
    .int()
    .min(0)
    .max(100)
    .default(0),
});
export type BuildFrontmatter = z.infer<typeof buildFrontmatterSchema>;

// 파싱된 글 = frontmatter + 본문 + 파일 식별자
export type JournalPost = {
  frontmatter: JournalFrontmatter;
  content: string;
  filePath: string;
};

export type BuildPost = {
  frontmatter: BuildFrontmatter;
  content: string;
  filePath: string;
};

// 빌드 시 published 필터에 사용되는 상수 (하드코딩 방지)
export const PUBLISHED_STATUS = "published" as const;

/**
 * Markdown 파일 확장자 검증.
 * 옵시디언이 잘못 만든 .md.md 같은 이중 확장자는 제외.
 *
 * 비유: "이름표 검사" — .md.md는 이름표가 두 개라 제외.
 */
export function isValidMarkdownFile(filename: string): boolean {
  if (!filename.endsWith(".md")) return false;
  if (filename.endsWith(".md.md")) return false;
  // 숨김 파일·시스템 파일 제외
  if (filename.startsWith(".")) return false;
  return true;
}
