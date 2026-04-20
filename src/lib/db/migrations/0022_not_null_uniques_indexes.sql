-- Phase 5 Epic 5-1 Task 5-1-4: 13 도메인 테이블 workspace_id NOT NULL 전환
--                              + 채번 UNIQUE 재조정 (user → workspace)
--                              + workspace_id 복합 인덱스 추가 (Task 5-1-7 리뷰 H-1)
--                              (weekly_reports 포함 — db-engineer 리뷰 H-1 후속 반영)
--
-- ⚠️ POST-APPLY 필수: schema.ts 수동 반영 (db-engineer 리뷰 H-2)
--   본 마이그레이션 apply 후 schema.ts의 13개 workspaceId 컬럼에 `.notNull()`
--   + contracts/invoices/estimates UNIQUE 정의 수동 업데이트 필요.
--   미반영 시 다음 drizzle-kit generate가 본 마이그레이션 역행 SQL을 생성함.
--
-- 전제 (적용 순서):
--   0017 workspaces 4 테이블 생성
--   0018 workspaces RLS deny_anon
--   0019 12 도메인 테이블 workspace_id NULLABLE + FK RESTRICT
--   0020 default workspace 생성 + 12 테이블 backfill + assertion (NULL row = 0 보장)
--   ─── 이 파일 0022는 0020 assertion 통과 이후 실행 ───
--
-- 0021(RLS 48 policy) 대비 적용 순서 권장:
--   0020 → 0022(이 파일, NOT NULL + UNIQUE + 인덱스) → 0021(RLS)
--   이유: RLS 정책이 NOT NULL 전제로 설계되면 NULL row 접근 경로를 사전 차단
--         (이미 0020 assertion이 NULL=0 보장하지만 defense-in-depth).
--
-- 설계 결정 (계획 단계 확정):
--   [D1] UNIQUE 재조정은 DROP + ADD 2단계. ALTER CONSTRAINT RENAME은 컬럼 변경 불가.
--   [D2] estimates는 신규 UNIQUE 추가 — 기존 UNIQUE 없음 (generateEstimateNumber의
--        MAX 기반 채번). DB 레벨 무결성 강화.
--   [D3] briefings UNIQUE 유지 — (user_id, week_start_date). user-centric 엔티티로
--        workspace 필터는 쿼리 레벨만.
--   [D4] CREATE INDEX IF NOT EXISTS로 멱등성 보장. 재실행 안전.
--   [D5] soft-delete 포함 인덱스는 projects만 (유일한 soft-delete 테이블).
--   [D6] activity_logs는 (workspace_id, created_at DESC) — 대시보드 최근 활동
--        ORDER BY desc(createdAt) LIMIT 10 hot-path 역방향 스캔 제거.
--
-- 멱등성:
--   ALTER COLUMN SET NOT NULL은 이미 NOT NULL이면 오류 없음 (DDL idempotent).
--   ADD CONSTRAINT는 같은 이름 존재 시 실패 → IF NOT EXISTS 없음.
--     DROP CONSTRAINT IF EXISTS로 선행 처리.
--   CREATE INDEX IF NOT EXISTS로 인덱스는 안전.
--
-- 트랜잭션 래핑:
--   BEGIN/COMMIT으로 전체 마이그레이션 원자성 보장.

BEGIN;--> statement-breakpoint

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 섹션 1. 12 테이블 workspace_id NOT NULL 전환
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE "clients"        ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "client_notes"   ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leads"          ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects"       ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones"     ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "estimates"      ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "estimate_items" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts"      ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices"       ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs"  ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "briefings"      ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "portal_tokens"  ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "weekly_reports" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 섹션 2. 채번 UNIQUE 재조정 — workspace 단위 독립 채번 체계
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- [M-1 방어] 각 ADD CONSTRAINT 전 duplicate 사전 검사.
--   single-user 환경에서 generateXNumber가 올바르게 증가했으면 0건이 기대치.
--   0건 아니면 즉시 RAISE EXCEPTION → BEGIN 전체 롤백 (trans 중간 실패로 silent 변경 방지).

