# Dairect v3.1 — 진행 현황

> 최종 업데이트: 2026-04-16
> 현재 위치: Phase 0 완료 → Phase 1 시작 전

## 전체 진행률

| Phase | 제목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 기반 설정 | ✅ 완료 | 100% |
| Phase 1 | 대시보드 핵심 | ⬜ 대기 | 0% |
| Phase 2 | 견적/계약/정산 + 리브랜딩 | ⬜ 대기 | 0% |
| Phase 3 | AI + 자동화 + 리드 CRM | ⬜ 대기 | 0% |
| Phase 4 | 고객 포털 + /demo + PWA | ⬜ 대기 | 0% |
| Phase 5 | SaaS 전환 준비 (옵션) | ⬜ 대기 | 0% |

## Phase 0: 기반 설정 ✅

- [x] **Task 0-1** — Next.js 16.2 프로젝트 생성 + 패키지 설치 + 폰트 + DESIGN.md 토큰 적용
- [x] **Task 0-2** — 라우트 구조 (공개 7 + 대시보드 8 + auth callback = 19 라우트)
- [x] **Task 0-3** — Supabase Auth + Google OAuth + middleware 인증 보호
- [x] **Task 0-4** — Drizzle ORM 스키마 13테이블 → Supabase DB push 완료
- [x] **코드 리뷰** — CRITICAL 2건 + HIGH 5건 수정 완료

### 코드 리뷰 수정 내역
| 심각도 | 이슈 | 수정 |
|--------|------|------|
| CRITICAL | proxy.ts 미들웨어 미작동 | `src/middleware.ts`로 이동 + `middleware` export |
| CRITICAL | Open Redirect 취약점 | `next` 파라미터에 `//` 프로토콜 상대 URL 차단 |
| HIGH | DATABASE_URL 런타임 가드 없음 | 비-널 단언 → throw Error 가드 |
| HIGH | leads FK 누락 | `convertedToProjectId` FK 추가 |
| HIGH | invoices/milestones updatedAt 없음 | 두 테이블에 `updatedAt` 컬럼 추가 |
| HIGH | Dashboard `<a>` 전체 페이지 리로드 | `next/link` `<Link>` 변환 |
| HIGH | OAuth 에러 무시 + Suspense fallback 없음 | 에러 상태 처리 + `fallback={null}` |

## 현재 세션

- **위치**: Phase 0 완료
- **다음**: Phase 1 — Task 1-1 (대시보드 레이아웃)
- **차단 요소**: Google OAuth Console 설정 (Jayden 직접 — Supabase Auth Provider에 Google Client ID/Secret 등록)

## 검증 상태

```
✅ tsc       — PASS
✅ lint      — PASS
✅ build     — PASS (19 routes + Middleware)
✅ db:push   — PASS (13 tables)
```

## 기술 결정 기록

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-04-16 | Drizzle ORM (Prisma 대신) | 타입 안전 + 경량 + Supabase 호환 |
| 2026-04-16 | Pretendard npm 패키지 + local font | CDN 의존 제거, FOUT 방지 |
| 2026-04-16 | 글로벌 design-system.md 적용 안 함 | 로컬 DESIGN.md가 Single Source of Truth |
| 2026-04-16 | `(dashboard)` → `dashboard/` 실제 세그먼트 | 라우트 그룹은 URL에 영향 없어서 `/projects` 경로 충돌 |
| 2026-04-16 | PORT=3700 유지 | 기존 dairect 포트 번호 유지 |
| 2026-04-16 | Direct URL (5432) for Drizzle | PgBouncer(6543)는 마이그레이션 트랜잭션 미지원 |
| 2026-04-16 | `prepare: false` postgres.js 옵션 | Supabase Pooler Transaction mode 호환 |

## 주요 파일 구조

```
src/
├── app/
│   ├── layout.tsx              ← Root (DM Sans + Pretendard + JetBrains Mono)
│   ├── globals.css             ← DESIGN.md 토큰 ("Intelligent Sanctuary")
│   ├── page.tsx                ← 랜딩 Hero (placeholder)
│   ├── (public)/               ← 공개 7페이지
│   ├── dashboard/              ← 비공개 8페이지 + layout (사이드바)
│   └── auth/callback/route.ts  ← OAuth 콜백
├── middleware.ts               ← /dashboard 인증 보호
├── lib/
│   ├── supabase/ (client.ts, server.ts)
│   └── db/ (schema.ts, index.ts, migrations/)
└── fonts/PretendardVariable.woff2
```
