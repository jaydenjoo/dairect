-- 0020_backfill_workspaces.sql
-- Task 5-1-3: default workspace 생성 + 기존 12 도메인 테이블 backfill
--
-- 전제: 0017 (workspaces 4 테이블) + 0018 (RLS) + 0019 (12 도메인 ALTER NULLABLE) 모두 apply 완료.
-- 실행 후: workspace_id IS NULL 행이 12 테이블에서 0건이어야 Task 5-1-4 (NOT NULL 전환) 진입 가능.
-- 멱등성: 재실행해도 기존 workspace/member/settings 덮어쓰지 않음 (EXISTS/ON CONFLICT 가드).
-- 실행 방법: Supabase MCP `apply_migration` 또는 Dashboard SQL Editor (수동 1회).
--           drizzle-kit generate 자동 생성 아님 (data migration). journal 미등록 (0018 패턴).

BEGIN;

--> statement-breakpoint
-- 1. 각 user에 default workspace 1개 생성 (없을 때만).
--    slug 결정적: 'default-' || user_id::text (full UUID) → user-facing 의미 0인 일회성 backfill이라
--    가독성보다 충돌 0% 보장이 우선. Task 5-2-7 회원가입 자동 프로비저닝은 별도 slug 정책.
--    (32-bit prefix 사용 시 77K user에서 50% 생일 충돌 — multi-tenant 전환 관점 선제 제거)
--    owner 연결은 workspaces 테이블이 아닌 workspace_members(role='owner')로 표현 (스키마 설계).
INSERT INTO workspaces (id, name, slug, created_at, updated_at)
SELECT gen_random_uuid(),
       '기본 워크스페이스',
       'default-' || u.id::text,
       now(),
       now()
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM workspace_members wm
  WHERE wm.user_id = u.id AND wm.role = 'owner'
);

--> statement-breakpoint
-- 2. workspace_members: 각 user를 자기 default workspace의 owner로 등록.
--    매칭 키: slug = 'default-' || user_id::text (1단계와 동일 규칙).
--    ON CONFLICT: 이미 해당 (workspace_id, user_id) 쌍이 있으면 skip (재실행 안전).
INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
SELECT w.id, u.id, 'owner', now()
FROM users u
JOIN workspaces w ON w.slug = 'default-' || u.id::text
ON CONFLICT (workspace_id, user_id) DO NOTHING;

--> statement-breakpoint
-- 3. workspace_settings: 각 workspace에 빈 settings row 생성.
--    updated_at만 채움. 나머지 필드(companyName 등 14개)는 기본값/NULL 유지.
--    user_settings → workspace_settings 필드 이전은 Task 5-4-3 스코프 (본 마이그레이션은 scope out).
INSERT INTO workspace_settings (workspace_id, updated_at)
SELECT w.id, now()
FROM workspaces w
ON CONFLICT (workspace_id) DO NOTHING;

--> statement-breakpoint
-- 4. user_id 직접 컬럼 9개 테이블 backfill (owner-member 경유로 workspace_id 매핑).

UPDATE clients
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = clients.user_id AND wm.role = 'owner'
  AND clients.workspace_id IS NULL;

--> statement-breakpoint
UPDATE leads
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = leads.user_id AND wm.role = 'owner'
  AND leads.workspace_id IS NULL;

--> statement-breakpoint
UPDATE projects
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = projects.user_id AND wm.role = 'owner'
  AND projects.workspace_id IS NULL;

--> statement-breakpoint
UPDATE estimates
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = estimates.user_id AND wm.role = 'owner'
  AND estimates.workspace_id IS NULL;

--> statement-breakpoint
UPDATE contracts
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = contracts.user_id AND wm.role = 'owner'
  AND contracts.workspace_id IS NULL;

--> statement-breakpoint
UPDATE invoices
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = invoices.user_id AND wm.role = 'owner'
  AND invoices.workspace_id IS NULL;

--> statement-breakpoint
UPDATE activity_logs
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = activity_logs.user_id AND wm.role = 'owner'
  AND activity_logs.workspace_id IS NULL;

--> statement-breakpoint
UPDATE briefings
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = briefings.user_id AND wm.role = 'owner'
  AND briefings.workspace_id IS NULL;

--> statement-breakpoint
UPDATE weekly_reports
SET workspace_id = wm.workspace_id
FROM workspace_members wm
WHERE wm.user_id = weekly_reports.user_id AND wm.role = 'owner'
  AND weekly_reports.workspace_id IS NULL;

--> statement-breakpoint
-- 5. 부모 테이블 경유 3개 (user_id 컬럼 없음 → parent FK로 workspace_id 상속).
--    순서 중요: 위 4단계에서 parent 먼저 채워졌으므로 parent.workspace_id IS NOT NULL 가드로 race 방어.

UPDATE client_notes
SET workspace_id = c.workspace_id
FROM clients c
WHERE c.id = client_notes.client_id
  AND c.workspace_id IS NOT NULL
  AND client_notes.workspace_id IS NULL;

