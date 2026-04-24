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
