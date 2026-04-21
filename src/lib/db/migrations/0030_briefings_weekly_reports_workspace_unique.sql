-- Phase 5 Epic 5-2 Task 5-2-2g: briefings / weekly_reports UNIQUE 제약에 workspace_id 추가
--                                (cross-workspace 덮어쓰기 차단)
--
-- 배경 (learnings.md 2026-04-21 심야 "workspace_members M:N UPSERT target" 참조):
--   Phase 5 multi-tenant 이관 당시 workspace_id 컬럼만 NOT NULL 전환하고 UNIQUE 제약은
--   손대지 않음. 5-2-3-B workspace 스위치 기능 도입 후, 동일 user가 A→B workspace 전환
--   후 같은 주 Regenerate 시 onConflict가 workspace_id=A 행에 매치 → contentJson만
--   덮어쓰고 workspace_id는 A 유지 → B 페이지 SSR에서도 userId+weekStart 조건에 걸려
--   그 row가 반환되어 **B workspace 화면에 A workspace 데이터 노출**.
--
-- 설계 결정:
--   [D1] 기존 UNIQUE DROP + 신규 UNIQUE ADD 2단계 (ALTER CONSTRAINT RENAME은 컬럼 변경 불가).
--        0022 섹션 2 패턴 재사용.
--   [D2] 사전 duplicate 검사 DO 블록 — (user_id, workspace_id, [project_id,] week_start_date)
--        중복이 발견되면 RAISE EXCEPTION → BEGIN 전체 롤백.
--        기존 (user_id, [project_id,] week_start_date) UNIQUE가 이미 더 엄격하므로
--        중복 0건 기대치. defense-in-depth.
--   [D3] 제약 이름 변경:
--          briefings_user_week_unique → briefings_user_workspace_week_unique
--          weekly_reports_user_project_week_unique → weekly_reports_user_workspace_project_week_unique
--
-- 트랜잭션 래핑: BEGIN/COMMIT으로 전체 원자성 보장.
--
-- 롤백 SQL (역방향):
--   BEGIN;
--   ALTER TABLE "briefings" DROP CONSTRAINT "briefings_user_workspace_week_unique";
--   ALTER TABLE "briefings" ADD CONSTRAINT "briefings_user_week_unique"
--     UNIQUE ("user_id", "week_start_date");
--   ALTER TABLE "weekly_reports" DROP CONSTRAINT "weekly_reports_user_workspace_project_week_unique";
--   ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_user_project_week_unique"
--     UNIQUE ("user_id", "project_id", "week_start_date");
--   COMMIT;
--
-- POST-APPLY:
--   schema.ts의 briefings/weeklyReports UNIQUE 정의 동기화 필수.
--   애플리케이션 레이어 onConflict target + 읽기 WHERE 전수 수정.

BEGIN;--> statement-breakpoint

-- ─── briefings: (user_id, week_start_date) → (user_id, workspace_id, week_start_date) ───
DO $$
DECLARE dup_count bigint;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT user_id, workspace_id, week_start_date FROM briefings
    GROUP BY 1, 2, 3 HAVING COUNT(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'briefings has % duplicate (user_id, workspace_id, week_start_date) rows', dup_count;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "briefings" DROP CONSTRAINT IF EXISTS "briefings_user_week_unique";--> statement-breakpoint
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_user_workspace_week_unique"
  UNIQUE ("user_id", "workspace_id", "week_start_date");--> statement-breakpoint

-- ─── weekly_reports: (user_id, project_id, week_start_date) → (user_id, workspace_id, project_id, week_start_date) ───
DO $$
DECLARE dup_count bigint;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT user_id, workspace_id, project_id, week_start_date FROM weekly_reports
    GROUP BY 1, 2, 3, 4 HAVING COUNT(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE EXCEPTION 'weekly_reports has % duplicate (user_id, workspace_id, project_id, week_start_date) rows', dup_count;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "weekly_reports" DROP CONSTRAINT IF EXISTS "weekly_reports_user_project_week_unique";--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_user_workspace_project_week_unique"
  UNIQUE ("user_id", "workspace_id", "project_id", "week_start_date");--> statement-breakpoint

COMMIT;
