/**
 * Workspace Isolation E2E 시드 픽스처 (Phase 5 Task 5-1-8).
 *
 * 시나리오 대상: Epic 5-1 전환(single-tenant → multi-tenant SaaS)의 격리 검증.
 *
 * 구조:
 *   Workspace A (user_A owner) ──┐
 *     ├─ client / 2 projects / estimate(+ 1 item) / invoice / note / milestone
 *     └─ CROSS-FK milestone — workspaceId=A인데 projectId=B 참조 (H-4 시나리오)
 *   Workspace B (user_B owner) ──┤  ← 기본 대칭. cross-query로 누출 여부 검증.
 *     └─ client / 1 project / estimate(+ 1 item) / invoice / note / milestone
 *
 *   Multi-membership (H-1): user_A가 W_B에 `member` role로 추가 소속 →
 *   한 user가 여러 workspace 소속된 상태에서도 single-workspace scope 쿼리가
 *   선택된 workspace 데이터만 반환하는지 검증.
 *
 * 전략:
 *   - 고정 UUID(22222222- prefix, 마지막 segment는 순수 hex만) → RFC 4122 v4 형식 준수.
 *     portal 시드(11111111-)와 namespace 분리.
 *   - Drizzle postgres superuser 연결이므로 RLS 우회 → 이 시드가 검증하는 대상은
 *     "앱 레이어(workspace_scope helper + Server Action 쿼리 WHERE절)" 격리.
 *     RLS 자체(0021)는 anon role 별도 커넥션이 필요해 Task 5-1-9 범위.
 *   - seed는 cleanup 먼저 호출 (이전 실행 crash 흔적 멱등 정리).
 *
 * global-teardown.ts에서 cleanupWorkspaceFixtures()도 연결됨 (portal과 병렬).
 *
 * ⚠️ DATABASE_URL이 127.0.0.1/localhost가 아니면 globalSetup에서 throw → production 시드 차단.
 */
import { like, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  userSettings,
  clients,
  clientNotes,
  projects,
  milestones,
  estimates,
  estimateItems,
  invoices,
  workspaces,
  workspaceMembers,
} from "@/lib/db/schema";

// ─── Workspace A — "Alpha Agency" ───
// 마지막 segment는 12자 hex (0-9a-f만) — Postgres uuid cast 안전.
const WS_A_ID = "22222222-2222-4222-8222-aaaaaaaaaaaa";
const USER_A_ID = "22222222-2222-4222-8222-aaaa00000001";
const MEMBER_A_ID = "22222222-2222-4222-8222-aaaa00000002";
const CLIENT_A_ID = "22222222-2222-4222-8222-aaaa00000003";
const PROJECT_A_ID = "22222222-2222-4222-8222-aaaa00000004";
const MILESTONE_A_ID = "22222222-2222-4222-8222-aaaa00000005";
const ESTIMATE_A_ID = "22222222-2222-4222-8222-aaaa00000006";
const ESTIMATE_ITEM_A_ID = "22222222-2222-4222-8222-aaaa00000007";
const INVOICE_A_ID = "22222222-2222-4222-8222-aaaa00000008";
const NOTE_A_ID = "22222222-2222-4222-8222-aaaa00000009";

// H-2 aggregate 오염 검증용 — W_A의 두 번째 project (같은 client_A).
// sum(contractAmount) GROUP BY client 시 W_A만 모여야 함 (W_B project 금액 섞이면 누출).
const PROJECT_A2_ID = "22222222-2222-4222-8222-aaaa0000000a";

// H-4 cross-FK 검증용 — workspaceId=A 이면서 projectId=B (FK는 물리적 허용).
// W_A scope 조회 시 이 row가 포함 vs W_B scope 조회 시 포함 안 됨을 검증.
const CROSS_MILESTONE_A_ID = "22222222-2222-4222-8222-aaaa0000000b";

// ─── Workspace B — "Beta Studio" ───
const WS_B_ID = "22222222-2222-4222-8222-bbbbbbbbbbbb";
const USER_B_ID = "22222222-2222-4222-8222-bbbb00000001";
const MEMBER_B_ID = "22222222-2222-4222-8222-bbbb00000002";
const CLIENT_B_ID = "22222222-2222-4222-8222-bbbb00000003";
const PROJECT_B_ID = "22222222-2222-4222-8222-bbbb00000004";
const MILESTONE_B_ID = "22222222-2222-4222-8222-bbbb00000005";
const ESTIMATE_B_ID = "22222222-2222-4222-8222-bbbb00000006";
const ESTIMATE_ITEM_B_ID = "22222222-2222-4222-8222-bbbb00000007";
const INVOICE_B_ID = "22222222-2222-4222-8222-bbbb00000008";
const NOTE_B_ID = "22222222-2222-4222-8222-bbbb00000009";

