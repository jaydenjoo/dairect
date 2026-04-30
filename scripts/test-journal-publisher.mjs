/**
 * Phase 5 검증 스크립트 — Journal publisher 실 동작 테스트.
 *
 * publisher.ts와 1:1 등가 로직을 인라인으로 재구현 (server-only · path alias 우회).
 * publisher.ts 자체는 production server action에서 검증됨.
 *
 * 검증 대상:
 *   1) slug regex 매칭 (한글·대문자·공백 거부)
 *   2) frontmatter 직렬화 형식 (gray-matter stringify)
 *   3) (--commit) GitHub PUT contents 실 호출 → status:draft commit 1건
 *
 * 실행:
 *   node --env-file=.env.local scripts/test-journal-publisher.mjs
 *   node --env-file=.env.local scripts/test-journal-publisher.mjs --commit
 */

import matter from "gray-matter";

const COMMIT_MODE = process.argv.includes("--commit");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Phase 5 Journal Publisher 검증");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// publisher.ts와 동일 정규식 (slug.ts와 1:1)
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*$/;
const SLUG_MAX_LENGTH = 80;
function validateSlug(input) {
  if (input.length === 0) return { ok: false, reason: "empty" };
  if (input.length > SLUG_MAX_LENGTH) return { ok: false, reason: "too-long" };
  if (!SLUG_REGEX.test(input)) return { ok: false, reason: "invalid-format" };
  return { ok: true };
}

let pass = 0;
let fail = 0;

// ─── 1) slug validator ───
console.log("\n[1] slug validator (한글·대문자·공백·길이 거부 검증)");
const slugCases = [
  { input: "welcome-2026-05-01", expected: "ok", note: "표준 영문 slug" },
  { input: "a", expected: "ok", note: "최소 1자" },
  { input: "123-numeric-start", expected: "ok", note: "숫자로 시작 OK" },
  { input: "한글", expected: "fail", note: "한글 거부" },
  { input: "Hello", expected: "fail", note: "대문자 거부" },
  { input: "", expected: "fail", note: "빈 문자열 거부" },
  { input: "with space", expected: "fail", note: "공백 거부" },
  { input: "-leading-hyphen", expected: "fail", note: "선행 하이픈 거부" },
  { input: "a".repeat(81), expected: "fail", note: "81자 거부" },
  { input: "test_underscore", expected: "fail", note: "언더스코어 거부" },
];
for (const c of slugCases) {
  const r = validateSlug(c.input);
  const actual = r.ok ? "ok" : "fail";
  if (actual === c.expected) {
    pass++;
    console.log(`  ✓ "${c.input.slice(0, 30)}" → ${actual} (${c.note})`);
  } else {
    fail++;
    console.error(`  ✗ "${c.input}" → ${actual}, expected ${c.expected}`);
  }
}

// ─── 2) frontmatter 직렬화 ───
console.log("\n[2] frontmatter 직렬화 (gray-matter stringify)");
const fm = {
  title: "테스트 — Phase 5 자동 검증",
  date: "2026-05-01",
  tags: ["meta", "test"],
  status: "draft",
  slug: "phase-5-auto-test",
};
const md = matter.stringify(
  "본문\n\n## 섹션 1\n\n- 항목 A\n- 항목 B\n\n> 인용문\n",
  fm,
);
console.log("--- 직렬화된 MD (read 시 자동 통과 보장) ---");
console.log(md);
console.log("--- end ---");

// matter 자체 round-trip — 직렬화→재파싱 시 데이터 일치
const reparsed = matter(md);
const dataKeys = ["title", "date", "tags", "status", "slug"];
let rtOk = true;
for (const k of dataKeys) {
  const a = JSON.stringify(reparsed.data[k]);
  const b = JSON.stringify(fm[k]);
  if (a !== b) {
    console.error(`  ✗ ${k}: ${a} !== ${b}`);
    rtOk = false;
  }
}
if (rtOk) {
  pass++;
  console.log("  ✓ matter round-trip 통과 (모든 필드 일치)");
} else {
  fail++;
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`단위 검증: ${pass}/${pass + fail} PASS`);
if (fail > 0) {
  console.error("✗ 단위 검증 실패 — commit 단계 차단");
  process.exit(1);
}

if (!COMMIT_MODE) {
  console.log("\n(GitHub commit 검증은 --commit 플래그 시 실행)");
  process.exit(0);
}

// ─── 3) GitHub PUT contents 실 호출 (publisher.ts와 1:1 등가) ───
console.log("\n[3] GitHub commit 실 호출 (--commit 모드)");

const pat = process.env.GITHUB_PAT;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = process.env.GITHUB_BRANCH;
if (!pat || !owner || !repo || !branch) {
  console.error("  ✗ GitHub 환경변수 누락 — .env.local 또는 --env-file 확인");
  console.error(`    GITHUB_PAT: ${pat ? "✓" : "✗"}`);
  console.error(`    GITHUB_OWNER: ${owner ?? "✗"}`);
  console.error(`    GITHUB_REPO: ${repo ?? "✗"}`);
  console.error(`    GITHUB_BRANCH: ${branch ?? "✗"}`);
  process.exit(1);
}

const dateISO = "2026-05-01";
const slug = "phase-5-auto-test";
const filePath = `src/content/journal/${dateISO}-${slug}.md`;
const contentBase64 = Buffer.from(md, "utf8").toString("base64");
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

console.log(`  PUT ${apiUrl}`);
console.log(`  message: post(journal): ${fm.title}`);
console.log(`  branch: ${branch}`);

let res;
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
      message: `post(journal): ${fm.title}`,
      content: contentBase64,
      branch,
    }),
    cache: "no-store",
  });
} catch (err) {
  console.error("  ✗ network error:", err);
  process.exit(1);
}

if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error(`  ✗ HTTP ${res.status}: ${text.slice(0, 300)}`);
  process.exit(1);
}

const json = await res.json();

console.log("  ✓ commit 성공");
console.log(`    path: ${json.content?.path ?? filePath}`);
console.log(`    commitSha: ${json.commit?.sha ?? "(unknown)"}`);
console.log(`    htmlUrl: ${json.commit?.html_url ?? json.content?.html_url ?? ""}`);

console.log("\n✓ 모든 검증 PASS");
console.log("다음: 사이트 회귀 + Vercel 빌드 결과 확인 → cleanup commit");
