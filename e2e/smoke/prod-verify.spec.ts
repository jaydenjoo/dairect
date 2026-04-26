/**
 * Production 회귀 검증 — Studio Anthem 디자인 시스템 배포 반영 확인.
 *
 * 사용법:
 *   E2E_BASE_URL=https://dairect.kr pnpm test:e2e:prod -- e2e/smoke/prod-verify.spec.ts
 *
 * production-smoke.spec.ts 와의 차이:
 * - production-smoke = 일반 페이지 작동 smoke (200 OK / 라우팅)
 * - prod-verify     = Studio Anthem 토큰/섹션 회귀 검증 (canvas/ink/signal hex,
 *                     구 Sanctuary 흔적 부재, 9 섹션 전부, /about Nav solidAlways)
 */
import { test, expect } from "@playwright/test";

test.skip(
  !process.env.E2E_BASE_URL,
  "E2E_BASE_URL 미설정 — prod verify skip"
);

test.use({ viewport: { width: 1440, height: 900 } });

test("프로덕션 디자인 시스템 확인 — Studio Anthem 토큰 배포 반영", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const tokens = await page.evaluate(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return {
      background: style.getPropertyValue("--background").trim(),
      foreground: style.getPropertyValue("--foreground").trim(),
      primary: style.getPropertyValue("--primary").trim(),
      accent: style.getPropertyValue("--accent").trim(),
      ring: style.getPropertyValue("--ring").trim(),
      // 구 Sanctuary 흔적 탐지
      hasOldSurfaceBase: !!document.querySelector(".surface-base"),
      hasOldSoulGradient: !!document.querySelector(".soul-gradient"),
      // 새 Studio Anthem 지표
      hasEtymology: !!document.querySelector(".etymology"),
      hasHeroGrid: !!document.querySelector(".hero-grid"),
      hasFooterSplit: !!document.querySelector(".footer-logo-split"),
      sections: Array.from(document.querySelectorAll("[data-screen-label]"))
        .map((s) => (s as HTMLElement).dataset.screenLabel)
        .filter(Boolean),
    };
  });

  console.log("Production tokens:", JSON.stringify(tokens, null, 2));

  // Studio Anthem 토큰 검증
  expect(tokens.background.toLowerCase()).toBe("#f5f1e8"); // canvas
  expect(tokens.foreground.toLowerCase()).toBe("#141414"); // ink
  expect(tokens.primary.toLowerCase()).toBe("#141414");
  expect(tokens.accent.toLowerCase()).toBe("#ffb800"); // signal

  // 구 Sanctuary 흔적 없음
  expect(tokens.hasOldSurfaceBase).toBe(false);
  expect(tokens.hasOldSoulGradient).toBe(false);

  // 새 섹션 존재
  expect(tokens.hasEtymology).toBe(true);
  expect(tokens.hasHeroGrid).toBe(true);
  expect(tokens.hasFooterSplit).toBe(true);

  // 9 섹션 전부
  expect(tokens.sections).toHaveLength(9);
});

test("프로덕션 풀페이지 스크린샷 (dairect.kr)", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({
    path: testInfo.outputPath("prod-landing.png"),
    fullPage: true,
  });
});

test("프로덕션 /about Nav solidAlways 확인", async ({ page }) => {
  await page.goto("/about");
  await page.waitForLoadState("networkidle");

  const navState = await page.evaluate(() => {
    const nav = document.querySelector(".nav") as HTMLElement;
    return {
      scrolled: nav?.classList.contains("scrolled"),
      bg: getComputedStyle(nav).backgroundColor,
    };
  });

  console.log("About Nav:", navState);
  expect(navState.scrolled).toBe(true);
  expect(navState.bg).toContain("250, 247, 240"); // paper alpha
});

test("프로덕션 /pricing → / redirect", async ({ page }) => {
  const response = await page.goto("/pricing");
  expect(response?.status()).toBeLessThan(400);
  expect(new URL(page.url()).pathname).toBe("/");
});
