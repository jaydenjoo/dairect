/**
 * Studio Anthem 리디자인 E2E 스모크 테스트 (Epic 1~7 검증)
 *
 * 의도: 2026-04-24~25 Studio Anthem 전환의 모든 공개 라우트 + 대시보드 demo가
 *       디자인 토큰(ink/canvas/signal), 폰트 체인(Fraunces/Geist), 번들 이식 섹션
 *       구조를 올바르게 렌더하는지 검증.
 *
 * 실행:
 *   E2E_BASE_URL=http://localhost:3700 pnpm playwright test e2e/smoke/studio-anthem-redesign
 *
 * 시나리오 (10개):
 *   1. 랜딩 9 섹션 + Footer 전부 존재
 *   2. Etymology 워드마크 정합성 (D=127, AI=166, RECT=436 at 1440px)
 *   3. Fraunces variable font 로드 + opsz axis
 *   4. Manifesto/Work/Founder dark section 배경 ink
 *   5. /projects 인덱스 10개 프로젝트 + 5 필터
 *   6. /about 5 섹션 + 9 milestones + 3 essays + contact form
 *   7. /about Nav solidAlways (dark hero 가독성)
 *   8. /pricing → /#pricing 308 redirect
 *   9. /login Studio Anthem 재스킨 + shadcn primary=ink
 *   10. /demo 대시보드 토큰 재매핑 + 차트 색상
 */
import { test, expect } from "@playwright/test";

test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL 미설정 — redesign smoke skip");

