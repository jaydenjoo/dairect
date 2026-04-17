# Dairect v3.1 — 진행 현황

> 최종 업데이트: 2026-04-17
> 현재 위치: Phase 2 > Task 2-6 완료 → Task 2-7 대기

## 전체 진행률

| Phase | 제목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 기반 설정 | ✅ 완료 | 100% |
| Phase 1 | 대시보드 핵심 | ✅ 완료 | 100% |
| Phase 2 | 견적/계약/정산 + 리브랜딩 | 🔄 진행 | 75% |
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

## Phase 2: 견적/계약/정산 + 리브랜딩 🔄

- [x] **Task 2-1** — 견적서 생성기 수동 모드 (목록 + 생성 폼 + 상세 + 상태 변경 + 삭제)
- [x] **Task 2-2** — 견적서 PDF 생성 + 미리보기 (Pretendard self-host + A4 템플릿 + 다운로드)
- [x] **Task 2-3** — 계약서 관리 (목록 + 생성 + 상세 + 상태 전환 + PDF 조항 11개)
- [x] **Task 2-4** — 청구서/정산 관리 (수동/견적서 자동 3분할 + 상태 전이 + 입금 확인 + 세금계산서 도우미 + PDF)
- [x] **Task 2-5** — 랜딩 메인 리브랜딩 (Nav + Hero 추상 대시보드 목업 + Problem + Service + Portfolio + PricingSummary + CTA + Footer)
- [x] **Task 2-6** — `/pricing` 상세 페이지 (3패키지 앵커 + 비교 표 semantic + FAQ native details + LandingNav 공용화)
- [ ] **Task 2-7** — `/about` + Contact 폼 (inquiries 테이블 확장)
- [ ] **Task 2-8** — `/projects` Bento Grid 상세 (is_public 연동)

### 코드 리뷰 수정 내역 (Task 2-4)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 실질 CRITICAL | 트랜잭션 내 `generateInvoiceNumber` MAX 중복 → 자동 3분할 항상 실패 | `offset` 파라미터 추가 + 루프 인덱스 전달 |
| HIGH | `toggleTaxInvoiceAction` 상태 검증 부재 (cancelled/미입금에서도 발행 표시 가능) | 소유권 + cancelled 차단 + `issued=true`는 paid만 허용 |
| HIGH | 0원 견적서로 자동 생성 시 0원 청구서 3건 발생 | `supplyAmount <= 0` 가드 |
| HIGH | 입금 확인 "감액 반영 가능" 오해 소지 | "합의된 실입금액 기록. 부분 입금은 별도 청구서 생성" 문구 |
| MEDIUM | `deleteInvoiceAction` WHERE에 userId 누락 | `and(eq(id, id), eq(userId, userId))` 방어 추가 |

### 코드/디자인 리뷰 수정 내역 (Task 2-5)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| HIGH | Problem h3 → h2 계층 역순 | 상단 h2 도입문 추가, 하단 h2 → p |
| HIGH | Service Bento Teaser h4 계층 스킵 | h4 → h3 승격 2곳 |
| HIGH | Footer `border-t` No-Line Rule 위반 | 그라데이션 divider로 교체 |
| HIGH | 다크 섹션 white/40 WCAG AA 미달 | white/60 이상으로 상향 (CTA + Footer) |
| HIGH | Portfolio 3열 그리드가 시안 4열 의도 누락 | `md:grid-cols-2 lg:grid-cols-4` + span 재배치 |
| MEDIUM | Service 연결선 inline style | `bg-foreground/[0.08]` Tailwind 클래스 |
| MEDIUM | Service 타임라인 `top-[100px]` | `top-[32px]` 원 중심 통과 |
| 옵션 C | Hero "3D 기기 목업" placeholder | 추상 대시보드 목업 (윈도우 크롬 + 사이드바 + KPI 3카드 + 차트 7바) |

### 코드/디자인 리뷰 수정 내역 (Task 2-6)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| HIGH | Nav `activeHref` 중복 href (서비스/소개 둘 다 `/about`) | `active: NavActiveId` id 기반 타입 안전 매칭 |
| HIGH | 비교 표 `<div>` grid 스크린리더 인식 불가 | `<table>` + `<thead>/<tbody>` + `<th scope>` semantic HTML |
| HIGH | MVP 열 강조 `primary/[0.03]` 육안 식별 불가 | 헤더 `primary/[0.08]` + 본문 `primary/[0.06]` 상향 |
| HIGH | 패키지 CTA 3개 모두 `/about#contact` 동일 | `/about?package={id}#contact` 쿼리 추가 |
| HIGH | 비교 표 한글 값에 `font-mono` | `font-medium` (Pretendard sans)로 교체 |
| MEDIUM | 비교 표 모바일 긴 라벨 잘림 | `overflow-x-auto` + `min-w-[560px]` |
| MEDIUM | Hero MVP 앵커 pre-highlighted 오인 | 3개 링크 동일 스타일 + hover만 강조 |
| MEDIUM | MVP scale `lg:` 이하 적용 안 됨 | `md:scale-[1.04]`로 breakpoint 하향 |
| MEDIUM | "정확한 금액..." 문구 중복 (Summary + Table) | Table 하단 제거, Summary만 유지 |

## 현재 세션 (2026-04-17)

