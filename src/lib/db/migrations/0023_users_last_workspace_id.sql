ALTER TABLE "users" ADD COLUMN "last_workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_last_workspace_id_workspaces_id_fk" FOREIGN KEY ("last_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Phase 5 Task 5-2-3-A (2026-04-21) — users.last_workspace_id 컬럼 추가 (PRD 섹션 10 결정 반영).
-- 목적: 로그인 직후 /dashboard 리다이렉트 시 "마지막 접속 workspace" 우선 해석.
--
-- NULLABLE + ON DELETE SET NULL:
--   - NULLABLE: 신규 가입 직후엔 아직 workspace 선택 이력 없음 → NULL 기본 → getCurrentWorkspaceId 폴백(joinedAt MIN)로 자연스럽게 진입.
--   - ON DELETE SET NULL: workspace 삭제(hard delete) 시 레퍼런스 자동 해제. workspace가 soft delete(deleted_at IS NOT NULL)인 경우는 getCurrentWorkspaceId 쿼리의 deleted_at IS NULL 조건으로 걸러내 폴백 진입.
--
-- Race 방어 미필요:
--   - last_workspace_id UPDATE는 사용자당 순차 동작 (workspace picker 전환 시마다 1건).
--   - 읽기와 쓰기가 경합해도 최악의 시나리오는 "전환 직후 이전 workspace로 잠시 보임" → 다음 요청에서 자연 복원.
--
-- RLS: users 테이블은 service layer(layout.tsx)에서만 접근 → anon 정책 불필요. authenticated 정책은 Task 5-2-6 (역할 guard) 범위에서 일괄 검토.
--
-- 전제: 0017 (workspaces 테이블) 적용 후 실행. FK 대상 workspaces.id 존재 필요.
--
-- ROLLBACK:
-- ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_last_workspace_id_workspaces_id_fk";
-- ALTER TABLE "users" DROP COLUMN IF EXISTS "last_workspace_id";