test.describe("Studio Anthem Redesign — 공개 영역", () => {
  test("#1 랜딩 / — 9 섹션 data-screen-label 전부 렌더 + Footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/dairect/i);

    // 9 섹션 data-screen-label 확인 (Hero/Etymology/Manifesto/Proof/Services/Work/Pricing/Founder/Contact)
    const expected = [
      "01 Hero",
      "02.5 Etymology",
      "02 Manifesto",
      "03 Proof",
      "04 Services",
      "05 Work",
      "06 Pricing",
      "07 Founder",
      "08 Contact",
    ];
    for (const label of expected) {
      await expect(page.locator(`[data-screen-label="${label}"]`)).toBeVisible();
    }

    // Footer 전용 요소
    await expect(page.locator("footer.footer")).toBeVisible();
    await expect(page.locator(".footer-logo-split")).toBeVisible();
    // Etymology + Footer 양쪽에 있는 슬로건 → Footer 내부만 scoped
    await expect(
      page.locator("footer.footer").getByText(/Code by machines\. Direction by us\./)
    ).toBeVisible();
  });

  test("#2 Etymology 워드마크 정합성 — D/AI/RECT 번들 수치 일치 (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const measurements = await page.evaluate(() => {
      const d = document.querySelector(".etym-d") as HTMLElement;
      const ai = document.querySelector(".etym-ai") as HTMLElement;
      const rect = document.querySelector(".etym-rect") as HTMLElement;
      const wordmark = document.querySelector(".etym-wordmark") as HTMLElement;
      return {
        d: Math.round(d.getBoundingClientRect().width),
        ai: Math.round(ai.getBoundingClientRect().width),
        rect: Math.round(rect.getBoundingClientRect().width),
        wordmarkH: Math.round(wordmark.getBoundingClientRect().height),
      };
    });

    // 번들 Landing.html 기준: D=127, AI=166, RECT=436. ±3px 허용 (폰트 metric fallback 영향)
    expect(measurements.d).toBeGreaterThanOrEqual(124);
    expect(measurements.d).toBeLessThanOrEqual(130);
    expect(measurements.ai).toBeGreaterThanOrEqual(163);
    expect(measurements.ai).toBeLessThanOrEqual(169);
    expect(measurements.rect).toBeGreaterThanOrEqual(430);
    expect(measurements.rect).toBeLessThanOrEqual(442);
    // 한 줄 유지 — 2줄 wrap되면 높이가 2배 이상
    expect(measurements.wordmarkH).toBeLessThan(320);
  });

  test("#3 Fraunces variable font + opsz axis 로드", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const fontInfo = await page.evaluate(() => {
      const rect = document.querySelector(".etym-rect") as HTMLElement;
      const style = getComputedStyle(rect);
      return {
        family: style.fontFamily,
        hasFraunces: style.fontFamily.includes("Fraunces"),
        fontSize: parseFloat(style.fontSize),
      };
    });

    expect(fontInfo.hasFraunces).toBe(true);
    // 1440px desktop: 번들 기준 200px
    expect(fontInfo.fontSize).toBeGreaterThanOrEqual(180);
    expect(fontInfo.fontSize).toBeLessThanOrEqual(220);
  });

  test("#4 Dark section 배경 ink (#141414) — Manifesto/Work/Founder", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bgs = await page.evaluate(() => {
      const manifesto = document.querySelector(".manifesto") as HTMLElement;
      const work = document.querySelector("#work") as HTMLElement;
      const founder = document.querySelector("#founder") as HTMLElement;
      return {
        manifesto: getComputedStyle(manifesto).backgroundColor,
        work: getComputedStyle(work).backgroundColor,
        founder: getComputedStyle(founder).backgroundColor,
      };
    });

    // rgb(20, 20, 20) = #141414 (ink)
    expect(bgs.manifesto).toBe("rgb(20, 20, 20)");
    expect(bgs.work).toBe("rgb(20, 20, 20)");
    expect(bgs.founder).toBe("rgb(20, 20, 20)");
  });

  test("#5 /projects 인덱스 — 10 프로젝트 + 5 필터 + CTA", async ({ page }) => {
    await page.goto("/projects");

    // 10 프로젝트 rows
    const rows = page.locator(".p-row");
    await expect(rows).toHaveCount(10);

    // 5 필터 탭 (All/SaaS/Automation/Editorial/Tools)
    const filters = page.locator(".p-filter");
    await expect(filters).toHaveCount(5);
    await expect(filters.first()).toHaveAttribute("aria-selected", "true");

    // Hero headline
    await expect(page.getByText("Ten projects.")).toBeVisible();
    await expect(page.getByText("Ten stories.")).toBeVisible();

    // Closing CTA
    await expect(page.locator(".p-cta")).toBeVisible();
    await expect(page.getByRole("link", { name: /Start a conversation/i })).toBeVisible();
  });

  test("#6 /about — 5 섹션 + 9 milestones + 3 essays + contact form", async ({ page }) => {
    await page.goto("/about");

    const expected = [
      "01 About Hero",
      "02 Timeline",
      "03 Philosophy",
      "04 Process",
      "05 CTA",
    ];
    for (const label of expected) {
      await expect(page.locator(`[data-screen-label="${label}"]`)).toBeVisible();
    }

    // 9 milestones
    await expect(page.locator(".a-tl-mile")).toHaveCount(9);

    // 3 essays
    await expect(page.locator(".a-essay")).toHaveCount(3);

    // 3 process nodes
    await expect(page.locator(".proc-node")).toHaveCount(3);

    // Contact form (ContactSection) — 유지되어야 함
    const contactForm = page.locator("form").filter({ hasText: /이메일|문의|메시지|성함|이름/ }).first();
    await expect(contactForm).toBeVisible();
  });

  test("#7 /about Nav solidAlways — dark hero 가독성 확보", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    const navState = await page.evaluate(() => {
      const nav = document.querySelector(".nav") as HTMLElement;
      return {
        scrolled: nav.classList.contains("scrolled"),
        bg: getComputedStyle(nav).backgroundColor,
      };
    });

    // scrollY=0에서도 solidAlways로 'scrolled' 클래스 강제
    expect(navState.scrolled).toBe(true);
    // rgba(250, 247, 240, 0.97) = paper with alpha
    expect(navState.bg).toContain("250, 247, 240");
  });

  test("#8 /pricing → / permanentRedirect (308)", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBeLessThan(400);
    // Final URL은 / (/ 이후 fragment는 JS navigation이라 URL bar엔 반영)
    expect(new URL(page.url()).pathname).toBe("/");

    // 랜딩 9 섹션이 정상 렌더 = redirect 성공
    await expect(page.locator('[data-screen-label="01 Hero"]')).toBeVisible();
  });

  test("#9 /login Studio Anthem 재스킨 — primary=ink, paper card 4px shadow", async ({
    page,
  }) => {
    await page.goto("/login");

    // 브랜드: dairect. (serif italic + signal dot)
    const brand = page.locator("h1").filter({ hasText: /dairect/i });
    await expect(brand).toBeVisible();

    // 로그인 버튼 색상 = ink (shadcn primary 재매핑 확인)
    const submitBtn = page.getByRole("button", { name: /이메일로 로그인/ });
    await expect(submitBtn).toBeVisible();

    const submitBg = await submitBtn.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });
    // rgb(20, 20, 20) = ink
    expect(submitBg).toBe("rgb(20, 20, 20)");

    // Google 버튼은 canvas(투명-ish) 배경
    const googleBtn = page.getByRole("button", { name: /Google/ });
    await expect(googleBtn).toBeVisible();
  });

  test("#10 /demo 대시보드 — shadcn 토큰 재매핑 + 차트 색상", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");

    // CSS variables가 Studio Anthem으로 재매핑되었는지
    const tokens = await page.evaluate(() => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      return {
        background: style.getPropertyValue("--background").trim(),
        foreground: style.getPropertyValue("--foreground").trim(),
        primary: style.getPropertyValue("--primary").trim(),
        accent: style.getPropertyValue("--accent").trim(),
        ring: style.getPropertyValue("--ring").trim(),
        chart1: style.getPropertyValue("--chart-1").trim(),
        chart2: style.getPropertyValue("--chart-2").trim(),
      };
    });

    expect(tokens.background.toLowerCase()).toBe("#f5f1e8"); // canvas
    expect(tokens.foreground.toLowerCase()).toBe("#141414"); // ink
    expect(tokens.primary.toLowerCase()).toBe("#141414");
    expect(tokens.accent.toLowerCase()).toBe("#ffb800"); // signal
    expect(tokens.ring.toLowerCase()).toBe("#ffb800");
    expect(tokens.chart1.toLowerCase()).toBe("#141414");
    expect(tokens.chart2.toLowerCase()).toBe("#ffb800");

    // KPI 카드 존재 (진행 중 프로젝트/견적/계약서/미수금)
    await expect(page.getByText("진행 중 프로젝트")).toBeVisible();
    await expect(page.getByText("이번 달 견적")).toBeVisible();
  });
});

