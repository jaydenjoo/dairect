# Dairect — 프로젝트 CLAUDE.md

> AI 개발 대행 서비스 사이트 + 프리랜서 PM 대시보드
> 보안등급: 🟡 부분 보안 (고객 비즈니스 데이터 + 정산 정보)
> 포트: localhost:3700

## 이중 구조 아키텍처
- **공개 영역** (`/`): 리브랜딩 랜딩 + /projects + /pricing + /about + /demo
- **비공개 영역** (`/dashboard`): 프리랜서 PM 대시보드 (프로젝트→견적→계약→정산)

## 기술 스택
- Next.js 16.2 (Turbopack) + Tailwind CSS 4 + shadcn/ui
- Supabase (DB + Auth + Storage) + Drizzle ORM
- Recharts (차트) + @react-pdf/renderer (PDF)
- Zod (입력 검증) + Claude API (Phase 3, AI)

## 디자인 시스템
- **DESIGN.md** ("The Intelligent Sanctuary") — `docs/design-references/redesign-2026/DESIGN.md`
- **글로벌 design-system.md 적용 금지** — 로컬 DESIGN.md가 Single Source of Truth
- Primary: Indigo `#4F46E5` / Surface: `#F9F9F7` / Dark: `#111827`
- 폰트: DM Sans(영문) + Pretendard(한글) + JetBrains Mono(코드)
- No-Line Rule: 1px 솔리드 테두리 금지, 배경 톤 전환으로만 경계 표현
- 순수 검정(#000) 금지 → gray-900 #111827

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
- PRD: docs/PRD.md (v3.1)
- 디자인: docs/design-references/redesign-2026/DESIGN.md
- 진행: PROGRESS.md

## Context Loading
```
@CLAUDE.md → @PROGRESS.md → 작업 시작
```
