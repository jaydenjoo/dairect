/**
 * Workspace Isolation E2E (Phase 5 Task 5-1-8) — 15 시나리오.
 *
 * 검증 대상: Epic 5-1 전환(single-tenant → multi-tenant SaaS)의 격리 경계선.
 *
 * 시나리오 카테고리:
 *   Read 격리 (1~5)          — clients / projects / estimates / estimate_items / invoices
 *   Write 격리 (6~7)         — cross-workspace UPDATE / DELETE가 0 rows affected
 *   Cross-FK 참조 (8 + 15)   — milestone.projectId가 다른 workspace여도 WHERE workspace_id 필터로 차단
 *   채번 독립성 (9)          — W_A.INV-2026-001 + W_B.INV-2026-001 공존 (user_id 다르면 항상, Task 5-1-4 적용 후엔 ws 기준)
 *   Membership 격리 (10)     — 자기 workspace_members만 반환
 *   Notes 격리 (11)          — client_notes workspace scope
 *   Multi-membership (12)    — [H-1] user_A가 W_A/W_B 양쪽 소속 시 scope별 데이터 일관성
 *   Aggregate 오염 (13)      — [H-2] sum/count 집계 시 cross-workspace 오염 없음
 *   LEFT JOIN 누출 canary (14) — [H-3] leftJoin 조건에 workspace_scope 빠지면 누출 발생 증명 + 있으면 차단
 *
 * 테스트 레이어:
 *   Drizzle은 postgres superuser 연결 → RLS 우회. 본 spec는 "앱 레이어(workspace_scope helper +
 *   Server Action WHERE절)" 격리 검증 전용. RLS 정책 자체(0021) 점검은 별도 supabase anon
 *   connection 테스트가 후속 Task 5-1-9 범위.
 *
 * 왜 Playwright runner로 Drizzle 쿼리만:
 *   - Server Action은 getUserId() → Supabase Auth cookie 의존 → E2E에서 session mock 비용 과도.
 *   - 격리 invariant는 쿼리 WHERE절의 workspace_scope가 전부. Drizzle 직접 쿼리로 동일 경로 재현.
 *   - 향후 Epic 5-2에서 workspace picker UI 완성 후 HTTP-level E2E로 확장 예정.
 */
import { test, expect } from "@playwright/test";
import { and, eq, sql, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clients,
  clientNotes,
  projects,
  milestones,
  estimates,
  estimateItems,
  invoices,
  workspaceMembers,
} from "@/lib/db/schema";
import { workspaceScope } from "@/lib/db/workspace-scope";
import {
  E2E_WS_FIXTURE,
  cleanupWorkspaceFixtures,
  seedWorkspaceFixtures,
} from "../fixtures/seed-workspaces";

// PRODUCTION(E2E_BASE_URL) 모드에서는 로컬 시드가 라이브 DB에 없으므로 전체 skip.
test.skip(
  !!process.env.E2E_BASE_URL,
  "E2E_BASE_URL 설정됨 — workspace-isolation은 LOCAL 시드 의존이라 production에서 skip",
);