-- ─── contracts: (user_id, contract_number) → (workspace_id, contract_number) ───
DO $$
DECLARE dup_count bigint;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT workspace_id, contract_number FROM contracts
    GROUP BY 1, 2 HAVING COUNT(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'contracts has % duplicate (workspace_id, contract_number) pairs', dup_count;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "contracts" DROP CONSTRAINT IF EXISTS "contracts_user_number_unique";--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_workspace_number_unique"
  UNIQUE ("workspace_id", "contract_number");--> statement-breakpoint

-- ─── invoices: (user_id, invoice_number) → (workspace_id, invoice_number) ───
DO $$
DECLARE dup_count bigint;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT workspace_id, invoice_number FROM invoices
    GROUP BY 1, 2 HAVING COUNT(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'invoices has % duplicate (workspace_id, invoice_number) pairs', dup_count;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_user_number_unique";--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workspace_number_unique"
  UNIQUE ("workspace_id", "invoice_number");--> statement-breakpoint

-- ─── estimates: 신규 UNIQUE (기존 UNIQUE 없음, Task 5-1-7에서 generateEstimateNumber
--     workspace 조건 추가됨. DB 레벨 무결성 강화) ───
DO $$
DECLARE dup_count bigint;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT workspace_id, estimate_number FROM estimates
    GROUP BY 1, 2 HAVING COUNT(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'estimates has % duplicate (workspace_id, estimate_number) pairs', dup_count;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "estimates" DROP CONSTRAINT IF EXISTS "estimates_workspace_number_unique";--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_workspace_number_unique"
  UNIQUE ("workspace_id", "estimate_number");--> statement-breakpoint

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 섹션 3. workspace_id 복합 인덱스 추가 (Task 5-1-7 리뷰 H-1)
--
-- Hot-path 쿼리 기준 선별 (Task 5-1-7 Server Action 실제 WHERE 절 분석):
--
--   일반 CRUD (user_id 공존)                    → (workspace_id, user_id)
--   Soft-delete 경로 (projects 유일)            → (workspace_id, user_id, deleted_at)
--   부모 ID 경유 조회 (client_notes/items 등)  → (workspace_id, parent_id)
--   최근 순 정렬 (activity_logs 대시보드)       → (workspace_id, created_at DESC)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ─── 일반 CRUD: (workspace_id, user_id) 복합 인덱스 ───
CREATE INDEX IF NOT EXISTS "clients_ws_user_idx"    ON "clients"("workspace_id", "user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_ws_user_idx"      ON "leads"("workspace_id", "user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contracts_ws_user_idx"  ON "contracts"("workspace_id", "user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_ws_user_idx"   ON "invoices"("workspace_id", "user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "briefings_ws_user_idx"  ON "briefings"("workspace_id", "user_id");--> statement-breakpoint

-- ─── Soft-delete 포함: projects (유일한 soft-delete 테이블) ───
CREATE INDEX IF NOT EXISTS "projects_ws_user_deleted_idx"
  ON "projects"("workspace_id", "user_id", "deleted_at");--> statement-breakpoint

-- ─── 부모 ID 경유 조회: (workspace_id, parent_id) ───
CREATE INDEX IF NOT EXISTS "client_notes_ws_client_idx"
  ON "client_notes"("workspace_id", "client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestones_ws_project_idx"
  ON "milestones"("workspace_id", "project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_items_ws_est_idx"
  ON "estimate_items"("workspace_id", "estimate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "portal_tokens_ws_project_idx"
  ON "portal_tokens"("workspace_id", "project_id");--> statement-breakpoint

-- ─── 최근 순 정렬 hot-path: activity_logs ───
-- (workspace_id, created_at DESC) — Postgres B-tree는 양방향 자동 지원이라
-- 단일 ORDER BY 용도로는 ASC/DESC 성능 동일. DESC 명시는 향후 멀티컬럼
-- ORDER BY (예: workspace_id ASC, created_at DESC) 확장 대비용.
CREATE INDEX IF NOT EXISTS "activity_logs_ws_created_idx"
  ON "activity_logs"("workspace_id", "created_at" DESC);--> statement-breakpoint

-- ─── weekly_reports: (workspace_id, project_id) — 프로젝트별 주간 보고서 hot-path ───
CREATE INDEX IF NOT EXISTS "weekly_reports_ws_project_idx"
  ON "weekly_reports"("workspace_id", "project_id");

COMMIT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROLLBACK (역순: 인덱스 → UNIQUE → NOT NULL)
-- 주의: BEGIN/COMMIT 트랜잭션으로 묶어 실행. 단계별 실패 시 전체 자동 롤백.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- -- 섹션 3 rollback: 인덱스 제거
-- DROP INDEX IF EXISTS "weekly_reports_ws_project_idx";
-- DROP INDEX IF EXISTS "activity_logs_ws_created_idx";
-- DROP INDEX IF EXISTS "portal_tokens_ws_project_idx";
-- DROP INDEX IF EXISTS "estimate_items_ws_est_idx";
-- DROP INDEX IF EXISTS "milestones_ws_project_idx";
-- DROP INDEX IF EXISTS "client_notes_ws_client_idx";
-- DROP INDEX IF EXISTS "projects_ws_user_deleted_idx";
-- DROP INDEX IF EXISTS "briefings_ws_user_idx";
-- DROP INDEX IF EXISTS "invoices_ws_user_idx";
-- DROP INDEX IF EXISTS "contracts_ws_user_idx";
-- DROP INDEX IF EXISTS "leads_ws_user_idx";
-- DROP INDEX IF EXISTS "clients_ws_user_idx";
--
-- -- 섹션 2 rollback: UNIQUE 제약 복원
-- ALTER TABLE "estimates" DROP CONSTRAINT IF EXISTS "estimates_workspace_number_unique";
-- ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_workspace_number_unique";
-- ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_number_unique"
--   UNIQUE ("user_id", "invoice_number");
-- ALTER TABLE "contracts" DROP CONSTRAINT IF EXISTS "contracts_workspace_number_unique";
-- ALTER TABLE "contracts" ADD CONSTRAINT "contracts_user_number_unique"
--   UNIQUE ("user_id", "contract_number");
--
-- -- 섹션 1 rollback: NOT NULL 해제
-- ALTER TABLE "weekly_reports" ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "portal_tokens"  ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "briefings"      ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "activity_logs"  ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "invoices"       ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "contracts"      ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "estimate_items" ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "estimates"      ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "milestones"     ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "projects"       ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "leads"          ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "client_notes"   ALTER COLUMN "workspace_id" DROP NOT NULL;
-- ALTER TABLE "clients"        ALTER COLUMN "workspace_id" DROP NOT NULL;
