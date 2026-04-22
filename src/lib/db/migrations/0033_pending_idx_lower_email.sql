-- Phase 5.5 선행 Task: workspace_invitations_pending_idx LOWER(email) 교체
--
-- 배경 (Task 5-2-5 review learnings):
--   현재 unique partial idx는 (workspace_id, email) 기반으로 대소문자 구분(case-sensitive).
--   애플리케이션 레이어(invitation.ts zod)에서 email을 trim+toLowerCase하여 저장하므로
--   정상 경로에서는 중복이 발생하지 않지만, 다음 우회 경로에서 동일 수신자에 대해
--   복수 활성 초대가 생성될 수 있음:
--     1) 직접 INSERT 경로 (psql, Supabase SQL editor, admin API)
--     2) zod 검증을 우회하는 신규 서버 액션 추가 시
--     3) 데이터 이관 스크립트
--   LOWER(email) 기반 expression index는 DB 레벨에서 대소문자 통일을 강제 — defense-in-depth.
--
-- 설계 결정:
--   [D1] DROP + CREATE 원자성: BEGIN/COMMIT으로 감싼다. DROP만 커밋된 채 CREATE 실패 시
--        unique 제약이 없어져 race 중복 생성 위험.
--   [D2] 같은 이름 재사용: "workspace_invitations_pending_idx" — 외부 참조 / 문서 일관성 유지.
--   [D3] WHERE 조건(accepted_at IS NULL AND revoked_at IS NULL)은 그대로.
--        Pending 상태일 때만 중복 방지 (accepted/revoked 후 재발급 허용은 기존 동작).
--
-- Pre-check (적용 전 확인 필수):
--   SELECT workspace_id, LOWER(email), COUNT(*)
--   FROM workspace_invitations
--   WHERE accepted_at IS NULL AND revoked_at IS NULL
--   GROUP BY workspace_id, LOWER(email)
--   HAVING COUNT(*) > 1;
--   → 0 rows 이어야 함. 1 rows 이상이면 기존 대소문자 혼재 데이터 정리 선행 필요.
--
-- 롤백 SQL (역방향 — LOWER 제거, 대소문자 구분 복귀):
--   BEGIN;
--   DROP INDEX IF EXISTS "workspace_invitations_pending_idx";
--   CREATE UNIQUE INDEX "workspace_invitations_pending_idx"
--     ON workspace_invitations (workspace_id, email)
--     WHERE accepted_at IS NULL AND revoked_at IS NULL;
--   COMMIT;
--
-- POST-APPLY:
--   schema.ts의 workspaceInvitations pending idx 정의도 sql`LOWER(${table.email})` 표현식으로 갱신.

BEGIN;--> statement-breakpoint

DROP INDEX IF EXISTS "workspace_invitations_pending_idx";--> statement-breakpoint

CREATE UNIQUE INDEX "workspace_invitations_pending_idx"
  ON workspace_invitations (workspace_id, LOWER(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;--> statement-breakpoint

COMMIT;