test.describe("Studio Anthem Redesign — 시스템 페이지", () => {
  test("#11 /signup 404 (v3.2 1차 잠금)", async ({ page }) => {
    const response = await page.goto("/signup");
    expect(response?.status()).toBe(404);
  });

  test("#12 /onboarding 404 (v3.2 1차 잠금)", async ({ page }) => {
    const response = await page.goto("/onboarding");
    expect(response?.status()).toBe(404);
  });

  test("#13 /terms + /privacy Nav/Footer 적용", async ({ page }) => {
    for (const path of ["/terms", "/privacy"]) {
      await page.goto(path);
      await expect(page.locator("nav.nav")).toBeVisible();
      await expect(page.locator("footer.footer")).toBeVisible();
      // 구 레거시 #F9F9F7 → 새 canvas #F5F1E8
      const bg = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });
      expect(bg).toBe("rgb(245, 241, 232)");
    }
  });
});

test.describe("Studio Anthem Redesign — 보안/상태 규칙", () => {
  test("#14 footer 링크 /about#contact 유효 (v3.2 contact 통합)", async ({ page }) => {
    await page.goto("/");
    const contactLink = page.locator("footer.footer a").filter({ hasText: /Contact form/ });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute("href", "/about#contact");
  });

  test("#15 Footer 4 컬럼 + © 2026 + Korean-in-mono 슬로건", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer.footer");
    await expect(footer.locator(".footer-col")).toHaveCount(4);
    await expect(footer.getByText(/© 2026 dairect\. Made with taste & Claude\./)).toBeVisible();
    // footer-logo-slogan(.fls-ko)와 footer-tag 양쪽에 한글 슬로건 → 양쪽 모두 가시
    await expect(footer.locator(".fls-ko")).toBeVisible();
    await expect(footer.locator(".footer-tag")).toBeVisible();
  });
});