// ─── H-1 Multi-membership ───
// user_A가 W_B에도 "member" role로 가입. schema.ts workspace_members_ws_user_unique는
// (workspaceId, userId) 조합 UNIQUE이므로 W_A/W_B 양쪽 가입은 서로 다른 row라 허용.
// Epic 5-2 workspace picker UI 핵심 시나리오 (user가 여러 workspace 소속).
const MEMBER_A_IN_B_ID = "22222222-2222-4222-8222-cccc00000001";

// 공유 번호(INV-2026-001) — 채번 독립성 시나리오 전용. Task 5-1-4 적용 전엔
// (user_id, invoice_number) UNIQUE라 user 다르면 충돌 없음. 적용 후엔
// (workspace_id, invoice_number)로 UNIQUE가 바뀌어도 workspace 다르면 여전히 공존.
const SHARED_INVOICE_NUMBER = "e2e_INV-2026-001";

export const E2E_WS_FIXTURE = {
  workspaceA: {
    id: WS_A_ID,
    name: "e2e_ws_alpha_agency",
    slug: "e2e-ws-isolation-alpha",
    userId: USER_A_ID,
    memberId: MEMBER_A_ID,
    clientId: CLIENT_A_ID,
    projectId: PROJECT_A_ID,
    project2Id: PROJECT_A2_ID,
    milestoneId: MILESTONE_A_ID,
    crossMilestoneId: CROSS_MILESTONE_A_ID,
    estimateId: ESTIMATE_A_ID,
    estimateItemId: ESTIMATE_ITEM_A_ID,
    invoiceId: INVOICE_A_ID,
    invoiceNumber: SHARED_INVOICE_NUMBER,
    noteId: NOTE_A_ID,
    projectAmount: 10_000_000,
    project2Amount: 7_000_000,
  },
  workspaceB: {
    id: WS_B_ID,
    name: "e2e_ws_beta_studio",
    slug: "e2e-ws-isolation-beta",
    userId: USER_B_ID,
    memberId: MEMBER_B_ID,
    clientId: CLIENT_B_ID,
    projectId: PROJECT_B_ID,
    milestoneId: MILESTONE_B_ID,
    estimateId: ESTIMATE_B_ID,
    estimateItemId: ESTIMATE_ITEM_B_ID,
    invoiceId: INVOICE_B_ID,
    invoiceNumber: SHARED_INVOICE_NUMBER,
    noteId: NOTE_B_ID,
    projectAmount: 5_000_000,
  },
  multiMembership: {
    memberRowId: MEMBER_A_IN_B_ID,
    userId: USER_A_ID,
    workspaceId: WS_B_ID,
    role: "member" as const,
  },
} as const;

