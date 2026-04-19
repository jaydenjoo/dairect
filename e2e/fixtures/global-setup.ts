/**
 * Playwright globalSetup hook — 모든 spec 실행 직전 1회 호출.
 *
 * 의도:
 *   - DATABASE_URL은 package.json의 e2e scripts에서 inline으로 주입됨
 *     (Supabase local CLI: postgresql://postgres:postgres@127.0.0.1:54422/postgres).
 *   - 시드는 spec의 beforeAll에서 처리 (시나리오별 격리 + 단일 시드 비용 절약).
 *   - 본 hook은 환경 검증만 — production DB 우발 사용을 strict하게 차단.
 */
async function globalSetup(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL 미설정 — `pnpm test:e2e`로 실행하세요 (script가 inline으로 local DB URL 주입). 사전: `supabase start`",
    );
  }

  if (
    !process.env.DATABASE_URL.includes("127.0.0.1") &&
    !process.env.DATABASE_URL.includes("localhost")
  ) {
    throw new Error(
      `❌ DATABASE_URL이 127.0.0.1/localhost가 아닙니다. e2e 시드가 production에 박힐 위험. 즉시 중단.\n` +
        `현재값: ${process.env.DATABASE_URL.replace(/:[^:@/]+@/, ":***@")}`,
    );
  }
}

export default globalSetup;
