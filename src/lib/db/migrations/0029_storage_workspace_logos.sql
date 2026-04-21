-- Task 5-2-2c: Supabase Storage 버킷 'workspace-logos' + RLS 정책 4개
--
-- 배경:
--   workspace 로고 파일 저장소. 각 workspace별 폴더 내에 이미지 저장.
--   파일명 규칙: {workspace_id}/{timestamp}.{ext} — path 앞부분 UUID로 workspace 식별.
--
-- 보안 설계:
--   [D1] public read — PDF @react-pdf/renderer Image src에 직접 임베드 가능해야 함.
--        인증 토큰 없이도 로고 조회 가능 (GET). 대신 upload/update/delete는 authenticated + 멤버십 체크.
--   [D2] 버킷 레벨 file_size_limit 5MB + MIME whitelist (PNG/JPG/WEBP).
--        Zod 검증(앱 레이어) + 버킷 제약(스토리지 레이어) 2중 방어.
--   [D3] workspace_members 기반 정책 — is_workspace_member(uuid) helper 재사용 (0021 SECURITY DEFINER).
--        path의 첫 폴더명을 UUID로 파싱해 workspace 식별 → RLS에서 membership 체크.
--   [D4] role 세분화 제외 — owner/admin만 허용 같은 분기는 Server Action 레이어에서 처리 (layered security,
--        Task 5-1-7 D1 원칙과 일관). RLS는 workspace 격리만.
--
-- 멱등성: IF NOT EXISTS (버킷) + DROP POLICY IF EXISTS 선행으로 재실행 안전.

BEGIN;

-- 1) 버킷 생성 (이미 있으면 스킵)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-logos',
  'workspace-logos',
  true,
  5242880,  -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) SELECT 정책 — public (PDF 임베드용)
DROP POLICY IF EXISTS "workspace_logos_select_public" ON storage.objects;
CREATE POLICY "workspace_logos_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'workspace-logos');

-- 3) INSERT 정책 — authenticated + workspace 멤버만
DROP POLICY IF EXISTS "workspace_logos_insert_members" ON storage.objects;
CREATE POLICY "workspace_logos_insert_members"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'workspace-logos'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid)
  );

-- 4) UPDATE 정책 — 멤버만 (upsert 동작 대비)
DROP POLICY IF EXISTS "workspace_logos_update_members" ON storage.objects;
CREATE POLICY "workspace_logos_update_members"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'workspace-logos'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid)
  )
  WITH CHECK (
    bucket_id = 'workspace-logos'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid)
  );

-- 5) DELETE 정책 — 멤버만
DROP POLICY IF EXISTS "workspace_logos_delete_members" ON storage.objects;
CREATE POLICY "workspace_logos_delete_members"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'workspace-logos'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid)
  );

COMMIT;

-- ─── Rollback (수동) ────────────────────────────
-- BEGIN;
-- DROP POLICY IF EXISTS "workspace_logos_select_public" ON storage.objects;
-- DROP POLICY IF EXISTS "workspace_logos_insert_members" ON storage.objects;
-- DROP POLICY IF EXISTS "workspace_logos_update_members" ON storage.objects;
-- DROP POLICY IF EXISTS "workspace_logos_delete_members" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'workspace-logos';
-- COMMIT;
