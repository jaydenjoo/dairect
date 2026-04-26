# Dairect — 프로젝트 CLAUDE.md

> AI 개발 대행 서비스 사이트 + 프리랜서 PM 대시보드
> 보안등급: 🟡 부분 보안 (고객 비즈니스 데이터 + 정산 정보)
> 포트: localhost:3700



## ⚠️ AI 응답 검증 규칙 (최우선 - 모든 응답 전 자기 점검)

### 검증 3원칙
1. **UI/메뉴 질문 = 캡처 우선**: UI/메뉴/플랫폼/도구의 변경 가능한 정보는 추측 금지. 화면 캡처 또는 정확한 메뉴명을 먼저 요청한 후 답변.
2. **공식 문서 날짜 명시**: 인용 시 "[서비스명] 공식 문서 YYYY-MM-DD 기준" 형식으로 업데이트 날짜 명시.
3. **확신등급 표시 의무**: 모든 답변 끝에 다음 중 하나 표시
   - 🟢 공식 문서로 확인됨
   - 🟡 추정·기존 지식 기반
   - 🔴 캡처/추가 정보 필요

### 확증편향 절대 금지
- 검색 결과 중 기존 지식과 일치하는 부분만 선택 사용 금지
- 기존 지식 vs 검색된 새 정보 충돌 시 → 무조건 새 정보 우선
- "검색 1회 = 학습 완료" 자체 선언 금지
- "검증 완료" 표시 전 필수 점검: (a) 업데이트 날짜 (b) 변경된 구조 (c) 구버전 차이

### 정보 부족 시 명시적 질문
- 모르는 것은 "정보가 부족합니다"라고 명시
- 추측으로 메꾸지 않기
- UI 관련은 화면 캡처 없이는 추측 답변 절대 금지

### 본 규칙의 발동 조건 (모든 답변에 자동 적용)
- 외부 도구/플랫폼 메뉴, 사용법, 가격, 정책 관련 답변
- "최신 정보로 알려줘", "지금 어떻게 되어있어" 같은 시점 의존 질문
- 변경 가능성이 있는 모든 정보 (법령, 가격, UI, 기능, API 등)

## 이중 구조 아키텍처
- **공개 영역** (`/`): 리브랜딩 랜딩 + /projects + /pricing + /about + /demo
- **비공개 영역** (`/dashboard`): 프리랜서 PM 대시보드 (프로젝트→견적→계약→정산)

## 기술 스택
- Next.js 16.2 (Turbopack) + Tailwind CSS 4 + shadcn/ui
- Supabase (DB + Auth + Storage) + Drizzle ORM
- Recharts (차트) + @react-pdf/renderer (PDF)
- Zod (입력 검증) + Claude API (Phase 3, AI)

## 디자인 시스템 — Studio Anthem (2026-04-24 전환)
- **BRAND.md** ("The Studio Anthem") — [`docs/design-references/redesign-2026-studio-anthem/BRAND.md`](docs/design-references/redesign-2026-studio-anthem/BRAND.md)
- **번들 원본**: [`docs/design-references/design_handoff_studio_anthem/`](docs/design-references/design_handoff_studio_anthem/)
- **글로벌 design-system.md 적용 금지** — 로컬 BRAND.md가 Single Source of Truth
- Palette: Canvas `#F5F1E8` / Paper `#FAF7F0` / Ink `#141414` / Signal(amber) `#FFB800`
- 폰트: Fraunces(serif, display) + Geist(sans, UI) + Geist Mono(labels) + Pretendard(한글)
- 1px hairlines / 4px hard shadows (sharp, offset) / 12-col asymmetric grid
- Forbidden: indigo, violet, purple, blue, teal, soft/blur shadow, pills, glassmorphism
- 이전: "The Intelligent Sanctuary" (Indigo) ⛔ — [`docs/design-references/redesign-2026/DESIGN.md`](docs/design-references/redesign-2026/DESIGN.md)

## 폴더 규칙
- `src/app/(public)/` — 공개 영역 라우트
- `src/app/(dashboard)/` — 비공개 영역 라우트
- `src/components/` — UI 컴포넌트 (landing/, dashboard/, pricing/, about/, shared/, ui/)
- `src/lib/` — 유틸 (db/, auth/, pdf/, validation/, utils/)
- `src/types/` — 타입 정의

## DB
- Supabase PostgreSQL + Drizzle ORM
- RLS 필수 (user_id 기반 격리)
- 12 테이블: users, user_settings, clients, client_notes, leads, projects, milestones, estimates, estimate_items, contracts, invoices, activity_logs
- 채번: EST-YYYY-NNN / CON-YYYY-NNN / INV-YYYY-NNN
- ⚠️ **MCP `apply_migration` 사용 시 반드시 `pnpm db:generate` + noop marker 후속** — 상세: [`docs/db-migrations-workflow.md`](docs/db-migrations-workflow.md)

## 검증 명령
```bash
pnpm tsc --noEmit && pnpm lint && pnpm build && pnpm db:check
```

## 핵심 참조
- PRD: docs/PRD.md (v3.1) + docs/PRD-v3.2-single-user.md
- 디자인 (브랜드): docs/design-references/redesign-2026-studio-anthem/BRAND.md
- 디자인 (번들): docs/design-references/design_handoff_studio_anthem/
- 마이그레이션: docs/design-references/redesign-2026-studio-anthem/MIGRATION-MAP.md
- 진행: PROGRESS.md

## Context Loading
```
@CLAUDE.md → @PROGRESS.md → 작업 시작
```
