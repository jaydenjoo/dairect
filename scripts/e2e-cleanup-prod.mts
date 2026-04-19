/**
 * production Supabase에 남은 e2e_* 시드 row 일괄 정리 (B-2 → B 전환 시 1회 실행).
 *
 * 사용:
 *   pnpm dlx tsx scripts/e2e-cleanup-prod.mts
 *
 * 동작:
 *   1. .env.local에서 DATABASE_URL 로드
 *   2. e2e/fixtures/seed-portal.ts의 cleanupPortalFixtures() 호출
 *   3. 결과 출력 후 종료
 *
 * 안전:
 *   - WHERE 절이 모두 E2E_USER_ID 또는 e2e_* prefix로 한정 — 실 사용자 데이터 영향 없음
 *   - 멱등 — 잔류 row 0이어도 성공
 */
import { config } from "dotenv";
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL 미설정. .env.local 확인.");
  process.exit(1);
}

const { cleanupPortalFixtures } = await import("../e2e/fixtures/seed-portal.js");

await cleanupPortalFixtures();
console.log("✓ production e2e seed cleanup 완료");
process.exit(0);
