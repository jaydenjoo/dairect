# Studio Anthem 마이그레이션 맵

> **목적**: feat/redesign-studio-anthem 브랜치에서 진행되는 디자인 전환의
> **원본 → 신규 매핑표**. Epic 5~6 진행 중 놓친 기능 방지용.
>
> **작성**: 2026-04-24 (Epic 1 Task 1-3)
> **관련**: [`BRAND.md`](./BRAND.md) · [`../design_handoff_studio_anthem/README.md`](../design_handoff_studio_anthem/README.md)
>
> **범위**: 공개 영역 **완전 교체** + 대시보드 **리-스킨**.
> v3.2 잠금(signup/onboarding 404)은 유지.

---

## 1. 공개 영역 (`src/app/(public)/`)

### 1-1. 전면 교체 대상

| 현재 경로 | 신규 매핑 | 번들 참조 | DB/API 의존 | 주의사항 |
|-----------|-----------|-----------|-------------|----------|
| `src/app/page.tsx` (랜딩 `/`) | `<LandingA>` 섹션 합성 | `references/Landing-A-Light.html` | ❌ | 기존 8섹션 모두 교체 |
| `src/components/landing/nav.tsx` | `components/chrome/Nav.tsx` | 번들 snippets + CLAUDE Rule 1/2 | ❌ | **v3.2**: signup 링크 없음 유지 |
| `src/components/landing/footer.tsx` | `components/chrome/Footer.tsx` | Landing HTML footer | ❌ | **`/about#contact`** 링크 보존 필수 (2026-04-24 fix) |
| `src/components/landing/cta-section.tsx` | `components/sections/FinalCTA.tsx` | Landing `[09]` | ❌ | |
| `src/components/landing/portfolio-section.tsx` | `components/sections/Proof.tsx` | Landing `[06]` | ❌ | 3 case cards (Chatsio/Findably/AutoVox) |
| `src/components/landing/problem-section.tsx` | `components/sections/Manifesto.tsx` | Landing `[03]` | ❌ | 이중 언어 |
| `src/components/landing/service-section.tsx` | `components/sections/Services.tsx` | Landing `[04]` | ❌ | 4 steps + DIRECTED/EXECUTED 태그 |
| `src/components/landing/pricing-summary-section.tsx` | `components/sections/Pricing.tsx` | Landing `[07]` | ❌ | **`/pricing` 페이지 제거** + `#pricing` 앵커 통합 |
| `src/app/(public)/projects/page.tsx` | 동일 경로 유지 | `references/Projects.html` | ✅ Supabase projects | **DB fetch 로직 유지** |
| `src/app/(public)/projects/[id]/page.tsx` | 동일 경로 유지 | `CaseStudy` 컴포넌트 | ✅ Supabase projects | CaseStudyCover/Chapters/Outcome 구성 |
| `src/app/(public)/about/page.tsx` | 동일 경로 유지 | `references/About.html` | ✅ n8n contact webhook | **contact 폼 로직 이식** / `#contact` 앵커 유지 |

### 1-2. 삭제 (Epic 5 Task 5-3)

| 제거 대상 | 대체 | 링크 수정 필요 파일 |
|-----------|------|----------------------|
| `src/app/(public)/pricing/page.tsx` | `/#pricing` 앵커 | landing 내부 `/pricing` 참조 + `src/components/landing/*` 잔존 링크 + nav |

### 1-3. 잠금 유지 (v3.2 Task-S2b)

| 경로 | 현재 상태 | 목표 |
|------|-----------|------|
| `src/app/(public)/signup/page.tsx` | `notFound()` | 그대로 유지 (재디자인 적용 불필요) |
| `src/app/(public)/signup/signup-form.tsx` | 자산 보존 (미사용) | 그대로 유지 |
| `src/app/onboarding/page.tsx` | `notFound()` | 그대로 유지 |
| `src/app/onboarding/onboarding-form.tsx` | 자산 보존 | 그대로 유지 |

### 1-4. 시스템 페이지 — 스타일만 재적용

| 경로 | 처리 |
|------|------|
| `/privacy`, `/terms` | 타이포/토큰만 새로 (Fraunces 헤딩, Geist 본문, Pretendard 한글) |
| `/portal/[token]`, `/portal/invalid`, `/portal/layout.tsx` | Nav/Footer 새 chrome으로 교체, 내부 내용 기존 유지 |
| `/invite/[token]` | Nav/Footer 교체, accept-button 스타일 |
| `/login` | Nav/Footer 교체, 로그인 폼 스타일 재적용. **회원가입 CTA 없음 유지 (v3.2)** |
| `/demo/*` (10+ 페이지) | 대시보드 리-스킨(Epic 6) 후 동일 토큰 자동 반영 |
| `/offline` (PWA) | 간단 스타일만 새 토큰 |

---

## 2. 대시보드 (`src/app/dashboard/`) — 리-스킨 (Epic 6)

**전략**: 레이아웃/컴포넌트 구조 유지 + shadcn 토큰을 Studio Anthem으로 재매핑.

### 2-1. 토큰 재매핑 (Task 6-1)

| shadcn CSS var | 기존 값 | 신규 값 |
|----------------|---------|---------|
| `--background` | off-white `#F9F9F7` | canvas `#F5F1E8` |
| `--foreground` | gray-900 `#111827` | ink `#141414` |
| `--primary` | indigo `#4F46E5` | signal `#FFB800` |
| `--card` | white | paper `#FAF7F0` |
| `--border` | gray-200 | hairline `rgba(20,20,20,0.12)` |
| `--ring` | indigo | signal |
| `--muted` | gray-100 | dust 변환 |
| 기타 | — | BRAND.md 참조 |

### 2-2. 차트 색상 (Task 6-2)

