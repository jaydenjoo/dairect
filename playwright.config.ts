import { defineConfig, devices } from "@playwright/test";

// Task 4-2 M8 B (B-2 → B): Supabase local CLI 격리 + 포털 핵심 흐름 E2E 스모크.
//
// 보안 설계:
//   - DATABASE_URL은 .env.e2e (Supabase local, port 54422)로 격리 — production 시드 위험 제거
//   - webServer는 별도 포트(3701)로 띄움 — 외부 ngrok tunnel 활성 상태에서도 e2e seed 격리
//   - reuseExistingServer:false — 다른 사용자가 띄운 dev 서버에 우연히 시드 박히는 것 방지
//   - trace/video off — .env secret이 trace ZIP에 dump되어 공유 시 노출되는 위험 제거
//   - screenshot only-on-failure — 디버깅 가치 vs 보안 위험 trade-off (PNG는 secret 노출 위험 낮음)
//   - n8n webhook URL 비움 — e2e seed의 피드백 제출이 production n8n으로 emit되지 않도록
//
// 시드/cleanup 보장:
//   - globalSetup: .env.e2e 로드 + DATABASE_URL 검증
//   - globalTeardown: spec afterAll 미호출 시나리오(crash, --grep, OOM)에서 cleanup 보장
//   - spec 내 beforeAll/afterAll: 시드 비용 절약 + 시나리오 격리(afterEach feedbacks delete)
const PORT = 3701;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  globalSetup: "./e2e/fixtures/global-setup.ts",
  globalTeardown: "./e2e/fixtures/global-teardown.ts",

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

  webServer: {
    command: "pnpm dev:e2e",
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
