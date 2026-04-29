#!/usr/bin/env node
/**
 * 옵시디언 첨부파일 → 사이트 정적 자산 동기화.
 *
 * src/content/attachments/  →  public/journal-images/
 *
 * 옵시디언 vault의 80-Dairect/attachments/ 폴더(심볼릭 링크 통해 src/content/attachments/)에
 * 저장된 이미지를 사이트가 서빙 가능한 public/journal-images/로 복사.
 *
 * 비유: "방 두 개의 같은 책상" — 옵시디언이 글에 이미지 끼우면 자동으로 사이트도 보임.
 *
 * 실행: pnpm dev / pnpm build 시 자동 (package.json scripts에서 chain).
 *
 * 정책:
 * - 폴더 없으면 조용히 skip (옵시디언 셋업 안 한 환경 방어)
 * - 빈 폴더면 0개 복사
 * - 숨김 파일(.DS_Store 등) skip
 * - 매번 전체 복사 (단순. 수십 MB 단위라면 rsync 도입 고려)
 *
 * 사용 흐름:
 * 1. 옵시디언에서 글에 이미지 첨부 (자동으로 attachments/foo.png 생성)
 * 2. 마크다운에서 ![설명](attachments/foo.png) 참조
 * 3. 빌드 시 이 스크립트가 attachments/foo.png → public/journal-images/foo.png 복사
 * 4. MarkdownContent 컴포넌트가 src를 /journal-images/foo.png로 변환
 */
import { mkdir, readdir, copyFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const SOURCE_DIR = join(PROJECT_ROOT, "src/content/attachments");
const TARGET_DIR = join(PROJECT_ROOT, "public/journal-images");

async function main() {
  let entries;
  try {
    entries = await readdir(SOURCE_DIR);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("[sync-images] src/content/attachments/ 없음 — skip");
      return;
    }
    throw err;
  }

  await mkdir(TARGET_DIR, { recursive: true });

  let copied = 0;
  let skipped = 0;
  for (const file of entries) {
    if (file.startsWith(".")) {
      skipped++;
      continue;
    }
    const src = join(SOURCE_DIR, file);
    const dst = join(TARGET_DIR, file);
    const s = await stat(src);
    if (!s.isFile()) {
      skipped++;
      continue;
    }
    await copyFile(src, dst);
    copied++;
  }

  console.log(
    `[sync-images] ${copied}개 복사, ${skipped}개 skip ` +
      `(src/content/attachments/ → public/journal-images/)`,
  );
}

main().catch((err) => {
  console.error("[sync-images] 실패:", err);
  process.exit(1);
});
