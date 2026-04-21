-- Task 5-2-2b 리뷰 S-H2: workspace_settings에 authenticated 멤버십 기반 RLS 정책 3개 추가.
--
-- 배경:
--   0018에서 workspace_settings는 deny_anon만 설정됨 (authenticated 정책 부재).
--   0021에서 13 도메인 테이블은 is_workspace_member 기반 4 CRUD 정책을 받았지만
--   workspace_settings는 누락 → defense-in-depth 공백.
--
-- 현재 영향:
--   Drizzle=postgres superuser 접속이라 RLS 우회 → 실질 동작 문제 없음.
--   그러나 Phase 5.5에서 Supabase authenticated 클라이언트로 전환하는 순간,
--   owner/admin도 자기 workspace_settings를 읽지 못해 설정 저장/AI 카운터 전부 실패.
--
-- 설계 결정:
--   [D1] 0021 Task 5-1-5 layered security 원칙 계승:
--        - RLS = workspace 격리 (member 여부만 체크)
--        - Server Action = role 세분화 (settings/actions.ts의 getCurrentWorkspaceRole owner/admin 가드)
--   [D2] UPDATE를 member까지 허용하는 이유 — AI 한도 카운터 증가는 모든 workspace 멤버가 수행.
--        owner/admin으로 제한하면 member의 AI 호출이 RLS에서 차단됨.
--        민감정보(사업자번호/은행계좌) 편집 차단은 Server Action 레이어에서 이미 처리 중.
--   [D3] DELETE 정책 없음 — workspaces 삭제 시 ON DELETE CASCADE로만 제거, 직접 DELETE 경로 없음.
--
-- 멱등성: DROP POLICY IF EXISTS 선행 → 재실행 안전.

BEGIN;

DROP POLICY IF EXISTS "workspace_settings_select_members" ON public.workspace_settings;
CREATE POLICY "workspace_settings_select_members" ON public.workspace_settings
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "workspace_settings_insert_members" ON public.workspace_settings;
CREATE POLICY "workspace_settings_insert_members" ON public.workspace_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "workspace_settings_update_members" ON public.workspace_settings;
CREATE POLICY "workspace_settings_update_members" ON public.workspace_settings
  FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

COMMIT;

-- ─── Rollback (수동 실행 시) ───────────────────────────────────────
-- BEGIN;
-- DROP POLICY IF EXISTS "workspace_settings_select_members" ON public.workspace_settings;
-- DROP POLICY IF EXISTS "workspace_settings_insert_members" ON public.workspace_settings;
-- DROP POLICY IF EXISTS "workspace_settings_update_members" ON public.workspace_settings;
-- COMMIT;
