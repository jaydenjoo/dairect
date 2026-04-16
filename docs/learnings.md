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

## 2026-04-16 — shadcn/ui v4 base-ui 기반 API 변경

- **증상**: `DialogTrigger asChild` 사용 시 TypeScript 에러, `Select onValueChange`에서 `string | null` 타입 불일치
- **원인**: shadcn/ui v4는 Radix UI에서 base-ui로 마이그레이션. `asChild` prop이 `render` prop으로 변경, `onValueChange`가 `(value: string | null)` 시그니처
- **해결**: `asChild` → `render={<Component />}`, `onValueChange`에 null 가드 추가 (`v ?? ""` 또는 `if (!v) return`)
- **규칙**: shadcn/ui 최신 버전에서는 Radix UI 문서가 아닌 base-ui 문서를 참조. 컴포넌트 설치 후 실제 소스(`src/components/ui/`)의 prop 타입을 확인할 것.

## 2026-04-16 — Server Action 보안 패턴 (코드 리뷰 교훈)

- **증상**: 코드 리뷰에서 CRITICAL 4건 + HIGH 11건 발견 (DB 에러 노출, 소유권 미검증, unsafe 캐스트 등)
- **원인**: 빠르게 구현하며 "나중에 수정" 의식이 작동. Server Action은 공개 엔드포인트이므로 Client 검증만으로 불충분
- **해결**: 5가지 필수 패턴 확립
- **규칙**:
  1. catch 블록: `console.error("[tag]", err)` + 일반 메시지 반환 (DB 에러 절대 노출 금지)
  2. 소유권: `verifyOwnership` 헬퍼로 FK 체인 검증 (clientId → client.userId)
  3. JSONB 읽기: `as` 캐스트 금지 → Zod `safeParse`로 안전 변환
  4. 상태값: 서버에서 반드시 `z.enum().safeParse` 재검증 (TypeScript 타입 ≠ 런타임 보장)
  5. select: 항상 명시적 컬럼 프로젝션 (select() 호출 시 컬럼 객체 필수)

## 2026-04-16 — proxy.ts vs middleware.ts (Next.js 16.2)

- **증상**: `proxy.ts`로 내보낸 미들웨어가 작동하지 않음 (인증 보호 무효)
- **원인**: Next.js는 `src/middleware.ts` (또는 루트 `middleware.ts`)에서 `middleware` 함수를 export해야 인식. 파일명과 export명 둘 다 맞아야 함
- **해결**: `proxy.ts` → `src/middleware.ts`, `export async function proxy` → `export async function middleware`
- **규칙**: Next.js 미들웨어는 파일명 `middleware.ts` + export명 `middleware` 둘 다 고정. PRD/문서에서 "proxy" 용어를 사용하더라도 실제 구현은 Next.js 컨벤션을 따를 것.
