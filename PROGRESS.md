# Dairect v3.1 — 진행 현황

> 최종 업데이트: 2026-04-17
> 현재 위치: Phase 2 > Task 2-3 완료 → Task 2-4 대기

## 전체 진행률

| Phase | 제목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 기반 설정 | ✅ 완료 | 100% |
| Phase 1 | 대시보드 핵심 | ✅ 완료 | 100% |
| Phase 2 | 견적/계약/정산 + 리브랜딩 | 🔄 진행 | 45% |
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
- [ ] **Task 2-4** — 청구서/정산 관리
- [ ] **Task 2-5** — 리브랜딩 랜딩 페이지

### 코드 리뷰 수정 내역 (Task 2-2)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| CRITICAL | getUserCompanyInfo try-catch 없음 | 5패턴 준수 적용 |
| CRITICAL | PDFDownloadLink(anchor) 안에 Button 중첩 | buttonVariants className으로 스타일만 적용 |
| CRITICAL | pdfDocument 매 렌더 재생성 | useMemo 메모이즈 |
| CRITICAL | pdfData 타입 어노테이션 누락 | `const pdfData: EstimatePdfData = {...}` |
| HIGH | Pretendard CDN 의존성 | public/fonts/ self-host (Regular/Medium/SemiBold/Bold) |
| HIGH | 파일명 sanitize 누락 | `[^A-Za-z0-9_-]` → `_` 치환 |

### 코드 리뷰 수정 내역 (Task 2-3)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| HIGH | 채번 경합 (UNIQUE 제약 없음) | `unique(userId, contractNumber)` DB 제약 + 23505 재시도 |
| HIGH | 상태 역행 가능 (signed → draft 등) | `ALLOWED_TRANSITIONS` 맵 서버 검증 |
| HIGH | 서명 후 삭제 서버 가드 누락 | `status === "draft"` 체크 |
| MEDIUM | 견적서 삭제 시 계약서 orphan | 연결 계약서 존재 시 삭제/accepted 해제 차단 |
| MEDIUM | bidi/zero-width 문자 조항 변조 | specialTerms transform으로 제거 |
| LOW | `ipOwnership as IpOwnership` 캐스트 | safeParse + fallback |
| MINOR | PDF liabilityLimit null 시 말 안 됨 | null guard + 대체 문구 |
| MINOR | 빈 입력 → 0 강제 | state `number \| ""` + placeholder |

## 현재 세션 (2026-04-17)

- **완료**:
  - Task 2-2 구현 + 코드 리뷰 6건 수정
  - Task 2-3 구현 + 코드 리뷰 8건 수정
  - DB 마이그레이션 `0001_nasty_stingray.sql` (contracts UNIQUE 제약)
- **다음**: Task 2-4 (청구서/정산 관리) 또는 Task 2-5 (리브랜딩 랜딩)
- **차단 요소**: 없음

## 검증 상태

```
✅ tsc       — PASS (0 errors)
✅ lint      — PASS (0 errors, 경고 1개 기존 Task 2-1 잔존)
✅ build     — PASS (21 routes)
✅ db:push   — PASS (14 tables, contracts UNIQUE 적용)
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
| 2026-04-17 | `(userId, contractNumber)` UNIQUE + 23505 재시도 | MAX 기반 채번 경합 방어 |

## 주요 파일 구조

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css             ← DESIGN.md 토큰
│   ├── (public)/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx            ← KPI 대시보드
│   │   ├── dashboard-actions.ts
│   │   ├── projects/
│   │   ├── clients/
│   │   ├── settings/
│   │   ├── estimates/          ← 목록 + 생성 + 상세 + PDF
│   │   │   ├── actions.ts      ← + getUserCompanyInfo (Task 2-2)
│   │   │   └── [id]/
│   │   │       └── pdf-buttons.tsx   ← Task 2-2
│   │   ├── contracts/          ← Task 2-3 신규
│   │   │   ├── actions.ts      ← CRUD + 상태 전이맵 + 23505 재시도
│   │   │   ├── page.tsx        ← 목록
│   │   │   ├── new/            ← 생성 폼
│   │   │   └── [id]/
│   │   │       ├── page.tsx    ← 상세 (당사자/조건/특약)
│   │   │       ├── contract-actions.tsx
│   │   │       └── pdf-buttons.tsx
│   │   └── invoices/           ← (Task 2-4)
│   └── auth/callback/route.ts
├── components/
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── auth/get-user-id.ts
│   ├── validation/ (settings, clients, projects, milestones, estimates, contracts)
│   ├── supabase/ (client, server)
│   ├── db/ (schema, index, migrations/)
│   └── pdf/                    ← Task 2-2/2-3
│       ├── estimate-pdf.tsx    ← Pretendard Font.register + A4 템플릿
│       └── contract-pdf.tsx    ← 법적 조항 11개 + 서명란
├── middleware.ts
├── fonts/PretendardVariable.woff2  ← 웹 UI용
└── public/fonts/                   ← react-pdf용 OTF (Task 2-2)
    ├── Pretendard-Regular.otf
    ├── Pretendard-Medium.otf
    ├── Pretendard-SemiBold.otf
    └── Pretendard-Bold.otf
```