export async function seedWorkspaceFixtures(): Promise<void> {
  await cleanupWorkspaceFixtures();

  // 1. workspaces (FK target)
  await db.insert(workspaces).values([
    { id: WS_A_ID, name: E2E_WS_FIXTURE.workspaceA.name, slug: E2E_WS_FIXTURE.workspaceA.slug },
    { id: WS_B_ID, name: E2E_WS_FIXTURE.workspaceB.name, slug: E2E_WS_FIXTURE.workspaceB.slug },
  ]);

  // 2. users — users_not_demo_uuid check 통과 (0... UUID 아님)
  await db.insert(users).values([
    { id: USER_A_ID, email: "e2e-ws-isolation-a@dairect.local", name: "E2E Alpha Owner" },
    { id: USER_B_ID, email: "e2e-ws-isolation-b@dairect.local", name: "E2E Beta Owner" },
  ]);

  // 3. user_settings — invoice 채번 prefix 조회 의존성
  await db.insert(userSettings).values([
    { userId: USER_A_ID, companyName: "e2e_alpha_company", invoiceNumberPrefix: "e2e_INV" },
    { userId: USER_B_ID, companyName: "e2e_beta_company", invoiceNumberPrefix: "e2e_INV" },
  ]);

  // 4. workspace_members — owner + H-1 multi-membership
  await db.insert(workspaceMembers).values([
    { id: MEMBER_A_ID, workspaceId: WS_A_ID, userId: USER_A_ID, role: "owner" },
    { id: MEMBER_B_ID, workspaceId: WS_B_ID, userId: USER_B_ID, role: "owner" },
    // H-1: user_A가 W_B에도 member role로 소속. joined_at은 W_A 가입보다 후순위.
    { id: MEMBER_A_IN_B_ID, workspaceId: WS_B_ID, userId: USER_A_ID, role: "member" },
  ]);

  // 5. clients
  await db.insert(clients).values([
    {
      id: CLIENT_A_ID,
      userId: USER_A_ID,
      workspaceId: WS_A_ID,
      companyName: "e2e_client_alpha_corp",
      contactName: "알파담당자",
    },
    {
      id: CLIENT_B_ID,
      userId: USER_B_ID,
      workspaceId: WS_B_ID,
      companyName: "e2e_client_beta_corp",
      contactName: "베타담당자",
    },
  ]);

  // 6. projects — W_A는 2개 (aggregate 시나리오용), W_B는 1개
  await db.insert(projects).values([
    {
      id: PROJECT_A_ID,
      userId: USER_A_ID,
      workspaceId: WS_A_ID,
      clientId: CLIENT_A_ID,
      name: "e2e_project_alpha_1",
      status: "in_progress",
      contractAmount: E2E_WS_FIXTURE.workspaceA.projectAmount,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
    },
    {
      id: PROJECT_A2_ID,
      userId: USER_A_ID,
      workspaceId: WS_A_ID,
      clientId: CLIENT_A_ID,
      name: "e2e_project_alpha_2",
      status: "in_progress",
      contractAmount: E2E_WS_FIXTURE.workspaceA.project2Amount,
      startDate: "2026-03-01",
      endDate: "2026-08-31",
    },
    {
      id: PROJECT_B_ID,
      userId: USER_B_ID,
      workspaceId: WS_B_ID,
      clientId: CLIENT_B_ID,
      name: "e2e_project_beta",
      status: "in_progress",
      contractAmount: E2E_WS_FIXTURE.workspaceB.projectAmount,
      startDate: "2026-02-01",
      endDate: "2026-05-31",
    },
  ]);

  // 7. milestones — 정상 + H-4 cross-FK
  await db.insert(milestones).values([
    {
      id: MILESTONE_A_ID,
      projectId: PROJECT_A_ID,
      workspaceId: WS_A_ID,
      title: "e2e_milestone_alpha",
      isCompleted: false,
      sortOrder: 1,
    },
    {
      id: MILESTONE_B_ID,
      projectId: PROJECT_B_ID,
      workspaceId: WS_B_ID,
      title: "e2e_milestone_beta",
      isCompleted: false,
      sortOrder: 1,
    },
    // H-4: workspaceId=A 이면서 projectId=B의 project 참조. FK만 통과하는 cross-workspace row.
    // 공격 시나리오: A admin이 B의 project id를 추측해 milestone을 강제 생성. W_A scope로 조회 시
    // 이 row가 A workspace 결과에 포함됨 (workspace_scope는 workspace_id 컬럼만 본다).
    //
    // Invariant 검증: B workspace scope 쿼리는 이 cross-FK row를 반환하지 않는다
    // (workspace_id=A이므로 B scope WHERE와 불일치).
    {
      id: CROSS_MILESTONE_A_ID,
      projectId: PROJECT_B_ID,
      workspaceId: WS_A_ID,
      title: "e2e_cross_milestone_in_a_refs_b",
      isCompleted: false,
      sortOrder: 99,
    },
  ]);

  // 8. client_notes
  await db.insert(clientNotes).values([
    { id: NOTE_A_ID, clientId: CLIENT_A_ID, userId: USER_A_ID, workspaceId: WS_A_ID, content: "e2e_note_alpha_content" },
    { id: NOTE_B_ID, clientId: CLIENT_B_ID, userId: USER_B_ID, workspaceId: WS_B_ID, content: "e2e_note_beta_content" },
  ]);

  // 9. estimates + items
  await db.insert(estimates).values([
    {
      id: ESTIMATE_A_ID,
      userId: USER_A_ID,
      workspaceId: WS_A_ID,
      projectId: PROJECT_A_ID,
      clientId: CLIENT_A_ID,
      estimateNumber: "e2e_EST-2026-001",
      title: "e2e_estimate_alpha_title",
      status: "draft",
    },
    {
      id: ESTIMATE_B_ID,
      userId: USER_B_ID,
      workspaceId: WS_B_ID,
      projectId: PROJECT_B_ID,
      clientId: CLIENT_B_ID,
      estimateNumber: "e2e_EST-2026-001",
      title: "e2e_estimate_beta_title",
      status: "draft",
    },
  ]);

  await db.insert(estimateItems).values([
    {
      id: ESTIMATE_ITEM_A_ID,
      estimateId: ESTIMATE_A_ID,
      workspaceId: WS_A_ID,
      name: "e2e_estimate_item_alpha",
      unitPrice: 1_000_000,
      quantity: 1,
      subtotal: 1_000_000,
    },
    {
      id: ESTIMATE_ITEM_B_ID,
      estimateId: ESTIMATE_B_ID,
      workspaceId: WS_B_ID,
      name: "e2e_estimate_item_beta",
      unitPrice: 500_000,
      quantity: 1,
      subtotal: 500_000,
    },
  ]);

  // 10. invoices — 동일 invoice_number로 채번 독립성 검증
  await db.insert(invoices).values([
    {
      id: INVOICE_A_ID,
      userId: USER_A_ID,
      workspaceId: WS_A_ID,
      projectId: PROJECT_A_ID,
      invoiceNumber: SHARED_INVOICE_NUMBER,
      type: "advance",
      status: "paid",
      amount: 3_000_000,
      taxAmount: 300_000,
      totalAmount: 3_300_000,
      issuedDate: "2026-01-15",
      paidDate: "2026-01-20",
    },
    {
      id: INVOICE_B_ID,
      userId: USER_B_ID,
      workspaceId: WS_B_ID,
      projectId: PROJECT_B_ID,
      invoiceNumber: SHARED_INVOICE_NUMBER,
      type: "advance",
      status: "paid",
      amount: 1_500_000,
      taxAmount: 150_000,
      totalAmount: 1_650_000,
      issuedDate: "2026-02-15",
      paidDate: "2026-02-20",
    },
  ]);
}

