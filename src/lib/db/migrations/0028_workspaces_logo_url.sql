-- Task 5-2-2c: workspaces에 logo_url + logo_storage_path 추가
--
-- 배경:
--   PDF 헤더(견적서/계약서/청구서)와 대시보드 UI에 workspace 로고 표시 위해 이미지 URL 보관.
--   Supabase Storage 버킷 'workspace-logos'에 파일 저장. DB에는 공개 URL + 내부 경로 2개 저장.
--
-- 컬럼 설계:
--   - logo_url (text, nullable): 공개 URL. PDF @react-pdf/renderer Image src에 직접 사용 가능.
--     Supabase Storage가 제공하는 `/storage/v1/object/public/{bucket}/{path}` 형식.
--   - logo_storage_path (text, nullable): 버킷 내부 경로 `{workspace_id}/{timestamp}.{ext}`.
--     파일 제거 시 `storage.from('workspace-logos').remove([path])` 호출에 필요.
--     url만 저장하면 path 역추출 fragile → 둘 다 보관이 안전.
--
-- 둘 다 NULL 허용: 신규 workspace는 로고 없는 상태가 기본. 제거 시 두 컬럼 모두 NULL로 업데이트.

BEGIN;

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS logo_storage_path text;

COMMIT;

-- ─── Rollback (수동) ────────────────────────────
-- BEGIN;
-- ALTER TABLE public.workspaces
--   DROP COLUMN IF EXISTS logo_url,
--   DROP COLUMN IF EXISTS logo_storage_path;
-- COMMIT;
