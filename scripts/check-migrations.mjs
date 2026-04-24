#!/usr/bin/env node
/**
 * Drizzle migrations ↔ journal 정합성 체크 (pure Node, tsx 불필요)
 *
 * 목적: MCP `apply_migration`으로 cloud에 SQL을 직접 적용한 뒤 `pnpm db:generate`를
 * 빠뜨려 journal/snapshot이 drift되는 상황을 조기 탐지한다.
 *
 * 체크 기준:
 *   1) migrations/*.sql 최신 번호 === _journal.json 마지막 entry idx
 *   2) resync_marker 이후 journal에 등록되지 않은 sql 파일이 없는지
 *
 * 실패 시 exit 1 + 한국어 안내.
 *
 * 사용: pnpm db:check (package.json scripts 등록)
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const MIGRATIONS_DIR = join(PROJECT_ROOT, "src/lib/db/migrations");
const JOURNAL_PATH = join(MIGRATIONS_DIR, "meta/_journal.json");

const sqlFiles = readdirSync(MIGRATIONS_DIR)
  .filter((f) => /^\d{4}_.+\.sql$/.test(f))
  .map((f) => ({ idx: Number(f.slice(0, 4)), name: f }))
  .sort((a, b) => a.idx - b.idx);

const journal = JSON.parse(readFileSync(JOURNAL_PATH, "utf8"));
const journalIdxSet = new Set(journal.entries.map((e) => e.idx));
const latestSqlIdx = sqlFiles.at(-1)?.idx ?? -1;
const latestJournalIdx = journal.entries.at(-1)?.idx ?? -1;

const errors = [];

if (latestSqlIdx !== latestJournalIdx) {
  errors.push(
    `❌ 최신 sql 번호(${String(latestSqlIdx).padStart(4, "0")})와 journal 마지막 idx(${latestJournalIdx})가 일치하지 않음.\n` +
      `   원인: MCP apply_migration으로 cloud에만 적용하고 drizzle journal 보강(\`pnpm db:generate\`)을 놓친 경우.\n` +
      `   해결:\n` +
      `     1) 방금 추가한 ${String(latestSqlIdx).padStart(4, "0")}_*.sql 내용을 cloud에 apply했다면\n` +
      `        → \`pnpm db:generate\` 실행 후 생성된 파일을 noop marker로 치환 (0031/0036 패턴).\n` +
      `     2) 아직 apply 전이면 → drizzle-kit으로 파일 생성 후 MCP apply_migration으로 적용하는 순서로 전환.`,
  );
}

const markerIndices = journal.entries
  .filter((e) => /^\d{4}_phase\d+_resync_marker(_v\d+)?$/.test(e.tag))
  .map((e) => e.idx);
const highestMarkerIdx = markerIndices.length > 0 ? Math.max(...markerIndices) : -1;

const unregisteredAfterMarker = sqlFiles.filter(
  (f) => !journalIdxSet.has(f.idx) && f.idx > highestMarkerIdx,
);
if (unregisteredAfterMarker.length > 0) {
  errors.push(
    `❌ resync_marker(idx=${highestMarkerIdx}) 이후 journal에 등록되지 않은 sql 파일이 있음:\n` +
      unregisteredAfterMarker.map((f) => `     - ${f.name}`).join("\n") +
      `\n   해결: 위 1번 절차와 동일 (generate 후 noop marker 치환 또는 정규 마이그레이션 등록).`,
  );
}

if (errors.length > 0) {
  console.error("━━━ drizzle migrations 정합성 체크 실패 ━━━");
  for (const e of errors) console.error(e);
  console.error(
    "\n📖 상세 절차: docs/db-migrations-workflow.md 참고 (MCP apply_migration 사용 시 체크리스트)",
  );
  process.exit(1);
}

console.log(
  `✅ migrations 정합성 OK — sql ${sqlFiles.length}개 / journal ${journal.entries.length}개 (최신 idx=${latestJournalIdx})`,
);