| 현재 | 신규 (amber 톤) |
|------|------------------|
| `--chart-1~5` (indigo 계열) | signal + ink 명도 변주 5단계 |
| `src/app/dashboard/dashboard-charts.tsx` | 동일 코드, 토큰만 변경 |

### 2-3. Chrome (Task 6-3)

- 사이드바: 기존 dark (`gray-900`) → ink `#141414` 배경 + amber hover
- 상단 banner: 기존 white → paper `#FAF7F0` + 1px hairline bottom
- Workspace picker: **v3.2 단일 ws 텍스트 모드 유지**

### 2-4. 주요 컴포넌트 스팟 체크 (Task 6-4)

| 컴포넌트 | 영향 | 체크 포인트 |
|----------|------|-------------|
| KPI 4카드 (대시보드 홈) | shadow/border/typo 재매핑 | 4px hard shadow, Fraunces 숫자 |
| AI 주간 브리핑 | accent 배경 유지 | signal amber 강조 |
| 테이블 행 (리드/고객/프로젝트/견적/계약/청구) | 교차 배경 | paper vs canvas |
| 폼 필드 (견적/계약/청구/프로젝트/설정) | focus ring | amber |
| Select/Dialog/Dropdown (shadcn) | 기본 변형 | 토큰만 자동 반영 |
| Kanban view | 카드 스타일 | 1px hairline + 2px radius |

### 2-5. PDF 출력 (`src/lib/pdf/`) — 범위 외

- 견적/계약/청구 PDF 템플릿은 **별도 디자인 체계** (프린트 최적화)
- Epic 6 범위에서 제외. 필요 시 별도 Task.

---

## 3. 기타 영역

### 3-1. `src/app/layout.tsx` (루트)
- 폰트 로더 교체 (Epic 2 Task 2-2): DM Sans/JetBrains Mono 제거, Fraunces + Geist + Geist Mono 추가, Pretendard 유지
- `<body>` 클래스: `font-sans` → `font-sans` (변수만 교체)
- Film-grain SVG `body::before` 추가 (번들 지시)
- `serwist.tsx` PWA 관련 — 변경 없음

### 3-2. `src/app/globals.css`
- `@theme inline` 블록 전면 교체 (Epic 2 Task 2-1)
- shadcn 토큰 매핑은 대시보드 Epic 6에서 override

### 3-3. 폰트 자산
- `src/fonts/PretendardVariable.woff2` (localFont) — **유지**
- DM Sans, JetBrains Mono 로더 제거
- Fraunces, Geist, Geist Mono → `next/font/google` + `geist` npm 패키지

---

## 4. 체크리스트 (Epic 완료 시점별)

### Epic 2 완료
- [ ] globals.css Studio Anthem 토큰 반영
- [ ] fonts.ts 신규 폰트 로드
- [ ] layout.tsx film-grain + 폰트 변수 연결
- [ ] 기존 랜딩 시각 손상 허용 (Epic 3~4에서 복구)

### Epic 3 완료
- [ ] primitives 4종 (Button/Kicker/SerifDisplay/Hairline)
- [ ] motion 4종 (Reveal/LetterReveal/MaskReveal/MagneticCTA)
- [ ] WordmarkLogo Rule 1/2/3
- [ ] Nav (v3.2 signup 없음) + Footer (`/about#contact` 보존)

### Epic 4 완료
- [ ] 랜딩 8섹션 렌더
- [ ] Pricing 섹션에 기존 `/pricing` 3카드 통합

### Epic 5 완료
- [ ] `/projects` DB fetch 정상 (Chatsio 1건 확인)
- [ ] `/about` contact 폼 n8n 제출 성공
- [ ] `/pricing` 페이지 삭제 + 링크 전수 업데이트
- [ ] 시스템 페이지 타이포 재적용
- [ ] `/signup` `/onboarding` 404 회귀 없음

### Epic 6 완료
- [ ] shadcn 토큰 재매핑
- [ ] 차트 색상 amber 톤
- [ ] 대시보드 9개 서브 라우트 스팟 체크
- [ ] PDF 출력 깨지지 않음 (별도 시스템)

### Epic 7 완료
- [ ] `src/components/landing/*` 7파일 제거
- [ ] `docs/design-references/redesign-2026/` → `docs/archived/`로 이동
- [ ] E2E Phase 1~4 통과
- [ ] Lighthouse ≥ 92 mobile / ≥ 98 desktop
- [ ] main PR squash merge

---

## 5. 리스크 & 보존 사항

1. **Epic 2 완료 ~ Epic 4 완료 사이** 기존 랜딩 시각 손상 — main으로 switch 시 복구
2. **DB 연동**: `/projects` (Supabase projects 테이블) + `/about` (n8n contact webhook) — 이식 시 로직 보존 필수
3. **v3.2 잠금**: `/signup`, `/onboarding`, `/login` 회원가입 CTA 없음 — E2E로 회귀 확인
4. **Footer `/about#contact`**: 2026-04-24 fix(footer) 커밋의 핵심 — 새 Footer에도 적용
5. **PWA**: serwist.tsx, sw.ts, offline/page.tsx — 변경 없음
6. **대시보드 데이터 레이어**: Server Actions, Drizzle 쿼리, RLS 정책 — 변경 없음 (UI 스킨만)

---

## 6. 커밋 태그 컨벤션

- 구조 이관: `chore(redesign): ...`
- 디자인 토큰: `feat(redesign-tokens): ...`
- 컴포넌트: `feat(redesign/chrome): ...`, `feat(redesign/sections): ...`
- 라우트 교체: `feat(redesign/route): ...`
- 대시보드 리-스킨: `refactor(redesign/dashboard): ...`
- 문서: `docs(redesign): ...`
- 정리: `chore(redesign/cleanup): ...`
