import { defineConfig, devices } from "@playwright/test";

// Task 4-2 M8 B (B-2 → B): Supabase local CLI 격리 + 포털 핵심 흐름 E2E 스모크.
//
// 두 가지 모드:
//   1. LOCAL (default) — webServer 자동 띄움 + Supabase local DB + 시드/cleanup
//      `pnpm test:e2e`
//   2. PRODUCTION SMOKE — webServer skip + 시드 없음 + read-only 검증만
//      `E2E_BASE_URL=https://... pnpm test:e2e:prod`
//
// 보안 설계 (LOCAL):
//   - DATABASE_URL은 inline env로 Supabase local(54422) 격리 — production 시드 위험 제거
//   - webServer 별도 포트(3701) — 외부 ngrok tunnel 활성 상태에서도 e2e seed 격리
//   - reuseExistingServer:false — 다른 사용자가 띄운 dev 서버에 우연히 시드 박히는 것 방지
//   - trace/video off — .env secret이 trace ZIP에 dump되어 공유 시 노출되는 위험 제거
//   - n8n webhook URL 비움 — e2e seed의 피드백 제출이 production n8n으로 emit되지 않도록
//
// 시드/cleanup 보장 (LOCAL):
//   - globalSetup: DATABASE_URL 검증 + production guard (127.0.0.1 미포함 시 throw)
//   - globalTeardown: spec afterAll 미호출 시나리오(crash, --grep, OOM)에서 cleanup 보장
//   - spec 내 beforeAll/afterAll: 시드 비용 절약 + 시나리오 격리(afterEach feedbacks delete)
const PROD_URL = process.env.E2E_BASE_URL;
const isProd = !!PROD_URL;
const LOCAL_PORT = 3701;
const BASE_URL = isProd ? PROD_URL : `http://localhost:${LOCAL_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // PRODUCTION 모드는 e2e/smoke/만 collection — portal-flow는 db 모듈 top-level import라
  // collection 단계에서 DATABASE_URL throw 발생. 이를 차단하기 위해 collection 자체 분리.
  testMatch: isProd ? "smoke/**/*.spec.ts" : "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // PRODUCTION 모드에서는 DB 시드/cleanup 자체가 의미 없음(read-only) → hook skip.
  globalSetup: isProd ? undefined : "./e2e/fixtures/global-setup.ts",
  globalTeardown: isProd ? undefined : "./e2e/fixtures/global-teardown.ts",

  use: {
    baseURL: BASE_URL,
    trace: "off",
    video: "off",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // PRODUCTION 모드에서는 라이브 URL 사용 → 로컬 dev 서버 띄울 필요 없음.
  webServer: isProd
    ? undefined
    : {
        command: "pnpm dev:e2e",
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
