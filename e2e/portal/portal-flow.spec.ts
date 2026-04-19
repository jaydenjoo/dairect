/**
 * Portal E2E 스모크 (Task 4-2 M8) — 7 시나리오.
 *
 * 검증 범위:
 *   #1 Happy path        — 활성 토큰 → 콘텐츠(프로젝트/클라/PM/마일스톤/인보이스/피드백 폼) 렌더
 *   #2 URL 마스킹        — PortalUrlScrub로 토큰이 주소창에서 사라짐
 *   #3 메타 태그         — robots noindex/nofollow/nocache + referrer no-referrer
 *   #4 피드백 정상 제출  — 3초 대기 후 제출 → DB row 1건
 *   #5 Honeypot 차단     — hidden `website` 채우면 success 위장 + DB row 0
 *   #6 Timing 차단       — 3초 미만 제출 → success 위장 + DB row 0
 *   #7 만료/Revoked 토큰 → /portal/invalid redirect
 *
 * 보안 회귀 방어 의도:
 *   - 모든 실패 경로(만료/honeypot/timing)가 사용자에게는 동일한 "성공 위장" UI 응답
 *   - DB row 카운트로 실제 INSERT 여부 분리 검증 (timing oracle 우회 차단)
 */
import { eq } from "drizzle-orm";
import { test, expect } from "@playwright/test";
import { db } from "@/lib/db";
import { portalFeedbacks } from "@/lib/db/schema";
import {
  E2E_FIXTURE,
  cleanupPortalFixtures,
  countPortalFeedbacks,
  seedPortalFixtures,
} from "../fixtures/seed-portal";

// PRODUCTION 모드(E2E_BASE_URL 설정)에서는 시드 데이터가 라이브 DB에 없으므로 모든 시나리오 skip.
// production smoke는 e2e/smoke/production-smoke.spec.ts에서 read-only로 별도 진행.
test.skip(
  !!process.env.E2E_BASE_URL,
  "E2E_BASE_URL 설정됨 — portal-flow는 LOCAL 시드 의존이라 production에서 skip",
);

