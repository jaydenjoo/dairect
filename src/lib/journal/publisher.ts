import "server-only";
import matter from "gray-matter";
import { journalFrontmatterSchema } from "../content/types";
import { validateSlug } from "./slug";

/**
 * Journal 글 GitHub commit publisher.
 *
 * 흐름: 입력 → slug 검증 → frontmatter 검증(read 스키마 동일) →
 *      MD 직렬화 → base64 인코딩 → GitHub REST API PUT contents →
 *      commit 결과 반환.
 *
 * 단일 소스 원칙: src/content/journal/*.md 파일이 SoT. 이 publisher는
 * 옵시디언과 동일한 위치에 파일을 만들어 두 입구가 같은 노트를 쓰도록 한다.
 *
 * 비유: "원격 비서가 카페에서 받은 원고를 책상 노트북에 똑같이 옮겨 적기".
 *
 * 보안 (🟡):
 *  - server-only: client 번들 진입 차단
 *  - PAT는 환경변수에서만 읽고 로그·에러·응답 어디에도 노출 X
 *  - 동일 slug 충돌 시 422 → 친절한 사용자 메시지 반환
 */

type CommitJournalPostInput = {
  slug: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  body: string;
  tags: string[];
  status: "draft" | "published";
};

export type CommitJournalPostResult = {
  commitSha: string;
  htmlUrl: string;
  filePath: string;
};

export type JournalPublishErrorCode =
  | "missing-env"
  | "invalid-slug"
  | "invalid-frontmatter"
  | "github-auth"
  | "github-not-found"
  | "github-conflict"
  | "github-rate-limit"
  | "github-other"
  | "network";

export class JournalPublishError extends Error {
  readonly code: JournalPublishErrorCode;
  readonly status?: number;

  constructor(code: JournalPublishErrorCode, message: string, status?: number) {
    super(message);
    this.name = "JournalPublishError";
    this.code = code;
    this.status = status;
  }
}

function readGithubEnv() {
  const pat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;
  if (!pat || !owner || !repo || !branch) {
    const missing = [
      !pat && "GITHUB_PAT",
      !owner && "GITHUB_OWNER",
      !repo && "GITHUB_REPO",
      !branch && "GITHUB_BRANCH",
    ]
      .filter(Boolean)
      .join(", ");
    throw new JournalPublishError(
      "missing-env",
      `GitHub 환경변수 누락: ${missing}. .env.local(개발) 또는 Vercel 환경변수에 추가하세요.`,
    );
  }
  return { pat, owner, repo, branch };
}

export async function commitJournalPost(
  input: CommitJournalPostInput,
): Promise<CommitJournalPostResult> {
  const slugCheck = validateSlug(input.slug);
  if (!slugCheck.ok) {
    throw new JournalPublishError("invalid-slug", slugCheck.message);
  }

  const frontmatter = {
    title: input.title,
    date: input.dateISO,
    tags: input.tags,
    status: input.status,
    slug: input.slug,
  };

  // 빌드 read 시 검증과 동일 스키마로 사전 검증 — 잘못된 frontmatter가 commit
  // 후 사이트 빌드를 깨뜨리는 사고 방지.
  const parsed = journalFrontmatterSchema.safeParse(frontmatter);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new JournalPublishError(
      "invalid-frontmatter",
      `frontmatter 검증 실패:\n${issues}`,
    );
  }

  const md = matter.stringify(input.body.trimEnd() + "\n", parsed.data);
  const filePath = `src/content/journal/${input.dateISO}-${input.slug}.md`;
  const contentBase64 = Buffer.from(md, "utf8").toString("base64");

  const { pat, owner, repo, branch } = readGithubEnv();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "dairect-journal-publisher",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `post(journal): ${input.title}`,
        content: contentBase64,
        branch,
      }),
      cache: "no-store",
    });
  } catch (err) {
    throw new JournalPublishError(
      "network",
      `GitHub API 네트워크 오류: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401) {
      throw new JournalPublishError(
        "github-auth",
        "GitHub 인증 실패 — PAT가 만료되었거나 잘못되었습니다. 새 PAT를 발급해주세요.",
        401,
      );
    }
    if (res.status === 403) {
      throw new JournalPublishError(
        "github-rate-limit",
        "GitHub API rate limit 초과 또는 권한 부족 — 잠시 후 다시 시도하거나 PAT 권한(Contents: Read and write)을 확인하세요.",
        403,
      );
    }
    if (res.status === 404) {
      throw new JournalPublishError(
        "github-not-found",
        "Repo 접근 불가 — PAT의 Repository access에 dairect가 포함되어 있는지 확인하세요.",
        404,
      );
    }
    if (res.status === 409 || res.status === 422) {
      // sha 미제공 + 동일 경로 파일 존재 시 GitHub은 422 반환.
      throw new JournalPublishError(
        "github-conflict",
        `동일 파일이 이미 존재합니다: ${filePath}. slug를 변경하거나 옵시디언에서 직접 편집하세요.`,
        res.status,
      );
    }
    throw new JournalPublishError(
      "github-other",
      `GitHub API 오류 (status: ${res.status}): ${text.slice(0, 200)}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    content?: { html_url?: string };
    commit?: { sha?: string; html_url?: string };
  };

  return {
    commitSha: json.commit?.sha ?? "(unknown)",
    htmlUrl: json.commit?.html_url ?? json.content?.html_url ?? "",
    filePath,
  };
}
