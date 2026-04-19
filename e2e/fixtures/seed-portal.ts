/**
 * Portal E2E DB 시드 픽스처.
 *
 * 전략 (B-2):
 * - production Supabase에 `e2e_*` prefix 레코드 시드 + cleanup 보장.
 * - PM 측 인증은 우회: portal_tokens.token을 직접 INSERT → 비로그인 고객 시각만 검증.
 * - 모든 row의 식별자는 고정 UUID(또는 e2e_ prefix string)로 cleanup 정확성 확보.
 * - global setup/teardown에서 호출 (playwright.config.ts globalSetup hook).
 *
 * ⚠️ DATABASE_URL 환경변수 필요. .env.local의 production Supabase 사용.
 *    실패 시 prefix 잔류 위험 → cleanup은 항상 try-finally 또는 globalTeardown에서 호출.
 */
import { eq, like, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  userSettings,
  clients,
  projects,
  milestones,
  invoices,
  portalTokens,
  portalFeedbacks,
} from "@/lib/db/schema";

// 고정 UUID — 한번에 cleanup 가능. e2e 격리용 별도 namespace (실 사용자 영역 침입 차단).
// schema.ts users_not_demo_uuid check (DEMO 0...0)와 다른 UUID 사용 (충돌 회피).
const E2E_USER_ID = "11111111-1111-4111-8111-e2e000000001";
const E2E_CLIENT_ID = "11111111-1111-4111-8111-e2e000000002";
const E2E_PROJECT_ID = "11111111-1111-4111-8111-e2e000000003";

// 활성 / 만료 / revoked 토큰 — 시나리오 #7에서 invalid 분기 검증.
const E2E_TOKEN_ACTIVE = "11111111-1111-4111-8111-e2e0000a0001";
const E2E_TOKEN_EXPIRED = "11111111-1111-4111-8111-e2e0000a0002";
const E2E_TOKEN_REVOKED = "11111111-1111-4111-8111-e2e0000a0003";

// 토큰 row id (활성/만료/revoked 각각). DB cleanup + 시나리오에서 직접 참조.
const E2E_TOKEN_ROW_ACTIVE_ID = "11111111-1111-4111-8111-e2e000bb0001";
const E2E_TOKEN_ROW_EXPIRED_ID = "11111111-1111-4111-8111-e2e000bb0002";
const E2E_TOKEN_ROW_REVOKED_ID = "11111111-1111-4111-8111-e2e000bb0003";

const E2E_INVOICE_ID = "11111111-1111-4111-8111-e2e000cc0001";
const E2E_MILESTONE_DONE_ID = "11111111-1111-4111-8111-e2e000dd0001";
const E2E_MILESTONE_PROGRESS_ID = "11111111-1111-4111-8111-e2e000dd0002";
const E2E_MILESTONE_PENDING_ID = "11111111-1111-4111-8111-e2e000dd0003";

export const E2E_FIXTURE = {
  userId: E2E_USER_ID,
  clientId: E2E_CLIENT_ID,
  projectId: E2E_PROJECT_ID,
  projectName: "e2e_test_project_dairect_portal",
  clientCompanyName: "e2e_test_client_company",
  clientContactName: "이고객",
  pmCompanyName: "e2e_test_pm_company",
  pmRepresentativeName: "박매니저",
  pmBusinessEmail: "e2e-test-pm@example.com",
  tokens: {
    active: E2E_TOKEN_ACTIVE,
    expired: E2E_TOKEN_EXPIRED,
    revoked: E2E_TOKEN_REVOKED,
  },
  tokenRowIds: {
    active: E2E_TOKEN_ROW_ACTIVE_ID,
    expired: E2E_TOKEN_ROW_EXPIRED_ID,
    revoked: E2E_TOKEN_ROW_REVOKED_ID,
  },
} as const;