test.describe("Portal E2E (Task 4-2 M8) — 비로그인 고객 시나리오", () => {
  test.beforeAll(async () => {
    await seedPortalFixtures();
  });

  test.afterAll(async () => {
    await cleanupPortalFixtures();
  });

  test.afterEach(async () => {
    // 시나리오 간 격리 — 피드백 row만 비워 다음 테스트 카운트 정확성 확보.
    // 토큰/프로젝트/클라이언트는 유지 (다음 시나리오 베이스 데이터).
    await db
      .delete(portalFeedbacks)
      .where(eq(portalFeedbacks.projectId, E2E_FIXTURE.projectId));
  });

  test("#1 Happy path — 활성 토큰으로 프로젝트 콘텐츠 렌더링", async ({ page }) => {
    await page.goto(`/portal/${E2E_FIXTURE.tokens.active}`);

    // 페이지 타이틀은 generic ("고객 포털") — 프로젝트명 인덱싱 방지 정책
    await expect(page).toHaveTitle(/고객 포털/);

    // 본문에는 실제 프로젝트/관계자 정보가 노출
    await expect(page.getByText(E2E_FIXTURE.projectName)).toBeVisible();
    await expect(page.getByText(E2E_FIXTURE.clientCompanyName)).toBeVisible();
    await expect(page.getByText(E2E_FIXTURE.pmCompanyName)).toBeVisible();

    // 마일스톤 3종
    await expect(page.getByText("기획 완료")).toBeVisible();
    await expect(page.getByText("디자인 진행 중")).toBeVisible();
    await expect(page.getByText("개발 대기")).toBeVisible();

    // 인보이스 번호 (paid)
    await expect(page.getByText("e2e_INV-2026-001")).toBeVisible();

    // 피드백 폼 섹션
    await expect(
      page.getByRole("heading", { name: "의견 남기기" }),
    ).toBeVisible();
    await expect(page.getByLabel("피드백 내용")).toBeVisible();
  });

  test("#2 URL 마스킹 — PortalUrlScrub가 토큰을 /portal/active로 교체", async ({
    page,
  }) => {
    await page.goto(`/portal/${E2E_FIXTURE.tokens.active}`);

    // PortalUrlScrub은 client mount 후 history.replaceState 실행 — 약간의 지연 허용
    await expect(page).toHaveURL(/\/portal\/active$/, { timeout: 5_000 });

    // 어떤 형태로도 토큰이 URL에 잔류하지 않음
    expect(page.url()).not.toContain(E2E_FIXTURE.tokens.active);
  });

  test("#3 메타 태그 — robots noindex + referrer no-referrer", async ({ page }) => {
    await page.goto(`/portal/${E2E_FIXTURE.tokens.active}`);

    const robots = await page
      .locator('meta[name="robots"]')
      .first()
      .getAttribute("content");
    expect(robots).toBeTruthy();
    expect(robots!.toLowerCase()).toContain("noindex");
    expect(robots!.toLowerCase()).toContain("nofollow");
    expect(robots!.toLowerCase()).toContain("nocache");

    const referrer = await page
      .locator('meta[name="referrer"]')
      .first()
      .getAttribute("content");
    expect(referrer).toBe("no-referrer");
  });

  test("#4 피드백 정상 제출 — 3초 대기 후 → DB row 1건 + 성공 UI", async ({
    page,
  }) => {
    await page.goto(`/portal/${E2E_FIXTURE.tokens.active}`);

    // 3초 timing guard 충족 — FEEDBACK_MIN_SUBMIT_MS=3000 + 여유분
    await page.waitForTimeout(3500);

    const message = "e2e_test_4_정상_피드백_시나리오_입력_본문";
    await page.getByLabel("피드백 내용").fill(message);
    await page.getByRole("button", { name: /의견 보내기/ }).click();

    await expect(page.getByText("의견이 전달되었어요")).toBeVisible({
      timeout: 5_000,
    });

    const count = await countPortalFeedbacks(E2E_FIXTURE.projectId);
    expect(count).toBe(1);
  });

  test("#5 Honeypot 차단 — hidden `website` 채우면 success 위장 + DB row 0", async ({
    page,
  }) => {
    await page.goto(`/portal/${E2E_FIXTURE.tokens.active}`);
    await page.waitForTimeout(3500);

    // honeypot은 off-screen positioning(opacity 0) — Playwright fill에 force 필요
    await page
      .locator('input[name="website"]')
      .fill("http://bot.example.com", { force: true });
    await page
      .getByLabel("피드백 내용")
      .fill("e2e_test_5_봇_시나리오_honeypot_채움");
    await page.getByRole("button", { name: /의견 보내기/ }).click();

    // 사용자 시각: 정상 제출처럼 보임 (timing oracle 방어)
    await expect(page.getByText("의견이 전달되었어요")).toBeVisible({
      timeout: 5_000,
    });

    // DB 진입은 차단됨
    const count = await countPortalFeedbacks(E2E_FIXTURE.projectId);
    expect(count).toBe(0);
  });

  test("#6 Timing 차단 — 3초 미만 제출 → success 위장 + DB row 0", async ({
    page,
  }) => {
    // 페이지 mount 시점 Date.now()를 미래로 강제 — startedAt이 future값이 되어
    // server 측 elapsed = serverNow - futureStartedAt 이 음수가 되고 FEEDBACK_MIN_SUBMIT_MS(3000)
    // 미만으로 drop. dev 첫 컴파일 지연/네트워크 변동이 우연히 3초를 넘겨 timing guard를 통과시키는
    // false negative 회귀를 결정론적으로 막기 위한 명시적 시간 조작.
    await page.addInitScript(() => {
      const offset = 60_000;
      const realNow = Date.now.bind(Date);
      Date.now = () => realNow() + offset;
    });

    await page.goto(`/portal/${E2E_FIXTURE.tokens.active}`);

    await page
      .getByLabel("피드백 내용")
      .fill("e2e_test_6_타이밍_방어_시나리오");
    await page.getByRole("button", { name: /의견 보내기/ }).click();

    await expect(page.getByText("의견이 전달되었어요")).toBeVisible({
      timeout: 5_000,
    });

    const count = await countPortalFeedbacks(E2E_FIXTURE.projectId);
    expect(count).toBe(0);
  });

  test("#7 만료/Revoked 토큰 — 둘 다 /portal/invalid로 redirect", async ({
    page,
  }) => {
    // 만료 토큰
    await page.goto(`/portal/${E2E_FIXTURE.tokens.expired}`);
    await expect(page).toHaveURL(/\/portal\/invalid$/);
    await expect(
      page.getByText(/링크가 만료되었거나 유효하지 않아요/),
    ).toBeVisible();

    // Revoked 토큰
    await page.goto(`/portal/${E2E_FIXTURE.tokens.revoked}`);
    await expect(page).toHaveURL(/\/portal\/invalid$/);
    await expect(
      page.getByText(/링크가 만료되었거나 유효하지 않아요/),
    ).toBeVisible();
  });
});
