/**
 * PWA 아이콘 생성 스크립트 (일회성, 디자인 변경 시 재실행)
 *
 * 산출물:
 * - public/icons/icon-192.png (any purpose)
 * - public/icons/icon-512.png (any purpose)
 * - public/icons/icon-maskable-192.png (safe zone 80%)
 * - public/icons/icon-maskable-512.png (safe zone 80%)
 * - public/apple-touch-icon.png (180x180, iOS 홈 화면)
 *
 * 실행: pnpm dlx tsx scripts/generate-pwa-icons.mts
 *      또는 pnpm pwa:icons (package.json script 등록 시)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "public", "icons");
const APPLE_ICON_PATH = path.join(ROOT, "public", "apple-touch-icon.png");

// DESIGN.md primary indigo + 흰색 D 모양 (좌측 직선 + 우측 반원, 안쪽 비움)
// viewBox 1024 기준: 모서리 반지름 22.5% (라운드 사각형)
const SOURCE_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="230" fill="#4F46E5"/>
  <path d="M 320 280 L 512 280 A 232 232 0 0 1 512 744 L 320 744 Z M 416 376 L 512 376 A 136 136 0 0 1 512 648 L 416 648 Z" fill="white" fill-rule="evenodd"/>
</svg>`;

const INDIGO_RGB = { r: 79, g: 70, b: 229, alpha: 1 } as const; // #4F46E5

async function rasterizeAny(size: number, outPath: string) {
  const buffer = Buffer.from(SOURCE_SVG);
  await sharp(buffer, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${path.relative(ROOT, outPath)} (${size}x${size}, any)`);
}

async function rasterizeMaskable(size: number, outPath: string) {
  // Maskable: 풀 캔버스 indigo 배경 + 80% 영역에 아이콘 (safe zone padding 10% 사방)
  const innerSize = Math.round(size * 0.8);
  const innerBuffer = await sharp(Buffer.from(SOURCE_SVG), { density: 384 })
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: INDIGO_RGB,
    },
  })
    .composite([{ input: innerBuffer, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${path.relative(ROOT, outPath)} (${size}x${size}, maskable safe zone 80%)`);
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  await Promise.all([
    rasterizeAny(192, path.join(ICONS_DIR, "icon-192.png")),
    rasterizeAny(512, path.join(ICONS_DIR, "icon-512.png")),
    rasterizeMaskable(192, path.join(ICONS_DIR, "icon-maskable-192.png")),
    rasterizeMaskable(512, path.join(ICONS_DIR, "icon-maskable-512.png")),
    rasterizeAny(180, APPLE_ICON_PATH),
  ]);

  console.log("\n✅ PWA 아이콘 5종 생성 완료");
}

main().catch((err) => {
  console.error("아이콘 생성 실패:", err);
  process.exit(1);
});