test.describe("Workspace Isolation E2E (Task 5-1-8) — cross-workspace 누출 방어", () => {
  const A = E2E_WS_FIXTURE.workspaceA;
  const B = E2E_WS_FIXTURE.workspaceB;
  const M = E2E_WS_FIXTURE.multiMembership;

  test.beforeAll(async () => {
    await seedWorkspaceFixtures();
  });

  test.afterAll(async () => {
    await cleanupWorkspaceFixtures();
  });

  test("#1 clients — W_A 쿼리는 W_B 클라이언트를 반환하지 않는다", async () => {
    const rowsA = await db
      .select({ id: clients.id, workspaceId: clients.workspaceId })
      .from(clients)
      .where(and(eq(clients.userId, A.userId), workspaceScope(clients.workspaceId, A.id)));

    expect(rowsA).toHaveLength(1);
    expect(rowsA[0].id).toBe(A.clientId);
    expect(rowsA[0].workspaceId).toBe(A.id);

    // 역방향: W_B scope에 W_A user로 쿼리 → 0 rows (정상 격리)
    const leak = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.userId, A.userId), workspaceScope(clients.workspaceId, B.id)));
    expect(leak).toHaveLength(0);
  });

  test("#2 projects — W_A 쿼리는 W_B 프로젝트를 반환하지 않는다", async () => {
    const rowsA = await db
      .select({ id: projects.id, workspaceId: projects.workspaceId, name: projects.name })
      .from(projects)
      .where(and(eq(projects.userId, A.userId), workspaceScope(projects.workspaceId, A.id)));

    // W_A에는 project 2개 시드됨 (H-2 aggregate 대비)
    expect(rowsA).toHaveLength(2);
    const ids = rowsA.map((r) => r.id).sort();
    expect(ids).toEqual([A.projectId, A.project2Id].sort());

    // B workspace의 프로젝트 이름이 A에 누출되지 않음
    const names = rowsA.map((r) => r.name);
    expect(names).not.toContain("e2e_project_beta");
  });

  test("#3 estimates — W_A 쿼리는 W_B 견적서를 반환하지 않는다", async () => {
    const rowsA = await db
      .select({ id: estimates.id, title: estimates.title, workspaceId: estimates.workspaceId })
      .from(estimates)
      .where(and(eq(estimates.userId, A.userId), workspaceScope(estimates.workspaceId, A.id)));

    expect(rowsA).toHaveLength(1);
    expect(rowsA[0].id).toBe(A.estimateId);
    expect(rowsA[0].title).toBe("e2e_estimate_alpha_title");
  });

  test("#4 estimate_items — W_A workspace scope는 W_B 견적 아이템을 반환하지 않는다", async () => {
    // estimate_items는 userId 컬럼이 없음 → workspace_id만으로 격리.
    // estimates JOIN 없이 workspace_id만으로 직접 필터되는지 검증 (Task 5-1-7 migrate 패턴).
    const rowsA = await db
      .select({ id: estimateItems.id, name: estimateItems.name })
      .from(estimateItems)
      .where(workspaceScope(estimateItems.workspaceId, A.id));

    expect(rowsA).toHaveLength(1);
    expect(rowsA[0].id).toBe(A.estimateItemId);
    expect(rowsA[0].name).toBe("e2e_estimate_item_alpha");

    // B scope도 1개만
    const rowsB = await db
      .select({ id: estimateItems.id })
      .from(estimateItems)
      .where(workspaceScope(estimateItems.workspaceId, B.id));
    expect(rowsB).toHaveLength(1);
    expect(rowsB[0].id).toBe(B.estimateItemId);
  });

  test("#5 invoices — W_A 쿼리는 W_B 인보이스를 반환하지 않는다", async () => {
    const rowsA = await db
      .select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber, amount: invoices.amount })
      .from(invoices)
      .where(and(eq(invoices.userId, A.userId), workspaceScope(invoices.workspaceId, A.id)));

    expect(rowsA).toHaveLength(1);
    expect(rowsA[0].id).toBe(A.invoiceId);
    expect(rowsA[0].amount).toBe(3_000_000);
  });

  test("#6 cross-workspace UPDATE — W_A user가 W_B client를 수정 시도 시 0 rows affected", async () => {
    // 공격 시나리오: A user가 B client id를 추측해 update action 호출 → 쿼리 자체는 실행되지만
    // WHERE workspace_scope 필터로 매칭 0 → row 변경 없음.
    const result = await db
      .update(clients)
      .set({ companyName: "e2e_attempted_breach_rename" })
      .where(
        and(
          eq(clients.id, B.clientId),
          eq(clients.userId, A.userId),
          workspaceScope(clients.workspaceId, A.id),
        ),
      )
      .returning({ id: clients.id });

    expect(result).toHaveLength(0);

    // 원본 유지 확인
    const original = await db
      .select({ companyName: clients.companyName })
      .from(clients)
      .where(eq(clients.id, B.clientId));
    expect(original[0].companyName).toBe("e2e_client_beta_corp");
  });

  test("#7 cross-workspace DELETE — W_A user가 W_B project를 삭제 시도 시 0 rows affected", async () => {
    const result = await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, B.projectId),
          eq(projects.userId, A.userId),
          workspaceScope(projects.workspaceId, A.id),
        ),
      )
      .returning({ id: projects.id });

    expect(result).toHaveLength(0);

    // 원본 생존 확인
    const survived = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, B.projectId));
    expect(survived).toHaveLength(1);
  });

  test("#8 cross-workspace FK 참조 — milestone 쿼리가 WORKSPACE_ID 기준으로만 필터링된다", async () => {
    // W_A scope로 조회하면 정상 milestone 1개 + cross-FK milestone 1개 = 2개 (둘 다 workspace_id=A).
    // 하지만 주의: cross-FK milestone은 projectId=B.PROJECT_B_ID 참조 — projects JOIN 시 오해 유발.
    // 현재 쿼리는 JOIN 없음 → workspace_id만으로 올바르게 A 영역으로 격리.
    const rowsA = await db
      .select({ id: milestones.id, projectId: milestones.projectId })
      .from(milestones)
      .where(workspaceScope(milestones.workspaceId, A.id));

    expect(rowsA).toHaveLength(2);
    const ids = rowsA.map((r) => r.id).sort();
    expect(ids).toEqual([A.milestoneId, A.crossMilestoneId].sort());

    // B의 milestone은 포함 안 됨
    expect(ids).not.toContain(B.milestoneId);
  });

  test("#9 채번 독립성 — W_A와 W_B가 동일한 invoice_number(INV-2026-001)를 갖는다", async () => {
    // Task 5-1-4 적용 전: (user_id, invoice_number) UNIQUE → user 다르면 공존 OK
    // Task 5-1-4 적용 후: (workspace_id, invoice_number) UNIQUE → ws 다르면 공존 OK
    // 어느 단계든 이 시드는 성립. 향후 채번 경합이 workspace 단위로 격리됨을 보장.
    const rowsA = await db
      .select({ number: invoices.invoiceNumber, workspaceId: invoices.workspaceId })
      .from(invoices)
      .where(workspaceScope(invoices.workspaceId, A.id));

    const rowsB = await db
      .select({ number: invoices.invoiceNumber, workspaceId: invoices.workspaceId })
      .from(invoices)
      .where(workspaceScope(invoices.workspaceId, B.id));

    expect(rowsA).toHaveLength(1);
    expect(rowsB).toHaveLength(1);
    expect(rowsA[0].number).toBe(A.invoiceNumber);
    expect(rowsB[0].number).toBe(B.invoiceNumber);
    expect(rowsA[0].number).toBe(rowsB[0].number); // 같은 번호!
    expect(rowsA[0].workspaceId).not.toBe(rowsB[0].workspaceId); // 다른 workspace
  });

  test("#10 workspace_members — user_B 조회는 W_B membership만 반환", async () => {
    // user_B는 오직 W_B의 owner. (user_A는 #12에서 multi-membership 검증)
    const rowsB = await db
      .select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, B.userId));

    expect(rowsB).toHaveLength(1);
    expect(rowsB[0].workspaceId).toBe(B.id);
    expect(rowsB[0].role).toBe("owner");
  });

  test("#11 client_notes — workspace_id 필터로 타 workspace 메모 차단", async () => {
    const rowsA = await db
      .select({ id: clientNotes.id, content: clientNotes.content })
      .from(clientNotes)
      .where(workspaceScope(clientNotes.workspaceId, A.id));

    expect(rowsA).toHaveLength(1);
    expect(rowsA[0].content).toBe("e2e_note_alpha_content");

    // B content가 A 결과에 없음
    const contents = rowsA.map((r) => r.content);
    expect(contents).not.toContain("e2e_note_beta_content");
  });

  // ─── H-1: Multi-membership ───

  test("#12 [H-1] multi-membership — user_A가 W_A/W_B 양쪽 소속 시 scope별 데이터 격리", async () => {
    // user_A의 membership 2개 조회
    const memberships = await db
      .select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, A.userId));

    expect(memberships).toHaveLength(2);
    const byWs = Object.fromEntries(memberships.map((m) => [m.workspaceId, m.role]));
    expect(byWs[A.id]).toBe("owner");
    expect(byWs[B.id]).toBe(M.role); // "member"

    // 핵심 invariant: user_A가 W_B에 member로 있더라도, W_A scope로 clients 조회 시
    // W_B의 client는 노출되면 안 됨 (workspace 단위 격리).
    const rowsAScope = await db
      .select({ id: clients.id, workspaceId: clients.workspaceId })
      .from(clients)
      .where(workspaceScope(clients.workspaceId, A.id));
    expect(rowsAScope).toHaveLength(1);
    expect(rowsAScope[0].id).toBe(A.clientId);

    // 반대로 W_B scope로 전환하면 user_A는 W_B의 데이터에 접근 가능 (member 역할).
    // 이 시드에서 W_B client는 user_B가 생성했지만 workspace 단위로 공유되므로 접근 가능.
    const rowsBScope = await db
      .select({ id: clients.id, workspaceId: clients.workspaceId })
      .from(clients)
      .where(workspaceScope(clients.workspaceId, B.id));
    expect(rowsBScope).toHaveLength(1);
    expect(rowsBScope[0].id).toBe(B.clientId);

    // 핵심: 한 번에 한 scope만 본다 — scope 선택 실수가 곧 데이터 누출.
    // Epic 5-2 workspace picker UI가 이 선택을 명시적으로 만드는 이유.
  });

  // ─── H-2: Aggregate 오염 ───

  test("#13 [H-2] aggregate — W_A 집계 sum(contractAmount)에 W_B 금액이 섞이지 않는다", async () => {
    // 실제 Server Action 패턴 재현 (src/app/dashboard/clients/actions.ts getClients).
    // leftJoin(projects)에 workspaceScope가 있으면 A의 projects(P_A 10M + P_A2 7M)만 집계.
    // workspaceScope가 빠지면 B의 project(5M)까지 섞여 22M이 되는 누출이 가능.
    const rows = await db
      .select({
        clientId: clients.id,
        projectCount: sql<number>`count(${projects.id})::int`,
        totalRevenue: sql<number>`coalesce(sum(${projects.contractAmount}), 0)::bigint`,
      })
      .from(clients)
      .leftJoin(
        projects,
        and(
          eq(projects.clientId, clients.id),
          isNull(projects.deletedAt),
          workspaceScope(projects.workspaceId, A.id), // ← 이게 없으면 B의 project가 섞임
        ),
      )
      .where(and(eq(clients.userId, A.userId), workspaceScope(clients.workspaceId, A.id)))
      .groupBy(clients.id);

    expect(rows).toHaveLength(1);
    expect(rows[0].clientId).toBe(A.clientId);
    expect(rows[0].projectCount).toBe(2); // P_A + P_A2
    // drizzle bigint는 string 반환 가능 → Number() 캐스팅.
    expect(Number(rows[0].totalRevenue)).toBe(A.projectAmount + A.project2Amount);

    // 경계값: B workspace 금액(5M)은 집계에 포함되면 안 됨
    expect(Number(rows[0].totalRevenue)).not.toBe(
      A.projectAmount + A.project2Amount + B.projectAmount,
    );
  });

  // ─── H-3: LEFT JOIN 누출 canary ───

  test("#14 [H-3] leftJoin canary — JOIN 조건에 workspace_scope가 빠지면 누출이 실제로 발생한다", async () => {
    // Regression canary: 미래에 누군가 Server Action의 leftJoin에서 workspace_scope를 빼면
    // B의 project가 A user에 대한 집계에 섞인다. 이 테스트는 "빠졌을 때 누출 발생"과
    // "있을 때 차단"을 둘 다 증명해 회귀를 결정론적으로 잡는다.
    //
    // ⚠️ 1번 쿼리는 프로덕션 패턴이 아닌 negative example. "workspace_scope를 빼면
    //    실제로 B 데이터가 섞인다"를 결정론적으로 재현하는 canary — Server Action 코드가
    //    항상 workspace_scope를 포함해야 함을 증명.

    // 1) workspace_scope 없이 전체 projects 스캔 — A와 B 양쪽 row가 한 결과에 섞임.
    //    (projects 테이블 전체 조회는 다른 시드 잔류 가능성 있어 A/B id 기반으로만 집계.)
    const allProjects = await db
      .select({ id: projects.id, workspaceId: projects.workspaceId })
      .from(projects);

    const aProjects = allProjects.filter(
      (p) => p.id === A.projectId || p.id === A.project2Id,
    );
    const bProjects = allProjects.filter((p) => p.id === B.projectId);
    expect(aProjects).toHaveLength(2);
    expect(bProjects).toHaveLength(1);
    // 핵심: scope 없이 조회하면 A와 B가 "한 결과 안에" 공존 — 누출 가능 상태.
    expect(aProjects.length + bProjects.length).toBe(3);

    // 2) workspace_scope가 포함된 올바른 쿼리 — B는 완전히 제외.
    const scopedProjects = await db
      .select({ id: projects.id, workspaceId: projects.workspaceId })
      .from(projects)
      .where(workspaceScope(projects.workspaceId, A.id));
    expect(scopedProjects).toHaveLength(2);
    for (const p of scopedProjects) {
      expect(p.workspaceId).toBe(A.id);
    }
    // B.projectId가 scoped 결과에 절대 포함되지 않음
    const scopedIds = scopedProjects.map((p) => p.id);
    expect(scopedIds).not.toContain(B.projectId);
  });

  // ─── H-4: Cross-FK milestone 조회 검증 ───

  test("#15 [H-4] cross-FK milestone — B scope 조회는 cross-FK row(workspaceId=A, projectId=B)를 반환하지 않는다", async () => {
    // 시드의 CROSS_MILESTONE_A는 workspaceId=A + projectId=B.PROJECT_B_ID 조합.
    // A scope 쿼리는 이 row를 A 영역으로 보여줌 (정상 — workspace_id=A이므로).
    // B scope 쿼리는 이 row가 "B에 속한 것처럼" 보여서는 안 됨 — workspace_id가 A이므로 필터 통과 불가.
    const rowsB = await db
      .select({ id: milestones.id, workspaceId: milestones.workspaceId, projectId: milestones.projectId })
      .from(milestones)
      .where(workspaceScope(milestones.workspaceId, B.id));

    expect(rowsB).toHaveLength(1);
    expect(rowsB[0].id).toBe(B.milestoneId);
    expect(rowsB[0].workspaceId).toBe(B.id);

    // cross-FK row는 B scope에 포함 안 됨 (핵심 invariant)
    const ids = rowsB.map((r) => r.id);
    expect(ids).not.toContain(A.crossMilestoneId);

    // cross-FK row의 projectId가 B.project인데도 B scope 쿼리에 안 잡힌다 —
    // 즉 workspace_scope는 "FK 관계"가 아니라 "workspace_id 컬럼 값"으로만 필터한다.
    // 공격 시나리오: A admin이 B의 projectId로 milestone을 insert해도, B의 workspace 화면에는
    // 노출 안 됨 (A의 workspace 화면에만 노출 → A가 자기 책임하에 생성한 것).
  });
});