export async function seedPortalFixtures(): Promise<void> {
  // cleanup 먼저 — 이전 실행이 중간에 죽었어도 안전하게 재시드.
  await cleanupPortalFixtures();

  const now = new Date();
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  await db.insert(users).values({
    id: E2E_USER_ID,
    email: "e2e-test-user@dairect.local",
    name: "E2E Test PM",
  });

  await db.insert(userSettings).values({
    userId: E2E_USER_ID,
    companyName: E2E_FIXTURE.pmCompanyName,
    representativeName: E2E_FIXTURE.pmRepresentativeName,
    businessEmail: E2E_FIXTURE.pmBusinessEmail,
  });

  await db.insert(clients).values({
    id: E2E_CLIENT_ID,
    userId: E2E_USER_ID,
    companyName: E2E_FIXTURE.clientCompanyName,
    contactName: E2E_FIXTURE.clientContactName,
  });

  await db.insert(projects).values({
    id: E2E_PROJECT_ID,
    userId: E2E_USER_ID,
    clientId: E2E_CLIENT_ID,
    name: E2E_FIXTURE.projectName,
    status: "in_progress",
    contractAmount: 10_000_000,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
  });

  // 마일스톤 3개 (1 완료 + 1 진행중 + 1 대기) → 진행률 ~33%
  await db.insert(milestones).values([
    {
      id: E2E_MILESTONE_DONE_ID,
      projectId: E2E_PROJECT_ID,
      title: "기획 완료",
      isCompleted: true,
      completedAt: oneHourAgo,
      sortOrder: 1,
    },
    {
      id: E2E_MILESTONE_PROGRESS_ID,
      projectId: E2E_PROJECT_ID,
      title: "디자인 진행 중",
      isCompleted: false,
      sortOrder: 2,
    },
    {
      id: E2E_MILESTONE_PENDING_ID,
      projectId: E2E_PROJECT_ID,
      title: "개발 대기",
      isCompleted: false,
      sortOrder: 3,
    },
  ]);

  // 인보이스 1건 (paid)
  await db.insert(invoices).values({
    id: E2E_INVOICE_ID,
    userId: E2E_USER_ID,
    projectId: E2E_PROJECT_ID,
    invoiceNumber: "e2e_INV-2026-001",
    type: "advance",
    status: "paid",
    amount: 3_000_000,
    taxAmount: 300_000,
    totalAmount: 3_300_000,
    issuedDate: "2026-01-15",
    paidDate: "2026-01-20",
  });

  // 토큰 3종 — 활성 / 만료 / revoked
  await db.insert(portalTokens).values([
    {
      id: E2E_TOKEN_ROW_ACTIVE_ID,
      projectId: E2E_PROJECT_ID,
      token: E2E_TOKEN_ACTIVE,
      issuedBy: E2E_USER_ID,
      issuedAt: now,
      expiresAt: oneYearLater,
    },
    {
      id: E2E_TOKEN_ROW_EXPIRED_ID,
      projectId: E2E_PROJECT_ID,
      token: E2E_TOKEN_EXPIRED,
      issuedBy: E2E_USER_ID,
      issuedAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1일 전 만료
      // partial unique index `revokedAt IS NULL` 회피 위해 revokedAt 마킹 (만료 + revoked)
      revokedAt: oneHourAgo,
    },
    {
      id: E2E_TOKEN_ROW_REVOKED_ID,
      projectId: E2E_PROJECT_ID,
      token: E2E_TOKEN_REVOKED,
      issuedBy: E2E_USER_ID,
      issuedAt: oneHourAgo,
      expiresAt: oneYearLater,
      revokedAt: oneHourAgo,
    },
  ]);
}

export async function cleanupPortalFixtures(): Promise<void> {
  // 1차: 고정 ID 기반 직접 삭제 — FK 역순(feedbacks → tokens → invoices → milestones → projects → clients → user_settings → users)
  await db.delete(portalFeedbacks).where(eq(portalFeedbacks.projectId, E2E_PROJECT_ID));
  await db.delete(portalTokens).where(eq(portalTokens.projectId, E2E_PROJECT_ID));
  await db.delete(invoices).where(eq(invoices.projectId, E2E_PROJECT_ID));
  await db.delete(milestones).where(eq(milestones.projectId, E2E_PROJECT_ID));
  await db.delete(projects).where(eq(projects.id, E2E_PROJECT_ID));
  await db.delete(clients).where(eq(clients.id, E2E_CLIENT_ID));
  await db.delete(userSettings).where(eq(userSettings.userId, E2E_USER_ID));
  await db.delete(users).where(eq(users.id, E2E_USER_ID));

  // 2차 안전망 — E2E_USER_ID로 발급된 모든 토큰/인보이스/프로젝트 일괄 삭제.
  // 1차 cleanup이 부분 실패한 경우(connection drop / FK constraint race)에도
  // E2E_USER_ID 소유 row가 잔류하지 않도록 보장. portalTokens는 토큰 자체가 hex라
  // prefix 매칭이 불가하므로 issuedBy 기반이 유일한 안전망.
  await db.delete(portalTokens).where(eq(portalTokens.issuedBy, E2E_USER_ID));
  await db.delete(invoices).where(eq(invoices.userId, E2E_USER_ID));
  await db
    .delete(projects)
    .where(
      and(eq(projects.userId, E2E_USER_ID), like(projects.name, "e2e_test_%")),
    );

  // 3차 안전망 — 다른 e2e_test_* prefix 잔존 피드백(예: 다른 환경에서 시드된 row)
  await db
    .delete(portalFeedbacks)
    .where(like(portalFeedbacks.message, "e2e_test_%"));
}

export async function countPortalFeedbacks(projectId: string): Promise<number> {
  const rows = await db
    .select({ id: portalFeedbacks.id })
    .from(portalFeedbacks)
    .where(eq(portalFeedbacks.projectId, projectId));
  return rows.length;
}
