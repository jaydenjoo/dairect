# Dairect v3.1 — 진행 현황

> 최종 업데이트: 2026-04-16
> 현재 위치: Phase 1 완료 → Phase 2 시작 전

## 전체 진행률

| Phase | 제목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 기반 설정 | ✅ 완료 | 100% |
| Phase 1 | 대시보드 핵심 | ✅ 완료 | 100% |
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

## Phase 1: 대시보드 핵심 ✅

- [x] **Task 1-1** — 대시보드 레이아웃 (사이드바 + 헤더 + 반응형 하단 탭바)
- [x] **Task 1-7** — 설정 페이지 (사업자 정보 + 견적서 기본값 + 수금 비율)
- [x] **Task 1-4** — 고객 CRM (목록 + 생성 모달 + 상세 + 메모 CRUD)
- [x] **Task 1-2** — 프로젝트 CRUD (목록 + 생성 모달 + 상세 + 상태 변경 + 소프트 삭제)
- [x] **Task 1-3** — 칸반 뷰 (4컬럼 + 뷰 전환 토글)
- [x] **Task 1-5** — 마일스톤 관리 (CRUD + 체크리스트 + 진행률 프로그레스 바)
- [x] **Task 1-6** — KPI 홈 대시보드 (카드 4개 + Bar/Pie 차트 + 활동 타임라인 + 마일스톤)

### 코드 리뷰 수정 내역 (Phase 1 전체)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| CRITICAL | DB 에러 메시지 클라이언트 노출 | console.error + 일반 메시지 반환 (5곳) |
| CRITICAL | clientId 소유권 미검증 | verifyClientOwnership 헬퍼 추가 |
| CRITICAL | deleteProjectAction isNull(deletedAt) 누락 | 가드 추가 |
| CRITICAL | updateProjectStatusAction Zod 미검증 | projectStatusSchema.safeParse 추가 |
| HIGH | JSONB unsafe `as` 캐스트 | Zod safeParse로 변환 |
| HIGH | select() 전체 컬럼 조회 | 명시적 컬럼 프로젝션 |
| HIGH | middleware setAll 비공식 패턴 | 공식 Supabase SSR 패턴 정렬 |
| HIGH | 날짜 포맷 미검증 | YYYY-MM-DD 정규식 + startDate≤endDate refine |
| HIGH | currentStatus prop 타입 string | ProjectStatus 타입 강화 |
| HIGH | IN (...) raw SQL | Drizzle inArray() 교체 |
| HIGH | ::int bigint 정밀도 손실 | ::bigint + Number() 변환 |
| HIGH | UTC/KST 날짜 오차 | toLocalDateStr() 로컬 날짜 |
| MEDIUM | ClientNotes revalidate 후 stale UI | useOptimistic 적용 |
| MEDIUM | LogoutButton push/refresh race | router.refresh()만 호출 |
| MEDIUM | generateMetadata 중복 호출 | React.cache() 적용 |
| MEDIUM | addNoteAction raw string 파라미터 | ClientNoteData DTO 적용 |
| MEDIUM | getUserId 중복 3파일 | src/lib/auth/get-user-id.ts 추출 |
| MEDIUM | optimistic 실패 시 롤백 없음 | dispatch 반대 액션으로 롤백 |
| MEDIUM | isEmpty 조건 매출 데이터 미포함 | monthlyRevenue + clientRevenue 체크 추가 |
| MEDIUM | tab 화이트리스트 하드코딩 | tabs 배열에서 파생 |
| MEDIUM | formatKRW 0 falsy 처리 | amount === null 명시 체크 |

## 현재 세션

- **위치**: Phase 1 완료
- **다음**: Phase 2 — Task 2-1 (견적서 생성기 수동 모드)
- **차단 요소**: Google OAuth Console 설정 (Jayden 직접)

## 검증 상태

```
✅ tsc       — PASS
✅ lint      — PASS
✅ build     — PASS (19 routes + /clients/[id] + /projects/[id] + Middleware)
✅ db:push   — PASS (13 tables)
```

## 기술 결정 기록

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-04-16 | Drizzle ORM (Prisma 대신) | 타입 안전 + 경량 + Supabase 호환 |
| 2026-04-16 | Pretendard npm 패키지 + local font | CDN 의존 제거, FOUT 방지 |
| 2026-04-16 | 글로벌 design-system.md 적용 안 함 | 로컬 DESIGN.md가 Single Source of Truth |
| 2026-04-16 | `dashboard/` 실제 세그먼트 | 라우트 그룹은 URL에 영향 없어서 `/projects` 경로 충돌 |
| 2026-04-16 | PORT=3700 유지 | 기존 dairect 포트 번호 유지 |
| 2026-04-16 | Direct URL (5432) for Drizzle | PgBouncer(6543)는 마이그레이션 트랜잭션 미지원 |
| 2026-04-16 | `prepare: false` postgres.js 옵션 | Supabase Pooler Transaction mode 호환 |
| 2026-04-16 | getUserId 공통 모듈 추출 | 4개 actions 파일에서 중복 제거 |
| 2026-04-16 | Server Action Zod 재검증 의무화 | Client→Server 경계에서 TypeScript 타입은 런타임 보장 없음 |
| 2026-04-16 | useOptimistic + 실패 롤백 패턴 | 즉시 UI 반영 + 서버 실패 시 원래 상태 복원 |

## 주요 파일 구조

```
src/
├── app/
│   ├── layout.tsx              ← Root (DM Sans + Pretendard + JetBrains Mono + Toaster)
│   ├── globals.css             ← DESIGN.md 토큰 ("Intelligent Sanctuary")
│   ├── page.tsx                ← 랜딩 Hero (placeholder)
│   ├── (public)/               ← 공개 7페이지
│   ├── dashboard/
│   │   ├── layout.tsx          ← Sidebar + Header
│   │   ├── page.tsx            ← KPI 대시보드 (차트 + 타임라인)
│   │   ├── dashboard-actions.ts
│   │   ├── dashboard-charts.tsx
│   │   ├── projects/           ← 프로젝트 CRUD + 칸반
│   │   ├── clients/            ← 고객 CRM + 메모
│   │   ├── settings/           ← 설정 (사업자 + 견적 기본값)
│   │   ├── estimates/          ← (Phase 2)
│   │   ├── contracts/          ← (Phase 2)
│   │   └── invoices/           ← (Phase 2)
│   └── auth/callback/route.ts
├── components/
│   ├── dashboard/ (sidebar, header, logout-button)
│   └── ui/ (button, input, label, badge, dialog, select, textarea, sonner)
├── lib/
│   ├── auth/get-user-id.ts     ← 공통 인증 헬퍼
│   ├── validation/ (settings, clients, projects, milestones)
│   ├── supabase/ (client, server)
│   └── db/ (schema, index, migrations/)
├── middleware.ts
└── fonts/PretendardVariable.woff2
```