--> statement-breakpoint
UPDATE milestones
SET workspace_id = p.workspace_id
FROM projects p
WHERE p.id = milestones.project_id
  AND p.workspace_id IS NOT NULL
  AND milestones.workspace_id IS NULL;

--> statement-breakpoint
UPDATE estimate_items
SET workspace_id = e.workspace_id
FROM estimates e
WHERE e.id = estimate_items.estimate_id
  AND e.workspace_id IS NOT NULL
  AND estimate_items.workspace_id IS NULL;

--> statement-breakpoint
-- 6. 자동 assertion: 12 테이블의 workspace_id NULL row가 0인지 트랜잭션 내 확인.
--    한 건이라도 남으면 RAISE EXCEPTION → BEGIN 전체 롤백.
--    목적: Task 5-1-4 NOT NULL 전환 진입 가능 여부를 이 마이그레이션 하나로 보장.
--    남는 시나리오: (a) orphan row의 user_id가 workspace_members(owner)에 없음
--                  (b) 부모 경유 3개에서 parent row가 삭제된 상태로 자식만 존재
DO $$
DECLARE
  t text;
  n bigint;
  tables text[] := ARRAY[
    'clients', 'client_notes', 'leads', 'projects', 'milestones',
    'estimates', 'estimate_items', 'contracts', 'invoices',
    'activity_logs', 'briefings', 'weekly_reports'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I WHERE workspace_id IS NULL', t) INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION 'Backfill incomplete: table % still has % rows with workspace_id IS NULL. Investigate orphan user_id or missing parent FK before re-running.', t, n;
    END IF;
  END LOOP;
END $$;

--> statement-breakpoint
COMMIT;

-- 7. 검증 쿼리 (자동 assertion 통과 후 수동 재확인용 — 6번에서 실패 시 이 쿼리는 실행도 못 함).
-- ──────────────────────────────────────────────────────────────────────────────
-- SELECT 'clients'        AS t, COUNT(*) AS null_rows FROM clients        WHERE workspace_id IS NULL
-- UNION ALL SELECT 'client_notes',   COUNT(*) FROM client_notes   WHERE workspace_id IS NULL
-- UNION ALL SELECT 'leads',          COUNT(*) FROM leads          WHERE workspace_id IS NULL
-- UNION ALL SELECT 'projects',       COUNT(*) FROM projects       WHERE workspace_id IS NULL
-- UNION ALL SELECT 'milestones',     COUNT(*) FROM milestones     WHERE workspace_id IS NULL
-- UNION ALL SELECT 'estimates',      COUNT(*) FROM estimates      WHERE workspace_id IS NULL
-- UNION ALL SELECT 'estimate_items', COUNT(*) FROM estimate_items WHERE workspace_id IS NULL
-- UNION ALL SELECT 'contracts',      COUNT(*) FROM contracts      WHERE workspace_id IS NULL
-- UNION ALL SELECT 'invoices',       COUNT(*) FROM invoices       WHERE workspace_id IS NULL
-- UNION ALL SELECT 'activity_logs',  COUNT(*) FROM activity_logs  WHERE workspace_id IS NULL
-- UNION ALL SELECT 'briefings',      COUNT(*) FROM briefings      WHERE workspace_id IS NULL
-- UNION ALL SELECT 'weekly_reports', COUNT(*) FROM weekly_reports WHERE workspace_id IS NULL;
--
-- 기대값: 모든 t에서 null_rows = 0.
-- null_rows > 0인 경우: 해당 row의 user_id가 workspace_members(owner)에 없음 → 수동 조사 필요.

-- ROLLBACK (긴급 복구용):
-- ──────────────────────────────────────────────────────────────────────────────
-- ⚠️ 실행 순서 엄수: 12 테이블의 workspace_id를 먼저 NULL로 되돌린 뒤 workspaces DELETE.
--   순서 위반 시 FK RESTRICT(0019)로 DELETE 실패 → 트랜잭션 롤백. onDelete:cascade 아님 — 데이터 손실 없음.
--   주석 해제하여 SQL Editor에 붙여넣기 후 실행. 단일 user 환경에선 기대 영향 범위: 12 테이블 workspace_id 컬럼만.
-- BEGIN;
-- UPDATE clients        SET workspace_id = NULL;
-- UPDATE client_notes   SET workspace_id = NULL;
-- UPDATE leads          SET workspace_id = NULL;
-- UPDATE projects       SET workspace_id = NULL;
-- UPDATE milestones     SET workspace_id = NULL;
-- UPDATE estimates      SET workspace_id = NULL;
-- UPDATE estimate_items SET workspace_id = NULL;
-- UPDATE contracts      SET workspace_id = NULL;
-- UPDATE invoices       SET workspace_id = NULL;
-- UPDATE activity_logs  SET workspace_id = NULL;
-- UPDATE briefings      SET workspace_id = NULL;
-- UPDATE weekly_reports SET workspace_id = NULL;
-- DELETE FROM workspace_settings;
-- DELETE FROM workspace_members;
-- DELETE FROM workspaces;
-- COMMIT;
