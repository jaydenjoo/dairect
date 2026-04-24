/**
 * Studio Anthem 리디자인 시각 증거 수집 (full-page screenshot)
 *
 * 실행:
 *   E2E_BASE_URL=http://localhost:3700 pnpm playwright test e2e/smoke/studio-anthem-visual --project=chromium
 *
 * 출력: test-results 하위 .png 파일 — Jayden이 브라우저 없이도 각 페이지 전체 렌더 확인 가능.
 */
import { test, expect } from "@playwright/test";

test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL 미설정 — visual skip");

test.use({ viewport: { width: 1440, height: 900 } });

const routes = [
  { path: "/", name: "landing-full" },
  { path: "/projects", name: "projects-full" },
  { path: "/about", name: "about-full" },
  { path: "/login", name: "login" },
  { path: "/demo", name: "dashboard-demo" },
  { path: "/demo/estimates", name: "dashboard-estimates" },
  { path: "/demo/projects", name: "dashboard-projects" },
  { path: "/terms", name: "terms" },
  { path: "/privacy", name: "privacy" },
];

for (const { path, name } of routes) {
  test(`Visual: ${name} (${path})`, async ({ page }, testInfo) => {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState("networkidle");

    // reveal animation 완료 대기
    await page.waitForTimeout(500);

    await page.screenshot({
      path: testInfo.outputPath(`${name}.png`),
      fullPage: true,
    });
  });
}
