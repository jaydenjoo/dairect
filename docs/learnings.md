# Dairect — 교훈 기록

## 2026-04-16 — Next.js 16.2 라우트 그룹 충돌

- **증상**: `pnpm build` 실패 — "You cannot have two parallel pages that resolve to the same path"
- **원인**: `(dashboard)` 라우트 그룹은 URL 경로에 영향을 주지 않음. `(public)/projects`와 `(dashboard)/projects`가 둘 다 `/projects`로 충돌
- **해결**: `(dashboard)`를 `dashboard/` 실제 라우트 세그먼트로 변경
- **규칙**: 대시보드처럼 별도 URL 접두사가 필요한 영역은 라우트 그룹 `()` 대신 실제 폴더명 사용. 라우트 그룹은 레이아웃 분리 목적으로만 사용할 것.

## 2026-04-16 — Supabase 새 프로젝트 DB 연결 형식 변경

- **증상**: `db.xxx.supabase.co` DNS 해석 실패 (`ENOTFOUND`)
- **원인**: 최신 Supabase 프로젝트는 IPv4 `db.` 직접 연결 대신 Pooler URL (`aws-0-*.pooler.supabase.com`) 사용
- **해결**: Supabase Connect → ORMs 탭에서 Pooler URL 복사. 마이그레이션용은 포트 5432 (Direct), 앱 런타임은 6543 (Transaction mode)
- **규칙**: 새 Supabase 프로젝트에서는 항상 Connect 버튼의 Pooler URL 사용. `db.xxx.supabase.co` 형식은 레거시/IPv4 addon 전용.

## 2026-04-16 — proxy.ts vs middleware.ts (Next.js 16.2)

- **증상**: `proxy.ts`로 내보낸 미들웨어가 작동하지 않음 (인증 보호 무효)
- **원인**: Next.js는 `src/middleware.ts` (또는 루트 `middleware.ts`)에서 `middleware` 함수를 export해야 인식. 파일명과 export명 둘 다 맞아야 함
- **해결**: `proxy.ts` → `src/middleware.ts`, `export async function proxy` → `export async function middleware`
- **규칙**: Next.js 미들웨어는 파일명 `middleware.ts` + export명 `middleware` 둘 다 고정. PRD/문서에서 "proxy" 용어를 사용하더라도 실제 구현은 Next.js 컨벤션을 따를 것.
