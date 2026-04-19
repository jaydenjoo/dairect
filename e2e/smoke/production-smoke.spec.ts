/**
 * Production Smoke Test — read-only.
 *
 * 의도: 배포된 라이브 URL이 정상 응답 + 핵심 콘텐츠 렌더 + 보안 메타 유지를 빠르게 확인.
 * DB 시드 의존 없음 (production seed 자체 폐기 정책 — Task 4-2 M8 B 결정).
 *
 * 실행:
 *   E2E_BASE_URL=https://dairect-b4xf.vercel.app pnpm test:e2e:prod
 *
 * 시나리오는 portal-flow.spec과 다르게 production seed를 가정하지 않음:
 *   - 공개 페이지 응답 + 핵심 텍스트 렌더
 *   - portal/invalid 안내 페이지
 *   - random v4 UUID로 portal 접근 → invalid 분기 (DB에 없는 토큰이 invalid로 가는지 확인)
 *   - manifest.json + 아이콘 + sw.js 정적 자원 응답
 *   - 보안 메타 (portal robots noindex, referrer no-referrer)
 */
import { test, expect } from "@playwright/test";

// E2E_BASE_URL이 없으면 production smoke 의미가 없으므로 skip.
test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL 미설정 — production smoke skip");

test.describe("Production Smoke (read-only)", () => {
  test("#1 랜딩 / — 200 + 핵심 카피 또는 nav 렌더", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/dairect/i);
    // Hero/nav에 "아이디어"는 항상 등장 (리브랜딩 회귀 시 가장 먼저 망가지는 단어)
    await expect(page.getByText(/아이디어/).first()).toBeVisible();
  });

  test("#2 /pricing — 200 + 3패키지 heading 노출", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBeLessThan(400);
    // 패키지별 heading — 회귀 시 가장 먼저 망가지는 곳. 페이지 곳곳에 단어가 분산되므로
    // strict mode violation 회피를 위해 .first() 사용.
    await expect(
      page.getByRole("heading", { name: /진단 패키지/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /MVP 패키지/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /확장 패키지/i }).first(),
    ).toBeVisible();
  });

  test("#3 /about — 200 + contact 폼 렌더", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBeLessThan(400);
    // contact 폼의 핵심 input — name="website" honeypot도 DOM에 있어야 함
    await expect(page.locator('input[name="website"]')).toBeAttached();
  });

  test("#4 /projects — 200 + 페이지 렌더 (Bento Grid 또는 빈 상태)", async ({ page }) => {
    const response = await page.goto("/projects");
    expect(response?.status()).toBeLessThan(400);
    // 빌드 실패 직접 원인이었던 경로 — DB connect 정상 + render 정상 확인
    await expect(page.locator("body")).toBeVisible();
  });

  test("#5 /portal/invalid — 200 + 만료 안내", async ({ page }) => {
    const response = await page.goto("/portal/invalid");
    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByText(/링크가 만료되었거나 유효하지 않아요/),
    ).toBeVisible();
  });

  test("#6 /portal/<random v4 UUID> — invalid로 redirect (DB에 없는 토큰)", async ({
    page,
  }) => {
    // production DB에 e2e seed가 없으므로 v4 random UUID는 항상 미존재 → invalid 분기.
    // RFC 4122 v4 strict (13번째=4, 17번째=8) 준수해야 Zod uuid 통과 후 DB 조회됨.
    const randomToken = crypto.randomUUID();
    await page.goto(`/portal/${randomToken}`);
    await expect(page).toHaveURL(/\/portal\/invalid$/);
    await expect(
      page.getByText(/링크가 만료되었거나 유효하지 않아요/),
    ).toBeVisible();
  });

  test("#7 portal 페이지 보안 메타 — robots noindex + referrer no-referrer", async ({
    page,
  }) => {
    await page.goto("/portal/invalid");
    const robots = await page
      .locator('meta[name="robots"]')
      .first()
      .getAttribute("content");
    expect(robots).toBeTruthy();
    expect(robots!.toLowerCase()).toContain("noindex");
    const referrer = await page
      .locator('meta[name="referrer"]')
      .first()
      .getAttribute("content");
    expect(referrer).toBe("no-referrer");
  });

  test("#8 PWA manifest + 아이콘 + sw.js — 정적 자원 응답", async ({ request }) => {
    const manifest = await request.get("/manifest.json");
    expect(manifest.status()).toBe(200);
    const manifestJson = await manifest.json();
    expect(manifestJson.name).toMatch(/Dairect/i);
    expect(manifestJson.icons.length).toBeGreaterThanOrEqual(4);

    const icon192 = await request.get("/icons/icon-192.png");
    expect(icon192.status()).toBe(200);
    expect(icon192.headers()["content-type"]).toMatch(/image\/png/);

    const sw = await request.get("/sw.js");
    expect(sw.status()).toBe(200);
    expect(sw.headers()["content-type"]).toMatch(/javascript|application\/javascript/);
  });

  test("#9 /login — 200 + Google OAuth 버튼 렌더", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("button", { name: /Google|구글/ })).toBeVisible();
  });
});