- **완료**:
  - Task 2-4 구현 + 코드/보안 리뷰 5건 수정 + DB 마이그레이션 `0002_sturdy_true_believers.sql`
  - Task 2-5 구현 + 코드/UX 리뷰 8건 수정 (+ Hero 옵션 C 추상 대시보드 목업)
  - Task 2-6 구현 + 코드/UX 리뷰 9건 수정 + LandingNav 공용화
  - 커밋 2건: `5b15060` (Task 2-4) / `0b706c8` (Task 2-5/2-6)
- **다음**: Task 2-7 (/about 페이지 + Contact 폼 + inquiries 테이블 확장) 또는 Task 2-8 (/projects Bento 상세)
- **차단 요소**: 없음

## 검증 상태

```
✅ tsc       — PASS (0 errors)
✅ lint      — PASS (0 errors, Task 2-1 기존 경고 1개 잔존)
✅ build     — PASS (24 routes, invoices/pricing 추가)
✅ db:push   — PASS (14 tables, invoices UNIQUE 적용)
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
| 2026-04-17 | react-pdf 폰트 public/fonts/ self-host | CDN 장애 시 한글 깨짐 방지 (BusinessContinuity) |
| 2026-04-17 | PDFDownloadLink = anchor → buttonVariants className | HTML nested button invalid 회피 |
| 2026-04-17 | Server Action: 읽기 함수 try-catch 없음 | Next.js Dynamic Server Error 정상 흐름 보존 |
| 2026-04-17 | 계약서 상태 전이맵 서버 검증 | 법적 증빙 무결성 (signed → draft 역행 방지) |
| 2026-04-17 | 계약서 immutability는 참조 차단으로 완화 | 전자서명(Phase 3) 때 스냅샷 컬럼 추가 예정 |
| 2026-04-17 | `(userId, contractNumber/invoiceNumber)` UNIQUE + 23505 재시도 | MAX 기반 채번 경합 방어 |
| 2026-04-17 | `generateInvoiceNumber(tx, userId, offset)` offset 파라미터 | 트랜잭션 내 N회 호출 시 동일 MAX 반환 방어 (3분할 자동 생성) |
| 2026-04-17 | 청구서 연체는 쿼리 시점 계산 | `status='sent' && dueDate<today`로 cron 불필요 |
| 2026-04-17 | 세금계산서 발행 플래그는 `paid` 상태만 허용 | 세무 감사 증빙 무결성 |
| 2026-04-17 | 공개 `/` 랜딩 8섹션 구조 | DESIGN.md "Intelligent Sanctuary" — No-Line Rule + Tonal Layering |
| 2026-04-17 | LandingNav `active: NavActiveId` id 기반 매칭 | href 중복(`/about` 2개) 시 동시 강조 방지 |
| 2026-04-17 | 비교 표 semantic `<table>` + `scope` | 접근성 보강, No-Line Rule은 교차 배경으로 유지 |
| 2026-04-17 | FAQ native `<details>` (JS 없음) | Server Component 유지 + 기본 접근성 확보 |

## 주요 파일 구조

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css             ← DESIGN.md 토큰
│   ├── page.tsx                ← 랜딩 메인 (Task 2-5)
│   ├── (public)/
│   │   ├── about/
│   │   ├── pricing/page.tsx    ← /pricing 상세 (Task 2-6)
│   │   ├── projects/
│   │   ├── demo/
│   │   ├── login/
│   │   ├── privacy/
│   │   └── terms/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx            ← KPI 대시보드
│   │   ├── dashboard-actions.ts
│   │   ├── projects/
│   │   ├── clients/
│   │   ├── settings/
│   │   ├── estimates/
│   │   ├── contracts/
│   │   └── invoices/           ← Task 2-4
│   │       ├── actions.ts      ← CRUD + 3분할 + 상태 전이 + 입금 + 세금계산서
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── invoice-actions.tsx
│   │           ├── tax-invoice-helper.tsx
│   │           └── pdf-buttons.tsx
│   └── auth/callback/route.ts
├── components/
│   ├── landing/                ← Task 2-5 신규
│   │   ├── nav.tsx             ← Task 2-6에서 공용화 (id 기반 active)
│   │   ├── problem-section.tsx
│   │   ├── service-section.tsx
│   │   ├── portfolio-section.tsx
│   │   ├── pricing-summary-section.tsx
│   │   ├── cta-section.tsx
│   │   └── footer.tsx
│   ├── pricing/                ← Task 2-6 신규
│   │   ├── package-detail.tsx
│   │   ├── comparison-table.tsx
│   │   └── pricing-faq.tsx
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── auth/get-user-id.ts
│   ├── validation/ (settings, clients, projects, milestones, estimates, contracts, invoices)
│   ├── supabase/ (client, server)
│   ├── db/ (schema, index, migrations/)
│   └── pdf/
│       ├── estimate-pdf.tsx
│       ├── contract-pdf.tsx
│       └── invoice-pdf.tsx     ← Task 2-4
├── middleware.ts
├── fonts/PretendardVariable.woff2
└── public/fonts/               ← react-pdf용 OTF
    ├── Pretendard-Regular.otf
    ├── Pretendard-Medium.otf
    ├── Pretendard-SemiBold.otf
    └── Pretendard-Bold.otf
```