export async function cleanupWorkspaceFixtures(): Promise<void> {
  const wsIds = [WS_A_ID, WS_B_ID];
  const userIds = [USER_A_ID, USER_B_ID];
  const projectIds = [PROJECT_A_ID, PROJECT_A2_ID, PROJECT_B_ID];
  const milestoneIds = [MILESTONE_A_ID, MILESTONE_B_ID, CROSS_MILESTONE_A_ID];
  const memberIds = [MEMBER_A_ID, MEMBER_B_ID, MEMBER_A_IN_B_ID];

  // FK 역순 — 자식부터 삭제 (RESTRICT 충돌 회피).
  // 1차: 고정 ID 직접 삭제 (정확성).
  await db.delete(invoices).where(inArray(invoices.id, [INVOICE_A_ID, INVOICE_B_ID]));
  await db.delete(estimateItems).where(inArray(estimateItems.id, [ESTIMATE_ITEM_A_ID, ESTIMATE_ITEM_B_ID]));
  await db.delete(estimates).where(inArray(estimates.id, [ESTIMATE_A_ID, ESTIMATE_B_ID]));
  await db.delete(milestones).where(inArray(milestones.id, milestoneIds));
  await db.delete(clientNotes).where(inArray(clientNotes.id, [NOTE_A_ID, NOTE_B_ID]));
  await db.delete(projects).where(inArray(projects.id, projectIds));
  await db.delete(clients).where(inArray(clients.id, [CLIENT_A_ID, CLIENT_B_ID]));
  await db.delete(workspaceMembers).where(inArray(workspaceMembers.id, memberIds));
  await db.delete(userSettings).where(inArray(userSettings.userId, userIds));
  await db.delete(users).where(inArray(users.id, userIds));
  await db.delete(workspaces).where(inArray(workspaces.id, wsIds));

  // 2차 안전망 — 이전 실행이 부분 실패 시 workspace/user 기반 잔류물 제거.
  await db.delete(workspaceMembers).where(inArray(workspaceMembers.workspaceId, wsIds));
  await db.delete(workspaceMembers).where(inArray(workspaceMembers.userId, userIds));
  await db.delete(invoices).where(inArray(invoices.userId, userIds));
  await db.delete(estimateItems).where(like(estimateItems.name, "e2e_estimate_item_%"));
  await db.delete(estimates).where(inArray(estimates.userId, userIds));
  await db.delete(milestones).where(like(milestones.title, "e2e_%milestone_%"));
  await db.delete(milestones).where(like(milestones.title, "e2e_cross_milestone_%"));
  await db.delete(clientNotes).where(inArray(clientNotes.userId, userIds));
  await db.delete(projects).where(inArray(projects.userId, userIds));
  await db.delete(clients).where(inArray(clients.userId, userIds));
  await db.delete(userSettings).where(inArray(userSettings.userId, userIds));
  await db.delete(users).where(inArray(users.id, userIds));
  await db.delete(workspaces).where(inArray(workspaces.id, wsIds));

  // 3차 안전망 — e2e-ws-isolation- prefix workspace + 이메일 (M-1 반영: 범용 "e2e-ws-"보다
  // 구체적 prefix로 사용자 데이터 침범 risk 축소).
  await db.delete(workspaces).where(like(workspaces.slug, "e2e-ws-isolation-%"));
  await db.delete(users).where(like(users.email, "e2e-ws-isolation-%"));
}
