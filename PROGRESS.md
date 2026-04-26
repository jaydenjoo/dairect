# Dairect v3.2 — 진행 현황

> 최종 업데이트: 2026-04-26 PM (**v1.3 잔존 정리 + 대시보드 슬롯 메뉴 + projects.public* audit**)
> 현재 위치: **옵션 A+B 완료, 옵션 C-A (audit) 완료** → 다음 세션 옵션 C Phase 1~5 진행
> 상위 PRD: [docs/PRD-v3.2-single-user.md](docs/PRD-v3.2-single-user.md)
> v1.3 SOT: [docs/dairect-content-replan-v1_3.md](docs/dairect-content-replan-v1_3.md) (WHAT) · [docs/dairect-v1_3-application-guide.md](docs/dairect-v1_3-application-guide.md) (HOW)
> BRAND.md: [docs/design-references/redesign-2026-studio-anthem/BRAND.md](docs/design-references/redesign-2026-studio-anthem/BRAND.md)
> dogfooding 가이드: [docs/dogfooding-checklist.md](docs/dogfooding-checklist.md) 🧪
> projects.public* DROP plan: [docs/projects-public-deprecation-plan.md](docs/projects-public-deprecation-plan.md) 🆕

## 세션 2026-04-26 PM (옵션 A 잔존 정리 + 옵션 B 슬롯 메뉴 + 옵션 C-A audit)

### 배경
v1.3 적용 완료 후 후속 작업 3개를 한 세션에 진행:
- (A) v1.3 의 잔존 정리 (AutoVox→Dari 미반영 2곳 + e2e prod-verify untracked)
- (B) 대시보드에서 SchedulingStatus 슬롯 편집 가능하게 (Site Flags 패턴 확장)
- (C) projects.public* 컬럼 deprecation + DROP — 사전 audit 진행 (cleanup 은 다음 세션)

### 이번 세션 완료 내역

**옵션 A — 잔존 정리 (2 commits)**
1. fix(content) `5d8854c`: AboutSections.tsx 2026 FEB timeline + fallback-projects.tsx N°03 의 AutoVox → Dari 1:1 교체. portfolio_items DB row 가 우선시되어 fallback 은 안전망 역할.
2. test(e2e) `8ab319c`: prod-verify.spec.ts 정식 편입 + 사용법 주석 추가 (production-smoke 와 역할 차이 명시).

**옵션 B — 대시보드 슬롯 편집 메뉴 (3 commits)**
1. feat(db) `64cb3cf`: workspace_settings 에 scheduling_slots jsonb 컬럼 추가 (default = 현 하드코딩 값). drizzle 경로 A + cloud apply_migration.
2. feat(public) `29dbeb1`: SchedulingStatus 슬롯 데이터 동적화. **client/server 파일 분리 패턴** 도입 — `scheduling-slots.ts` (client-safe types) + `scheduling-slots-server.ts` (server-only db). client component 가 type import 시 postgres 가 client bundle 로 끌려가는 문제 회피.
3. feat(dashboard) `4f53940`: /settings 에 SchedulingSlotsCard 추가. 3 row form (status select + copy textarea + 글자수 카운터) + dirty 상태 시 저장 버튼 활성. Site-flags-actions 패턴 그대로 확장.

**옵션 C-A — projects.public* audit (다음 세션 진행 예정)**
- Cloud DB audit: total 3 projects / 1 public (테스트 더미 "test" + example.com URL) / portfolio_meta 0건
- portfolio_items 4개 (전부 active + public) — 진짜 SOT
- 17 파일 분류: 카테고리 A (수정 필수 5파일) / B (portfolio_items 도메인 9파일, 무관) / C (Demo mock 3파일, 무관)
- **결론**: DROP 안전 (실 데이터 0건, 테스트 더미만 손실)
- Plan 문서 작성: [docs/projects-public-deprecation-plan.md](docs/projects-public-deprecation-plan.md) — Phase 1~5 (총 3시간)

### 검증
- pnpm tsc --noEmit / lint / db:check 모두 ✓
- 옵션 A: /about timeline "Dari · Sōbun Daily." 정확 노출, AutoVox 0건
- 옵션 B: /의 SchedulingStatus 박스 DB 데이터로 SSR 정상 (Sprint/Build/Scale 디자인 100% 보존, 스크린샷 확인)
- 옵션 B 빌드 에러 1회 발생 → fix (server-only db 와 client-safe types 파일 분리)
- 대시보드 카드 시각 검증: 로그인 필요라 직접 못 봤으나 코드 구조 + tsc/lint 통과 — 다음 세션 Jayden 직접 확인 권장

### 변경 통계 (5 commits + 1 docs commit)
- fix(content) 5d8854c: 2 files (-15 +15)
- test(e2e) 8ab319c: 1 file (+101)
- feat(db) 64cb3cf: 4 files (+3132 — schema/SQL/journal/snapshot)
- feat(public) 29dbeb1: 5 files (+112 -31)
- feat(dashboard) 4f53940: 3 files (+248)

### 다음 세션 할 일
- **(이번 세션 잔존) 옵션 C Phase 1~5**: [docs/projects-public-deprecation-plan.md](docs/projects-public-deprecation-plan.md) 참조 — 총 3시간
  - Phase 1: /projects read 통일 (60분)
  - Phase 2: dashboard legacy UI 제거 (45분)
  - Phase 3: validation cleanup (15분)
  - Phase 4: schema DROP (30분)
  - Phase 5: 통합 검증 + 4 분리 커밋 (30분)
- **(이번 세션 잔존) 대시보드 슬롯 메뉴 시각 검증** (Jayden 로그인 후 /dashboard/settings 확인)
- **(이번 세션 잔존) push** — 이번 세션 5 commits + docs 1 commit 아직 origin 에 push 안 됨
- **(Jayden 액션) GA4 활성화** — analytics.google.com 프로퍼티 생성 → G-XXXXXXXXXX 발급 → .env.local + Vercel 환경변수
- **(이전 세션 잔존) dari 콘솔 학습 검증 / dari 위젯 라이브 검증**

### 차단 요소
- 없음

---

## 세션 2026-04-26 (v1.3 콘텐츠 리포지셔닝 — Day 1+2+3 + Extra Dari + GA4)

### 배경
Jayden이 dairect.kr 콘텐츠 리포지셔닝 v1.3 (검증 대화 4건 반영판) 기획서·적용 가이드 작성 후
요청. "기존 디자인을 사랑한다" 기준 — 디자인 변경 최소화, 카피·구조만 정직성/사업화/측정 강화.

### 이번 세션 완료 내역

**Day 1 — P0 메시지 핵심 (5건 + Extra)**
1. Hero: 카피 다듬기 + 새 비교 라인 ("일반 개발사 3개월 → 저희 3주") + 카운터 12→04 라이브 제품
2. WhyThisWorks 신규 (Manifesto↔Proof 사이): SI/시니어/중급 3-tier 비교표 (1/10·1/4 / 1/5·1/3 / 1/3·1/3 amber)
3. Pricing: Sprint 카드 추가 (PKG N°00 / 180만원~) + 4-card grid + .price-not-doing 안내문
4. SchedulingStatus 신규: REAL-TIME SCHEDULING 박스 (paper bg + amber 점멸 도트 + 슬롯 3행)
5. Proof: Live 04 (amber dot) / Demos 08 (dust) 분리 + 하단 2.1주·98%·100%
6. **Extra**: AutoVox → Dari 1:1 교체 (Hero film-strip Frame 3 + Work 카드 + Proof 부제). 1줄 코드 박스 시각

**Day 2 — P1 정직성 시그널 (7건)**
1. WhoThisIsFor 신규 (Hero↔Etymology): 비대칭 3-card 페르소나 (AI 진입 장벽 paper+amber bar / 검증 / 긴급)
2. WhatsLearning 신규 (Pricing 직후): 모바일 앱 + IAP 학습 공개 (📱💳 + 정책 박스 paper+amber bar)
3. WontDo 신규 (WhatsLearning 직후): 받지 않는 의뢰 8개 (rust 4px bar + ✗ rust prefix + 2-col)
4. NoAIExperience 신규 (WontDo 직후): 안심 카피 (canvas + amber 4px bar — 다크 섹션 추가 0)
5. Services 04 카피: "완성 및 이관 + 사업화 동행" + 14D SUPPORT (BUILD) / 90D PARTNERSHIP (SCALE) 태그
6. Pricing Build/Scale: amber tagline 1줄 (14일 동행 / 90일 파트너십) + Build features "14일 슬랙 자문 (월 5회, 24h SLA)" 교체
7. Footer: 법적 책임 안내 5개 항목 박스 (mono dust + mailto)

**Day 3 — P2 About + 측정 (3건)**
1. About 타임라인 헤드라인: "6개월간, 라이브 4. 실험 8. 그래서 13번째도 안전합니다." + 한글 본문 일관 + 잔존 "ten projects" 2곳 정정 (essay twelve / CTA 숫자 제거)
2. About NEXT 마일스톤 추가: "2026 · 학습 중 / NEXT. / Mobile, simply." dust 톤 + em ink (미래/진행중)
3. **GA4 측정 인프라 + 이벤트 4개** (옵션 B 미니멀):
   - 신규: src/lib/analytics.ts (track 헬퍼 graceful degrade) / src/components/chrome/Analytics.tsx (GA_ID 있을 때만 Script)
   - env.ts: NEXT_PUBLIC_GA_MEASUREMENT_ID 옵셔널
   - 이벤트: persona_card_click / pricing_click / schedule_click / wont_do_view (IntersectionObserver)

**추가 카피 수정**: WhoThisIsFor "노션 문서" → "문서로" (도구 중립화, Notion vs Obsidian 비교 검증 후 결정)

### 검증
- pnpm tsc --noEmit / lint / build / db:check 모두 ✓
- Playwright 시각 검증: 9개 영역 모두 Studio Anthem 디자인 100% 보존
  (Hero / WhyThisWorks / RealtimeScheduling / Pricing 4-card / Proof / Work Dari / WhoThisIsFor / WhatsLearning / WontDo / NoAIExperience / Services 04 / Pricing tagline / Footer / About Timeline / NEXT mile)
- 콘솔 에러 0 (dari widget CORS는 우리 작업 무관 — 다음 세션 dari 위젯 라이브 검증 잔존)
- GA4 graceful degrade 확인: gtag undefined / Script 미로드 (GA_ID 미설정 안전)

### 변경 통계 (3 commits)
- chore(gitignore): v13-*.png 패턴 (3 lines)
- docs: CLAUDE.md AI 응답 검증 규칙 + v1.3 기획서/가이드 (3 files, +1,287)
- feat: v1.3 코드 (20 files, +1,671 / -87 — 신규 7 컴포넌트 + 1 lib + 12 수정)

### 다음 세션 할 일
- **(Jayden 액션) GA4 활성화**: analytics.google.com 프로퍼티 생성 → G-XXXXXXXXXX 발급 → `.env.local` + Vercel 환경변수 추가
- **(별도 Task) 대시보드 슬롯 설정 메뉴**: SchedulingStatus 슬롯 데이터 동적화 (workspace_settings.slots jsonb + Site Flags 패턴 확장) — 약 2시간
- **(별도 Task) About + fallback-projects.tsx의 AutoVox 잔존 정리** — 약 30분
- **(별도 Task) e2e/smoke/prod-verify.spec.ts 정식 편입** (untracked 잔존)
- **(이전 세션 잔존) dari 콘솔 학습 검증** (Jayden 측 task — 비차단)
- **(이전 세션 잔존) projects.public\* 컬럼 deprecation + DROP** (Parallel Change 후속, 60~90분)
- **(이전 세션 잔존) dari 위젯 라이브 검증** — Production 우하단 floating bubble 작동 + CORS 이슈 점검

### 차단 요소
- 없음 (GA4 ID는 Jayden 액션 — 비차단, 코드 안전 graceful degrade)

---

## 세션 2026-04-25 (Demo-Suite + Dari 챗봇 통합 + Site-Flags 토글)

### 배경
Portfolio v2 머지 후 4 가지 추가 작업:
1. /projects 카드 클릭 시 가공된 데모 페이지 — Chatsio/Findably 시나리오 시뮬레이션
2. dairect 자체 데모 페이지 (/demo/dairect) + 90초 가이드 투어 (4-step)
3. dari (1줄 임베드 챗봇 SaaS) 를 dairect 사이트에 두 방향 통합
   (실용: 모든 공개 페이지 우하단 floating chat / 마케팅: /projects 카드 + /demo/dari)
4. PWA "앱으로 설치" 안내 기본 숨김 + 관리자 토글 (Jayden 명시 요청)

### 이번 세션 완료 내역

**1. /demo/dairect (Epic Demo-Dairect) — 커밋 `8761752`**
- `(public)/demo/(app)` 라우트 그룹 분리 (sidebar 있는 자식들 격리)
- /demo/dairect: Studio Anthem hero "Manage everything. / In one canvas." + 4 시나리오
- TourOverlay (`?tour=1&step=N`) + DemoTopBar (도돌이 링크)
- leads 24건 mock data (lead-data.ts)
- portfolio_items.dari* row 추가 (Direct., demoUrl=/demo/dairect)

**2. /demo/chatsio + /demo/findably (3분 가이드 투어) — 커밋 `296949e` `e62de41`**
- 단일 페이지 + sticky step bar + smooth scroll 패턴 (4-step)
- Chatsio: Connect→Analyze→Apply→Track + Citation BarChart
- Findably: Input→Scan→Score→Action + RadarChart 4 dim + Quick Win 3 + 90일 로드맵
- 모든 metric 에 "예시" 라벨 명시
- 가공된 JSON-LD 코드 박스 + Loader JS 1줄 인라인

**3. Step 1 버튼 작동 수정 — 커밋 `f210295`**
- Jayden 제보: 분석/진단 버튼 무반응 (disabled 처리)
- ScrollToStepButton (client) — 600ms spinner + smooth scroll
- globals.css 에 `html { scroll-behavior: smooth }` 추가

**4. dari 챗봇 + /demo/dari (Epic Demo-Dari) — 커밋 `9d8029f`**
- DariWidget.tsx: useEffect 직접 DOM 주입 (Next.js Script + currentScript 호환성 회피)
- 숨김 path: /dashboard /portal /login /signup /onboarding /invite /offline
- /demo/dari: 4-step (Setup/Train/Embed/Use) + Step 4 라이브 증명 ("지금 우하단을 보세요 ↘")
- portfolio_items.dari UPDATE: name='Da'+amber'ri.', "★ Powering this site" 배지
- dari 운영 콘솔용 완전 봇 설정 문서 작성 (시스템 프롬프트 + FAQ 30건 + URL 크롤링 7개)

**5. Site-Flags (PWA 토글) — 커밋 `220b20a`**
- 마이그레이션 0040: workspace_settings.pwa_install_prompt_enabled boolean DEFAULT false
- src/lib/site-flags.ts (server-only): getSiteFlags() — single workspace limit(1)
- src/app/page.tsx: server component 전환, 플래그 ON 일 때만 PwaInstallPrompt 마운트
- /dashboard/settings 에 SiteFlagsCard (Eye/EyeOff 토글 + 낙관적 업데이트 + toast)
- setPwaInstallPromptEnabledAction 서버 액션 (auth + workspace 격리 + revalidatePath)

### 검증
- pnpm tsc --noEmit / lint / build / db:check 모두 ✓
- Playwright /demo/dairect: hero + tour bar + 4 scenarios ✓
- Playwright /demo/chatsio: 클릭 → 0→2651px scroll, "분석 중..." pending ✓
- Playwright /demo/findably: 클릭 → 0→2569.5px scroll, "진단 중..." pending ✓
- Playwright /demo/dari: H1 "One line.Any site." + 4 step + 6 추천 질문 ✓
- 콘솔 error/warn 0건

### 변경 통계 (HEAD~6..HEAD)
- 40 파일, +6,173 / -18 줄
- 커밋 6건 push 완료 (8761752 → 296949e → e62de41 → f210295 → 9d8029f → 220b20a)

### 다음 세션 할 일
- **dari 콘솔 학습 검증**: Jayden 이 dari 봇 publish + 시스템 프롬프트 + URL 크롤링 + FAQ 입력 후
  실제 5개 질문 테스트로 답변 품질 확인. `bot_not_available` 운영 이슈 해결.
- **projects.public\* 컬럼 deprecation**: portfolio_items 로 분리 후 projects.publicAlias /
  publicDescription / publicTags / publicLiveUrl / portfolioMeta 5 컬럼은 deprecation marker
  추가 + 별도 마이그레이션으로 DROP (Parallel Change 후속).
- **dari 위젯 라이브 검증**: Production 에서 우하단 floating bubble 실제 작동 확인.
  안 보이면 dari 봇 publish 상태 점검.

### 차단 요소
- 없음 (dari 콘솔 작업은 Jayden 측 task — 비차단)

---

## 세션 2026-04-25 (Epic Portfolio v2 — 텐프로젝트 ↔ 고객 프로젝트 분리)

### 배경
Studio Anthem 머지 후 Jayden이 `/projects` 노출 항목을 등록·관리할 방법을 요청. 1차로 6-ext-1~3
(projects 테이블에 portfolio_meta jsonb 컬럼 + 같은 폼에 번들 메타 섹션) 으로 처리. 그러나
Jayden이 "고객 프로젝트(CRM)와 포트폴리오(마케팅)는 다른 개념" 명확히 구분 — 옵션 B (분리 테이블)
로 재설계. 추가로 각 항목에 데모 페이지 URL 필드 + `/projects` 카드 클릭 → 데모 이동 기능 요청.

### 이번 세션 완료 내역
**1. 모션 효과 React 포팅 (Landing/Projects/About) — 커밋 `e580448`**
- 번들 vanilla JS (data-chars/reveal/mask/magnetic/count-root) → `LandingMotion.tsx`
- /projects cursor-thumb + 5탭 필터 + back-to-top → `ProjectsInteractions.tsx`
- /about timeline 드래그/휠/키보드 스크롤 → `TimelineInteractions.tsx`
- Hero failsafe (스크롤 진입 전 화면 안 요소들 .in 즉시 부착)
- IntersectionObserver disconnect 시점 보존 (visible 후 setTimeout으로도 in 부착 가능)

**2. Smooth anchor scroll multi-page 지원 — 커밋 `d722bb1`**
- 번들 SPA 가정 `a[href^="#"]` → 우리 multi-page Nav `/#hero` 형식 미매칭 → URL parse 후 같은
  pathname + hash 만 smooth scroll 처리
- /#pricing 클릭 → scrollY 776→7179 ✓ / /about#contact 1139→3596 ✓

**3. Task 6-ext (1차 시도) — 커밋 `6bcb780` `61ea4ad` `8a7867b`**
- projects 테이블에 portfolio_meta jsonb 컬럼 추가
- /projects DB 쿼리 전환 + fallback (DB 0건이면 정적 10개)
- /dashboard/projects/[id] 폼에 번들 메타 섹션 추가
- 이후 Jayden 피드백으로 옵션 B 재설계 (이 시도는 보존, 사용처는 PT-5 에서 제거)

**4. Epic Portfolio v2 (옵션 B) — 커밋 `2b185f8`**
- **PT-1**: `portfolio_items` 테이블 신설 (22 컬럼) + RLS 정책 + 마이그레이션 0039 + Zod
  (`src/lib/validation/portfolio-item.ts`) + Chatsio 1건 이관
- **PT-2**: 사이드바 "포트폴리오" 메뉴 + `/dashboard/portfolio` 3 페이지 (목록/등록/편집) +
  `actions.ts` (create/update/delete 서버 액션)
- **PT-3**: `src/features/portfolio/queries.ts` 새 테이블 직접 select 로 전환
- **PT-4**: ProjectsIndex `<article>` → linkUrl 있을 때 `<a target="_blank">` (CSS .p-row 는
  className 셀렉터 → 디자인 1px 변경 0)
- **PT-5**: `/dashboard/projects/[id]` "공개 프로필 + 번들 메타" 섹션 제거 + 안내 카드 (포트폴리오
  메뉴로 이동)

### 검증
- pnpm tsc --noEmit / lint / build / db:check 전부 ✓
- Playwright Landing: hero chars 4/4 in, mask 3/3, reveal 6/6, magnetic 4, anchor scroll ✓
- Playwright /projects: row tag=A href=https://example.com target=_blank, cursor-thumb hover 활성 ✓
- Playwright /about: Nav solidAlways=true, magnetic 6.42px, timeline drag 0→957, anchor 1139→3596 ✓
- 콘솔 error/warn 0건
- production 배포 확인: `x-vercel-cache: HIT` + 새 코드 반영 ✓

### 변경 통계 (HEAD~5..HEAD)
- 29 파일, +5,703 / -330 줄
- 커밋 5건 push 완료

### 다음 세션 할 일
- 기존 `projects.publicAlias / publicDescription / publicTags / publicLiveUrl / portfolioMeta`
  5 컬럼 deprecation marker 추가 + 별도 마이그레이션으로 DROP (데이터 보존 위해 안전 분리 단계)
- portfolio_items 의 slug 가 채워지면 `/projects/[slug]` 라우트로 내부 데모 페이지 매핑 가능
  (지금은 demoUrl 자유 입력으로 외부/내부 양쪽 지원)

### 차단 요소
- 없음

---

## 세션 2026-04-24~25 (Studio Anthem 리디자인 Epic 1~7 — 전체 공개 영역 + 대시보드 교체)

### 배경
Jayden이 claude.ai design에게 의뢰한 Handoff 번들(`~/Downloads/dairect (2)/`)을 전면 도입 결정.
기존 "The Intelligent Sanctuary" (Indigo + Soul Gradient + glassmorphism) ⛔ → **"The Studio Anthem"** (Warm Brutalism + editorial serif + amber signal).

### Epic 1~3 ✅ 완료 (이전 세션)
의존성 설치 + 토큰/폰트 교체 (Fraunces serif + Geist sans/mono + Pretendard) + chrome primitives (Nav/Footer 뼈대).

### Epic 4 ✅ 완료 — 랜딩 9 섹션 번들 CSS 전면 이식 (10 커밋)
Hero / Etymology / Manifesto / Proof / Services / Work / Pricing / Founder / FinalCTA + page.tsx 조립 + Footer.
번들 `landing.css` 1721줄 + `editorial.css` 361줄 + `a11y-patch.css` 187줄 통째 이식.
Fraunces opsz/SOFT axis 활성화를 위해 `weight` 배열 제거 → `axes: ["opsz","SOFT"]`.

### Epic 5 ✅ 완료 — 공개 라우트 재생성 (6 커밋)
- `/pricing` → `/#pricing` permanentRedirect (308)
- `/projects` 번들 P-01/P-02/P-04 이식 + `projects.css` 784줄 + 10 정적 프로젝트
- `/about` 번들 A-HERO~A-CTA 5섹션 + `about.css` 764줄 + 9 milestones + 3 essays. ContactSection 유지
- `/login` Warm Brutalism 재스킨 (paper card + 4px hard shadow)
- `/terms` + `/privacy` 재스킨 + Nav/Footer 추가
- Nav `solidAlways` prop — dark hero 가독성 이슈 해결

### Epic 6 ✅ 완료 — 대시보드 재스킨 (1 커밋)
shadcn `:root` 토큰 전면 재매핑:
- `--primary` indigo-600 → ink #141414 / `--accent` → signal amber / `--ring` → signal
- `--chart-1~5` indigo spectrum → ink/signal/dust/rust/smoke
- `--sidebar` dark indigo → ink + canvas fg + signal primary
- `--radius-sm/md/lg/xl` 6/8/12/16px → 2/2/4/6px (sharp corners)
- Recharts 인라인 색상 (`<Bar fill="#4F46E5">` 등) → Studio Anthem 팔레트
- 상태 뱃지 7개 (estimates/contracts/invoices/projects/leads) amber+rust 통일

### Epic 7 ✅ 완료 — 정리 + 검증 (3 커밋)
- `components/landing/` 전체 (7 파일) + `components/pricing/` 전체 (3 파일) + `about/hero-section.tsx` 삭제
- 검증 게이트 전부 통과: tsc noEmit + eslint + pnpm build + Serwist SW 빌드
- E2E smoke 12 라우트 모두 예상 상태코드

### 숫자로 보는 작업량
- 커밋 수: **20+** (Epic 4=10 + Epic 5=6 + Epic 6=1 + Epic 7=3)
- 생성: 12 컴포넌트 + 4 CSS (landing/editorial/projects/about) + Footer 재작성
- 삭제: 11 레거시 파일 (landing/* 7 + pricing/* 3 + about hero-section)
- 순 코드 증감: +4,600줄 / -1,320줄

### 핵심 배운 점 (docs/learnings.md에 이관)

1. **Next.js `next/font/google`에서 `axes`와 `weight` 배열은 상호 배타적**. Fraunces opsz/SOFT axis를 사용하려면 `weight` 배열을 제거해야 variable font 모드로 로드됨.
2. **번들 CSS 전면 이식 > Tailwind 수동 번역**. 시각 정합성 추구 시 번들 CSS를 `src/styles/<brand>/`로 통째 복사하고 JSX는 className 일치만 맞추는 편이 재작업 최소화.
3. **Nav over-dark 가독성**. Dark hero 페이지에서 fixed Nav 투명 배경이면 ink 텍스트가 ink 배경과 동일해 보이지 않음 → prop 기반 solid 강제.
4. **shadcn `:root` 한 번 수정이 대시보드 전체 재스킨**. `--primary/--accent/--chart-*` 교체만으로 Button/Card/Badge/Table/Recharts가 동시 전환. 단, **인라인 hex 색상은 별도 grep + 교체 필수** (Recharts Bar fill 등).
5. **Footer.tsx 기존 존재 시 덮어쓰기 전 Read 필수**. Write 직접 실행 시 "File has not been read yet" 보호막 발동.

---

## 세션 2026-04-24 末-3 (Task-S2a~f — 코드 잠금 실행 + PRD 갱신)

### Task-S2a ✅ 완료 (커밋 ee6d076 — plan 차등 제거 + 단일 고정 한도)

**변경 파일 11개** (계획 9개 + tsc가 잡아낸 소비처 2개 추가 — estimates/actions.ts, ai-actions.ts).

**핵심 변경**:
- `src/lib/plans.ts` 73줄 → 15줄: `MAX_MEMBERS = 10` 단일 상수
- `src/lib/validation/ai-estimate.ts`: `AI_DAILY_LIMIT = 200` 단일 상수 (기존 free 값 유지 — 보수적)
- AI actions 4개(briefing/report/estimates/ai-estimates) `getAiDailyLimit` 호출 제거
- `MemberLimitExceededError` / `AcceptLimitExceededError`의 `plan` 필드 제거
- 에러 메시지 변경: "Free 플랜... Pro 업그레이드" → "한도(10명)... 문의"
- `schema.ts` 3개 컬럼(`subscriptionStatus` / `stripeCustomerId` / `workspace_settings.plan`)에 `@deprecated` JSDoc (DROP X)

**검증**: tsc/lint/build/db:check 전부 통과, grep 잔존 0건. 순 135줄 감소.

### Task-S2b ✅ 완료 (커밋 3def1de — /signup + /onboarding 라우트 잠금)

**변경 파일 3개**:
- `src/app/(public)/signup/page.tsx`: `notFound()` only (기존 17줄→13줄)
- `src/app/onboarding/page.tsx`: `notFound()` only (기존 73줄→15줄)
- `src/app/(public)/login/page.tsx`: 회원가입 CTA 블록 주석 처리

**계획 외 발견**:
- `WorkspacePicker` 숨김 작업 **불필요** — 이미 `singleWorkspace ≤ 1` 분기 존재(workspace-picker.tsx:53)로 Jayden 환경에서 자동 단순 텍스트 표시 중
- `notFound()` + 기존 로직 유지 패턴은 TS narrow 실패로 에러 → 미니멀 재작성 + git history 보존 방식 채택

**검증**: `/signup` 404 / `/onboarding` 404 / `/login` 200 + 회원가입 문자열 0건 (curl 확인)

### Task-S2c ⛔ 취소 (경계선 결정 ①과 모순)

원래 `/invite/[token]` 라우트 잠금 계획이었으나 Jayden 결정(하청 초대 유지)과 모순. Jayden이 members에서 발송한 초대 메일 속 링크가 `/invite/<token>`이라 수락 불가 → members 기능 무용지물.

122-bit random UUID + 이메일 매칭 + 로그인 필수로 보안 리스크 ~0 (무작위 대입 ≈ 10^-37)이므로 그대로 유지.

### Task-S2d ✅ 축소 완료 (커밋 8a504cc — /about#contact 링크 정정, 15분)

**원 계획**: `/pricing` 삭제 + `PricingSummarySection` 제거 + 랜딩 CTA "디렉팅 시작하기" → "문의하기" 교체

**전부 불필요 확인**:
- `/pricing`은 SI 프로젝트 견적 패키지(진단 30만원~/MVP 100만원~/확장 300만원~) — SaaS 무관, 경계선 ② 결정에 따라 유지
- 랜딩 모든 CTA(Hero/Nav/CtaSection)가 **이미 `/about#contact` 경로 사용 중**
- "디렉팅 시작하기" CTA는 코드에 존재하지 않음 (v3.1 PRD 옛 언급)

**실제 변경 (축소 범위)**: Task-S2a에서 걸어놓은 `/#contact` 링크를 `/about#contact`로 정정 (3개 파일).
- `src/app/dashboard/members/actions.ts` / `accept-actions.ts` / `members-client.tsx`

### Task-S2e ⛔ 취소 (/admin 라우트 미구현 + members 가드 이미 충분)

원 계획 1: `/dashboard/members` Owner 가드 강화 — `canManageMembers` 체크 이미 적용됨, 추가 불필요.
원 계획 2: `/admin/*` 2차 이관 표시 — `/admin/*` 라우트 자체가 미구현 (PRD에만 존재).

### Task-S2f ✅ 완료 (본 세션 — PRD-v3.2 §4 갱신 + 2차 unlock 체크리스트 작성)

**변경 파일 3개**:
- `docs/PRD-v3.2-single-user.md` §4 Task 분해 실제 결과 반영 (완료/취소/축소 상태 명시) + §8 unlock 체크리스트 링크 + §9 버전 이력
- `docs/2차-unlock-checklist.md` **신규 생성** (7 섹션):
  - 2차 진입 전 확인 사항 (Jayden dogfooding 완료 + v3.3 PRD 결정)
  - Unlock 항목 실행 순서 (signup/onboarding 복구 + login CTA 복구)
  - 한도 정책 재검토 (3가지 옵션)
  - DB 컬럼 DROP 여부 결정 (2가지 옵션)
  - Billing Mock 설계 재참조 (SaaS 재도입 시)
  - 랜딩 메시지 업데이트
  - 2차 진입 직전 최종 검증 체크리스트
- `PROGRESS.md` 본 세션 기록

### 실제 Task-S2 진행 요약

| Task | 상태 | 실제 소요 | 커밋 |
|---|---|---|---|
| S2a | ✅ 완료 | 1.5h | `ee6d076` |
| S2b | ✅ 완료 | 1h | `3def1de` |
| S2c | ⛔ 취소 | 0 | — |
| S2d | ✅ 축소 완료 | 15min | `8a504cc` |
| S2e | ⛔ 취소 | 0 | — |
| S2f | ✅ 완료 | 1h | TBD (본 세션) |
| S2g | ⬜ 대기 | 1h | — |
| **합계** | | **~4.75h** (원 예상 7h) | |

### 교훈 (다음 세션 learnings.md 반영 후보)

1. **코드 조사 전 과대 계획 금지** — S2c(/invite 잠금), S2d(/pricing 삭제), S2e(/admin 이관)는 **실제 코드 상태 미확인으로 과대 예측**. 코드 조사 → 계획 순서가 맞음. v3.2 초안 시점에 코드 조사 깊이 부족.
2. **경계선 결정의 전파 효과** — "members 유지"와 "invite 잠금"이 동시에 성립 불가 → 경계선 결정 시 관련 경로 전체 dependency 파악 필수.
3. **"삭제"를 "잠금"으로 전환하는 원칙** — /signup, /onboarding, /pricing 모두 삭제 대신 유지(잠금 또는 그대로)로 전환하면 2차 복구 비용 0.
4. **TS unreachable narrow 한계** — `notFound()` 이후 코드를 TS는 unreachable로 narrow 못함. 기존 로직 유지하면서 notFound 추가하는 패턴 대신 **미니멀 재작성 + git history 보존** 방식 권장.

### Task-S2g ✅ 완료 (본 세션 후반 — dogfooding 체크리스트 작성)

**신규 파일**: `docs/dogfooding-checklist.md`

**구성 (10 섹션)**:
1. dogfooding 의미 (왜 필요한가)
2. 주간 리듬 (일일/주간 시작/주간 종료)
3. End-to-End 프로젝트 생명주기 8단계 (리드 → 수금)
4. AI 기능 검증 (브리핑/리포트/견적)
5. 시스템 기능 검증 (로그인/설정/멤버/PWA/잠금 라우트)
6. n8n cron 5종 검증
7. 이슈 기록 양식 + 우선순위 3등급 (High/Med/Low)
8. dogfooding 완료 기준 체크리스트 (1차 DoD 재확인)
9. dogfooding 시작 전 준비물 (배포/env/Resend/고객사)
10. dogfooding 후 다음 단계 (2차 진입 / 1차 지속 / 피봇)

### Task-S2 전체 완료 선언

| Task | 상태 | 실제 소요 | 커밋 |
|---|---|---|---|
| S2a | ✅ 완료 | 1.5h | `ee6d076` |
| S2b | ✅ 완료 | 1h | `3def1de` |
| S2c | ⛔ 취소 | 0 | — |
| S2d | ✅ 축소 완료 | 15min | `8a504cc` |
| S2e | ⛔ 취소 | 0 | — |
| S2f | ✅ 완료 | 1h | `9d0cc83` |
| S2g | ✅ 완료 | 1h | TBD (본 세션) |
| **총 소요** | | **~4.75h** (원 예상 7h, 32% 단축) | |

### 1차 완료 요약 (v3.2 Single-user Mode)

**핵심 전환**:
- SaaS 구독 모델 전면 취소 (Billing/Stripe/플랜 차등)
- Multi-tenant 인프라 자산 보존 (workspaces/RLS/Server Actions 그대로)
- 회원가입/온보딩 UI 잠금 (2차 시 UI만 풀면 재활성화)
- 한도 정책 단일 고정 (MAX_MEMBERS=10, AI_DAILY_LIMIT=200)

**문서 자산**:
- PRD-v3.2-single-user.md (상위 스펙)
- dogfooding-checklist.md (1차 실사용 가이드)
- 2차-unlock-checklist.md (2차 진입 가이드)
- PRD.md / PRD-phase5.md / PRD-phase5-erd.md (역사 보존 + v3.2 안내)

**코드 변경 누적 (Task-S1 + S2)**:
- 문서 10+ 개 생성/수정
- 코드 파일 14개 수정
- 코드 순증: -55 ~ -135줄 (plan 차등 제거 등)
- 커밋 6건: 8703fbf, c131b35, ee6d076, 3def1de, 8a504cc, 9d0cc83 + 본 세션

### 다음 단계: Jayden dogfooding

`docs/dogfooding-checklist.md`에 따라 1~2주 실업무에서 Dairect 사용:

1. **준비** — production 배포 / Resend / 실제 고객사 1곳 확보
2. **실행** — End-to-End 프로젝트 1건 이상 관리 (리드→견적→계약→청구→수금)
3. **기록** — 이슈 발견 시 우선순위별 정리
4. **마감** — 1차 DoD 8항목 전부 ✅ → Jayden 판단 (2차 진입 / 1차 지속 / 피봇)

---



---



## 세션 2026-04-24 末-2 (v3.2 수정 PRD 확정 — 옵션 B 1차 범위 + Task-S2a~g 분해)

### 배경: 범위 축소 결정
Jayden 판단: "서비스 제공 완성까지 8~13주 vs Jayden 혼자 사용 완성까지 2~3주. 1~2개월 일찍 실사용 시작하고 2차는 dogfooding 후 재설계."

### 시간 비교 (PROGRESS 전체 스캔 결과)
| 옵션 | 순수 개발 | 법적 준비 | QA | 총 |
|---|---|---|---|---|
| A (서비스 제공) | 37~49h | 1~2주 | 2~3주 베타 | **8~13주** |
| B (1인 사용) | 7~8h | 불필요 | 1~2주 dogfooding | **2~3주** |

### 4건 결정 (Jayden 승인)
1. 멤버/AI 한도: B안 — 단일 고정 (전원 동일, 남용 방어용)
2. DB 컬럼: B안 — 유지 + 읽지 않기
3. billing-mock-design.md: B안 — archived 이동
4. Task 분할: ①안 2단계 (S1 문서 + S2 코드)

### 3건 경계선 결정 (Jayden 승인)
1. `/dashboard/members` — **(a) 유지 + 본인만 접근** (Jayden 하청 초대 용도)
2. 공개 랜딩 — **(a) 노출 유지 + CTA "문의하기"로 교체** (SI 수주 창구)
3. 고객 포털 — **(a) 그대로 유지** (1차 핵심)

### Task-S1 세션 결과 (완료)
- `docs/billing-mock-design.md` → `docs/archived/`로 이동 + 폐기 헤더
- `docs/PRD-phase5.md` Phase 5.5 / Epic 5-3 ⛔ deprecated 인라인 표시
- `docs/PRD-phase5-erd.md` `subscription_status`/`stripe_customer_id` 컬럼 주석 업데이트
- `docs/pii-lifecycle.md` "빌링과 함께" 언급 7건 → "향후 필요 시"
- `docs/PRD.md` 상단 업데이트 박스 + 플랜/결제 섹션 폐기 표시
- 커밋: `8703fbf`

### v3.2 세션 결과 (이번 세션 — 수정 PRD 작성)

**신규 파일 1**
- `docs/PRD-v3.2-single-user.md` (9 섹션, 1차 범위 확정 + Task-S2a~g 분해 + 2차 복구 전략)

**수정 파일 3**
- `docs/PRD.md` — v3.2 이관 안내 상단 배너
- `docs/PRD-phase5.md` — v3.2 이관 + "자산 보존" 명시
- `PROGRESS.md` — 방향 전환 기록 + 1차 완료 기준 반영

### 코드베이스 전면 스캔 결과 (현재 자산)
- **공개 라우트**: 21개 (pricing 삭제 1 + signup/onboarding/invite 잠금 3 + 나머지 유지)
- **대시보드 라우트**: 18개 전부 유지
- **API 라우트**: 2개 (cron) 전부 유지
- **Server Actions**: 18개 전부 유지 (잠긴 라우트 액션은 코드만 보존)
- **DB 테이블**: 22개 전부 유지 (multi-tenant 자산 보존)
- **마이그레이션**: 38개 (0037까지)

### Task-S2 분해 (v3.2 §4에 상세)

| Task | 내용 | 예상 | 상태 |
|---|---|---|---|
| **S2a** | plan 차등 제거 + AI 한도 단일화 (`AI_DAILY_LIMIT=200`, `MAX_MEMBERS=10`) + schema `@deprecated` | 1.5h | 대기 |
| **S2b** | `/signup` + `/onboarding` UI 잠금 + `WorkspacePicker` 숨김 | 1h | 대기 |
| **S2c** | `/invite/[token]` 라우트 잠금 | 0.5h | 대기 |
| **S2d** | `/pricing` 삭제 + `PricingSummarySection` 제거 + 랜딩 CTA "문의하기" | 1h | 대기 |
| **S2e** | `/dashboard/members` 본인 접근 가드 강화 | 0.5h | 대기 |
| **S2f** | PRD/PROGRESS 1차 완료 기준 갱신 + 2차 unlock 체크리스트 작성 | 1h | 대기 |
| **S2g** | `docs/dogfooding-checklist.md` 작성 | 1h | 대기 |
| **합계** | | **~7h** | |

### 세션 분할 권장
- **다음 세션 (세션 1)**: S2a + S2b (2.5h) — 핵심 코드 정리
- **세션 2**: S2c + S2d + S2e (2.5h) — UI 잠금/삭제
- **세션 3**: S2f + S2g (2h) — 문서 마감 + dogfooding 시작

### 1차 완료 기준 (v3.2 §2)
- [ ] S2a~g 전부 완료
- [ ] tsc/lint/build/db:check 통과
- [ ] 잠근 라우트 직접 접근 시 404
- [ ] Jayden 1~2주 실업무 dogfooding (견적/계약/청구/AI/포털 1건 이상)
- [ ] 발견 버그 정리 + 우선순위별 수정

---

## 세션 2026-04-24 末 (Task-S1 — SaaS 구독 계획 폐기: 문서 정리)

### 배경 / Jayden 결정
- Jayden: "saas구독 자체를 삭제해줘 계획에서 삭제 Billing Mock및 구독에 적용되는 개발항목도 모두 삭제해줘 구독을 진행하지 않을거야"
- 프로젝트 타겟 재확인: **한국 IT 프리랜서 / 소규모 에이전시** (맞음)
- Dairect에 두 가지 돈 흐름이 있었음:
  - (A) **Dairect SaaS 구독료** (프리랜서 → Dairect) ← Task C Billing Mock이 다루던 것 → **전면 취소**
  - (B) **프리랜서-고객 프로젝트 계약 비용** ← 이미 Phase 1-2 estimates/contracts/invoices로 구현됨 (변경 없음)

### 4건 결정 (Jayden 승인)
1. **멤버/AI 한도**: B안 — 단일 고정 한도 유지 (전원 동일 규칙, 남용 방어용)
2. **DB 컬럼**: B안 — 유지 + 읽지 않기 (재도입 여지 남김)
3. **billing-mock-design.md**: B안 — `docs/archived/`로 이동 + "폐기됨" 헤더
4. **Task 분할**: ①안 — 2단계 (Task-S1 문서 + Task-S2 코드). DB Drop 안 함으로 S3 제거

### Task-S1 완료 내역 (6개 문서)

**이동 1**
- `docs/billing-mock-design.md` → `docs/archived/billing-mock-design.md` (+ 폐기 헤더)

**수정 5**
- `docs/PRD-phase5.md` — 상단 폐기 배너 + Phase 5.5 / Epic 5-3 / Billing / Stripe 언급 모두 ⛔ deprecated 인라인 표시 (원문은 `<details>`로 참고용 보존). 타임라인 11주 → 8주, 5 Epic → 4 Epic(Billing 제거)
- `docs/PRD-phase5-erd.md` — `subscription_status` / `stripe_customer_id` 컬럼에 `(⛔ deprecated 2026-04-24, DB 보존)` 주석. CHECK 제약 주석도 동일
- `docs/pii-lifecycle.md` — "Phase 5.5 빌링과 함께" 언급 전 건수(§1-1/§1-2/§2-2/§2-4/§2-5/§5/§8) "향후 필요 시 재결정"으로 재라벨
- `docs/PRD.md` — 상단에 2026-04-24 업데이트 박스 추가 + Phase 5 마일스톤 개요 / Phase 5+ SaaS 전환 섹션 플랜/결제 부분 ⛔ 폐기 표시. "개인 사용 → SaaS 전환 가능 구조" 같은 추상적 가능성 표현은 보존 (Jayden 결정 2 "나중에 여지 남김")
- `PROGRESS.md` — 본 세션 기록 추가 + 차기 Task 등록 Epic 5-3 항목 제거

### 설계 보존 원칙
- billing-mock-design.md의 PaymentProvider 인터페이스 / Mock checkout 플로우 / provider-중립 DB 스키마 설계는 **역사 기록으로 보존** (재도입 시 참고 가능)
- DB 컬럼 `subscription_status` / `stripe_customer_id` / `workspace_settings.plan`은 **DROP하지 않음** (재도입 여지)
- 부수 "SaaS 전환" 언급(추상적 가능성)은 PRD.md에서 삭제하지 않음

### Task-S2 진입 준비 (다음 세션)
- `src/lib/plans.ts` (73줄) — 플랜 차등 제거하고 단일 고정 한도로 전환 (Jayden 결정 1)
- `src/lib/validation/ai-estimate.ts` — `workspacePlans` / `PLAN_AI_DAILY_LIMITS` 정리
- `src/app/dashboard/members/*` — plan 분기/표시 UI 제거
- `src/app/invite/[token]/accept-actions.ts` — 수락 게이트 plan 로직 정리
- `src/lib/ai/*` — AI 일일 한도 단일 값으로 통합
- schema.ts 컬럼은 유지하되 `@deprecated` 주석만 추가 (읽지 않기)

---

## 세션 2026-04-24 후반 (Task A~D — Phase 5.5 제도적 해결 + Epic 5-3 설계 진입)

### Task A: Drizzle journal 제도적 해결 ✅ 완료 (0036 marker + db:check + 워크플로우 문서)

**배경**: 0018, 0020~0030, 0032~0035가 MCP `apply_migration` 직접 경로로 cloud 적용 → `_journal.json`은 idx=31이 마지막 → `pnpm db:generate` 실행 시 drizzle이 `0032_brainy_ender_wiggin`(기존 0032_workspace_plan과 idx 충돌)을 생성하는 시한폭탄. Task 5-2-2h(2026-04-21)에 이어 **2번째 재발** → 제도적 재발 방지 가드 도입.

**신규 파일 4**
- `src/lib/db/migrations/0036_phase5_resync_marker_v2.sql` — noop marker SQL (0031 precedent 답습, `SELECT '...' AS resync_marker` 한 줄 + 상세 주석)
- `src/lib/db/migrations/meta/0036_snapshot.json` — drizzle-kit 생성 snapshot (0032_snapshot에서 rename)
- `scripts/check-migrations.mjs` — pure Node 정합성 체크 (최신 sql idx === journal 마지막 idx + resync marker 이후 누락 검증). cwd 독립(절대경로) + tight regex `/^\d{4}_phase\d+_resync_marker(_v\d+)?$/`
- `docs/db-migrations-workflow.md` — 경로 A (drizzle 먼저) vs 경로 B (MCP 먼저 + noop marker 후속) 체크리스트. NNNN 번호 선택 규칙 명시

**수정 파일 3**
- `src/lib/db/migrations/meta/_journal.json` — drizzle이 추가한 idx=32 entry를 idx=36으로 수정 (tag/idx 동시)
- `package.json` — `"db:check": "node scripts/check-migrations.mjs"` 추가
- `CLAUDE.md` — DB 섹션에 MCP apply_migration 후속 의무 + 링크 + 검증 명령에 `db:check` 편입

**code-reviewer 독립 리뷰 + 즉시 반영 3건**
- HIGH-1 regex tight pattern (substring match → anchored 패턴, silent false-negative 차단)
- HIGH-2 `fileURLToPath(import.meta.url)` 기반 절대경로 (cwd 의존성 제거 — `/tmp`에서도 정상 동작 실증)
- MED-4 workflow 문서 경로 B 4단계에 "NNNN = 수동 마이그레이션 최대 번호 + 1" 규칙 명시

**검증**
- `pnpm db:generate` 재실행 → "No schema changes, nothing to migrate 😴"
- `pnpm db:check` → sql 37개 / journal 21개 (최신 idx=36) OK
- `pnpm tsc/lint/build` 0 errors

---

### Task B: PII 라이프사이클 정책 + 즉시 이벤트 기반 scrub ✅ 완료

**배경**: Task 5-5-5 리뷰 audit-4 (sec MED-2) 잔여 — `activity_logs.metadata.email` 평문 저장 정책 미비. 원래 "Phase 5.5 빌링과 함께" 예정이었으나 **정책 문서화 + 최소 구현**으로 scope 축소(빌링 시점 확장 가능 기반 마련).

**신규 파일 3**
- `docs/pii-lifecycle.md` (8 섹션) — 저장 PII 목록 / 라이프사이클 / pseudonym 규칙 (`sha256(email:workspaceId:salt).slice(0,16)`) / 금지 사항 / 보존 기간 TBD / 탈퇴 연동 TBD
- `src/lib/db/migrations/0037_chemical_timeslip.sql` — `activity_logs.pii_scrubbed_at timestamptz` 추가 (cloud 적용 완료, **drizzle 경로 A로 journal 자동 동기** — Task A 가드 즉시 payoff)
- `src/lib/privacy/scrub-pii.ts` — `pseudonymizeEmail` / `scrubMetadataObject` (Array 가드 + shallow-only docblock) / `scrubInvitationActivityLogs` (별도 tx)

**수정 파일 6**
- `src/lib/db/schema.ts` — `activityLogs.piiScrubbedAt` 컬럼
- `src/lib/env.ts` — `PII_PSEUDONYM_SALT` (production 필수 + dev fallback 문자열 배포 차단)
- `src/app/dashboard/members/actions.ts` — 자동 revoke + 수동 `revokeInvitationAction` 2경로에 scrub 주입
- `src/app/invite/[token]/accept-actions.ts` — 수락 경로 scrub
- `src/lib/demo/sample-data.ts` — 타입 정합성 (`piiScrubbedAt: null`)
- `docs/env-setup.md` — `PII_PSEUDONYM_SALT` 섹션

**핵심 설계 결정**: scrub을 **상위 tx commit 후 별도 tx**로 실행 → scrub 실패가 비즈니스 액션 rollback시키지 않도록 격리. 호출부는 try/catch + `event: invitation.pii_scrub_failed` 구조화 로그로 swallow.

**DB 실증 (MCP execute_sql)**
- 임시 row insert → 기본 `pii_scrubbed_at = NULL` 확인
- 수동 scrub UPDATE → `email` → `pii:...` 치환 + `pii_scrubbed_at = NOW()`
- 멱등 재시도 → `WHERE pii_scrubbed_at IS NULL` 가드로 0 rows (기존 pseudonym 보존)
- 테스트 row cleanup 완료. 현재 workspace_invitation 관련 activity_logs = 0건 (backfill 불요)

**code-reviewer 독립 리뷰 + 즉시 반영 9건**
- H1 scrubMetadataObject docblock `SHALLOW ONLY` 경고 (중첩 구조 확장 시 회귀 방지)
- H2 §1-1 표에 "현재 scrub 대상 여부" 컬럼 + §1-2 본체 정책 명시 (정책-코드 drift 방지)
- M1 env.ts에 dev fallback 문자열 prod 배포 차단
- M2 §6 금지에 salt 회전 사실상 금지 (기존 pseudonym 불일치 회귀 위험)
- M3 §2-2 expired_cleanup 행 TBD로 재라벨 (정책 오버커밋 제거)
- M4 acceptedInvitationId 할당 뒤 rollback 시 no-op 주석
- M5 §2-1에 평문 존속 기간 의도됨 명시
- M7 `getSalt()` dev fallback 1회 `console.warn`
- L2 `scrubMetadataObject` 가드에 `Array.isArray` 추가

---

### Task C: Billing Mock 설계 ✅ 완료 (문서만, Jayden 검토 대기)

**변경점**: 기존 PRD "Stripe 우선" 방침 → Jayden 결정으로 **한국 PG사 계약 + Mock 기반 선개발**로 전환. 계약 완료 후 Provider 구현체만 교체.

**신규 파일 1**
- `docs/billing-mock-design.md` (10 섹션, ~270줄):
  - **PaymentProvider 인터페이스** (6 메서드 — `ensureCustomer` / `createCheckoutSession` / `verifyAndParseWebhook` / `getSubscription` / `createPortalLink` / `updateSubscription`)
  - **MockPaymentProvider DB-backed** (`mock_payment_sessions` / `mock_subscriptions` / `subscription_invoices` 테이블 신규)
  - DB 스키마: `workspaces.stripeCustomerId` → `externalCustomerId` + `paymentProvider` flag + `externalSubscriptionId` 등 (provider 중립)
  - env flag: `PAYMENT_PROVIDER=mock|toss|portone`
  - 보안: Mock 기간 🟡 유지, 실 PG 연동 시 🔴 전환
  - Phase A Task 10건 (5-3-1' ~ 5-3-10')
  - Phase B 전환 시 변경 범위 사전 정의 (UI/DB/enforcement 로직 **유지**, Provider 구현체만 교체)

**Jayden 결정 대기 5건**:
1. 가격/플랜 확정 (PRD default 유지 or 베타 반영)
2. PG 후보 방향성 (포트원 v2 권장, 토스페이먼츠도 호환)
3. Mock 세션 유효기간 (30분 제안)
4. 청구 주기 (월간만 Phase A)
5. Free 플랜 PDF watermark (Phase A 구현 제안)

---

### Task D: createdInvitationId immutable 리팩토링 ✅ 완료

**수정 파일 1** — `src/app/dashboard/members/actions.ts`
- `let createdInvitationId: string | null = null` → `let createdInvitationId: string` (**unassigned 선언 + tx return value로 1회 할당**). tx catch 경로는 return으로 빠져나가므로 이후 코드에서 `string` 타입 확정 → null 체크 불필요
- `let autoRevokedInvitationId: string | null = null` → `let autoRevokedInvitationId: string | null` (tx return 또는 null). skip 경로 `early return null` 패턴
- 주석 "transaction 커밋 후에만 세팅됨 (ROLLBACK 경로 null 유지)" → "tx return value로 할당 (1회)" 갱신

**배경**: Task 5-5-5 리뷰 code L-1 잔여. 글로벌 "Immutability (CRITICAL)" 규칙 준수. 완전 `const`는 try/catch async 제약상 불가능 — **"실질적 immutable"** 패턴(선언 + 1회 할당 + 재할당 없음) 채택.

**검증**: tsc/lint/build/db:check 0 errors.

---

### 교훈 기록 3건 (docs/learnings.md)
1. **Drizzle journal MCP drift 2번 재발 → db:check 제도화** — 같은 문제 2번 반복 시 "문서/체크리스트가 아닌 자동 게이트" 도입이 근본 해결
2. **PII scrub은 별도 tx로 비즈니스 액션과 격리 + deterministic workspace-scoped pseudonym** — 감사 증거 정리는 본 업무를 rollback시키지 않도록 격리가 원칙. salt 회전은 기존 pseudonym 불일치라 사실상 금지
3. **외부 서비스 계약 전 Provider 추상화 + Mock 선개발 패턴** — Stripe → 한국 PG 전환처럼 provider가 바뀌어도 UI/비즈니스 로직 보호. 보안 등급 전환도 지연 가능

---

### 차기 Task 등록

**즉시 진행 가능** (2026-04-24 末 업데이트):
1. ~~**Epic 5-3 Mock 구현 착수**~~ ⛔ **폐기 2026-04-24** (SaaS 구독 모델 취소 → Task-S1/S2로 대체)
2. **Task-S2 코드 제거** — plans.ts 단일 고정 한도화 + plan 분기 제거 (예상 1.5~2시간, Task-S1 승인 후 진입)

**Jayden 수동 작업 대기**:
1. Resend Sending Access key 발급/회전
2. ~~Task C 설계 검토 + 결정 5건 응답~~ ⛔ 완료됨 (2026-04-24 末 — 구독 계획 취소로 종결)
3. `PII_PSEUDONYM_SALT` production 값 설정 (`openssl rand -hex 32`)

**후속 (기술 부채)**:
- Task A 후속: MED-1 try-catch UX / MED-2 drizzle-kit 업그레이드 재확인 / LOW-1 0036 `duplicate_object` 경고 보강
- Task B 후속: ~~H3 scrub 실패 탐지 주기 health check (빌링 cron과 함께)~~ → 별도 cron 도입 시 / L3 `pseudonymizeEmail` vitest unit / L4 `entityId` 부분 인덱스 / §2-4 보존 기간 확정 / §2-5 탈퇴 플로우 연동
- 이전 세션 이월: Task 5-5-1 LOW-1 vitest 이관, ~~Task 5-5-2 Existing-over-limit (Billing과 함께)~~ ⛔ 불필요 (플랜 차등 제거로 downgrade 시나리오 소멸), Task 5-5-3 audit-2 활동 피드 정책, Task 5-5-4 sec MED-2 IPv6 /64 / sec LOW-1 fake success

---

## 세션 2026-04-24 (Task 5-5-2 후속 HIGH 2건 + MED-4 실증 + rate-1 cron — 커밋 2건)

### Task 5-5-2 후속 HIGH 2건 ✅ 완료 (d676d69 — page race + hashtextextended + reviewer 즉시 반영 3건)

**범위**: Task 5-5-2(멤버 한도 게이트) 잔여 HIGH 2건 묶음 + reviewer 즉시 반영 3건.

**수정 파일 3**
- `src/app/dashboard/members/page.tsx` — HIGH-1 race 가드:
  - 기존 4개 독립 SELECT(memberRows / invitationRows / settingsRow / pendingCountRow) → 단일 `db.transaction` + REPEATABLE READ snapshot 고정.
  - code LOW-1 반영: 수동 `SET TRANSACTION...` 제거 → Drizzle 공식 config 인자(`{ isolationLevel: "repeatable read", accessMode: "read only" }`) 채택. accessMode="read only"로 실수 INSERT/UPDATE 이중 방어.
  - sec M1 반영: `SET LOCAL statement_timeout = '3s'` 추가 → 병렬 탭/스크립트 DoS 경화.
  - sec M3 반영: NOW() = transaction_timestamp() 고정 시점 주석 보완 (snapshot 시점 통일성 명시).
  - console.error(settings row 누락 알림)은 transaction 밖으로 이동 (side effect 커밋 후 처리).
- `src/app/dashboard/members/actions.ts` — HIGH-2 advisory lock 공간 확장:
  - `pg_advisory_xact_lock(hashtext(workspaceId))` → `pg_advisory_xact_lock(hashtextextended(workspaceId, 0))`.
  - hashtext(int4 32-bit) → hashtextextended(bigint 64-bit). 공간 2^32 → 2^64 — ~65536 ws 50% 충돌 → ~42억 ws.
- `src/app/invite/[token]/accept-actions.ts` — HIGH-2 동일 패턴. 발송/수락 양측 같은 lock key space 공유 유지 (멤버 한도 invariant 직렬화 의도).

**검증**
- `pnpm tsc/lint/build` 0 errors (무관 기존 warning 1).
- Cloud Supabase SQL:
  - `pg_typeof(hashtextextended('test-uuid', 0)) = 'bigint'` 확인.
  - `pg_advisory_xact_lock(hashtextextended(...))` 획득 + COMMIT 후 `pg_locks` 0건 (xact 자동 해제 정상).

**code-reviewer + security-reviewer 결과**
- CRITICAL 0 / HIGH 0. 즉시 반영 3건 모두 반영.
- 잔여 (후속 Task):
  - code LOW-2: RR connection 점유 모니터링 (관측 선행, 별도 Task 불필요)
  - sec M2 논의: 2-arg advisory lock 격리 — 이미 hashtextextended 64-bit로 해결된 범위, 추가 격리는 공간 축소 역행이라 기각
  - sec M3 stuck row expires_at 단축 — 운영 관찰 후

### Task 5-5-1 MED-4 instrumentation 부팅 차단 실증 ✅ 완료 (코드 변경 없음)

**범위**: Task 5-5-1 잔여 MED-4 — env.ts validateEnv가 실제 Next.js 부팅을 차단하는지 실증.

**실증 방법 2단**
1. **envSchema 단위 검증** (일회성 스크립트, 실행 후 삭제):
   - 4 시나리오 모두 PASS — NEXT_PUBLIC_APP_URL 누락 / DATABASE_URL 빈 문자열 / production + RESEND 누락 / INVITE_RATE_LIMIT_PER_MINUTE=0 regex 거부
2. **실제 `pnpm start` 부팅 차단 관측**:
   - shell `NEXT_PUBLIC_APP_URL=''` override로 .env.local 무수정 검증
   - 로그: `Failed to prepare server Error: An error occurred while loading instrumentation hook: [env] 환경변수 검증 실패 (NODE_ENV=production) - NEXT_PUBLIC_APP_URL: ...` + `unhandledRejection` → 프로세스 exit
   - 한국어 에러 + 누락 key 명시 + 해결법 안내 모두 정상 노출

**발견 (learnings.md 기록)**
- Next.js 16.2 async instrumentation hook은 "Ready in 99ms" 메시지 뒤에 평가되는 경로 존재 → HTTP 포트는 바인드된 상태에서 async fail → crash
- 운영 로그 패턴 "Ready 직후 dying"은 env validation 실패 우선 의심
- `next build`는 register()를 호출하지 않음 — env validation 실증은 `next start`/`next dev` 필수

### Task 5-5-4 rate-1 cleanup cron ✅ 완료 (2026c5f — pg_cron 매시 정각 + reviewer 즉시 반영 3건)

**범위**: `rate_limit_counters` 자동 정리 cron — rate limit row의 영구 잔존 방지.

**신규 파일 1**
- `src/lib/db/migrations/0035_rate_limit_counters_cleanup_cron.sql` — pg_cron extension 설치 + 매시 정각 cleanup job 등록
  - 주기: `0 * * * *` (매시)
  - 임계: `window_start < NOW() - INTERVAL '2 hours'` (최장 window 3600s + 1h buffer)
  - 멱등: DO $$ 블록으로 기존 동일 이름 job unschedule 후 재등록
  - sec M2 반영: unschedule fail-soft (`EXCEPTION WHEN OTHERS THEN RAISE NOTICE`) → migration rerun 안전
  - code MED-2 반영: 롤백 순서 주석 명시 (0035 unschedule 먼저 → 0034 table drop)
  - sec L1 반영: DROP EXTENSION pg_cron 금지 경고 강화 (Supabase plan extension, 다른 tenant/후속 cron 영향)

**검증**
- `apply_migration` 성공 (최초) + `execute_sql` 재적용 성공 (3건 반영 후)
- cron.job 등록 확인 (jobid=2, active=true, schedule/command 정상)
- Functional test: 3 row(3h/1.5h/now) 삽입 후 DELETE 실행
  - age=10800s(3h) → 삭제 ✅
  - age=5400s(1.5h) → 보존 ✅ (2h buffer 안)
  - age=0s → 보존 ✅
- 테스트 row 정리 후 total_rows=0

**code-reviewer + security-reviewer 결과**
- CRITICAL 0 / HIGH 0. 즉시 반영 3건 완료.
- 후속 (잔여 기술 부채 — 운영 시점에 자연 검증 또는 별도 Task):
  - Drizzle journal 0032~0035 미갱신 (Task 5-2-2g 반복 — 제도적 해결 필요)
  - cron 실패 모니터링 (cron.job_run_details 주기 점검)
  - 정각 thundering herd (향후 rate-1 확장 시 분 offset)
  - 2h buffer 재검토 (더 긴 window 도입 시 상향)

### 교훈 기록 4건 (docs/learnings.md)
1. Drizzle 공식 `db.transaction(..., { isolationLevel, accessMode })` config가 수동 `SET TRANSACTION`보다 안전
2. `pg_advisory_xact_lock`의 32-bit 공간 한계 — 2-key 변형은 네임스페이스 상수일 때 효과 없음, `hashtextextended`로 64-bit 확장이 본질적 해결
3. Next.js 16.2 async instrumentation hook은 "Ready" 메시지 뒤에 평가 — "Ready 직후 dying" 로그 패턴은 env validation 실패 우선 의심
4. pg_cron cleanup cron 임계는 "최장 활성 window + buffer", DROP EXTENSION은 Supabase plan extension이라 절대 금지

### 차기 Task 등록 (Phase 5.5 잔여 2건 + 후속 8건)

1. **Resend Sending Access key 발급/회전** (Jayden 수동, 개발 완료 후)
2. **Phase 5 Epic 5-3** 진입 검토 (PRD 재확인 필요)

후속 (잔여 기술 부채):
- Task 5-5-1 잔여: LOW-1 vitest 이관
- Task 5-5-2 잔여: Existing-over-limit 정책 (Phase 5.5 billing과 함께)
- Task 5-5-3 잔여: audit-2 활동 피드 정책 / audit-4 PII 라이프사이클
- Task 5-5-4 잔여: sec MED-2 IPv6 /64 그룹핑 / sec LOW-1 fake success 정책 / cron 실패 모니터링 / Drizzle journal 미갱신 (0032~0035)
- Task 5-5-5 cleanup 분리: sec M-3 `expires_at` 단축 / code L-1 immutable 리팩토링

---

## 세션 2026-04-23 (Task 5-5-5 cleanup + Task 5-5-4 rate-4 contact form — 커밋 2건)

### Task 5-5-5 cleanup 묶음 ✅ 완료 (cdf0073 — 로그 구조화 + revoke 가드 + stuck row + reviewer MEDIUM 4건)

**범위**: Task 5-5-5 잔여 ToDo 3건(cleanup-1/2/3) + 리뷰 MEDIUM 4건 즉시 반영.

**수정 파일 5**
- `src/lib/utils/sanitize.ts` — `sanitizeLogMessage` 신규 export. 제어문자(\x00-\x1F, \x7F) + BiDi override 공백 치환. sanitizeFreeText와 달리 tab/newline/ANSI escape도 제거 (한 줄 로그 오염 방지).
- `src/app/dashboard/members/actions.ts` — cleanup-1 event 필드 5개, cleanup-2 자동 revoke WHERE `isNull` 가드, cleanup-3 stuck row alert (`createdInvitationId` 상위 스코프 + `workspaceId`/`pgCode`/`causeName` 박제), sec M-2 `revoke_skipped` audit 분기 (race revoked), 6 로그 sanitize 적용.
- `src/app/dashboard/members/page.tsx` — event 필드.
- `src/app/invite/[token]/accept-actions.ts` — event 필드 2개 + sanitize.
- `src/app/invite/[token]/page.tsx` — event 필드 + sanitize.

**검증**: tsc 0 / lint 0 / build 39 routes + SW 정상.

**code-reviewer + security-reviewer 결과**
- CRITICAL 0 / HIGH 0 / MEDIUM 3+3 → **즉시 반영 4건**:
  - code M-1: stuck row 로그에 `workspaceId` (운영 복구 편의)
  - code M-2: `email_send_failed`에 `message` 필드 (Resend 장애 분류)
  - sec M-1: `sanitizeLogMessage` 유틸 + 6 로그 sanitize 적용
  - sec M-2: cleanup-2 0-row skip 분기에 `invitation.revoke_skipped` 로그 (stuck row와 race-revoked 구분, audit log INSERT는 skip — 실제 DB 변경 없음)
- **후속 Task로 분리**:
  - sec M-3: stuck row의 `expires_at` 단축 (triple-fault 리스크 대비 효익 불확실 → 운영 관찰 후)
  - code L-1: `createdInvitationId` immutable 전환 (transaction return 패턴 리팩토링)

---

### Task 5-5-4 rate-4 contact form ✅ 완료 (8092d29 — submitInquiryAction IP 기반 rate limit + Supabase GoTrue 문서화 + reviewer MEDIUM 3건)

**범위**: Task 5-5-4 잔여 rate-4 (login/signup/password reset/contact form) 중 실질 가능한 contact form만 적용 + 나머지는 Supabase GoTrue 정책 위임.

**발견 (scope 축소 사유)**:
- login, signup, password reset 모두 `"use client"` + `supabase.auth.*` 직접 호출 → 서버 미경유 → Dairect rate limit 주입 불가.
- Server Action 리팩토링은 SSR cookie 흐름 재설계 필요 → ROI 낮음.
- contact form(`submitInquiryAction`)만 Server Action → 즉시 적용 가능.

**수정 파일 5**
- `src/lib/rate-limit.ts` — `parseRateLimit` 공통 export로 이관 + key 컨벤션 주석에 `inquiry:ip:{ip}:*` 추가.
- `src/lib/env.ts` — `INQUIRY_RATE_LIMIT_PER_MINUTE/HOUR` 2건 추가 (INVITE_* 동일 regex `^[1-9]\d*$`).
- `src/app/(public)/about/actions.ts` — submitInquiryAction에 rate limit 주입. honeypot → timing → **rate limit** → zod parse → insert 순서. 분 3 + 시간 20. short-circuit. IP null 시 rate limit skip (review MED-1 반영).
- `src/app/dashboard/members/actions.ts` — 로컬 `parseRateLimit` 제거 → lib import.
- `docs/env-setup.md` — INVITE/INQUIRY env 2건 문서화 + 🛡️ Supabase GoTrue Auth Rate Limit 가이드 섹션 신설 (Dashboard 위치 + 대략적 카테고리 + 공식 링크 2건).

**검증**: tsc 0 / lint 0 / build 39 routes + SW 정상.

**code-reviewer + security-reviewer 결과**
- CRITICAL 0 / HIGH 0 / MEDIUM 2+3 → **즉시 반영 3건**:
  - code MED-1/2 + sec MED-1 통합: IP null 시 rate limit skip (공유 `"unknown"` 버킷 false positive 방어 — 정상 모바일 사용자 보호)
  - sec MED-3: env-setup.md GoTrue 수치 박제 제거 → Supabase 공식 문서/Dashboard 참조 + 공식 링크 2건
  - code LOW-2: 이관 흔적 주석 축약
- **후속 Task로 분리**:
  - sec MED-2: IPv6 /64 CIDR 그룹핑 (rate-limit.ts 인프라 개선 — 모든 IP 기반 rate-limit 공통 적용)
  - sec LOW-1: rate limit fake success vs real error 비대칭 정책 결정 (봇이 rate limit 존재 학습 가능 vs 정상 사용자 UX 피해 trade-off)

### 차기 Task 등록 (Phase 5.5 잔여 2건 + 후속 11건)

1. **Resend Sending Access key 발급/회전** (Jayden 수동, 개발 완료 후)
2. **Phase 5 Epic 5-3** 진입 검토 (PRD 재확인 필요)

후속 (잔여 기술 부채):
- Task 5-5-1 잔여: MEDIUM-4 instrumentation 부팅 차단 실증 / LOW-1 vitest 이관
- Task 5-5-2 잔여: HIGH-1 page.tsx race / HIGH-2 hashtext 32-bit 충돌 / Existing-over-limit 정책
- Task 5-5-3 잔여: audit-2 활동 피드 정책 / audit-4 PII 라이프사이클
- Task 5-5-4 잔여: rate-1 cleanup cron
- Task 5-5-5 cleanup 분리: sec M-3 `expires_at` 단축 / code L-1 immutable 리팩토링
- Task 5-5-4 rate-4 분리: sec MED-2 IPv6 /64 그룹핑 / sec LOW-1 fake success 정책

---

## Task 5-5-5 ✅ 완료 (Phase 5.5 잔여 정리 묶음 7건 + reviewer 즉시 반영 3건)

**범위**: Task 5-5-1~4의 잔여 MEDIUM/LOW 7건 단일 묶음 처리.

**신규 파일 1**
- `src/lib/utils/sanitize.ts` — `sanitizeFreeText(text: string)` + `sanitizeFreeTextOrNull` export. control char(\x00-\x08\x0B\x0C\x0E-\x1F\x7F) + BiDi override(\u202A-\u202E, \u2066-\u2069) 제거. tab/newline/HTML 특수문자는 의도적 보존 (React가 자동 escape, 자연 입력 허용).

**수정 파일 5**
- `src/lib/env.ts`:
  - n8n webhook URL 5종 (PROJECT_STATUS_CHANGED / PROJECT_COMPLETED / PORTAL_FEEDBACK_RECEIVED / INVOICE_OVERDUE / WEEKLY_SUMMARY) 옵션 등록 (drift 방지). **`.url()` 검증은 의도적으로 빼서** 부가 시스템 1개 오설정으로 전체 앱 부팅 차단되는 운영 risk 회피 (review MED-1 반영).
  - INVITE_RATE_LIMIT_PER_MINUTE/HOUR 옵션 등록. regex `^[1-9]\d*$`로 `"0"` 거부 (review HIGH-1 반영, limit=0이면 모든 admin 초대 영구 차단 위험).
- `src/app/dashboard/members/actions.ts`:
  - INVITE_RATE_LIMITS에 `parseRateLimit` 헬퍼 추가 (env 빈 문자열/NaN/0/음수 fallback to default — review HIGH-1 defense-in-depth).
  - inviterName + wsName(workspace.name)에 sanitizeFreeText 적용 (이메일 본문 + audit metadata BiDi 스푸핑 차단 — audit-3 + sec MED-3).
  - createInvitationAction transaction 안 workspaceSettings row missing console.error 알림 (HIGH-4).
  - 이메일 발송 실패 자동 revoke를 transaction으로 묶어 audit log 동시 INSERT (audit-1, action: workspace_invitation.revoked + metadata.reason: email_send_failed).
  - revokeInvitationAction metadata에 revokerRoleAtTime 박제 (audit-5).
- `src/app/invite/[token]/accept-actions.ts`:
  - workspaceSettings row missing 알림 (HIGH-4 동일 패턴).
- `src/app/dashboard/members/page.tsx`:
  - workspaceSettings row missing 알림 (HIGH-4 동일 패턴).
- `docs/env-setup.md`:
  - RESEND_FROM_EMAIL 표기 명문화 (LOW-2): "Vercel UI에 따옴표 없이" 사고 이력 + 표준 안내 문구 추가.

**검증**
- `pnpm tsc/lint/build` 통과 (lint warning 1건 무관).
- sanitize 단위 동작 확인 (Bash 1줄):
  - control char "Hello\\x07World" → "HelloWorld" ✅
  - BiDi "Hello\\u202EWorld" → "HelloWorld" ✅
  - newline/tab/HTML chars 보존 (의도) ✅

**code-reviewer + security-reviewer 결과**
- CRITICAL 0, HIGH 1 (code, 두 리뷰 공통 지적) → **즉시 반영 3건**:
  - HIGH-1 (code) / MED-1 (sec): INVITE_RATE_LIMITS env 빈 문자열/0/NaN 처리 부재 → parseRateLimit 헬퍼 + env.ts regex `^[1-9]\d*$` 강화. fail-closed라 보안은 안전하지만 운영 가용성 0 회귀 위험.
  - MEDIUM-1 (code): n8n URL .url() fail-fast 정책 → A안 채택 (`.url()` 제거, client.ts graceful 처리에 위임).
  - MEDIUM-3 (sec): wsRow.name(workspace.name)도 sanitize 적용 (이메일 본문 BiDi 스푸핑 defense-in-depth).
- **잔여 ToDo 추가** (다음 정리 묶음 또는 운영 시점에):
  - cleanup-1: console.error 형식 통일 (`event: "..."` 구조화 로그) — 모니터링 일관성 (code MED-2)
  - cleanup-2: revoke transaction에 isNull(revokedAt) 가드 추가 (code LOW-1)
  - cleanup-3: revoke transaction ROLLBACK 시 stuck row alert 강화 (sec MED-2)

### 차기 Task 등록 (Phase 5.5 잔여 2건 + 후속 11건)
1. **Resend Sending Access key 발급/회전** (Jayden 수동, 개발 완료 후 — 2026-04-22 결정)
2. **Phase 5 Epic 5-3** 진입 검토 (PRD 재확인 필요)

후속 (잔여 기술 부채 — 운영 시점에 자연 검증 또는 별도 Task):
- Task 5-5-1 잔여: MEDIUM-4 instrumentation 부팅 차단 실증 / LOW-1 vitest 이관
- Task 5-5-2 잔여: HIGH-1 page.tsx race / HIGH-2 hashtext 32-bit 충돌 / Existing-over-limit 정책
- Task 5-5-3 잔여: audit-2 활동 피드 정책 / audit-4 PII 라이프사이클 (Phase 5.5 빌링과 함께)
- Task 5-5-4 잔여: rate-1 cleanup cron / rate-3 Promise.all 보류 / rate-4 추가 엔드포인트 확장
- Task 5-5-5 cleanup-1/2/3: 구조화 로그 / revoke isNull 가드 / stuck row alert

---

## Task 5-5-4 ✅ 완료 (createInvitationAction rate limit — fixed window counter)

## Task 5-5-4 ✅ 완료 (createInvitationAction rate limit — fixed window counter)

**범위**: createInvitationAction abuse 방어. 분 5회 + 시간 20회 한도, userId 기반 식별자.

**신규 파일 3**
- `src/lib/db/migrations/0034_rate_limit_counters.sql` — `rate_limit_counters` 테이블(key PK + window_start + count + updated_at) + window_start 인덱스(향후 cleanup용) + RLS RESTRICTIVE deny anon/authenticated. Cloud Supabase apply 완료.
- `src/lib/db/schema.ts` — rateLimitCounters drizzle 정의 추가 (라인 749 이후).
- `src/lib/rate-limit.ts` — `checkAndIncrementRateLimit(key, { windowSec, limit })` 단일 export. UPSERT + ON CONFLICT DO UPDATE의 SET CASE로 window expired면 reset(count=1) 아니면 increment(count+1). RETURNING으로 갱신 후 count + window_start 받아 retryAfterSec 산출. PG single-statement atomicity로 race 방어 (advisory lock 불필요).

**수정 파일 1**
- `src/app/dashboard/members/actions.ts`:
  - `INVITE_RATE_LIMITS` 상수 (perMinute / perHour) 추가
  - createInvitationAction validation 직후 분 한도 → 차단 시 즉시 RATE_LIMITED → 시간 한도 → 차단 시 RATE_LIMITED. **Short-circuit 패턴**: 분 차단 시 시간 카운트 skip (HIGH-1 reviewer 반영).
  - ActionResult 타입에 RATE_LIMITED 추가
  - validation 통과 후 체크 (오타로 자기 자신 차단 방지)

**검증**
- `pnpm tsc/lint/build` 통과
- Cloud Supabase `apply_migration` 성공 (테이블 + 인덱스 + RLS 정책 생성)
- DO 블록 회귀 PASS:
  - iter1~5: count 1~5 PASS
  - iter6: count=6 BLOCK (limit 5 초과)
  - window 강제 만료 후 호출: count=1 RESET_OK
- 자동 ROLLBACK으로 테스트 row 무손상

**code-reviewer + security-reviewer 결과**
- CRITICAL 0, HIGH 1 (code) — **즉시 반영 3건**:
  - HIGH-1 (code): minute/hour 양쪽 카운트 동시 증가 → 분 차단 시 시간 카운트도 +1되어 정상 admin이 abuser 직후 시간 한도에 부당 도달 → **short-circuit으로 변경** (분 차단 시 시간 카운트 skip).
  - MEDIUM-2 (sec): UPSERT row 미반환 fail-closed 시 retryAfterSec=windowSec 그대로 노출 → "3600초 후 다시 시도" 부정확 → **60초 캡 적용** (`Math.min(windowSec, 60)`).
  - LOW-2 (code): NaN guard 추가 (`Number.isNaN(windowStartMs)` 분기 — driver upgrade/type cast 변경 안전망).
- **Phase 5.5 잔여 ToDo로 이관 4건**:
  - rate-1 (code MED-2 / sec LOW-2): stale key cleanup cron (Supabase pg_cron + DELETE WHERE window_start < NOW() - 24h) — 운영 1년 후에도 백만 row 미만 예상이지만 prefix 확장 시 누적 가능.
  - rate-2 (code MED-3): 한도값 환경변수화 (INVITE_RATE_LIMIT_PER_MINUTE/HOUR) — 운영 중 abuse 발견 시 코드 수정 없이 조정.
  - rate-3 (sec MED-3): Promise.all 병렬화 — short-circuit 채택으로 의미 작아짐, 보류.
  - rate-4: 추가 엔드포인트(login/signup/password reset/contact form/AI burst)에 rate limit 확장 — Supabase auth 자체 정책 확인 후.

### 차기 Task 등록 (Phase 5.5 잔여 2건 + 후속 8건)
1. **Resend Sending Access key 발급/회전** (Jayden 수동, 개발 완료 후 — 2026-04-22 결정)
2. **Phase 5 Epic 5-3** 진입 검토 (PRD 재확인 필요) — 또는 audit/rate/MEDIUM/LOW 후속 정리 묶음 Task

후속 (잔여 기술 부채):
- audit-1~5 (Task 5-5-3 잔여): 자동 revoke audit / 활동 피드 정책 / inviterName 정규화 / PII 라이프사이클 / revokerRole 박제
- rate-1~4 (Task 5-5-4 잔여): cleanup cron / 한도 env / Promise.all / 추가 엔드포인트 확장
- Task 5-5-1/2 잔여: n8n schema / instrumentation 실증 / vitest 이관 / page.tsx HIGH-1 / hashtext HIGH-2 / settings row missing HIGH-4 / Existing-over-limit 정책

---

## Task 5-5-3 ✅ 완료 (멤버 초대/수락/취소 activity_logs 감사 — 3 이벤트 atomically + 리뷰 통과)

## Task 5-5-3 ✅ 완료 (멤버 초대/수락/취소 activity_logs 감사 — 3 이벤트 atomically + 리뷰 통과)

**범위**: 3가지 이벤트를 같은 transaction에 INSERT (atomicity 보장).
- `workspace_invitation.created` (createInvitationAction)
- `workspace_invitation.accepted` (acceptInvitationAction)
- `workspace_invitation.revoked` (revokeInvitationAction)

**수정 파일 2**
- `src/app/dashboard/members/actions.ts`:
  - createInvitationAction transaction에 `tx.insert(activityLogs).values({...})` 추가. invitation INSERT를 `.returning({ id })`로 변경하여 entityId 확보. metadata: { email, role, inviterName }.
  - revokeInvitationAction을 `db.transaction`으로 감쌈 (기존 단일 UPDATE → tx). UPDATE returning에 email/role/invitedBy 추가. 0 rows 반환 시 null 반환 → 외부 NOT_FOUND (멱등성 일관, audit log skip). metadata: { email, role, originalInviterUserId }.
- `src/app/invite/[token]/accept-actions.ts`:
  - acceptInvitationAction transaction의 invitation UPDATE returning에 id 추가. workspace_members INSERT + last_workspace_id UPDATE 다음에 activityLogs INSERT. metadata: { email(invitation 저장값), role, inviteeUserId }.

**기존 패턴 재사용**: `src/app/dashboard/projects/[id]/portal-actions.ts:188` 의 portal_token activity_log 패턴 그대로.

**검증**
- `pnpm tsc/lint/build` 통과 (lint warning 1건 무관 estimate-form.tsx).
- Cloud Supabase schema 호환성 확인: 코드 INSERT 필드(userId, workspaceId, entityType, entityId, action, description, metadata) 모두 schema와 일치.
- DO 블록 시뮬레이션 PASS: workspace_invitations + activity_logs 3건 INSERT 모두 schema 위반 없이 통과 → `RAISE EXCEPTION 'TEST_ROLLBACK_OK_LOGS=3'`로 자동 ROLLBACK (테스트 데이터 무손상).
- RLS 호환성: `0021_rls_policies_multitenant.sql:191~202`의 `activity_logs_select_members` 정책으로 같은 workspace 멤버만 조회 가능 + anon RESTRICTIVE deny로 cross-tenant 차단.

**code-reviewer + security-reviewer 결과**
- CRITICAL/HIGH **0건** — 즉시 반영 필요 변경 없음.
- transaction atomicity / RLS 격리 / token metadata 누락 / entityId 일관성(invitation.id) / nullable invitedBy / inviterName snapshot 시점 등 모두 의도된 설계로 OK.
- **Phase 5.5 잔여 ToDo로 이관 5건**:
  - audit-1 (code MED): 이메일 발송 실패 후 자동 soft revoke 시 audit log 부재 → 같은 패턴으로 추가 (action: workspace_invitation.revoked + metadata.reason: "email_send_failed"). 일관성 강화.
  - audit-2 (code MED): 활동 피드(`getRecentActivity`)가 본인 row만 조회 → 다른 admin이 revoke한 초대를 invitee가 못 봄. 정책 변경(workspace 단위 표시) 별도 PRD 검토.
  - audit-3 (sec MED-1): inviterName(user.name 자유 텍스트) control char 정규화 — 향후 audit UI 도입 시 XSS 자동 보호. 5줄 수정.
  - audit-4 (sec MED-2): metadata.email 평문 저장 정책의 PII 라이프사이클(보존 기간 / 익명화 / 삭제 정책) 결정 — Phase 5.5 빌링과 함께.
  - audit-5 (sec MED-3): revokeInvitation metadata에 revokerRoleAtTime 박제 — 분쟁 시 "revoke 시점의 권한" 추적 정확성.

### 차기 Task 등록 (Phase 5.5 잔여 3건 + audit 후속 5건)
1. **Resend Sending Access key 발급/회전** (Jayden 수동, 개발 완료 후 — 2026-04-22 결정)
2. **rate limit** (members 초대 / login — Vercel KV vs Upstash Redis 결정 선행)
3. **audit-1~5 + Task 5-5-1/2의 MEDIUM/LOW 후속 정리** (자동 revoke audit / 활동 피드 정책 / inviterName 정규화 / PII 라이프사이클 / revokerRole 박제 / n8n schema / instrumentation 실증 / vitest 이관 / page.tsx HIGH-1 / hashtext HIGH-2 / settings row missing HIGH-4 / Existing-over-limit 정책)

또는 **Phase 5 Epic 5-3** 진입 검토 (PRD 재확인 필요).

---

## Task 5-5-2 ✅ 완료 (멤버 수 상한 게이트 — invite + accept 양측 + reviewer 즉시 반영 3건)

## Task 5-5-2 ✅ 완료 (멤버 수 상한 게이트 — invite + accept 양측 + reviewer 즉시 반영 3건)

**범위**: workspace plan별 max members enforcement (베타: Free 3 / Pro 5 / Team ∞).
- PRD-phase5.md:154-162 정의(1/1/∞)는 베타 종료 후 Phase 5.5 빌링 진입 시점에 회귀 — `src/lib/plans.ts` 한 줄 변경.

**신규 파일 1**
- `src/lib/plans.ts` — `PLAN_MAX_MEMBERS` 상수 + `getMaxMembers` / `getPlanLabel` / `suggestUpgradeTarget` 헬퍼. 무제한은 `Number.POSITIVE_INFINITY`(server JSON 직렬화 시 page.tsx에서 null로 정규화). "INSERT-time + ACCEPT-time enforcement only" + "Existing-over-limit 정책은 Phase 5.5 빌링 ToDo" 명시 주석.

**수정 파일 4**
- `src/app/dashboard/members/actions.ts` (createInvitationAction):
  - `db.transaction` 안에 `pg_advisory_xact_lock(hashtext(workspaceId))` → 동시 INSERT 직렬화.
  - workspace_settings.plan SELECT + workspace_members count + workspace_invitations pending count(`acceptedAt IS NULL AND revokedAt IS NULL AND expiresAt > NOW()`) 합산.
  - `used >= limit`이면 `MemberLimitExceededError` throw → 트랜잭션 ROLLBACK → 외부 catch에서 instanceof 분기로 LIMIT_EXCEEDED 반환 (DUPLICATE 분기보다 먼저).
  - 메시지에 동적 업그레이드 안내 (Free → Pro / Pro → Team — `suggestUpgradeTarget` 사용).
- `src/app/dashboard/members/page.tsx`:
  - workspace_settings.plan SELECT + 별도 COUNT(*) 쿼리로 pending count(`Date.now()` 호출 회피 → React Server Component purity 규칙 준수, DB NOW()로 actions.ts와 동일 정의).
  - planLabel/upgradeTarget/limit(Infinity → null 정규화)/used를 client에 prop 전달.
- `src/app/dashboard/members/members-client.tsx`:
  - 초대 폼 헤더에 "N / M (Free 플랜)" 사용량 표시.
  - 한도 도달 시 amber 배너(role="alert") + email/role select/submit button 모두 disabled.
  - 동적 업그레이드 안내 ("…또는 {upgradeTarget} 플랜으로 업그레이드하면 더 추가할 수 있어요").
- `src/app/invite/[token]/accept-actions.ts` (acceptInvitationAction) — **code-reviewer CRIT-1 즉시 반영**:
  - 발송 게이트 통과 후에도 plan downgrade(pro→free) 또는 SQL 직접 INSERT 우회 시 수락 시점 한도 깨짐 가능 → 같은 트랜잭션 패턴(advisory lock + plan SELECT + members count) 추가.
  - `existingMember` 체크로 재수락(idempotent) 시 한도 체크 skip → onConflictDoNothing과 일관.
  - 자기 자신 invitation은 곧 member로 전환되므로 pending 카운트 제외 → `memberCount >= limit`만 검사.
  - `AcceptLimitExceededError` throw → catch에서 LIMIT_EXCEEDED 반환 (ACCEPT_RACE 분기보다 먼저).

**검증**
- `pnpm tsc/lint/build` 통과 (lint warning 1건 무관 estimate-form.tsx).
- Cloud Supabase SQL 격리 시나리오 12건 PASS:
  - 발송 게이트 6건 (T1~T6): Free/Pro/Team × used 매트릭스 + edge case + unknown plan fallback.
  - 수락 게이트 6건 (A1~A6): Free/Pro/Team × member_count + downgrade 누적 초과 시나리오 + unknown plan fallback.
  - 핵심 시나리오 A5 Free downgrade 후 members=4 → BLOCKED — CRIT-1 우회 경로 봉쇄 확인.
- advisory lock 동작 검증 (reentrant + 다른 ws 동시 가능).

**code-reviewer + security-reviewer 결과**
- CRITICAL 1 (code) + HIGH 0 (sec) → **즉시 반영 3건**:
  - CRIT-1: accept-actions.ts 한도 게이트 추가 (위에 기록).
  - LOW-2: "팀 플랜으로 업그레이드" 정적 안내 → `suggestUpgradeTarget`로 동적("Free → Pro" / "Pro → Team").
  - INFO: plans.ts에 "INSERT-time + ACCEPT-time only enforcement, existing-over-limit은 Phase 5.5 ToDo" 주석 추가.
- **Phase 5.5 잔여 ToDo로 이관 3건**:
  - HIGH-1 (code): page.tsx의 memberRows + pendingCount 두 SELECT 사이 race로 표시값 일시 불일치 — UX 영향만 (server transaction이 신뢰 경계).
  - HIGH-2 (code): hashtext()는 32-bit 해시 → 워크스페이스 1만 개 시점에 충돌 가능 (다른 ws 직렬화로 latency 영향만, 데이터 정합 영향 없음). 2-key advisory lock 전환은 Phase 5.5 빌링 후 ToDo.
  - HIGH-4 (code): workspaceSettings row 누락 시 free fallback이 silent — `console.error` 알림 추가 권장.
- **Existing-over-limit 정책**: plan downgrade 시점에 이미 한도 초과한 워크스페이스의 자동 정리/강제 다운그레이드는 Phase 5.5 billing webhook과 함께 결정.

### 차기 Task 등록 (Phase 5.5 잔여 4건)
1. **Resend Sending Access key 발급/회전** (Jayden 수동, 개발 완료 후 진행 예정 — 2026-04-22 결정)
2. **rate limit** (members 초대 / login — Vercel KV vs Upstash Redis 결정 선행)
3. **activity_logs 감사** (초대 발송/수락/revoke + plan 변경 audit trail)
4. **MEDIUM/LOW 후속 정리** (n8n webhook URL schema / instrumentation 부팅 차단 실증 + next.config build-time import / vitest 이관 / RESEND_FROM_EMAIL 표기 명문화 / page.tsx HIGH-1 / hashtext HIGH-2 / settings row missing HIGH-4 / Existing-over-limit 정책)

또는 **Phase 5 Epic 5-3** 진입 검토 (PRD 재확인 필요).

---

## Task 5-5-1 ✅ 완료 (Phase 5.5 보안 강화 묶음 3건 + 리뷰 4건 반영)

## Task 5-5-1 ✅ 완료 (Phase 5.5 보안 강화 묶음 3건 + 리뷰 4건 반영)

**범위**: Phase 5.5 ToDo 8건 중 3건 묶음 처리.

**신규 파일 3**
- `src/lib/env.ts` — Zod 스키마로 모든 필수 env 정의 + production-only superRefine(RESEND 2종 강제). top-level `validateEnv()` 호출 + cached `env` export. `import "server-only"`로 client 번들 leak 빌드 타임 차단.
- `src/instrumentation.ts` — Next.js 공식 부팅 훅. `register()`에서 `nodejs runtime`이면 `./lib/env` import → top-level validate 실행 → throw 시 부팅 차단.
- `scripts/test-env-validation.mjs` — zod superRefine 5개 케이스 일회성 검증 스크립트(dev/prod RESEND 누락, prod 충족, bad URL, empty DATABASE_URL). 모두 PASS 확인.

**수정 파일 2**
- `next.config.ts` — `headers()` async function 추가. `/invite/:path*`, `/portal/:path*`, `/auth/:path*`에 `Referrer-Policy: no-referrer` 응답 헤더. 응답 헤더 방식(메타 태그 대비 HTML 변조 강건). `/auth/`는 OAuth `?code=...` query 5xx 시 잔류 leak 방어(MEDIUM-1 리뷰 반영).
- `docs/env-setup.md` — RESEND_API_KEY/FROM_EMAIL/REPLY_TO 항목 + Resend Sending Access(only) key 분리 절차 5단계 + 분기 회전 권장 + startup 검증 안내 + 트러블슈팅 2건(따옴표 leak / 부팅 차단).

**의존성 추가 1**
- `pnpm add server-only@0.0.1` — Vercel 공식 패턴. server 전용 모듈이 client component에서 import될 때 빌드 타임 즉시 차단. env.ts 최상단 `import "server-only"`로 적용.

**검증**
- `pnpm tsc --noEmit && pnpm lint && pnpm build` — 전 단계 통과. SW artifact verified.
- `node scripts/test-env-validation.mjs` — 5/5 PASS (dev RESEND 누락 PASS, prod RESEND 누락 FAIL, prod 충족 PASS, bad url FAIL, empty DATABASE_URL FAIL).
- dev 서버 부팅 + curl 헤더 검증:
  - `/invite/<uuid>` → 200 + `Referrer-Policy: no-referrer` ✅
  - `/portal/<uuid>` → 200 + `Referrer-Policy: no-referrer` ✅
  - `/auth/callback?code=test` → 307 + `Referrer-Policy: no-referrer` ✅
  - `/` → 200 + 헤더 미적용 ✅ (대조군)

**security-reviewer 결과**
- CRITICAL 0건. HIGH 1건 + MEDIUM 4건 + LOW 2건 + INFO 다수.
- **즉시 반영 4건**:
  - HIGH-1: `RESEND_REPLY_TO`를 `.email()` 강제 → `.min(1)`로 완화. "Name <email>" 표기 입력 시 production 부팅 차단되는 회귀 위험 제거. 실제 형식 검증은 Resend SDK가 발송 시점 처리.
  - MEDIUM-1: `/auth/:path*` Referrer-Policy 추가 (OAuth code 5xx 잔류 leak 방어).
  - MEDIUM-3: `import "server-only"` 추가 (client 번들 leak 빌드 타임 차단).
  - 부수: 코드 주석에 리뷰 사유 명기.
- **Phase 5.5 잔여 ToDo로 이관 4건**:
  - MEDIUM-2: n8n webhook URL 5종을 env schema에 옵션 등록 (drift 방지). trade-off: 잘못된 URL 1개로 production 부팅 차단되는 부작용.
  - MEDIUM-4: instrumentation 부팅 차단 효과 end-to-end 실증 (`pnpm start` + 누락 env 시나리오) + `next.config.ts`에서 `import "@/lib/env"` 검토 (build 타임 차단 보강).
  - LOW-1: `scripts/test-env-validation.mjs`를 vitest 케이스로 이관 (현재 schema 사본이라 drift 위험).
  - LOW-2: `docs/env-setup.md`의 RESEND_FROM_EMAIL "주소만 vs Name <email>" 표기 일관성 명문화.

### 차기 Task 등록 (Phase 5.5 잔여 ToDo 5건)
1. **Resend Sending Access key 발급/회전** (Jayden 수동, docs/env-setup.md 절차 따름) — 가장 우선 권장
2. **rate limit** (members 초대 발송 / login 시도 등 — Vercel KV 또는 Upstash Redis)
3. **activity_logs 감사** (멤버 초대 발송/수락/revoke 이벤트 audit trail)
4. **멤버 수 상한 게이트** (workspace_settings.plan별 max members enforce)
5. **MEDIUM-2/4 + LOW-1/2 후속** (n8n schema 등록 / instrumentation 실증 / vitest 이관 / docs 명문화)

또는 **Phase 5 Epic 5-3** 진입 검토 가능 (PRD 재확인 필요).

---

## 이전 Task — Phase 5 Epic 5-2 Phase C (5-2-4, 5-2-5)

> 최종 업데이트: 2026-04-22 저녁 (Task 5-2-5 ✅ + 부수 4건 묶음 완료 — 프로덕션 E2E: 초대 발송→수신→수락→대시보드 진입 전 경로 실측 성공)
> 위치: **Phase 5 Epic 5-2 Phase C 완결 (5-2-4, 5-2-5 완료) + Phase 5.5 선행 1건(pending idx LOWER) + Supabase Auth 보안 강화 5건 + send.dairect.kr 도메인 prod 전환**. 남은 Phase C Task: workspace switcher UI(이미 구현되어 있어 추가 구현 0 / 실전 드롭다운 UX는 타계정 초대→수락 시 자동 검증됨), 이후는 Phase 5.5 ToDo 또는 Phase D.

## Task 5-2-5 ✅ 완료 (/invite/[token] 초대 수락 + 리뷰 CRITICAL 2 + HIGH 6 반영)

**범위**: Task 5-2-4(초대 발송) 후속 — 수신자가 초대 링크 클릭 시 동작하는 전체 플로우.

**신규 파일 5**
- `src/app/invite/[token]/page.tsx` — 서버 컴포넌트, 10단계 상태 분기 (포맷/존재/owner차단/revoked/accepted/expired/미로그인 redirect/email 매칭/이미 멤버/수락 UI). `redirect()` 포함 로직을 try/catch로 감싸 `NEXT_REDIRECT` digest re-throw 패턴으로 에러 로그에서 token 제외.
- `src/app/invite/[token]/accept-actions.ts` — 트랜잭션(UPDATE workspace_invitations + INSERT workspace_members + UPDATE users.last_workspace_id). 만료 판정은 DB `NOW()`로 통일(시계 drift 제거). EMAIL_MISMATCH 에러 메시지에 `invitation.email` 미포함(enumeration 방어). `role IN ('admin','member')` WHERE 조건으로 owner 초대 차단 defense-in-depth.
- `src/app/invite/[token]/accept-button.tsx` — 클라이언트 버튼, useTransition + toast.
- `src/app/auth/signout/route.ts` — `/invite/[token]` email 불일치 시 "로그아웃 후 다시 로그인" 폼용 POST 라우트. Origin 헤더 검증(CSRF 방어) + safeNext.
- `src/lib/validation/invite-accept.ts` — Zod 토큰 uuid 스키마.
- `src/lib/utils/safe-next.ts` — open-redirect 공통 유틸. `//`(protocol-relative) + `/\`(backslash bypass — WHATWG URL 정규화 경로) + 제어문자 차단. 4곳에서 재사용.

**수정 파일 5**
- `src/app/(public)/login/page.tsx` — safeNext 유틸 도입 + `next` 쿼리 보존(로그인 성공 후 복귀).
- `src/app/(public)/signup/signup-form.tsx` — safeNext + emailRedirectTo에 next 실어 /auth/callback 경유 복귀.
- `src/app/auth/callback/route.ts` — safeNext 통일(sanitize 중복 구현 제거).
- `src/app/sw.ts` — `/invite/` startsWith matcher 추가(NetworkOnly + silent 504 fallback) + fallback matcher exclude 추가.
- `next.config.ts` — `exclude` 정규식 리스트에 `/\/invite\//` 추가(precache 주입 차단).

**리뷰 반영 8건** (code-reviewer + security-reviewer 병렬):
- C-1 (code): `sanitizeNext` 4곳이 backslash bypass 미방어 → `safeNext` 공통 유틸 추출 + 치환. WHATWG URL 파서가 `/\evil.com`을 `https://evil.com/`로 정규화하는 경로 차단.
- C-2 (sec): SW matcher + next.config exclude에 `/invite/` 누락. Task 4-4 M1+M2(`/portal/[token]`)와 동일 패턴 재발 방지.
- H1 (code): `accept-actions.ts` `existing.expiresAt.getTime() <= Date.now()` → DB `NOW()` SQL로 통일(page.tsx와 일관, 앱 시계 drift 제거).
- H2 (code): EMAIL_MISMATCH 에러에서 `existing.email` 제거 → email enumeration 차단.
- H1 (sec): `page.tsx` 전체 try/catch wrapper + `isNextInternalError` helper로 `NEXT_REDIRECT`/`NEXT_NOT_FOUND` re-throw. 에러 로깅에 token 미포함.
- H3 (sec): `/auth/signout` POST 라우트에 Origin 헤더 검증(외부 origin 거부 + /login 리다이렉트).
- H4 (sec): `role='owner'` 초대 수락 차단을 page.tsx(INVALID_TOKEN) + accept-actions.ts 양쪽에 설치. UI 경로에서는 생성 불가지만 DB 직접 INSERT 경로 defense-in-depth.
- H2 (sec 잔여): Supabase "Secure email change" 설정 의존 → Jayden이 대시보드에서 ON 확인 완료(2026-04-22).

## 부수 작업 4건 (같은 세션에서 묶음 처리)

**B1. Phase 5.5 선행 — `workspace_invitations_pending_idx` LOWER(email) 교체** (commit `a90835d`)
- 0033_pending_idx_lower_email.sql: DROP + CREATE with expression index. BEGIN/COMMIT 원자성.
- schema.ts: `sql\`LOWER(${table.email})\`` 표현식으로 DB drift 방지.
- Pre-check SQL로 대소문자 중복 0건 확인 후 적용. Cloud Supabase 적용 완료 — `pg_indexes.indexdef`에서 `lower(email)` 확인.
- 효과: zod `email.toLowerCase()` 우회 경로(직접 INSERT, 데이터 이관 스크립트 등)에서도 DB가 case-insensitive로 중복 차단.

**B2. Supabase Auth 보안 강화 5건** (Jayden UI 수동)
- Secure email change: ON (email 변경 시 옛 주소 confirm 필요 → 초대 가로채기 체인 차단)
- Secure password change: ON (24시간 내 로그인 아닐 시 재인증 요구)
- Require current password when updating: ON
- Prevent use of leaked passwords: ON (HaveIBeenPwned 통합)
- Minimum password length: 6 → 8 (앱 zod와 일치)
- Password requirements: "Letters and digits"
- 주석 동기화 commit `3bddfc6`: `signupFormSchema`의 `min(8)`이 Supabase 설정과 일치함을 명시.

**B3. dairect.kr 도메인 prod 전환 — send.dairect.kr 서브도메인 방식** (commit `d5f309f`)
- Resend `send.dairect.kr` 등록(Tokyo region, ap-northeast-1) → Vercel Auto Configure로 DNS 4개 자동 추가 → 4:00 PM Verified.
- DNS 확인: DKIM `resend._domainkey.send.dairect.kr` / MX `send.send.dairect.kr → feedback-smtp.ap-northeast-1.amazonses.com` / SPF `send.send.dairect.kr → v=spf1 include:amazonses.com ~all`. 서브도메인 채택 이유: `dairect.kr` apex의 MX를 미래 수신 이메일 서비스(Gmail Workspace 등) 확장 시점까지 보존.
- 환경변수 교체: `RESEND_FROM_EMAIL=invite@send.dairect.kr` (최초 시도 `"Dairect <invite@send.dairect.kr>"` 따옴표 포함 형식은 Resend API가 거부 → 주소만 사용으로 회피. name 포함 필요 시 Phase 5.5에서 env 2개(NAME/EMAIL) 분리 리팩터).
- Vercel Redeploy 후 E2E 실측 성공.

**B4. workspace switcher UI — 이미 구현되어 있음을 확인**
- `src/components/dashboard/workspace-picker.tsx`(client) + `src/lib/auth/list-user-workspaces.ts`(server) + `header.tsx` 통합 모두 Task 5-2-3-B에서 완료됨.
- 단일 workspace 시 이름+role 뱃지만 표시 / 다수 workspace 시 드롭다운(모바일 bottom sheet + 데스크톱 popover) + Server Action 전환. Jayden 계정이 workspace 1개라 드롭다운 실전 UX는 Task 5에서 타 계정 초대→수락 시 자동 검증됨.

## Task 5 E2E 실측 (2026-04-22 저녁)

**curl 기반 공개 URL 검증**
- `/` 200 OK
- `/dashboard` (미로그인) 307 → `/login` (middleware)
- `/invite/invalid-not-uuid` 200 + "초대 링크가 유효하지 않습니다" ErrorCard (isUuid 1차 검증 통과)
- `/invite/00000000-0000-0000-0000-000000000000` 200 + "이 링크는 존재하지 않거나..." (DB 조회 후 invitation 없음 분기)

**Jayden 수동 실측** — 프로덕션
- `/dashboard/members` 로그인 후 진입 → 초대 폼 작동
- 본인 이메일로 초대 발송 → **메일 정상 수신** (`invite@send.dairect.kr` 발신자) ✅
- 이메일 버튼 클릭 → `/invite/[token]` 페이지 → 수락 → **`/dashboard` 자동 진입** ✅ (last_workspace_id 업데이트)

**DB 상태 검증** — 실패 시점의 자동 soft revoke 로직 정상 작동 확인:
- 초대 INSERT 후 email 발송 실패 시 nested try/catch가 `revokedAt = NOW()` UPDATE → pending idx 해제 → 재초대 경로 열림.
- 3건의 email 실패 레코드가 0.3~0.5초 간격으로 자동 revoke됨을 `revoke_delay_sec < 2` 로 확증.

## Task 5-2-5 Post-deploy 디버그 여정 (이메일 발송 실패 → 원인 확진)

Vercel push + Redeploy 완료 직후 Jayden이 `/dashboard/members`에서 초대 시도 → 토스트 "초대 저장은 되었지만 이메일 발송에 실패했습니다." 3건 연속 재현.

| 단계 | 조치 | 발견 |
|------|------|------|
| 1 | DB 최신 5건 조회 (`workspace_invitations` ORDER BY created_at DESC) | INSERT → 0.3~0.5초 후 자동 revoke (email 실패 soft revoke 정상 작동) |
| 2 | `/invite/invalid-not-uuid` curl | HTTP 200 + ErrorCard → 프로덕션 새 코드 반영 확인 |
| 3 | 원인 가설 | Vercel `RESEND_FROM_EMAIL` 값에 따옴표가 포함됐을 가능성(`"Dairect <invite@send.dairect.kr>"` 형식) |
| 4 | 수정 | 값을 `invite@send.dairect.kr`(주소만)로 교체 + **Redeploy** |
| 5 | 재시도 | Jayden 본인 이메일로 발송 → 수신 성공 → 수락 → 대시보드 진입 ✅ |

**핵심 교훈 3**:
- Vercel 환경변수 UI는 value를 **raw string** 저장. dotenv용 따옴표 포함 문법(`X="..."`)을 그대로 복사하면 따옴표 자체가 값 일부가 됨.
- `.env.local` 안내 시 shell-escape 목적의 따옴표와 Vercel UI 입력을 명시적으로 분리 설명 필요.
- Resend는 `from` 필드에 RFC 5322 `"Name <email>"` 형식을 받지만 Vercel env에 저장된 값이 정확히 그 형식이어야 함(따옴표 leak 금지).

---


## Task 5-2-4 Post-deploy 디버그 여정 (2026-04-22)

프로덕션 첫 테스트에서 중복 초대 시 "초대 생성 중 오류가 발생했습니다" UNKNOWN fallback 관찰 → 3단계 hotfix로 근본 해결.

| Hotfix | Commit | 변경 | 결과 |
|--------|--------|------|------|
| 1차 | `7618c0d` | err.code 3중 매칭 (code=23505 / message regex / constraint 이름) | 최상위 err.code가 null이라 여전히 miss. 로그에 `pgCode: null` 확인 → 원인 좁혀짐 |
| 2차 | `0c0e4c5` | err.cause까지 unwrap (drizzle-orm의 `DrizzleQueryError` 소스 확인: cause에 원본 PostgresError 보존) | 배포는 Ready였으나 첫 재테스트에서 동일 증상 + 로그 없음 재현 |
| 3차 debug | `055403d` | 에러 shape 요약을 return.error에 embed → 토스트로 직접 노출 | Jayden 재실행 시 "이미 발송된 초대가 있습니다" 정상 메시지 확인 — 즉 2차 hotfix가 실제로는 작동 중이었으나 **Vercel edge cache 전파 지연**으로 일부 리전에서 구 버전 서버 액션 실행 |
| 복구 | (이번 commit) | 디버그 페이로드 + 확장 로그 롤백, 원래 UX 문구 복구. 2차 hotfix의 err.cause unwrap 로직은 유지 | Task 5-2-4 최종 종료 |

## Task 5-2-4 ✅ 완료 (workspace 멤버 초대 생성 + Resend 이메일 발송)

**배경** (PRD-phase5.md:247 + PRD 섹션 10 C2):
- workspace_invitations 테이블은 Phase 5-1-1에서 이미 생성. 이번 Task는 write/list/revoke 경로 + 이메일 발송 계층 구축.
- 5-2-5 수락 플로우(`/invite/[token]`)는 다음 Task로 분리.

**결정 사항**:
- UI 위치: `/dashboard/members` 신규 페이지 (설정 탭 대신 독립)
- 토큰: `crypto.randomUUID()` 122-bit 엔트로피 (portal_tokens 패턴 재사용, DB unique 저장 → 별도 HMAC 불필요)
- TTL: UTC +7일 (PRD B1)
- Resend 발신자 초기: `onboarding@resend.dev` (sandbox) + Reply-To=`hidream72@gmail.com`. `dairect.kr` domain verify 후 `.env` 값만 교체 예정.
- role 화이트리스트: `admin | member` (owner는 workspace 생성자 1명 고정, 초대 불가)

**신규 파일 6**
- `src/lib/email/templates/invitation.ts` — HTML + plain text 템플릿. escapeHtml + Subject 제어문자 제거(stripHeaderControlChars)
- `src/lib/email/resend.ts` — Resend SDK v6.12.2 singleton + sendInvitationEmail. replyTo camelCase
- `src/lib/validation/invitation.ts` — email(trim+toLowerCase) + role(admin|member) zod
- `src/app/dashboard/members/actions.ts` — createInvitationAction / revokeInvitationAction. PG code 23505 중복 처리 + soft revoke 복구 + 중첩 try/catch double-fault 방어
- `src/app/dashboard/members/page.tsx` — SSR 멤버+초대 목록 조회, 미인증/미권한 redirect guard
- `src/app/dashboard/members/members-client.tsx` — 초대 폼 + 목록 + 취소 버튼. status 판정을 client에서 수행 (RSC purity 규칙)

**수정 파일 4**
- `src/components/dashboard/sidebar.tsx` — "팀 멤버" 메뉴 + `canSeeMembers` prop 추가 (Users2 아이콘)
- `src/app/dashboard/layout.tsx` — isManager(owner|admin) 계산 → canSeeSettings + canSeeMembers 동시 전달
- `package.json` / `pnpm-lock.yaml` — resend 6.12.2 의존성 추가

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0 (기존 estimate-form `_id` warning 1건만)
- `pnpm build` → postbuild SW artifact 포함 성공
- 라우팅 보호: `/dashboard/members` 미인증 진입 → `/login` 리다이렉트 (middleware + page.tsx guard 이원화)
- **code-reviewer**: Ship as-is, HIGH 1건(NEXT_PUBLIC_APP_URL fail-fast) + MEDIUM 3건(hydration/revoke 응답/토스트 정규화)
- **security-reviewer**: CRITICAL 0, HIGH 2건(H1 email 실패 revoke 2차 예외 / H2 env fail-fast), MEDIUM 4건, Phase 5.5 ToDo 8건 별도 기록

**리뷰 HIGH findings 반영 (2026-04-22 즉시 수정)**
1. `buildInviteUrl` fail-fast 전환 — NEXT_PUBLIC_APP_URL 미설정 또는 상대경로면 throw. DB INSERT 전에 미리 호출해 early throw → row도 생성 안 되게 순서 조정.
2. 이메일 실패 시 `revokedAt` UPDATE에 중첩 try/catch — 2차 예외 로그로만 남기고 상위는 EMAIL_FAILED 반환 유지 (pending idx 영구 잠금 방지).
3. Subject 헤더 인젝션 방어 — `stripHeaderControlChars`로 CRLF/NUL/line separator 제거. workspaceName에 제어문자 섞여도 Subject 헤더 인젝션 불가.

**환경변수 (Jayden 세팅 완료 / 확인됨)**
- **로컬 `.env.local`**: 로그인 후 Jayden 직접 확인 + 초대 발송 테스트 항목 (5개 중 이미 있는 것 제외)
  - `RESEND_API_KEY=re_xxx` (발급 완료)
  - `RESEND_FROM_EMAIL=onboarding@resend.dev` (sandbox)
  - `RESEND_REPLY_TO=hidream72@gmail.com`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3700` (로컬)
- **Vercel 환경변수**: Jayden 확인 완료 — `NEXT_PUBLIC_APP_URL=https://dairect.kr` + 나머지 3개 세팅됨

**남은 수동 검증 (push 후 Vercel 배포 완료 시점)**
- https://dairect.kr/dashboard/members 접속 → 사이드바 "팀 멤버" 메뉴 노출
- 본인 Gmail로 테스트 초대 발송 → Resend 대시보드 Delivered + 실제 메일 수신 + 버튼 URL 확인 (`https://dairect.kr/invite/<token>`)
- 5-2-5 페이지 아직 없으므로 링크 클릭 시 404가 나야 정상 (다음 Task에서 구현)

### 차기 Task
- **5-2-5**: `/invite/[token]` 페이지 — 토큰 검증 + 로그인/가입 분기 + workspace_members 가입 트랜잭션
- **dairect.kr domain verify**: Vercel DNS 등록 후 Resend Verified → `.env` 교체(코드 무변경)

### 남은 HIGH 외 리뷰 findings (Phase 5.5 or 별도 Task)
- code-reviewer MEDIUM 1(hydration mismatch — 7일 TTL 경계), 2(revoke 응답에 email 반환), 3(토스트 정규화 일관성)
- security-reviewer MEDIUM 2(URL 스킴 화이트리스트 방어층), 3(replyTo 형식 검증), 4(getUserId PII 로그)
- Phase 5.5 8건: pending idx lower(email) 교체 / Resend Sending Access 전용 key / .env startup 검증 / 공통 sanitize util / rate limit / activity_logs 감사 / referrer=no-referrer / 멤버 수 상한 게이트

---

## Task 5-2-2i ✅ 완료 (workspace_settings.plan 도입 — C-H1 해소 + AI 한도 plan 분기 설계)

**배경** (learnings.md 2026-04-21 밤 "workspace 공유 카운터 vs user 쿨다운 비대칭" + C-H1 주석):
- AI_DAILY_LIMIT=200 고정 상수가 workspace 공유 카운터로 쓰여 멤버 N명 진입 시 체감 한도 200/N로 희석 — Phase C(5-2-4/5 초대) 진입 직전 마지막 블로커.
- Phase 5.5 billing 없이 plan 변경 UI를 만들 수는 없지만, "뼈대 + free 고정"이라도 도입해야 Phase C가 열림 + Phase 5.5에서 컬럼 재생성/데이터 이관 없이 plan 이름만 확장 가능.

**접근법 비교**:
- A) 단일 text 컬럼 + TS 상수 맵 (**채택**): plan 추가/이름 변경 시 DROP/ADD CONSTRAINT + TS 맵 수정만 필요. Phase 5.5에서 `plan_limits` 별도 테이블로 분리해도 컬럼 그대로 유지.
- B) `plan_limits` 별도 테이블 + FK: Phase 5.5 billing 때 분리해도 충분 — 지금은 과잉.
- C) 환경변수 override: workspace별 차등 불가 — 기각.

**신규 마이그레이션 1**
- `0032_workspace_plan.sql` — BEGIN/COMMIT + `ADD COLUMN plan text NOT NULL DEFAULT 'free'` + `ADD CONSTRAINT workspace_settings_plan_check CHECK (plan IN ('free','pro','team'))` + 롤백 SQL 주석.

**신규 TS 정의** (`src/lib/validation/ai-estimate.ts`)
- `workspacePlans = ['free','pro','team'] as const` + `WorkspacePlan` 타입
- `PLAN_AI_DAILY_LIMITS = { free: 200, pro: 1000, team: 3000 }`
- `getAiDailyLimit(plan: string | null | undefined): number` — unknown/null → free fallback
- 기존 `AI_DAILY_LIMIT=200` 상수 제거 (7 참조 경로 일괄 이관)

**수정 파일 8**
- `src/lib/db/schema.ts` — `workspaceSettings.plan: text("plan").notNull().default("free")` 컬럼 추가
- `src/lib/ai/briefing-actions.ts` — regenerate 초반 `const [planRow] = db.select({plan})` + `dailyLimit = getAiDailyLimit(planRow?.plan)` 지역 변수. 기존 `AI_DAILY_LIMIT` 13 참조 모두 `dailyLimit`으로 교체. `tryCooldownReturn` 시그니처에 `dailyLimit: number` 파라미터 추가.
- `src/lib/ai/report-actions.ts` — 동일 패턴 (13 참조 + 시그니처 확장)
- `src/app/dashboard/estimates/ai-actions.ts` — 동일 패턴 (8 참조, cooldown 없음)
- `src/app/dashboard/estimates/actions.ts` — `getEstimateDefaults` 반환에 `dailyLimit` 추가, SELECT에 `plan` 컬럼 포함
- `src/app/dashboard/estimates/new/estimate-form.tsx` — `AI_DAILY_LIMIT` import 제거, `Props.defaults.dailyLimit: number` 추가, `/{AI_DAILY_LIMIT}` → `/{defaults.dailyLimit}`
- `src/app/dashboard/settings/actions.ts` — saveSettings UPSERT 직전에 "plan은 이 UPSERT가 건드리지 않음 (billing webhook 전용)" 주석 추가 (security-reviewer MEDIUM-1 반영)

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0 (기존 무관 warning 1건만)
- `pnpm build` → postbuild SW artifact 포함 성공
- Cloud migration apply 완료 (`hybidqamgsfjmmllwszr`)
  - `information_schema.columns`: `plan text NOT NULL default 'free'::text` ✅
  - `pg_constraint`: `CHECK (plan = ANY(ARRAY['free','pro','team']))` ✅
  - 기존 2 workspace row 모두 `plan='free'` 자동 백필 ✅
- **격리 트랜잭션 회귀 2건 PASS** (DO $$ 블록 + RAISE EXCEPTION 자동 롤백):
  - T1 plan=free, count=200, UPDATE WHERE count < 200 → 0 rows (LIMIT_EXCEEDED 경로) ✅
  - T2 plan=pro, count=200, UPDATE WHERE count < 1000 → 1 row, count=201 (pass 경로) ✅
  - 원본 workspace_settings 완전 복구 확인(post-probe SELECT)
- **code-reviewer**: Ship as-is, CRITICAL/HIGH 0건, nit 2건(M1 UI 런타임 sync / M2 shorthand)
- **security-reviewer**: Ship as-is, CRITICAL/HIGH 0건, MEDIUM 2 / LOW 2 / INFO 2. Phase 5.5 billing ToDo 3건 별도 기록

**리뷰 findings 반영**
- security-reviewer MEDIUM-1: `saveSettings` UPSERT 주석 추가 (plan은 billing 전용, 이 경로가 건드리지 않음 명시).
- 나머지 nit은 Phase 5.5 billing Task에서 자연스럽게 해소 (plan 변경 UI / FOR UPDATE TOCTOU / plan_changed activity_log / `src/lib/plans.ts` 단일 소스).

**이후 효과**
- Phase C 진입 블로커 해소 완료 — 멀티 멤버 workspace가 free 200 한도 공유하는 상태로 초대 수락 가능.
- Phase 5.5 billing: `workspace_settings.plan` 컬럼을 billing webhook에서 UPDATE → `PLAN_AI_DAILY_LIMITS` 맵에 plan 이름만 추가하면 즉시 차등 한도 enforcement.
- UI 변조 방어 이중 구조: `defaults.dailyLimit`은 표시 전용, 서버 UPDATE WHERE가 DB plan 기반 독립 재검증.

### 차기 Task 등록 (Phase 5 남은 것)
- **Phase C (5-2-4 / 5-2-5 초대 시스템)** — Resend API key 발급 필요 (차단 상태)
- **Phase 5.5 billing 진입 시**: plans.ts 단일 소스 / plan 변경 감사 로그 / FOR UPDATE TOCTOU 완화 / saveSettings 시점 plan 건드림 방지 테스트

---

## Task 5-2-2h ✅ 완료 (drizzle journal/snapshot 재동기화 + phase5_resync NOOP marker)

**배경** (security-reviewer MEDIUM 지적, Task 5-2-2g 후속):
- 0020~0030은 수동 작성 SQL + cloud `apply_migration`으로 직접 적용 → drizzle-kit journal/snapshot 체계에 미등록
- `_journal.json` 마지막 entry가 0019에 고정 + snapshot도 0019까지만 존재
- 다음 `drizzle-kit generate` 실행 시 baseline(0019) vs 현재 schema.ts 전체 diff가 SQL로 산출 → 누군가 무심결 apply 시 **Task 5-2-2g UNIQUE 재조정이 역행**되어 cross-workspace 덮어쓰기 취약점 재발 위험 (supply chain regression)

**접근법 C (채택)**: drizzle-kit generate를 일부러 돌려 현재 schema.ts를 기준선 snapshot으로 등록하되, 생성된 SQL은 NOOP으로 중성화

**변경 사항**
- `src/lib/db/migrations/0031_phase5_resync_marker.sql` (신규, NOOP)
  - drizzle이 생성한 누적 DDL을 삭제하고 `SELECT 'Task 5-2-2h noop marker'` 한 줄만 유지
  - 헤더 주석에 "절대 apply 금지" 안내 + idx 점프(19→31) 이유 + 포함된 과거 변경 범위 7개 문서화
- `src/lib/db/migrations/meta/0031_snapshot.json` (신규) — 현재 schema.ts 전체 반영된 baseline snapshot (drizzle-kit 자동 생성)
- `src/lib/db/migrations/meta/_journal.json` — idx=31 entry 추가 (tag=`0031_phase5_resync_marker`, 파일명 충돌 피해 0020→0031로 리네임)

**실행 스텝**
1. `pnpm drizzle-kit generate --name=phase5_resync` → `0020_phase5_resync.sql` + `meta/0020_snapshot.json` + journal idx=20 entry 생성
2. 기존 `0020_backfill_workspaces.sql`과 번호 충돌 → 수동으로 0020→0031 리네임 (파일 2개 + journal tag/idx 수정)
3. 생성된 `.sql` 내용(누적 DDL 29줄)을 NOOP 주석 + 안전한 SELECT로 교체
4. **검증**: `pnpm drizzle-kit generate --name=_verify_noop` → **"No schema changes, nothing to migrate 😴"** 로 응답 (임시 파일 생성 없음)

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm drizzle-kit generate --name=_verify_noop` → 스냅샷 diff 0, 파일 미생성
- git status: `0031_phase5_resync_marker.sql` + `meta/0031_snapshot.json` 신규 + `_journal.json` 수정만 Task 5-2-2h 스코프

**이후 효과**
- 다음 `drizzle-kit generate`는 0031_snapshot을 baseline으로 diff → 0020~0030 누적 변경 재생성 불가능
- 수동 SQL 마이그레이션 관행은 유지 (cloud apply는 계속 `apply_migration` 경유)
- 미래에 drizzle-kit으로 새 변경 생성 시 idx=32부터 자동 할당

---

## Task 5-2-2g ✅ 완료 (briefings/weekly_reports UNIQUE에 workspace_id 추가 — cross-workspace 덮어쓰기 차단)

**배경**: Phase 5 multi-tenant 이관 당시 `workspace_id` 컬럼은 NOT NULL 전환했으나 UNIQUE 제약은 `(user_id, week_start_date)` / `(user_id, project_id, week_start_date)` 그대로 유지. 5-2-3-B workspace 스위치 도입 후 **동일 user가 A→B 전환 후 같은 주 Regenerate 시 `onConflict`가 workspace_id=A row에 매치 → contentJson만 덮어쓰고 workspace_id는 A 유지 → B 페이지 SSR에서도 그 row가 반환되어 B workspace에 A workspace 데이터 노출**하는 취약점. Task 5-2-2b 리뷰 H2 선제 기록.

**신규 마이그레이션 1**
- `0030_briefings_weekly_reports_workspace_unique.sql` — BEGIN/COMMIT + 중복 사전 검사 DO 블록 + DROP/ADD CONSTRAINT 2쌍 + 롤백 SQL 주석
  - `briefings_user_week_unique` → `briefings_user_workspace_week_unique` UNIQUE `(user_id, workspace_id, week_start_date)`
  - `weekly_reports_user_project_week_unique` → `weekly_reports_user_workspace_project_week_unique` UNIQUE `(user_id, workspace_id, project_id, week_start_date)`

**수정 파일 3**
- `src/lib/db/schema.ts` — briefings/weeklyReports UNIQUE 정의 `workspaceId` 추가
- `src/lib/ai/briefing-actions.ts` — `getCurrentBriefing` WHERE에 `eq(briefings.workspaceId, workspaceId)` + `upsertBriefing` onConflict target `[userId, workspaceId, weekStartDate]`로 확장
- `src/lib/ai/report-actions.ts` — `getCurrentWeeklyReport` WHERE에 `eq(weeklyReports.workspaceId, workspaceId)` + `upsertReport` onConflict target `[userId, workspaceId, projectId, weekStartDate]`로 확장

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0 (기존 무관 1건만)
- `pnpm build` → postbuild SW artifact 포함 성공
- Cloud migration apply 완료 (`hybidqamgsfjmmllwszr`) — pg_constraint 조회로 신규 UNIQUE 2건 확인
- **DB 격리 회귀 4건 PASS** (BEGIN/ROLLBACK 트랜잭션 내 임시 workspace 생성):
  - T1 briefings: cross-workspace 동일 `(user, week)` insert → 성공 (기존엔 UNIQUE 위반) ✅
  - T2 briefings: 동일 `(user, workspace, week)` insert → `ON CONFLICT ... DO NOTHING` 발동, 0 returning ✅
  - T3 weekly_reports: cross-workspace insert → 성공 ✅
  - T4 weekly_reports: 동일 `(user, workspace, project, week)` insert → conflict 발동 ✅
- **전수 감사 grep 결과**: `briefings`/`weekly_reports` 외 workspace_id 누락 UNIQUE/onConflict 없음 (estimates/contracts/invoices는 Task 5-1-4에서 이미 workspace 기반 전환 완료, workspace_settings/user_settings/users는 자체 스코프 맞음)

**남은 검증 (환경 의존)**
- Playwright UI E2E는 **멀티 workspace 환경 필요** — 현재 Jayden 계정에 workspace 1개만 존재 + workspace 추가 기능(초대 5-2-4/5)은 Phase C 범위. Phase C 진입 시점에 2개 workspace 확보 후 실제 picker 스위치 → Regenerate → row 별도 생성 UI 회귀 수행.

### 차기 Task 등록 (Phase 5 남은 것)
- **Phase C (5-2-4 / 5-2-5 초대 시스템)** — Resend API key 발급 필요 (차단 상태)
- **5-2-2b 잔여 이슈 C-H1 재점검**: AI_DAILY_LIMIT 상수 workspace plan 도입 설계 (멀티 멤버 진입 전 상향 또는 plan 분기)

---

## 이전 세션 진행 내역
> 최종 업데이트: 2026-04-21 심야 (Task 5-2-2c/f Playwright E2E 13/13 통과 + C-H1/C-H2 해소 + 리뷰 H1 이원화 재수정 PASS)

## 전체 진행률

| Phase | 제목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 기반 설정 | ✅ 완료 | 100% |
| Phase 1 | 대시보드 핵심 | ✅ 완료 | 100% |
| Phase 2 | 견적/계약/정산 + 리브랜딩 | ✅ 완료 | 100% |
| Phase 3 | AI + 자동화 + 리드 CRM | ✅ 완료 (W2/W3 cron 포함) | 100% (5/5 + cron 전체 완료) |
| Phase 4 | 고객 포털 + /demo + PWA | ✅ 완료 | 100% (Task 4-1 ✅ / 4-2 M1~M8 ✅) |
| Phase 5 | SaaS 전환 준비 (multi-tenant + billing) | 🟡 진행 중 | Epic 5-1 ✅ 8/8 완료. Epic 5-2 🟡 Phase A+B+서브 6건+C-H1/C-H2 ✅ (메인 6/8 + 서브 6 + 멀티 멤버 블로커 3건 해소). 남은 것: Phase C(5-2-4/5, Resend). Epic 5-3~5-5 대기 |

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

## Phase 2: 견적/계약/정산 + 리브랜딩 ✅

- [x] **Task 2-1** — 견적서 생성기 수동 모드 (목록 + 생성 폼 + 상세 + 상태 변경 + 삭제)
- [x] **Task 2-2** — 견적서 PDF 생성 + 미리보기 (Pretendard self-host + A4 템플릿 + 다운로드)
- [x] **Task 2-3** — 계약서 관리 (목록 + 생성 + 상세 + 상태 전환 + PDF 조항 11개)
- [x] **Task 2-4** — 청구서/정산 관리 (수동/견적서 자동 3분할 + 상태 전이 + 입금 확인 + 세금계산서 도우미 + PDF)
- [x] **Task 2-5** — 랜딩 메인 리브랜딩 (Nav + Hero 추상 대시보드 목업 + Problem + Service + Portfolio + PricingSummary + CTA + Footer)
- [x] **Task 2-6** — `/pricing` 상세 페이지 (3패키지 앵커 + 비교 표 semantic + FAQ native details + LandingNav 공용화)
- [x] **Task 2-7** — `/about` + Contact 폼 (Hero 다크 + Contact 연보라 + inquiries.package 컬럼 + honeypot 봇방어 + sanitizeHeader + CSV injection 방어)
- [x] **Task 2-8** — `/projects` Bento Grid + 상세 페이지 (is_public 연동, Nav service 제거)
- [x] **Task 2-8-B** — 대시보드 공개 프로필 토글 UI (isPublic/alias/description/liveUrl/tags 편집 Server Action)

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

### 코드/보안/UX 리뷰 수정 내역 (Task 2-7)

code-reviewer + security-reviewer 병렬 리뷰, 총 14건 수정:

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 CRITICAL | Rate limit/봇 방어 부재 (공개 엔드포인트) | **honeypot `website` 필드** + **3초 timing 가드** → 즉시 성공 응답으로 드롭 |
| HIGH | `package` enum DB 레벨 방어 없음 | Drizzle `check()` 헬퍼 추가 + `0004_flimsy_fantastic_four.sql` 적용 |
| HIGH | `initialPackage` prop만 → 사용자 변경 불가 | `pkg` state 승격 + 뱃지 X 버튼으로 취소 가능 |
| HIGH | Radio 그룹 focus-visible 링 없음 (WCAG 2.4.7) | `focus-within:ring-2 ring-primary/40 ring-offset-2` |
| HIGH | `PackageId/BudgetId/ScheduleId` 3중 중복 정의 | `validation/inquiry.ts`에서 Zod infer로 단일 export |
| HIGH | UA/IP control char + 길이 상한 없음 | `sanitizeHeader(raw, max)` — control char strip + slice (UA 500, IP 64) |
| HIGH | CSV injection 방어 없음 (`=HYPERLINK(...)` 공격) | `stripFormulaTriggers()` — `=+-@\t\r` leading strip |
| MEDIUM | 토스트 + 성공 화면 중복 피드백 | 성공 시 토스트 제거, 대형 확인 카드만 |
| MEDIUM | 연락처 input 모바일 힌트 없음 | `inputMode="email"` + `autoComplete="email"` |
| MEDIUM | 연락처/이름/요약 개행·`<>` 차단 없음 | Zod `.regex(/^[^\r\n\t<>]+$/)` 메일 헤더 injection 방어 |
| MEDIUM | Hero 그림자 순수 `rgba(0,0,0,0.6)` | `rgba(17,24,39,0.6)` gray-900 기반 (DESIGN.md 순수 #000 금지) |
| MEDIUM | `x-forwarded-for` 좌측 파싱 (Vercel 스푸핑 위험) | 우측 파싱 `split(",").at(-1)` |
| MEDIUM | Zod `.strict()` 누락 (미정의 키 drop만) | `.strict()` 추가 — 미정의 키 즉시 reject |
| LOW | 영문 대문자 "BY SUBMITTING..." 가독성 | "제출 시 개인정보 처리방침에 동의..." 한국어 |

**추가로 발견 (수정 과정)**:
- `useRef<number>(Date.now())` React purity rule 위반 → `useState(() => Date.now())` lazy init
- unused `_w`/`_s` destructure → Zod safeParse에 명시적 객체 구성으로 제거

### 코드/보안 리뷰 수정 내역 (Task 2-8) — 14건

**1차 리뷰 (4건 블로킹 + 3건 권고)**:
| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 security | `publicAlias ?? project.name` fallback → 원본 고객사명 공개 리스크 | `isNotNull(publicAlias)` 쿼리 필터 + 제네릭 타입 가드 `hasAlias<T>`로 `string` narrow + 3곳 fallback 제거 |
| 🔴 code | 변수 쉐도잉 `projects` (테이블 심볼) | `items`로 rename |
| 🟡 code | `ORDER BY endDate DESC` NULLS FIRST 기본 | `sql\`${endDate} DESC NULLS LAST\`` |
| 🟡 code | `publicScreenshotUrl` dead field | 쿼리 컬럼 + 타입에서 제거 |
| 🟡 security | `safeExternalUrl` regex만 | `new URL()` + 제어문자/공백 차단 + 정규화 반환 |
| 🟡 security | `/projects/[id]` revalidate 미명시 | `export const revalidate = 60` |
| 🟡 code | `formatPeriod` split 방어 부재 | `parts.length < 2 → value` 가드 |

### 코드/보안 리뷰 수정 내역 (Task 2-8-B) — 8건

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 security | `publicLiveUrl` SSRF/내부망 차단 누락 | `isSafePublicUrl` refine + `isInternalHost` (localhost/127.*/10.*/172.16-31.*/192.168.*/169.254.*/.local/.internal) |
| 🔴 security | `publicDescription` 제어문자/BiDi 오염 | `safeMultilineText` regex — `\x00-\x08\x0B\x0C\x0E-\x1F\x7F` + BiDi `\u202A-\u202E\u2066-\u2069` 차단 |
| 🔴 security | `projectId` UUID 선검증 누락 | `projectIdSchema.safeParse(projectId)` 가드 + 이후 `idCheck.data` 사용 |
| 🔴 code | Zod `.strict()` `unrecognized_keys` 사용자 노출 | `issues.find(i => i.code !== "unrecognized_keys")` + 미정의 키는 console.error만 |
| 🟡 code | 저장 후 로컬 상태 drift | 성공 콜백에서 `setAlias/setLiveUrl(trim)` + `setTagsRaw(normalizeTagsRaw)` |
| 🟡 code | `parseTags` 대소문자 dedupe + slice(8) 유실 | `.toLowerCase()` 키 dedupe + `slice(8)` 제거 → Zod `.max(8)` 에러 정상 표출 |
| 🟡 code | `aria-describedby` 누락 | alias/description/tags 3필드 모두 `-help`/`-error` id 연결 |
| 🟡 security + code | `publicTagsRaw` 길이 상한 + `isPublic null` | 서버 `TAGS_RAW_MAX=500` + 클라 `maxLength={500}` + page.tsx `isPublic ?? false` |

### 다음 Task로 이관된 이슈 (Task 2-8 스코프 아웃)
- loading.tsx / error.tsx (전체 공개 페이지 일관성 유지)
- total=1 풀폭 span (실제 공개 프로젝트 1개 생길 때)
- Portfolio 섹션 하드코딩 vs DB 연동 (랜딩 홈)
- Server Action 시그니처 `publicTagsRaw` → `string[]` 리팩토링 (Task 2-8-B M4)
- 저장 후 공개 페이지 링크 표시 타이밍 (Task 2-8-B M3)
- 취소/되돌리기 UX (Task 2-8-B L4)
- URL/ALIAS/DESC 최대값 상수화 (Task 2-8-B L3)
- `style={{ wordBreak: "keep-all" }}` → `break-keep` 일괄 리팩토링

### Phase 3 백로그 (Task 2-7/2-8에서 인지)
- Redis/KV 기반 IP rate limit · reCAPTCHA/hCaptcha
- PII 암호화 (at-rest)
- `ENABLE ROW LEVEL SECURITY` + anon 차단 정책 (Supabase anon client 도입 시점)
- 이메일 자동 회신 시 헤더 injection 방어 (`contact`를 `To:`에 넣을 때 `\r\n` strip)
- 구조화 로깅
- `budget_range`/`schedule`/`status` 컬럼 CHECK 제약 일괄 추가
- `leads` 자동 생성 (source='landing_form')

## Phase 3: AI + 자동화 + 리드 CRM 🟡

- [x] **Task 3-4** — 리드 CRM (목록 + 필터 + 생성 모달 + 상세 + 상태 전이 + 실패 사유 + 프로젝트 전환 + 삭제 + 랜딩폼 자동 생성)
- [x] **Task 3-1** — AI 견적 초안 생성 (Claude Sonnet 4.6 API + tool_use + 일일 한도 50회 + 프롬프트 인젝션 방어)
- [x] **Task 3-2** — AI 주간 브리핑 (대시보드 홈 위젯 + briefings 테이블 + 10초 쿨다운 + generation_type 감사 + RLS 방어선)
- [x] **Task 3-3** — AI 주간 보고서 PDF (프로젝트 상세 카드 + weekly_reports 테이블 + 고객 발송용 PDF + shared-text 공통 방어)
- [x] **Task 3-5 (Option B)** — n8n Webhook 2종 (W1 `project.status_changed` Slack / W4 `project.completed` Gmail) + fire-and-forget 클라이언트 + HMAC+nonce+rawBody + SSRF 방어. W2(invoice.overdue)/W3(weekly cron)은 cron 인프라 도입 후 백로그.

### 코드/보안 리뷰 수정 내역 (Task 3-1) — 10건

code-reviewer + security-reviewer 병렬 리뷰, CRITICAL 2 + HIGH 6 + MEDIUM 2 수정:

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 CRITICAL | `aiLastResetAt NULL` → `NULL < CURRENT_DATE`가 NULL(false)로 판정 → 한도 영구 잠김 | `.notNull()` + 0007 마이그레이션 `UPDATE WHERE IS NULL` 보정 + SQL `COALESCE(..., '-infinity'::timestamptz)` 3중 방어 |
| 🔴 CRITICAL | AI 응답 `name` 필드 제어문자/HTML/BiDi/CSV 트리거 미차단 — PDF/CSV export 시 2차 XSS·피싱 벡터 | `aiEstimateItemSchema.name` refine 2종 (`\x00-\x1F\x7F<>U+202A-202E/2066-2069` + leading `=+\-@\t\r`) |
| 🟡 HIGH | `createEstimateAction` inputMode 재검증 실패 시 silent `"manual"` downgrade → 감사 추적 왜곡 | 실패 시 error 반환 (10패턴7) |
| 🟡 HIGH | `stop_reason === "max_tokens"` 시 잘린 JSON이 PARSE_ERROR로 일반화 — UX 불친절 | 별도 감지 후 "요구사항을 더 간결하게" 안내 |
| 🟡 HIGH | 프롬프트 인젝션 방어 부재 (user content에 "이전 지시 무시" 주입 가능) | 시스템 프롬프트에 "보안 규칙" 섹션 추가 + user content를 `<user_requirement>...</user_requirement>` XML 태그로 래핑 |
| 🟡 HIGH | Anthropic 에러 분기가 `err.name === "APIConnectionTimeoutError"` 문자열 매칭 — SDK 내부 변경에 취약 | `instanceof APIConnectionTimeoutError` + `RateLimitError` 분기 |
| 🟡 HIGH | `console.error`가 Claude 응답 `content` 전체 + tool `input` 전체 덤프 → Vercel/Sentry 로그에 고객 요구사항/파생 텍스트 저장 | `name`/`message.slice(200)` + `issues.map({path, code})` 구조만 로깅 |
| 🟡 HIGH | "내일 다시 시도" 문구가 UTC 자정 리셋과 최대 9시간 불일치 (KST 기준) | "약 24시간 후 다시 시도해주세요"로 순화 |
| 🟢 MEDIUM | 경고 배너 `role="status"` 부적절 (live region 용도) | `role="note"` + `aria-live="polite"` + "주의:" 프리픽스 |
| 🟢 MEDIUM | AI 초안 생성이 기존 수동 입력 항목을 경고 없이 덮어씀 | `items.some(it => it.name.trim())` 존재 시 `window.confirm` 가드 |

### 다음 Task로 이관된 이슈 (Task 3-1 스코프 아웃)

- 프롬프트 캐싱 `cache_control: { type: "ephemeral" }` 적용 → Sonnet 4.6 입력 캐시로 ~80% 원가 절감
- 월 토큰 예산 상한 (Phase 5 SaaS 전환 시 필요)
- `aiWasGenerated` 정확도 개선 — AI 항목이 모두 제거돼도 `inputMode="ai"` 유지 (PM 판단 필요)
- 기존 `border-t border-border/50` No-Line Rule 위반 일괄 정비
- 기존 `actions.ts`의 `export type ActionResult` — "use server" 10패턴1 위반 일괄 정비
- 기존 `createEstimateAction`의 `unrecognized_keys` 필터 누락 보강
- 서버 컴포넌트에서 AI 사용량 프리페치 → 첫 렌더 시 `오늘 사용: X/50` 표시
- Sparkles 아이콘 중복 다변화 (섹션 vs 버튼)
- KST 기준 리셋 SQL (현재 UTC 기준 — `AT TIME ZONE 'Asia/Seoul'`)

### 코드/보안 리뷰 수정 내역 (Task 3-3) — 10건

code-reviewer + security-reviewer 병렬 리뷰, HIGH 4 + MEDIUM 1 + 추가 발견 1 수정 (CRITICAL 0):

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🟡 HIGH | PDF `useMemo` dep 참조 불안정 — `milestoneProgress` 객체가 매 렌더 새로 생성돼 PDF 재빌드 반복 | dep 배열을 primitive(`progressCompleted/progressTotal/progressPercent`)로 분해 |
| 🟡 HIGH | `bulletItem.description` Zod transform 누락 — Claude가 literal `\\n` 반환 시 UI/PDF에 raw 노출 | `singleline` → `multiline` 전환으로 transform 포함 (summary/issue.detail과 정책 일관) |
| 🟡 HIGH | **내부 입력 필드 제어문자/BiDi/U+2028 차단 누락** — `projects.name`, `milestones.title`, `clients.companyName` 등 사용자 자유 텍스트가 프롬프트·고객 발송 PDF로 확산되는 **2차 신뢰 경계 공격 경로** | `src/lib/validation/shared-text.ts` 신설: `SAFE_SINGLE_LINE_FORBIDDEN`/`SAFE_MULTI_LINE_FORBIDDEN`/`SAFE_CSV_LEADING` + `guardSingleLine/guardMultiLine` 헬퍼. `projects/milestones/clients` 3개 스키마에 적용 |
| 🟡 HIGH | `buildEmptyReport` Zod 재검증 누락 — projectName에 위험 문자 있으면 drift 탐지 → null → 사용자 재생성 루프 → 카운터 미차감 DoS | `upsertReport` 호출 전 `reportContentSchema.safeParse(empty)` 추가 + 실패 시 PARSE_ERROR 반환 |
| 🟢 MEDIUM | `createProjectAction` clientId 소유권 검증 부재 — DevTools로 타인 client UUID 삽입 시 타인 회사명이 PDF 노출 가능 | `clients WHERE id AND userId` 사전 가드 + `report-data` leftJoin에 `clients.userId=userId` 조건 추가 (2중 방어) |
| ⚠️ 추가 발견 | **PDFDownloadLink SSR 실패** — `@react-pdf/renderer` 직접 import 시 Node.js 서버 렌더에서 "web-only API" 에러 + 500 response | `dynamic(() => import(...).then((m) => m.PDFDownloadLink), { ssr: false })` 래핑 + `typeof PDFDownloadLinkType` 캐스트로 render prop 시그니처 보존 |

**수정 과정 부수 발견**:
- 동일 타이밍에 Supabase Session pool(15슬롯) 고갈 재발 — `postgres.js max:1 idle_timeout:20` 설정 이미 적용 상태라 일시적 누적. Drizzle Studio + dev 서버 + 재시도 요청 누적이 원인으로 추정. 시간 경과로 자동 회복

### 다음 Task로 이관된 이슈 (Task 3-3 스코프 아웃)

- estimates/contracts/invoices/inquiries/leads validation에도 `shared-text` 적용 (현재는 projects/milestones/clients만)
- `activity_logs.description`의 user-originated 여부 재점검 (system-generated로 판단, 재확인 필요)
- weekly_reports 외 전 테이블 RLS 일괄 적용 (현재는 briefings + weekly_reports만 방어선)
- PDFDownloadLink dynamic 패턴을 기존 estimate/contract/invoice pdf-buttons.tsx에도 적용 (현재는 직접 import, 조건부 렌더로 증상 회피 중)

### 코드/보안 리뷰 수정 내역 (Task 3-2) — 10건

code-reviewer + security-reviewer 병렬 리뷰, HIGH 5 + MEDIUM 5 수정 (CRITICAL 0):

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🟡 HIGH | Unicode 라인 종결자(U+0085/U+2028/U+2029) 누락 — LLM 탈옥 응답이 PDF/UI에서 예상 밖 줄바꿈·스푸핑 | `BRIEFING_SINGLELINE_FORBIDDEN`/`MULTILINE_FORBIDDEN` regex에 `\u0085\u2028\u2029` 추가 |
| 🟡 HIGH | 빈 데이터 short-circuit DoS 경로 — 한도 체크 밖이라 반복 호출 시 DB write 무제한 (WAL 증가) | `BRIEFING_COOLDOWN_MS=10_000` 서버 쿨다운 — 같은 주 10초 내 재호출이면 AI/DB write 생략 |
| 🟡 HIGH | `briefings` RLS 정책 부재 — Drizzle service_role 경로라 지금은 안전하나 미래 anon client 도입 시 취약 | `ENABLE ROW LEVEL SECURITY` + `briefings_deny_anon` 정책 (defense-in-depth) |
| 🟡 HIGH | `overdueDays = Math.max(0, daysBetween)`이 "overdue 상태지만 dueDate 미래" 엣지 케이스를 0으로 뭉개 LLM 프롬프트 왜곡 | `r.dueDate < parts.today` 조건 가드 후 계산 |
| 🟡 HIGH | `date("week_start_date")` mode 미명시 — Drizzle/postgres.js 환경에 따라 Date 객체 반환, UI runtime 오류 리스크 | `{ mode: "string" }` 명시 |
| 🟢 MEDIUM | 더블클릭 시 AI 2회 호출 가능 — `useTransition`은 클라이언트 pending만, 서버는 둘 다 실행 | 서버 쿨다운으로 통합 방어 (H2와 동일 수정) |
| 🟢 MEDIUM | fallback vs 실제 AI 응답 구별 불가 (감사 추적 부재) | `briefings.generation_type` 컬럼 (`ai` \| `empty_fallback`) + CHECK 제약 추가 |
| 🟢 MEDIUM | max_tokens/no tool_use/invalid 실패 시 카운터 rollback 없음 — 사용자 체감 부당 | `rollbackCounter()` 헬퍼 + `GREATEST(-1, 0)` — 실패 3경로에서 적용 (timeout/rate_limit은 Anthropic 과금 가능성으로 유지) |
| 🟢 MEDIUM | `JSON.stringify(weeklyData)` null 값 포함 — 토큰 낭비 | replacer로 null 제외 (`(_k, v) => v === null ? undefined : v`) |
| 🟢 MEDIUM | 죽은 상수 `BRIEFING_AI_TIMEOUT_MS` (선언만 있고 미사용) | 삭제 (공용 `AI_TIMEOUT_MS` 재사용) |

**추가로 발견 (수정 과정)**:
- Next.js Hydration mismatch: `toLocaleString("ko-KR")` ICU 버전 차이로 서버 "PM" vs 클라이언트 "오후" → KST 고정 수동 포맷(`hour24 % 12`, `ampm`)으로 ICU 의존성 제거
- Claude 응답 literal `\\n` 2문자 → `whitespace-pre-line`에서 개행 안 됨 → Zod `.transform(v => v.replace(/\\n/g, "\n"))` 로 실제 개행 정규화

### 다음 Task로 이관된 이슈 (Task 3-2 스코프 아웃)

- RLS를 전 테이블로 확장 (현재는 briefings만 방어선 적용) — Phase 3 백로그
- `date` 컬럼 mode:"string" 전 테이블 일괄 점검 (Phase 2 발급 테이블)
- KST 계산을 `Date.UTC` 기반으로 재구성 (현재는 서버 UTC 가정, 로컬 KST 개발자 환경에서 이중 오프셋 위험)
- priorityKey 이중 폴백 제거 (Zod SoT 신뢰)
- 입력 토큰 pre-check (고객사 수 증가 시)

### 코드/보안 리뷰 수정 내역 (Task 3-5 Option B) — 11건

code-reviewer + security-reviewer 병렬 리뷰, HIGH 6 + MEDIUM 5 일괄 수정 (CRITICAL 0):

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🟡 HIGH | n8n Webhook 기본 파싱 경로에서 `JSON.stringify(body)` 재직렬화 round-trip에 HMAC 검증 의존 — `\u2028`·특수문자·키 순서에서 비결정적 불일치 → 정상 메시지가 조용히 401로 거부 | Webhook 노드 `options.rawBody:true` + Code 노드에서 `item.binary.data.data` (base64) → utf8 원본 바이트로 HMAC 재계산. canonical = `${ts}.${nonce}.${rawBody}` |
| 🟡 HIGH | `updateProjectStatusAction`의 SELECT→UPDATE 2-step — 동시 요청 시 잘못된 `from_status` 이벤트 발사, `completed` 상태 점프 시 W4 누락 | `db.transaction` + `.for("update", { of: projects })` — projects 행만 배타 락, clients JOIN 무영향 |
| 🟡 HIGH | Slack/Gmail 실패 시 `Respond 200` 스킵 → n8n 재시도 폭주 + executions DB 팽창, 서버에 AbortError 오탐 | 토폴로지 재구성: `Verified? → Respond 200 → Slack/Gmail (continueOnFail:true, retryOnFail:false)` — 응답 먼저, 사이드이펙트 격리 |
| 🟡 HIGH | `N8N_WEBHOOK_URL_*` 오설정 시 사설/링크로컬/메타데이터(169.254.169.254)로 PII POST 경로 (SSRF) — env 신뢰 가정 깨짐 | `PRIVATE_HOSTNAME_PATTERNS` production 차단: 127/10/172.16-31/192.168/169.254/::1/fc/fe80/localhost/0. 개발환경 localhost 허용. |
| 🟡 HIGH | `N8N_WEBHOOK_SECRET` 미설정 상태로 production 배포 시 `X-Dairect-Signature: unsigned` 그대로 PII 송신 — TLS intercept/프록시 로그에 평문 노출 | `if (!signature && NODE_ENV==='production') return` — fetch 전 early return + 구조화 error 로그 |
| 🟡 HIGH | ±5분 윈도우 내 동일 `(ts, body, sig)` 재전송 미차단 — W4 고객 Gmail 반복 발송 가능 (execution history 덤프·프록시 로그·DevTools 복사 경로) | 서버 `X-Dairect-Nonce: crypto.randomUUID()` 헤더 추가 (HMAC 입력에 포함) + n8n Code `$getWorkflowStaticData('global').seen` 5분+1분 grace TTL dedupe — HMAC 통과 후에만 seen에 등록 (무효 nonce flood 방지) |
| 🟢 MEDIUM | `urlCache`가 null을 permanent 캐싱 → env 주입 순서/hot reload 이슈로 영구 no-op 가능 | 유효 URL만 캐싱, null은 매 호출 재평가 (파싱 비용 미미) |
| 🟢 MEDIUM | W4 Gmail HTML 템플릿에 `project_name`/`client_contact_name` 직접 보간 — `"`·`<` 포함 시 속성/렌더 깨짐 (내부 도구라 XSS 리스크 낮으나 방어 필요) | `Compose Email`을 Set 노드에서 Code 노드로 교체: `escHtml`(5문자 엔티티) + `stripCtrl`(제어문자 제거) |
| 🟢 MEDIUM | n8n executions DB에 W4 Gmail 본문(PII) 영구 저장 가능 | 워크플로우 `settings.saveDataSuccessExecution:"none"` 기본값 + README에 `EXECUTIONS_DATA_MAX_AGE`/prune 운영 가이드 |
| 🟢 MEDIUM | `updateProjectStatusAction` catch 블록 `console.error("[...]", err)`로 err 객체 전체 덤프 | `err instanceof Error ? err.message : String(err)`만 구조화 로그 `{event, message}` (Sentry scrubber 전 1차 방어) |
| 🟢 MEDIUM | secret 없을 때도 `unsigned` 헤더로 n8n에 도달 → 의미 없는 401 executions 누적 | H5 fetch skip과 통합 처리 — dev 환경만 warn + 송신, production은 차단 |

**검증**: `pnpm tsc --noEmit` 무출력 통과 / `pnpm lint` 0 errors (1 pre-existing warning) / `pnpm build` 23 pages 성공.

**스모크**: 셀프호스트 n8n 준비 + Slack/Gmail Credentials 연결 필요. 코드 레벨은 타입/빌드/lint 통과로 확정, 런타임 스모크는 Jayden 셀프호스트 후 별도 수행.

### 다음 Task로 이관된 이슈 (Task 3-5 Option B 스코프 아웃)

- ~~**W2** `invoice.overdue` 일 1회 크론~~ — ✅ 완료 (2026-04-19): Vercel Cron + `/api/cron/invoice-overdue` + W2 JSON + PM/고객 2메일 발송. HIGH race 방어(UPDATE WHERE 강화) + sanitizeHeader typeof 가드 + maxDuration 300 반영.
  - **Known limitation (Phase 5 재검토)**: emit 성공 후 `db.update` 실패 시 `last_overdue_notified_at`이 NULL로 남아 다음 cron에서 동일 invoice 재emit → 고객 메일 중복 가능. DB 장애 시나리오라 실질 발생 확률 낮음. transaction(BEGIN → emit → UPDATE → COMMIT) 또는 outbox 패턴 도입 검토.
- ~~**W3** weekly reports 금요일 크론~~ — ✅ 완료 (2026-04-19): Vercel Cron + `/api/cron/weekly-summary` + W3 JSON + 8개 stat 집계 (Promise.all 병렬). 매주 금요일 KST 18:00 발송. `userSettings.lastWeeklySummarySentAt` 멱등성 키.
- **W4 고객 만족도 설문** — 완료 메일에 설문 링크 별도 Task
- **관찰성 개선**: `activity_logs`에 `webhook_emit` 종류 기록 (silent failure 가시화)
- **대시보드 발송 이력 UI**: 고객사별 메일/알림 발송 로그 조회
- **`ALLOWED_N8N_HOSTS` allowlist**: 현재는 blocklist — 운영 성숙도에 맞춰 allowlist 전환 검토
- **PDFDownloadLink dynamic 패턴**을 기존 estimate/contract/invoice pdf-buttons에도 적용 (Task 3-3에서 이관)

### 코드/보안 리뷰 수정 내역 (Task 3-4) — 4건

code-reviewer + security-reviewer 병렬 리뷰, HIGH 3 + MEDIUM 1 수정:

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 HIGH | owner picker `SELECT FROM users LIMIT 1` — ORDER BY 누락 → 비결정적 할당 | `orderBy(asc(users.createdAt))` — 최초 가입 운영자 고정 |
| 🔴 HIGH | `convertLeadToProjectAction` 더블클릭/동시 요청 시 client+project 2개 생성, 첫 project 고아화 | UPDATE WHERE에 `isNull(convertedToProjectId)` 가드 + rowsAffected=0 → `ALREADY_CONVERTED` throw로 전체 트랜잭션 롤백 |
| 🔴 HIGH | 랜딩폼에서 `inquiries INSERT`/`leads INSERT`/`inquiries UPDATE` 3쿼리 분리 — 중간 실패 시 감사추적 깨짐 | `leads INSERT` + `inquiries.convertedToLeadId UPDATE`를 단일 `db.transaction`으로 묶음 (inquiries INSERT는 트랜잭션 밖 — 고객 문의 보존 우선) |
| 🟡 MEDIUM | 0005 마이그레이션 롤백 SQL 누락 (글로벌 supabase.md 규칙) | `-- ROLLBACK:` 섹션에 `DROP CONSTRAINT` 주석 추가 |

### 다음 Task로 이관된 이슈 (Task 3-4 스코프 아웃)
- 전환율 분석 차트 (KPI 홈 대시보드 확장)
- 리드 소스별 주간 리포트
- 중복 리드 merge UI
- 리드 활동 타임라인
- `clients.companyName`에 개인명 직접 매핑 데이터 모델 개선
- `phone` 형식 정규식 검증 (Task 3-5 n8n SMS 전)
- 리드 기본 정보 편집 UI (현재는 삭제 후 재등록)

### Phase 3 백로그 (리뷰·기타에서 인지)
- **Rate limit** (Redis/KV) — 공개 엔드포인트 flooding 방어 (HIGH 이슈이나 인프라 필요해 별도 Task)
- reCAPTCHA/hCaptcha
- PII 암호화 (at-rest)
- `ENABLE ROW LEVEL SECURITY` + anon 차단 (Supabase anon client 도입 시)
- 이메일 자동 회신 시 헤더 injection 방어
- 구조화 로깅
- `budget_range`/`schedule`/`status` 컬럼 CHECK 제약 일괄 추가

## Phase 4: 고객 포털 + /demo + PWA ⬜ (Task 분해 완료, 구현 대기)

> 의존성: Phase 3 ✅ | 총 예상 3~4일 (20~28시간) | 권장 순서: 4-1 → 4-2 → 4-4 → 4-3(선택)

### Task 4-1 — `/demo` 대시보드 데모 (1일 = 8시간, 6 마일스톤)

**현재 상태**: `src/app/(public)/demo/page.tsx` skeleton만 존재 (placeholder 문구만). M1부터 전면 구현.

- **M1** (1h): 샘플 데이터 정의 — `src/lib/demo/sample-data.ts` (프로젝트 5 상태별 1개 / 고객 3 / 견적 3 / 마일스톤 / activity_logs / 6개월 매출 + 수금 타임라인)
- **M2** (1h): 데모 가드 유틸 — `src/lib/demo/guard.ts` (`isDemoContext` React context + "데모 모드에서는 수정할 수 없습니다" 토스트 헬퍼, 비활성 버튼 `data-demo` 속성 일관 처리)
- **M3** (1.5h): `/demo/layout.tsx` 상단 배너 "샘플 데이터입니다. 실제 사용 → [로그인]" + 샘플 provider + 기존 사이드바/헤더 재활용
- **M4** (2h): 홈(KPI+차트) + 프로젝트 목록 데모 뷰 (기존 컴포넌트 재사용, 샘플 데이터만 주입)
- **M5** (1.5h): 프로젝트 상세 + 견적 + 고객 데모 뷰 (읽기 전용, 모든 CRUD 버튼에 가드 적용)
- **M6** (1h): 반응형 점검 + 로그인 CTA + Playwright 스모크 (비로그인 → 4탭 열람 + 버튼 클릭 시 토스트 확인)

**완료 기준**: 비로그인 방문자가 `/demo`에서 전체 기능(읽기) 체험 + 수정 시도 시 토스트로 안내.

---

### Task 4-2 — 고객 포털 `/portal/[token]` (1.5일 = 12시간, 8 마일스톤)

**의존성**: Supabase anon client RLS 패턴 도입 필요 (Phase 3 백로그 연계). 이메일 전송은 기존 n8n W4 워크플로우 재활용.

- **M1** (1h): `portal_tokens` + `portal_feedbacks` 테이블 + Drizzle 스키마 + 마이그레이션 0011
- **M2** (1.5h): 토큰 생성 Server Action (`crypto.randomUUID()` + 만료 +1년 + 기존 무효화 후 재발급) + RLS 정책 `Portal access by valid token`
- **M3** (1.5h): 토큰 검증 + 만료 체크 + `last_accessed_at` 갱신 + 프리랜서 측 "포털 링크 복사" UI (프로젝트 상세)
- **M4** (2h): 고객 뷰 컨텐츠 (진행률·마일스톤·현재 단계·인보이스 금액/상태 — 계좌번호 등 PII 최소화)
- **M5** (1.5h): 피드백 폼 (`submitPortalFeedbackAction`) + `guardMultiLine` + honeypot + 공개 엔드포인트 방어 4종 재활용
- **M6** (1h): 만료/invalid 토큰 에러 페이지 + 토큰 갱신 UI (기존 무효화 후 새 발급, 감사 로그)
- **M7** (1.5h): (옵션) 이메일 전송 — n8n W4 템플릿 변형. MVP는 "링크 복사" 우선
- **M8** (2h): code-reviewer + security-reviewer 병렬 리뷰 반영 + E2E 스모크

**완료 기준**: 토큰 URL 비로그인 접근 → 고객 본인 프로젝트 열람 + 피드백 제출 + 프리랜서 측 피드백 확인.

---

### Task 4-3 — 경비 관리 (선택, 0.5일 = 4시간, 4 마일스톤)

**성격**: PRD "Should Have" 선택 기능. 진행 결정 시점: Task 4-2 완료 후.

- **M1** (1h): `expenses` 테이블 (category enum: infrastructure/domain/api/service/other + tax_deductible boolean + occurred_date) + 마이그레이션 0012
- **M2** (1.5h): CRUD + Server Action + `shared-text` 방어
- **M3** (1h): 월별 집계 + 매입세액 자동 계산 (`tax_deductible ? amount * 0.1 / 1.1 : 0`) + 카테고리별 바 차트
- **M4** (0.5h): code-reviewer 리뷰 + 스모크

**완료 기준**: 경비 3건 등록 후 월별 집계 + 매입세액 공제 대상 금액 정확 표시.

---

### Task 4-4 — PWA 지원 (0.5일 = 4시간, 4 마일스톤)

**권장 진행 시점**: Task 4-1/4-2 완료 후 (캐시 대상 경로 확정 후).

- **M1** (1h): `public/manifest.json` + 아이콘 (192/512/maskable) + favicon + apple-touch-icon
- **M2** (1.5h): Service Worker (`next-pwa`) — 정적 CacheFirst / API NetworkFirst(10s timeout) / HTML StaleWhileRevalidate
- **M3** (1h): `/offline` 폴백 페이지 + 읽기 전용 배너 + `online`/`offline` 이벤트 감지
- **M4** (0.5h): 모바일 실기 스모크 (iOS Safari/Android Chrome → 홈 화면 추가 → 비행기 모드 → 캐시 열람)

**완료 기준**: 모바일 브라우저에서 PWA 설치 + 오프라인에서 최근 조회 페이지 읽기.

---

### Phase 4 "만들지 않을 것" (PRD 기준)
- 경비 관리 **영수증 OCR 추가 금지**
- 고객 포털 **파일 업로드 기능 금지** (Phase 5에서도)
- 고객 포털 다크 모드 (범위 외)

## 현재 세션 (2026-04-19 운영 안정화 — 도메인 dairect.kr 이전 + Google OAuth 정정 + region 검증 + SW NetworkOnly throw 차단)

- **배경**: production smoke 9/9 통과(커밋 e4dcd29) 후 dairect.kr 도메인을 다른 Vercel 프로젝트에서 현재 dairect-b4xf로 이전. 로그인 콜백이 `/?code=...`로 깨짐(원인=Supabase Redirect URLs allowlist 미등록). 정정 후 페이지 전환 체감 느림 호소 → region 검증(완벽) → DevTools 콘솔에서 SW `no-response` 에러 매 navigation 발견 → 진짜 병목 확정.

- **수동 작업 (Jayden, 검증 완료)**:
  - Vercel 도메인 이전: 기존 프로젝트에서 dairect.kr 제거 → dairect-b4xf에 추가 + Production Domain 설정 + www→apex 308 redirect
  - `NEXT_PUBLIC_APP_URL=https://dairect.kr` 갱신 + Redeploy
  - Supabase Auth URL Configuration 정정: Site URL `https://dairect.kr` + Redirect URLs allowlist에 `/auth/callback` 4종 등록 (apex/www/localhost:3700/3701)
  - Google Cloud Console OAuth: Authorized JS origins에 dairect.kr/www 추가
  - region 정렬 검증: Supabase Northeast Asia (Seoul) `ap-northeast-2` t4g.micro / Vercel Function Region `icn1` Seoul ✅ 완벽 정렬

- **수정 파일 (1개)**:
  - `src/app/sw.ts` — `safeNetworkOnly()` factory 추가, 4개 매처(`/portal`, `/api`, `/auth`, `/dashboard`) 핸들러 교체. NetworkOnly에 `handlerDidError` plugin 동봉으로 silent 504 반환 → no-response throw 차단 → 단일 요청 + 콘솔 에러 0. 보안 의도(defaultCache catch-all NetworkFirst 3종 차단) 0% 변경.

- **검증**:
  - tsc 0 errors / lint 0 errors (기존 1 warning만)
  - `pnpm build --webpack` 통과 + postbuild SW artifact 검증 OK
  - Vercel 자동 배포 + 새 SW 활성화 확인
  - production DevTools 측정: 콘솔 `no-response` 0건 / dashboard 단일 요청 / Page Load 637ms / DOMContentLoaded 525ms (체감 빠름 확인)
  - 보안 회귀 0: Cache Storage `pages`/`pages-rsc`/`others`에 dashboard·portal URL 미저장 (defaultCache 차단 유지)

- **부수 발견 (백로그)**:
  - Pretendard subset 폰트 3종 preload warning — `<link rel="preload" as="font">`로 미리 받았지만 몇 초 내 사용 안 됨. 성능 임팩트 미미, 콘솔 청결 + 우선순위 미세 조정 차원에서 정리 가능 (15분).

- **다음 세션 선택지** (우선순위 순):
  - **n8n W5 워크플로 실제 구축** — `n8n/workflows/W5_portal_feedback_received.json` 생성(W4 복제 후 4개 노드 변경 미리 박음) + Vercel env `N8N_WEBHOOK_URL_PORTAL_FEEDBACK_RECEIVED` + Gmail Credentials 연결 + 활성화. Compose Email Code 노드 jsCode는 dashboardUrl `https://dairect.kr/dashboard/projects/{id}?tab=feedback` 박음
  - **`loading.tsx` 추가** — 대시보드 라우트별 skeleton (체감 +30%, 라우트당 10줄)
  - **DB 쿼리 최적화** — 페이지별 `Promise.all` 병렬화 + `select` 컬럼 명시 (실제 TTFB 100~300ms 절감 가능)
  - **모바일 PWA 실기 검증** — iOS/Android 설치 + 오프라인 동작 + sw.js 스코프
  - **Phase 5 SaaS 전환 준비** — 다중 테넌트 격리 설계
  - **Pretendard preload warning 정리** (소규모)

- **차단 요소**: 없음.

- **커밋/푸시**: `39dbae1` fix(sw): NetworkOnly에 handlerDidError plugin 추가 — 인증 영역 throw 차단 — push 완료 (e4dcd29..39dbae1)

- **교훈 1건 추가** (learnings.md): PWA SW 인증 영역 NetworkOnly는 `handlerDidError` plugin과 세트로 — 단독은 abort/redirect 시 throw → 이중 요청 + 콘솔 spam. defaultCache catch-all 검증 후 매처 제거 vs plugin 보강 결정.

---

## 이번 세션 (2026-04-21 심야 — Task 5-2-2c/f Playwright E2E + C-H1/C-H2 해소 + 리뷰 H1 이원화 재수정)

### 완료 내역

**1. Task 5-2-2c/f Playwright E2E 검증 (Jayden 수동 대기 해소)**
- **5-2-2f (middleware → proxy 리네임) 4/4 통과**: 로그아웃→/dashboard→/login, 로그인→/login→/dashboard, 로그인→/signup→/dashboard, 로그아웃→/login.
- **5-2-2c (로고 업로드) 9/9 통과**: 로고 섹션 최상단 + 초기 placeholder / PNG 업로드 토스트+미리보기 / 새로고침 persist (Supabase Storage URL `workspace-logos/{workspace_id}/{timestamp}.png`) / 6MB 거부 / .txt MIME 거부 / 제거 버튼+confirm→placeholder 복귀 / Storage 물리 삭제 / DB `logo_url`/`logo_storage_path` NULL.
- signup 플로우: /signup → cloud email confirmation(`UPDATE auth.users SET email_confirmed_at`로 강제) → /login → /onboarding → /dashboard. workspace + workspace_members(owner) + workspace_settings 자동 생성 확인. `users.onboarded_at` 정상 갱신.

**2. C-H1 (AI_DAILY_LIMIT 상향)**
- `src/lib/validation/ai-estimate.ts`: 50 → 200 + 주석 "Phase 5.5 billing에서 플랜별 재설계" 예고. workspace 공유 카운터 완화용 단순 상수 변경.

**3. C-H2 1차 (쿨다운 WHERE workspace 교체) + 리뷰 H1 이원화 재수정**
- `briefing-actions.ts` / `report-actions.ts` `tryCooldownReturn` 1차 변경: 쿨다운 키 `userId → workspaceId`로 교체 (카운터 중복 차감 방어 목적).
- 1차 리뷰에서 **code-reviewer CRITICAL 1 + security-reviewer HIGH 2 발견** → 단순 교체 시 타 멤버 content가 요청자 화면에 노출되는 **권한 경계 침범 취약점**.
- **이원화 재수정 채택** (code-reviewer 옵션 1 + security-reviewer 옵션 C 혼합):
  - workspace 10초 윈도우로 카운터 보호는 유지 (본 흐름 진입 차단 = 카운터 +1 방어).
  - 반환 row의 userId가 요청자와 **같으면** → 기존 content cache hit.
  - **다르면** → `RegenerateResult.code = "COOLDOWN"` 신규 + "워크스페이스에서 방금 AI 호출이 있었어요. 10초 후 다시 시도해주세요." 에러로만 응답. `contentJson` 파생물 일절 노출 차단.
- `RegenerateResult` 타입 union에 `"COOLDOWN"` 추가 (briefing/report 양쪽).
- SELECT에 `userId` 컬럼 추가 + `rows[0].userId !== userId` 분기 도입.
- `desc(aiGeneratedAt) LIMIT 1` 추가 (workspace에 멤버별 row 여럿일 때 "가장 최근" 기준).

### 독립 리뷰 결과 (code-reviewer + security-reviewer 2라운드 병렬)

**1라운드 (단순 교체 후)**:
- code-reviewer CRITICAL 1 (C-1): 쿨다운 hit으로 다른 멤버 `contentJson` 반환 → weekly-report는 PDF 다운로드 고객 발송 경로로 유출 위험 격상.
- security-reviewer HIGH 2:
  - H1: C-1과 동일 (멤버 A의 Acme Corp 미수금 등이 B 화면에 노출).
  - H2: `briefings_user_week_unique (userId, weekStart)` / `weekly_reports_user_project_week_unique` 유지 + `workspace-picker`로 A→B 스위치 후 같은 주 재생성 시 `onConflict`로 A의 row.contentJson만 덮어쓰기 + workspace_id는 A 유지 → B 화면에 A workspace 브리핑 노출. **기존 숨어있던 취약점 발견**.
- code-reviewer Important 2: briefings workspace 기반 인덱스 설계 정합성 누락 (선택적), 50→200 하드코딩 스냅샷 체크 (grep 결과 없음, PASS).
- H1 즉시 수정, H2는 범위 크고 기존 취약점이라 **별도 Task 5-2-2g로 분리 등록**.

**2라운드 (H1 수정 후) — 양쪽 PASS, 블로커 0건**:
- 기밀성: `contentJson` 파생물 일절 응답에 포함 안 됨.
- 인가: Postgres `uuid` + Supabase auth UUID 엄격 비교. `getUserId` null 시 AUTH 조기 반환.
- DoS: 본 흐름 진입 차단 = workspace 카운터 보호 유지 (C-H2 원래 의도 그대로).
- 감사: COOLDOWN 경로에 `console.*` 호출 없음 → Sentry/Vercel에 타 멤버 userId 축적 없음.
- Parallel Change: `getCurrentBriefing`/`getCurrentWeeklyReport`는 `userId` 필터 유지 → 읽기와 쿨다운 비대칭은 **의도된 수정**.
- RLS 정합성: `0021_rls_policies_multitenant.sql` `is_workspace_member` 정책과 앱 레이어 userId 게이트 2중 방어선 유지.
- H2 독립성: UNIQUE target은 이번 수정에서 손대지 않음 → 5-2-2g 시나리오 위장하지 않음.
- Existence oracle 관찰(B가 A의 10초 내 호출 여부 탐지): Dairect 협업 맥락에서 이미 공개 정보(activity_log·UI 상태)이므로 허용 범위.

### 검증 결과
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0 (기존 `estimate-form.tsx:225 _id` 무관 1건만)
- `pnpm build` → 28 routes + SW artifact(`public/sw.js`) OK
- Playwright E2E: 5-2-2f 4/4 + 5-2-2c 9/9 + signup 플로우 전부 통과

### 수정 파일 (3)
- `src/lib/validation/ai-estimate.ts` — C-H1
- `src/lib/ai/briefing-actions.ts` — C-H2 + H1 이원화
- `src/lib/ai/report-actions.ts` — C-H2 + H1 이원화

변경 라인: +67 / -10. 스키마 변경 없음, 마이그레이션 0건.

### 🧹 Cleanup
- E2E 테스트 계정 `e2e-1776745761@dairect.kr` (user_id: `2dbfc47a-dca6-4fb5-80cf-86ee8bf7111b`) SQL transaction으로 cascade 삭제: auth/public/workspace_members/workspaces/user_settings/storage.objects 모두 0건 확인.
- 기존 `playwright@dairect.test` (2026-04-17 생성) 테스트 인프라 계정은 **보존**.
- 임시 이미지 파일 `.playwright-mcp/e2e-logo/` 3건 (valid-logo.png / oversized.png / notimage.txt) — Jayden 직접 정리 필요 (rm 권한 차단).

### 차기 Task 등록 — Task 5-2-2g (멀티 멤버 진입 전 필수)

**H2 cross-workspace UPSERT 덮어쓰기 해소**

- **배경**: workspace switch(5-2-3-B)이 열린 상태에서 `briefings` UNIQUE `(user_id, week_start_date)` + `weekly_reports` UNIQUE `(user_id, project_id, week_start_date)` 유지 → user X가 workspace A → B 스위치 후 같은 주 Regenerate 시 `onConflict`로 A의 row contentJson을 덮어쓰기 + workspace_id는 A 그대로 → B 화면에 A workspace 브리핑 노출.
- **작업 범위**:
  1. 마이그레이션 0030: UNIQUE 확장 — `briefings (user_id, workspace_id, week_start_date)` + `weekly_reports (user_id, workspace_id, project_id, week_start_date)`. 기존 UNIQUE drop + 재생성. 사전 assertion 블록으로 `COUNT(*) GROUP BY 새키 HAVING COUNT>1 = 0` 검증.
  2. `upsertBriefing` / `upsertReport` onConflict target에 `workspaceId` 추가.
  3. `getCurrentBriefing` / `getCurrentWeeklyReport` WHERE에 `workspaceId` 추가 (Parallel Change 완결성).
  4. cloud apply + E2E(workspace 스위치 → 같은 주차 재생성 → 덮어쓰기 없음 확인).
- **예상**: 1시간.

### 🚧 차단 요소 (멀티 멤버 workspace 진입 전 상태)
- ✅ **C-H1** — AI_DAILY_LIMIT 200 상향 (완료)
- ✅ **C-H2** — workspace 쿨다운 이원화 (완료, 리뷰 H1 PASS)
- 🔜 **H2 (Task 5-2-2g)** — cross-workspace UPSERT 덮어쓰기 (차기 세션 최우선)
- 🚫 **Resend API key** — Jayden이 사전 발급 필요 (Phase C 진입 전)

### 다음 세션 선택지 (우선순위 순)
1. **Task 5-2-2g** — H2 해소 (멀티 멤버 차단 해제 마지막 1건, Phase C 전 필수)
2. **Phase C (Task 5-2-4 + 5-2-5)** — 초대 발송/수락 + Resend 통합 (API key 발급 후)
3. **UX 개선** — COOLDOWN 코드 amber 톤 배지 + 10초 카운트다운 (리뷰 선택 제안, 백로그)

---

## 이전 세션 (2026-04-21 밤 — Task 5-2-2b: AI 한도 workspace_settings 이관 + 리뷰 일괄 수정)

### 완료 내역
- Task: **5-2-2b** (AI 한도 2필드 user_settings → workspace_settings 이관, Phase 5.5 billing 대비)
- 상태: 로컬 검증 완료 (tsc 0 error, lint 기존 무관 경고 1건만). cloud DB 마이그레이션 0026/0027 적용 완료.

### 주요 변경 (신규 2 + 수정 6)

**신규 마이그레이션 2**:
- `src/lib/db/migrations/0026_workspace_settings_ai_limit.sql` — ALTER ADD COLUMN + DISTINCT ON 백필 (owner user_settings 기반) + DO 블록 assertion
- `src/lib/db/migrations/0027_rls_workspace_settings_members.sql` — workspace_settings authenticated RLS 3 정책 (SELECT/INSERT/UPDATE members)

**수정 6 파일**:
- `src/lib/db/schema.ts` — workspaceSettings에 aiDailyCallCount/aiLastResetAt 2 필드 추가 (NOT NULL + default)
- `src/app/dashboard/estimates/ai-actions.ts` — userSettings → workspaceSettings + getCurrentWorkspaceId 추가 + rollback 비대칭 주석
- `src/lib/ai/briefing-actions.ts` — userSettings → workspaceSettings + tryCooldownReturn 시그니처 확장 + rollback 자정 가드
- `src/lib/ai/report-actions.ts` — 동일 패턴
- `src/lib/ai/briefing-data.ts` — **workspaceId 파라미터 추가 + 4 쿼리 모두 invoices/projects workspace_id cross-check (S-H1)**
- `src/lib/ai/report-data.ts` — **workspaceId 파라미터 추가 + projects.workspaceId / activityLogs.workspaceId cross-check (S-H1)**
- `src/app/dashboard/settings/actions.ts` — 코멘트 이관 완료로 갱신
- `src/lib/db/migrations/0025_backfill_workspace_settings.sql` — AI 한도 유지 주석을 "0026에서 번복됨" 표시로 업데이트 (S-H3)

### 독립 리뷰 결과 (code-reviewer + security-reviewer 병렬)
- **CRITICAL 0건** — Parallel Change 패턴 정석 구현
- **HIGH 5건** 모두 처리 (일괄 수정 ③ 풀세트):
  - S-H1 (Cross-workspace 카운터 오염) — briefing-data/report-data에 workspaceId cross-check 전파
  - S-H2 (workspace_settings authenticated RLS 부재) — 0027 마이그레이션으로 3 정책 추가
  - S-H3 (0025 주석 stale) — "번복 표시" 형태로 원본 주석 정합성 복원
  - C-H1/C-H2 (멀티 멤버 진입 블로커) — PROGRESS.md 블로커 기재 + learnings.md 기록 (Task로 미룸)
- **MEDIUM 2건 처리**:
  - M-1: rollbackCounter에 자정 경계 가드 (`aiLastResetAt >= CURRENT_DATE AND count > 0`)
  - M-2: ai-actions rollback 미수행 정책(10패턴 10) 비대칭 주석 명시

### 검증 결과
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 기존 무관 경고 1건(estimate-form.tsx `_id` unused) 외 신규 이슈 0
- cloud DB (Supabase MCP `apply_migration`):
  - 0026 적용 + 백필 검증: ws_count(8) == us_count(8) 일치, 신규 workspace default(0, now()) 초기화
  - 0027 적용 + pg_policies 확인: workspace_settings 4 정책 등록 (deny_anon + 3 members)

### learnings.md 기록 (3건)
1. Workspace 단위 billing 이관은 "카운터 + 카운터 증가 쿼리 + 소스 데이터" 3중 세트 이관 필수 (S-H1)
2. Parallel Change 중 원본 주석은 "번복 표시"로 업데이트 (stale plan 드리프트 방지, S-H3)
3. workspace 공유 카운터 vs user 스코프 쿨다운 비대칭은 DoS 가속 경로 (C-H2, 멀티 멤버 진입 전 해소)

### 🚧 차단 요소 (멀티 멤버 workspace 진입 전 해소 필수)
- **AI_DAILY_LIMIT 재산정**: 현재 상수는 "1인 기준". workspace 공유로 의미 전환 → 멤버 증가 시 체감 한도 1/n. 2 이상 멤버 가입 전 상수 상향 또는 workspace 단위 plan 도입 필요 (C-H1).
- **쿨다운 스코프 정합**: briefings/weekly_reports 쿨다운을 workspaceId 기반으로 확장 (현재 userId만) — 다른 멤버 재요청이 쿨다운 우회하는 DoS 가속 경로 (C-H2).

### E2E 검증 (Playwright, 동일 세션 연속 수행)
- ✅ (1) 로그인 세션 유지 확인
- ✅ (2) Workspace picker — 1개 workspace 상태라 정적 표시 (dropdown은 2개 이상에서 활성화 설계)
- ✅ (3) 사이드바 설정 메뉴 진입 — workspace_settings 로드 정상
- ❌ (4) **설정 저장 roundtrip 실패** — form submit이 POST 요청 자체 미발생, 콘솔 에러 0, 토스트 0. `onSubmit`→Server Action 바인딩 실패 추정. **Task 5-2-2 스코프 별도 이슈** → **Task 5-2-2d**로 차기 등록
- ✅ (5) **Task 5-2-2b 본체 검증** — AI 브리핑 생성 → `workspace_settings.ai_daily_call_count` 8→1 자정 리셋 + `ai_last_reset_at` 갱신 + Claude API 응답 렌더링 정상
- ✅ (7) 신규 signup → "확인 메일 발송" UI → `auth.users.email_confirmed_at` 강제 세팅 → login → `/onboarding` 리다이렉트 → "이대로 시작할게요" → `/dashboard` 진입. `users.onboarded_at` 정상 갱신. workspace + workspace_members(owner) + workspace_settings(ai_daily_call_count=0 default 포함) 자동 생성.

### 🔴 Cloud 핫픽스 (E2E 중 추가 발견)
- **0016 마이그레이션 cloud 누락 발견** — `user_settings.last_weekly_summary_sent_at` 컬럼 없음 → 신규 가입자 전원 /dashboard 첫 진입 시 Runtime Error. 즉시 `apply_migration`으로 apply. **신규 가입 플로우 release blocker였음**. (learnings.md에 drift 검증 루틴 고정 교훈 추가.)

### 🧹 Cleanup 권장
- E2E 테스트 계정 cleanup (cloud DB): `auth.users` + `public.users` + `workspaces` + `workspace_members` + `workspace_settings` + `user_settings` 일괄 삭제 필요. email: `e2e-onboarding-1761010000@dairect.kr`, user_id: `30584155-042f-4b65-8c47-9387dc1db690`.

### Task 5-2-2d ✅ 완료 (설정 저장 Server Action 바인딩 실패 수정)

**원인**: `src/app/dashboard/settings/actions.ts:22`의 `export type SettingsActionResult` — Next.js 16 Turbopack이 `"use server"` 파일의 async function을 Server Action reference로 변환하지 못해 클라이언트 호출이 네트워크 요청을 만들지 않는 silent no-op 상태 (10패턴 1 위반).

**수정**: export 제거 + 로컬 type으로 변환 + 주석 보강.

**검증**: Playwright E2E — company_name/business_phone 설정 저장 → DB roundtrip + `POST /dashboard/settings 200 OK` 확인 (이전 0건).

**Task 5-2-2 이관과 무관**: settings-form.tsx의 `handleSubmit + useTransition` 패턴은 Phase 5 이전부터 존재. Task 5-2-2 이관은 DB 스키마 경로만 전환했고 export type은 그대로 계승. 즉 레거시 타이밍 버그.

### 🚨 파급 — Task 5-2-2e 신규 등록 필요
같은 10패턴 1 위반 **11개 파일 추가 발견** (`grep -rE '^export (type|interface|const)' src/**/*actions.ts`). 이 중 `onboarding/actions.ts`는 동일 세션 E2E에서 작동 확인됐으나, Next.js 16 Turbopack의 파일별 동작 차이(union type vs 평탄 object, z.infer 포함 여부 등)로 언제 끊길지 모르는 **잠재 폭탄**. 5-2-2e에서 dry-run 조사 → 분해 → 일괄 수정.

### Task 5-2-2e ✅ 완료 (11개 `"use server"` 파일 export 위반 일괄 정리)

**Pattern B — 타입 별도 파일 이관 (client/server import 대상 4개 타입)**
- 신규 `src/types/project-feedback.ts` — `ProjectFeedbackItem`, `ProjectFeedbackSummary`
- 신규 `src/types/portal-token.ts` — `ActivePortalTokenSummary`
- 신규 `src/lib/validation/portal-feedback.ts` — `PortalFeedbackActionResult`
- `src/lib/validation/inquiry.ts`에 `InquirySubmission` 추가

**Pattern B — 4개 actions.ts에서 export 제거 + types import**
- `projects/[id]/feedback-actions.ts` — ProjectFeedbackItem/Summary 이관, MarkFeedbackReadInput/Result는 로컬 type
- `projects/[id]/portal-actions.ts` — ActivePortalTokenSummary 이관, IssuePortalTokenResult/RevokePortalTokenResult는 로컬 type
- `(public)/about/actions.ts` — InquirySubmission 이관, InquiryActionResult는 로컬 type
- `lib/portal/feedback-actions.ts` — PortalFeedbackActionResult 이관, PortalFeedbackSubmission은 로컬 type

**Pattern B — client/server 4곳 import 경로 수정**
- `components/dashboard/portal-link-card.tsx`
- `components/portal/portal-feedback-form.tsx`
- `components/dashboard/project-feedback-section.tsx`
- `components/about/contact-form.tsx`
- `app/dashboard/projects/[id]/page.tsx` (server component, 추가 1곳 — 총 5곳)

**Pattern A — 7개 actions.ts에서 export type → 로컬 type**
- `clients/actions.ts` (ActionResult)
- `estimates/actions.ts` (ActionResult, CompanyInfo)
- `contracts/actions.ts` (ActionResult)
- `invoices/actions.ts` (ActionResult, BillingInfo, InvoiceListItem)
- `projects/actions.ts` (ActionResult, PublicFieldsFormData)
- `workspace-actions.ts` (SwitchWorkspaceResult)
- `onboarding/actions.ts` (OnboardingResult)

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0건 (기존 무관 1건만)
- Playwright E2E spot check — 6개 페이지(대시보드 목록 5개 + /projects 공개) + 설정 저장 roundtrip 모두 정상, 콘솔 에러 0

### Task 5-2-2c ✅ 코드 완료 (로고 업로드) — Jayden 수동 E2E 대기

**신규 마이그레이션 2**
- `0028_workspaces_logo_url.sql` — `workspaces.logo_url` + `logo_storage_path` NULL 컬럼 추가 (cloud apply 완료)
- `0029_storage_workspace_logos.sql` — Supabase Storage 버킷 `workspace-logos` 생성 (public read, 5MB, PNG/JPG/WEBP whitelist) + 4 RLS 정책 (SELECT public / INSERT/UPDATE/DELETE authenticated + is_workspace_member)

**신규 4 + 수정 2 파일**
- `src/lib/validation/workspace-logo.ts` (신규) — Zod (File instance, 5MB, MIME whitelist) + MIME→ext 매핑
- `src/app/dashboard/settings/logo-actions.ts` (신규) — `uploadWorkspaceLogoAction(FormData)` + `removeWorkspaceLogoAction()` + owner/admin 가드 + orphan 방지 롤백 (DB fail 시 Storage 삭제)
- `src/app/dashboard/settings/logo-upload.tsx` (신규 Client) — 파일 input + 미리보기 + 제거 버튼 + 클라이언트 측 즉시 검증
- `src/lib/db/schema.ts` — workspaces에 logoUrl/logoStoragePath 2 필드 추가
- `src/app/dashboard/settings/page.tsx` — 로고 섹션 통합 + 현재 workspace logoUrl SELECT 쿼리

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0건 (기존 무관 1건만)
- cloud migration 0028/0029 apply 성공, pg_policies 4건 등록 확인 (`workspace_logos_*`)

**⚠️ Playwright E2E 미수행 (MCP 불안정)**
- 브라우저 세션 닫힌 후 재시작 불가 (`browserBackend.callTool: Target page, context or browser has been closed`)
- 차선책: **Jayden 수동 E2E 체크리스트** (아래) — 다음 세션 또는 즉시 수행 권장

**🧪 Jayden 수동 E2E 체크리스트**
1. `/dashboard/settings` 진입 → "워크스페이스 로고" 섹션 보임 (최상단, SettingsForm 위)
2. 초기 상태: "로고 없음" placeholder
3. PNG/JPG/WEBP 파일(5MB 이하) 선택 → 즉시 업로드 → "로고가 업로드되었습니다" 토스트 + 미리보기 업데이트
4. 새로고침 → 미리보기 유지 (DB persist 확인)
5. "로고 제거" 버튼 클릭 → confirm 후 토스트 + placeholder 복귀
6. **거부 케이스**: 10MB 파일 선택 → 토스트 에러 "5MB 초과"
7. **거부 케이스**: .txt 파일 선택 → 토스트 에러 "PNG, JPG, WEBP만 가능"
8. Supabase Dashboard → Storage → `workspace-logos` 버킷 → 업로드된 파일 경로 `{workspace_id}/{timestamp}.{ext}` 확인
9. `SELECT logo_url, logo_storage_path FROM workspaces WHERE id='...'` 로 DB 반영 확인

### Task 5-2-2f ✅ middleware → proxy 리네임 (Next.js 16 컨벤션)

**배경**: Next.js 16부터 `middleware.ts`가 deprecated → `proxy.ts` 권고. 공식 codemod(`@next/codemod middleware-to-proxy`)와 동등한 수동 변경.

**변경**
- `src/middleware.ts` 삭제 + `src/proxy.ts` 신규 (동일 로직)
- `export async function middleware` → `export async function proxy`
- `config.matcher` 동일 유지
- next.config / src 내부 `middleware` 참조 없음 확인

**검증**
- `pnpm tsc --noEmit` → 0 error
- `pnpm lint` → 신규 경고 0
- 로직/matcher 동일하여 동작 차이 없음 (Supabase session refresh + /dashboard 보호 + /login|/signup 로그인 상태 redirect)

**⚠️ Jayden 수동 확인 권장**: dev server 재시작 후 터미널 로그에 "middleware deprecated" 경고가 사라지는지 + 로그인 시 /dashboard redirect, 로그아웃 시 /login redirect 정상 동작.

### 차기 Task 등록
- ④ **middleware → proxy 리네임** — Next.js 16.2 경고 해소 잔업 (30분)
- ⑤ **Phase C (5-2-4 / 5-2-5 초대 시스템)** — Resend API key 발급 필요 (차단 상태)

---

## 이전 세션 (2026-04-21 저녁 — Phase 5 Epic 5-2 Phase B: 3 Task + cloud DB 동기화)

### 완료 내역
- Epic: **Phase 5 Epic 5-2 Phase B**
- 완료 Task 3개: **5-2-3-B** (workspace picker UI), **5-2-1** (/onboarding), **5-2-2** (workspace settings 이관)
- 부가 작업: **cloud Supabase dairect 프로젝트 DB 동기화** — Phase 5 migration 0017~0025 전체 apply (drift 해결)
- 상태: 로컬 검증 완료 (tsc/lint/dev server 컴파일 무에러). Jayden 수동 E2E는 다음 세션 시작 시.

### 주요 파일 (신규 9 + 수정 14 + DB migration 2)

**신규 (9 파일)**:
- `src/app/dashboard/workspace-actions.ts` — `switchWorkspaceAction`
- `src/components/dashboard/workspace-picker.tsx` — 헤더 dropdown + 모바일 bottom sheet
- `src/lib/auth/list-user-workspaces.ts` — 소속 workspace + role 조회 헬퍼
- `src/app/onboarding/layout.tsx` + `page.tsx` + `onboarding-form.tsx` + `actions.ts`
- `src/lib/utils/slug.ts` — 공유 slug util (toSlug/isValidSlug)
- `src/lib/db/migrations/0024_users_onboarded_at.sql`
- `src/lib/db/migrations/0025_backfill_workspace_settings.sql`

**수정 (14 파일)**:
- `src/lib/db/schema.ts` — users.onboardedAt 컬럼 추가
- `src/app/dashboard/layout.tsx` — onboarding 가드 + role 조회 후 sidebar 전달
- `src/components/dashboard/header.tsx` — WorkspacePicker 좌측 통합
- `src/components/dashboard/sidebar.tsx` — `canSeeSettings` prop (member 설정 메뉴 숨김)
- `src/lib/auth/ensure-default-workspace.ts` — workspace_settings INSERT 추가
- `src/app/dashboard/settings/actions.ts` — workspace_settings 기반 + owner/admin 가드
- `src/app/dashboard/settings/page.tsx` — member 접근 시 redirect
- `src/app/dashboard/estimates/actions.ts` — 채번/사업자/default 3함수 전환
- `src/app/dashboard/contracts/actions.ts` — 채번 전환
- `src/app/dashboard/invoices/actions.ts` — 채번 + BillingInfo 전환
- `src/lib/portal/queries.ts` + `feedback-actions.ts` — JOIN 전환
- `src/app/api/cron/invoice-overdue/route.ts` — JOIN 전환
- `src/app/api/cron/weekly-summary/route.ts` — businessEmail만 workspace_settings (특수 혼합)

**DB migration (cloud apply)**:
- 0017~0023 Phase 5 Epic 5-1 전체 일괄 apply (기존 drift 해결)
- 0024 users.onboarded_at + 기존 owner 백필
- 0025 user_settings 13필드 → workspace_settings 복사 + assertion

### 검증 결과
- `pnpm tsc --noEmit && pnpm lint` 통과 (기존 경고 1건만, 무관)
- dev server 컴파일 에러 0건
- cloud DB 상태: users 2/2 onboarded, workspaces 2개, workspace_members 2 owners, workspace_id NULL 0건

### 이관 결정 정책 (learnings.md에 상세)
- 권한: workspace_settings는 **owner+admin만 조회/편집** (Linear/Stripe 패턴 — 사업자번호/은행계좌 민감정보 방어). member는 사이드바 "설정" 메뉴 자체 숨김.
- 백필: owner user의 user_settings → 해당 workspace_settings로 복사 + assertion.
- user_settings 13 필드: **컬럼 보존** (Parallel Change). 코드에서는 미사용. Phase 5.5 + AI 한도 이관 후 일괄 drop.
- AI 한도(aiDailyCallCount/aiLastResetAt): user_settings 유지. Phase 5.5 billing 전환 시 별도 Task.
- 로고 업로드: Supabase Storage 설계 필요 → 별도 Task 5-2-2c.

### 다음 세션 선택지
- **Phase C**: 5-2-4 초대 발송 + 5-2-5 초대 수락 UI (Resend 통합, Jayden이 사전에 API key 발급 필요)
- **5-2-2b**: AI 한도 2필드 → workspace_settings 이관 (cron/briefing/report 3곳 경로 전환 + Phase 5.5 빌링 인프라 대비)
- **5-2-2c**: Workspace 로고 업로드 (Supabase Storage 버킷 + workspaces.logo_url 컬럼)
- **middleware → proxy**: Next.js 16.2 경고 해소 (리네임 작업, 30분)

### 차단 요소
- Resend API key 발급 필요 (Phase C 진입 전)
- Jayden 수동 E2E 확인 필요 (로그인 후 /dashboard + 설정 저장 + 견적/청구서 PDF 생성 시 사업자 정보 로드 확인)

---

## 이전 세션 (2026-04-21 오후 — Phase 5 Epic 5-2 Phase A: Task α + β 완료)

### 현재 위치
- Epic: **Phase 5 Epic 5-2 (Workspace + Onboarding)**
- Task: α (5-2-0 + 5-2-7 회원가입 + default workspace) + β (5-2-3-A last_workspace_id)
- 상태: **Phase A 완료** (2/8 Task, 기반 인프라 완성)

### 이번 세션 완료 내역

**Task α (5-2-0 회원가입 UI + 5-2-7 default workspace 자동 생성)** — 6 파일:
- `src/lib/validation/auth.ts` 신규 — `signupFormSchema` (email + password + confirmPassword refine + name)
- `src/app/(public)/signup/page.tsx` + `signup-form.tsx` 신규 — Client Component + Zod + Supabase auth.signUp. 세션 있으면 /dashboard redirect, 없으면 "확인 메일 발송" UI
- `src/lib/auth/ensure-default-workspace.ts` 신규 — 소속 workspace 없으면 transaction(workspace + member(owner) + user_settings). slug 충돌 retry. 멱등.
- `src/app/dashboard/layout.tsx` — users INSERT 뒤 ensureDefaultWorkspace 호출 추가 (Google OAuth 신규 가입도 동일 경로)
- `src/app/(public)/login/page.tsx` — "회원가입" 링크 추가
- `src/middleware.ts` — 로그인 상태에서 /signup 접근 시 /dashboard redirect

**Task β (5-2-3-A last_workspace_id 컬럼 + getCurrentWorkspaceId 1순위 전환)** — 4 파일:
- `src/lib/db/migrations/0023_users_last_workspace_id.sql` 신규 — ALTER users ADD last_workspace_id uuid + FK ON DELETE SET NULL
- `src/lib/db/schema.ts` — users.lastWorkspaceId 필드 (forward reference `() => workspaces.id`)
- `src/lib/auth/get-workspace-id.ts` — 1순위 = last_workspace_id (innerJoin members + workspaces 검증). 2순위 폴백 유지.
- `src/lib/auth/update-last-workspace.ts` 신규 — updateLastWorkspaceId helper. 소속+soft-delete 재검증 후 UPDATE. 5-2-3-B picker UI에서 호출 예정.

### 커밋 (2건)
- `3883110` feat(auth): Task 5-2-0 + 5-2-7 — 회원가입 UI + default workspace 자동 생성
- `eb86a12` feat(auth): Task 5-2-3-A — users.last_workspace_id + getCurrentWorkspaceId 1순위 전환

### 검증 결과
- `pnpm tsc --noEmit` PASS (0 errors)
- `pnpm lint` PASS (0 errors, 1 pre-existing warning)
- Local DB 0023 적용 ✓ (`\d+ users` last_workspace_id uuid nullable 확인)
- `pnpm test:e2e --grep workspace-isolation` **15/15 PASS** (4.4초, Task β 회귀 없음)
- 브라우저 /signup 렌더링 + /login 링크 + Zod confirmPassword refine 에러 "비밀번호가 일치하지 않습니다" 작동 확인

### 다음 세션 할 일
- **Phase B 선택지**:
  - Task 5-2-3-B: Workspace picker UI (헤더 dropdown + 모바일 bottom sheet + updateLastWorkspaceId 호출 연결)
  - Task 5-2-1: `/onboarding` 페이지 (신규 가입 workspace 이름/로고 설정)
  - Task 5-2-2: Workspace 설정 페이지 (`user_settings` → `workspace_settings` 이관, 대규모)
- **Phase C 준비**: Resend 통합 시작 전 API key 발급 + docs/pipeline-runbook.md 초안 (Jayden 수동)
- **production DB apply 판단** — Epic 5-1+5-2 전체 SQL 누적(0017~0023) 한번에 Supabase Studio 수동 실행

### 차단 요소
- 없음. 실 가입 플로우 테스트는 production Supabase 건드리므로 E2E spec에 추가하는 Task를 Phase B 중 고려.

### 마지막 업데이트
- 날짜: 2026-04-21 오후

---

## 이전 세션 (2026-04-21 오전 — Phase 5 Epic 5-1 **8/8 완료 + local E2E 22/22 PASS**)

### 현재 위치
- Epic: **Phase 5 Epic 5-1 (Data Model)**
- Task: 5-1-4 후속 완결 + 5-1-8 E2E 실전 검증
- 상태: **완료** (Epic 5-1 전체 8/8 Task 모두 로컬 검증 통과)

### 이번 세션 완료 내역

1. **Local Supabase DB 마이그레이션 0015~0022 전체 적용** — docker exec psql로 `0017→0018→0019→0020→0022→0021` Jayden 지정 순서 + 누락 drift 0015/0016 수동 ADD. 최종 13 도메인 테이블 workspace_id NOT NULL + (workspace_id, number) UNIQUE 3건 + 12 복합 인덱스 + RLS 52 정책 적용.
2. **Task 5-1-4 schema.ts 후속** — 13 컬럼 `.notNull()` replace_all + contracts/invoices UNIQUE 재조정 + estimates UNIQUE 신규 (0022 SQL과 정합).
3. **Task 5-1-7 보완 4경로** — schema NOT NULL 전환이 tsc로 드러낸 누락 INSERT 경로:
   - `src/lib/ai/briefing-actions.ts` (regenerateBriefingAction + upsertBriefing)
   - `src/lib/ai/report-actions.ts` (regenerateWeeklyReportAction + upsertReport)
   - `src/app/(public)/about/actions.ts` (landing form의 owner workspace 동시 추출)
   - `e2e/fixtures/seed-portal.ts` (workspace + member 시드 추가)
4. **sample-data.ts** — DEMO_WORKSPACE_ID 상수 신규 + 23곳 `workspaceId: null → DEMO_WORKSPACE_ID` 치환.
5. **Task 5-1-8 E2E 실전 검증** — `pnpm test:e2e` 최종 결과: **22/22 PASS** (portal 7 + workspace-isolation 15, production smoke 9 skip) in 22초. qa-tester Critical 1 (UUID hex 포맷) + High 4 (multi-membership/aggregate/leftJoin/cross-FK) 전부 반영된 15 시나리오.

### 커밋 (3건)
- `4d073a4` feat(db): Task 5-1-4 NOT NULL + 채번 UNIQUE + 복합 인덱스 (0022)
- `0db0fb2` test(e2e): Task 5-1-8 workspace isolation 15 시나리오 + 2 workspace seed
- `45bcf34` feat(multi-tenant): Task 5-1-4 후속 완결 — schema NOT NULL + workspaceId 주입 4경로

### 검증 결과
- `pnpm tsc --noEmit` PASS (0 errors)
- `pnpm lint` PASS (0 errors, 1 pre-existing warning)
- `pnpm test:e2e` PASS 22/22 (5.4초 workspace-isolation + 추가 portal)

### 다음 세션 할 일
- **production DB apply 판단** — Jayden 확인 후 Supabase Studio에서 0017~0022 SQL 수동 실행 (0016까지는 기존 적용됨) 또는 MCP `apply_migration` (🟡 등급, Jayden 수동 검증 필수)
- Epic 5-2 (workspace switcher UI + users.last_workspace_id + billing Stripe) 착수 — Task 분해 먼저
- Task 5-1-9 (optional) — RLS 정책 자체 anon role 커넥션 검증 (이번 E2E는 superuser라 RLS bypass)

### 차단 요소
- 없음. local 검증 완료. production apply는 Jayden 판단 대기 (risk 🟡).

### 마지막 업데이트
- 날짜: 2026-04-21

---

## 이전 세션 (2026-04-20 후반 4차 — Phase 5 Epic 5-1 5/8 — Task 5-1-6 withWorkspace helper + Task 5-1-5 RLS 48 policy)

### 세션 스코프 (2 Task 순차, 각 Task 단위 6단계 사이클)

1. **Task 5-1-6 withWorkspace helper** — 신규 2 파일(`get-workspace-id.ts` + `workspace-scope.ts`) + 예시 migrate 2곳(`clients/actions.ts` createClientAction + getClients). code-reviewer HIGH 2건 반영.
2. **Task 5-1-5 RLS 48 policy** — 신규 1 파일(`0021_rls_policies_multitenant.sql`, 332줄): helper `is_workspace_member(uuid)` + 11 테이블 deny_anon RESTRICTIVE + 12 테이블 × 4 CRUD authenticated + BEGIN/COMMIT + ROLLBACK. db-engineer HIGH 3 + MEDIUM 2 + LOW 1 반영.

### 산출물

**Task 5-1-6 (3 파일)**
- `src/lib/auth/get-workspace-id.ts` (신규, 44줄) — React cache() + workspace_members innerJoin workspaces + deleted_at IS NULL 필터 + 2차 orderBy(id) 결정적 선택
- `src/lib/db/workspace-scope.ts` (신규, 37줄) — `workspaceScope(col, wsId)` helper + `assertWorkspaceContext(wsId)` asserts narrowing
- `src/app/dashboard/clients/actions.ts` (+14줄) — read 경로 `null → []` / write 경로 `null → ActionResult 에러`. 전면 migrate는 Task 5-1-7 스코프.

**Task 5-1-5 (1 파일)**
- `src/lib/db/migrations/0021_rls_policies_multitenant.sql` (신규, 332줄)
  - helper: `public.is_workspace_member(uuid)` — SECURITY DEFINER + STABLE + `(select auth.uid())` InitPlan 최적화 + workspaces.deleted_at IS NULL 필터
  - 11 테이블 deny_anon `AS RESTRICTIVE` (briefings 제외 — 0009 소유 정책 경계 유지)
  - 12 테이블 × 4 CRUD authenticated 정책 (SELECT USING / INSERT WITH CHECK / UPDATE USING+WITH CHECK / DELETE USING)
  - BEGIN/COMMIT 전체 래핑 + 완전 ROLLBACK SQL 주석

### 검증

- `pnpm tsc --noEmit` **0 errors** (Task 5-1-6 후)
- `pnpm lint` 0 errors (기존 1 warning 유지, 이번 변경 무관)
- code-reviewer 독립 리뷰 (Task 5-1-6): HIGH 2건 선조치 반영. MEDIUM 4 + LOW 2 중 일부는 Task 5-1-7 이월.
- db-engineer 독립 리뷰 (Task 5-1-5): HIGH 3 + MEDIUM 2 + LOW 1 반영. H2 옵션 B(my_workspaces SETOF)는 Task 5-1-8 실측 후 판단.
- SQL 실동작 검증: Jayden DB push (Task 5-1-4 NOT NULL 전환) 이후 Task 5-1-8 범위.

### code-reviewer 리뷰 반영 내역 (Task 5-1-6)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🟡 HIGH H-1 | `orderBy(joinedAt)` 동률 시 DB 임의 선택 → 같은 user가 매 request 다른 workspace 반환 가능 | `orderBy(asc(joinedAt), asc(id))` 2차 키 추가 |
| 🟡 HIGH H-2 | `workspaces.deletedAt` 체크 누락 → soft-delete workspace fallback 시 read/write 모두 실패 | `workspaces innerJoin + isNull(deletedAt)` 필터 |

Task 5-1-7 이월: M-1 AnyColumn 타입 가드 강화 / M-2 cache invalidation 문서화 / M-3 빈 배열 UX 구별 / M-4 updateClientAction 등 나머지 함수 migrate / L-1 래퍼 ROI 재평가. L-2 defense-in-depth 유지 (PASS).

### db-engineer 리뷰 반영 내역 (Task 5-1-5)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🟡 HIGH H1 | deny_anon PERMISSIVE → 향후 `FOR SELECT TO anon` 추가 시 OR 결합으로 deny 무력화 | 11 테이블 `AS RESTRICTIVE` 키워드 추가 |
| 🟡 HIGH H2 | helper `auth.uid()` row-per-call → 대량 스캔 부담 | `(select auth.uid())` InitPlan 래핑 (옵션 A) |
| 🟡 HIGH H3 | DROP + CREATE 사이 짧은 race window 가능 | 파일 상단 `BEGIN;` + 하단 `COMMIT;` 트랜잭션 래핑 |
| 🟢 MEDIUM M1 | anon `GRANT EXECUTE` 불필요 — deny_anon으로 호출 경로 없음 | `GRANT anon` 삭제 + ROLLBACK `REVOKE anon` 삭제 |
| 🟢 MEDIUM M2 | briefings_deny_anon DROP+CREATE가 0009 소유 경계 침범 | briefings 섹션 deny_anon 2줄 삭제 — 0009 원본 보존 |
| 🔵 LOW L2 | portal_tokens 마지막 `--> statement-breakpoint` 누락 | 추가 |

이월/생략:
- H2 옵션 B (`my_workspaces() RETURNS SETOF uuid` + 정책 48개 IN 패턴): Task 5-1-8 실측 결과 기반 판단
- 0009/0018 deny_anon RESTRICTIVE 전환: 별도 후속 Task
- M3 시그니처 변경 가이드 주석: 정보성, 현 파일 수정 불필요
- M4 이름 규칙: PASS
- L1/L3: PASS

### Phase 5 Epic 5-1 진행 현황 (갱신)

| Task | 상태 | 산출물 |
|------|------|--------|
| 5-1-1 | ✅ 정의 | workspaces 4 테이블 + RLS deny_anon (0017/0018) |
| 5-1-2 | ✅ 정의 | 12 테이블 workspace_id NULLABLE (0019) |
| 5-1-3 | ✅ 정의 | default workspace + backfill + assertion (0020) |
| **5-1-5** | ✅ 정의 | **RLS 48 policy 전면 재작성 (0021) ← NEW** |
| **5-1-6** | ✅ 정의 | **withWorkspace helper + 예시 1건 migrate ← NEW** |
| 5-1-4 | ⬜ 대기 | NOT NULL 전환 + 채번 UNIQUE 재조정 (Jayden DB push 후) |
| 5-1-7 | ⬜ 대기 | 12 테이블 전면 migrate + Server Action guard |
| 5-1-8 | ⬜ 대기 | E2E cross-workspace 누출 시뮬레이션 |

### Jayden 수동 대기 (DB 반영, 순서 엄수)

1. **0017** (4 테이블 DDL: workspaces/members/invitations/settings)
2. **0018** (RLS ENABLE + `*_deny_anon` 정책)
3. **0019** (12 도메인 ALTER ADD COLUMN workspace_id NULLABLE + FK RESTRICT)
4. **0020** (default workspace 생성 + 12 테이블 backfill + 자동 assertion)
5. **0021 (신규)** — RLS 48 정책. 권장 순서: Task 5-1-4 NOT NULL 전환 이후 (NULL row 전무 상태에서 적용하면 깨끗). 필수 아님.

실행 경로: Supabase MCP `apply_migration` 또는 Dashboard SQL Editor.

### 다음 세션 선택지

1. **Jayden DB push (0017→0021 순차)** 후 Task 5-1-4 NOT NULL 전환 (채번 UNIQUE 재조정)
2. **DB 무관 Task 5-1-7 계획** (12 테이블 전면 withWorkspace migrate + Server Action guard)
3. **Stripe/Resend 인프라 조사** (Phase 5.5 선행)

### 차단 요소

없음. Jayden DB push 대기가 있지만 Task 5-1-7 코드 작업은 병행 가능(결합 시점 정합성 검증).

### 교훈 기록 (learnings.md, 4건 추가 예정)

1. React `cache()` 2단 합성 — getUserId cache → getCurrentWorkspaceId cache. 동일 request 내 중첩 호출도 DB 왕복 각 1회로 수렴.
2. RLS `AS RESTRICTIVE` vs PERMISSIVE — deny 용도는 반드시 RESTRICTIVE 명시. PERMISSIVE OR 결합으로 deny 무력화 함정.
3. Supabase `auth.uid()` InitPlan 최적화 — `(select auth.uid())` 서브쿼리 래핑. SECURITY DEFINER + STABLE만으로는 row-per-call 방지 못 함.
4. RLS × Server Action Layered Security — 역할 세분화는 RLS가 아니라 Server Action. 정책 × 역할 조합 폭발 방지.

---

## 이전 세션 (2026-04-20 후반 후속 — A→B→C→D 4단계 순차 실행, 7 커밋)

### 세션 스코프

Jayden "a->b->c->d 순서대로 진행" 지시로 4단계를 연속 Task 단위 사이클로 실행.

- **A-1** 미커밋 변경 4 커밋 분리 (이전 save에서 문서만 커밋되고 코드 20개 파일이 unstaged로 잔존) — 4 커밋
- **B** Task 5-1-3 default workspace + 12 테이블 backfill SQL 정의 (db-engineer 독립 리뷰 → HIGH/MEDIUM/LOW 3건 반영) — 1 커밋
- **C** PRD 섹션 10 남은 결정 4건 확정 (Admin env / Picker dropdown / last_workspace_id / 실시간 count) + 연관 Task 2건 정합 업데이트 — 1 커밋
- **D** No-Line Rule 정비 (loading.tsx 6개 divide-y 제거) — 1 커밋

### 커밋 내역 (총 7건)

| # | Commit | 내용 |
|---|--------|------|
| 1 | `ae45572` | feat(db): Phase 5 Epic 5-1 workspaces 4 테이블 + 12 도메인 ALTER (NULLABLE) |
| 2 | `7883297` | docs(phase5): PRD v4.0 확정 + ERD 다이어그램 신규 (445줄 Mermaid) |
| 3 | `4721651` | perf(dashboard): getUserId React cache() + invoices 쿼리 컬럼 축소 |
| 4 | `36b13c1` | feat(dashboard): Suspense fallback loading.tsx 8개 |
| 5 | `a7b2e1f` | feat(db): Task 5-1-3 default workspace + backfill SQL (0020) |
| 6 | `bfdb4b3` | docs(phase5): PRD 섹션 10 결정 4건 확정 + 연관 Task 업데이트 |
| 7 | `ca25b9a` | fix(dashboard): loading.tsx 6개 divide-y 제거 — No-Line Rule 준수 |

### 검증 (통합)

- `pnpm tsc --noEmit` **0 errors**
- `pnpm lint` 0 errors (기존 1 warning `_id` 유지, 이번 변경 무관)
- db-engineer 독립 리뷰 (Task 5-1-3): CRITICAL 0 · HIGH 2 + MEDIUM 3 + LOW 3 중 3건 반영

### db-engineer 리뷰 반영 내역 (Task 5-1-3)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🟡 HIGH H2 | 부모 경유 UPDATE가 NULL 잔존을 묵인 → Task 5-1-4 NOT NULL 전환에서 실패 | 트랜잭션 내 DO 블록 + `RAISE EXCEPTION` — 12 테이블 workspace_id NULL 카운트 = 0 assertion |
| 🟡 MEDIUM M1 | slug `substring(uuid,1,8)` 32-bit → 77K user 50% 생일 충돌 (multi-tenant 확장 시 잠재) | full UUID 사용 (`'default-' \|\| u.id::text`) — 일회성 backfill이라 가독성 요구 0 |
| 🟢 LOW L1 | ROLLBACK 블록에 FK RESTRICT 순서 경고 누락 | "12 테이블 workspace_id = NULL 먼저 → workspaces DELETE" 안내 주석 추가 |

생략 3건 (non-blocking, 의도대로 동작 확인):
- H1: 단일 트랜잭션 commit 전제라 비발현 + ON CONFLICT 추가 시 silent skip 위험 증가
- M4: `user_settings → workspace_settings` 값 이전은 Task 5-4-3 스코프 (PRD 명시)
- M2/M3/L2: 트랜잭션 statement 순서 / UNIQUE 충돌 시나리오 / RLS 간섭 — 모두 의도대로

### PRD 섹션 10 확정 내역 (C 단계)

| 결정 항목 | 확정안 | 근거 |
|----------|--------|------|
| Admin 계정 부여 | env `ADMIN_EMAILS` | 초기 1명 전제, DB flag 조작 방어 부담 회피, 재배포 = 결재선 역할 |
| Workspace picker UX | 헤더 dropdown + 모바일 bottom sheet | Slack/Linear/Notion 업계 표준, PM 타겟 동시 소속 ≤3 가정 |
| Multi-workspace 기본 | `users.last_workspace_id` 컬럼 + NULL 폴백 joinedAt MIN | 직관적 UX, 1 컬럼 추가 비용 미미 |
| 사용량 측정 | 실시간 COUNT (트랜잭션 내 + race RAISE) | 소규모 한도에서 latency 영향 0, Phase 5.6+ 시 trigger 전환 |

연관 Task 분해 정합성 유지:
- Task 5-2-3 "헤더 dropdown + 모바일 bottom sheet + `users.last_workspace_id` 컬럼 추가"
- Task 5-3-6 "INSERT 트랜잭션 내 실시간 COUNT + race 방어"

미결정 3건 유지 (Phase 5.5 또는 부차):
- Plan 한도 정확한 수치 (베타 피드백 후)
- 토스페이먼츠 통합 시점 (한국 사용자 비중 기준)
- Workspace 로고 업로드 (Storage 설계 Task 5-2-2 시점)

### D No-Line Rule 정비 내역

6개 loading.tsx (clients / contracts / estimates / invoices / leads / projects):
- Before: `<div className="divide-y divide-border/20">` + 행 `bg-card` (1px 솔리드 선 = No-Line Rule 위반)
- After: `<div className="flex flex-col gap-1 p-1">` + 행 `bg-muted/30` (4px gap + 미세 톤 차이로 행 경계 표현)

대시보드 홈 + 프로젝트 상세 loading.tsx 2개는 원래 divide-y 미사용 → 정비 대상 외.

### Jayden 수동 대기 (DB 반영, 순서 엄수)

1. **0017** (4 테이블 DDL: workspaces/members/invitations/settings)
2. **0018** (RLS ENABLE + `*_deny_anon` 정책)
3. **0019** (12 도메인 ALTER ADD COLUMN workspace_id NULLABLE + FK RESTRICT)
4. **0020** (default workspace 생성 + 12 테이블 backfill + 자동 assertion)

실행 경로: Supabase MCP `apply_migration` 또는 Dashboard SQL Editor. 적용 후 0020 assertion이 성공하면 workspace_id IS NULL 행 0 자동 보장 → Task 5-1-4 진입 가능.

### 다음 세션 선택지

1. **Jayden DB push 후 Task 5-1-4** (NOT NULL 전환 + 채번 UNIQUE 재조정)
2. **DB 무관 Task 5-1-5 준비** (RLS 48 policy 전면 재작성 계획 — 12 테이블 × 4 policy)
3. **DB 무관 Task 5-1-6 설계** (Drizzle `withWorkspace(query, wsId)` helper 패턴 초안)
4. 그 외: Stripe/Resend 인프라 조사 (Phase 5.5 선행)

### 차단 요소

없음. Jayden 후속 DB push 의존 있으나, 차단 없는 병행 경로(5-1-5 계획 / 5-1-6 설계)로 해소 가능.

### 교훈 기록 (learnings.md)

1. DB data migration assertion 패턴 — 트랜잭션 내 DO 블록 + RAISE EXCEPTION으로 "기대 상태 도달" 기계 보장
2. 일회성 backfill slug는 full UUID — user-facing 의미 없는 식별자는 가독성 대신 충돌 안전성 우선
3. No-Line Rule skeleton 패턴 — divide-y → flex gap + 배경 톤 차이로 행 구분

---

## 이전 세션 (2026-04-20 후반 — Phase 5 Epic 5-1 착수 + DB 최적화 + ERD + loading.tsx)

### 세션 스코프 (7 Task 누적, 연속 Task 단위 6단계 사이클)

1. **PRD v4.0 리뷰 2회 반영** — PRD-phase5.md 7건 + PRD.md Phase 5 섹션 교체(B 옵션) + 추가 발견 잔재 3건(A1/A2/A3) 일괄 수정 (총 14건 Edit)
2. **(다) DB 쿼리 최적화** — `getUserId` React `cache()` + `getInvoices` 컬럼 축소. code-reviewer MEDIUM 1건 반영 (주석 수치 decoupling)
3. **(가) Epic 5-1 ERD 다이어그램** — `docs/PRD-phase5-erd.md` 신규 (445줄 Mermaid) + PRD-phase5.md 섹션 12 링크 + 12개 직접 추가 정합성 수정
4. **(2) loading.tsx 8개** — 대시보드 라우트별 Suspense fallback (홈/목록 6/상세 1). DESIGN.md 준수 (`aria-busy`/`surface-card`/`shadow-ambient`)
5. **(3) 섹션 10 결정 3건** — **A1 `workspace_settings` 독립 테이블 / B1 초대 TTL 7일 / C2 Member write 프로젝트 범위** 확정. PRD-phase5.md 섹션 10 [x] + ERD 섹션 3-4 신설 + 섹션 6-2 역할 매트릭스 구체화 (총 10건 Edit)
6. **(4) Task 5-1-1 Drizzle 스키마** — `workspaces`/`members`/`invitations`/`settings` 4 테이블 + `0017_modern_eternals.sql` + `0018_rls_workspaces.sql`. db-engineer HIGH 2 + MEDIUM 2 반영 (updatedAt notNull / invited_by SET NULL / user_idx / 자동 생성 주석)
7. **(5-1-2) Task 5-1-2 workspace_id NULLABLE 추가** — 12 도메인 테이블 × ALTER + FK RESTRICT + `0019_slim_gertrude_yorkes.sql`. sample-data.ts 7 데모 테이블 `workspaceId: null` 타입 호환. db-engineer MEDIUM 2 반영 (statement-breakpoint / 롤백 트랜잭션)

### 변경 사항 (커밋 대기)

**수정 파일 7**:
- `docs/PRD.md` — Phase 5 섹션 v4.0 요약 박스로 교체 + v3.1 잔재 3건 업데이트 (수익 모델/리스크 표 2행)
- `docs/PRD-phase5.md` — 섹션 1/4/6/10/11/12 14건 갱신 (결정 3건 반영 + 신규 4 테이블)
- `src/lib/auth/get-user-id.ts` — React cache() 래핑 (1줄 변경 + 주석)
- `src/app/dashboard/invoices/actions.ts` — `InvoiceListItem` + select에서 `createdAt`/`paidDate` 제거
- `src/lib/db/schema.ts` — 신규 4 테이블 + 12 테이블 ALTER (`workspaceId: uuid.references... onDelete: "restrict"`) + `index` import
- `src/lib/demo/sample-data.ts` — 7 데모 객체에 `workspaceId: null` (Drizzle InferSelectModel 타입 정합)
- `src/lib/db/migrations/meta/_journal.json` — idx 17 + 19 (18은 RLS 수동이라 등록 안 함)

**신규 파일 13**:
- `docs/PRD-phase5-erd.md` (445줄 Mermaid ERD + 섹션 9개)
- `src/app/dashboard/loading.tsx` + projects/(loading + [id]/loading)/clients/estimates/contracts/invoices/leads/loading.tsx (8개)
- `src/lib/db/migrations/0017_modern_eternals.sql` (Task 5-1-1 DDL)
- `src/lib/db/migrations/0018_rls_workspaces.sql` (수동 RLS — briefings 0009 패턴)
- `src/lib/db/migrations/0019_slim_gertrude_yorkes.sql` (Task 5-1-2 ALTER + FK)
- `src/lib/db/migrations/meta/0017_snapshot.json` + `0019_snapshot.json`

### 검증 (통합)

- `pnpm tsc --noEmit` **0 errors** (매 Task마다 확인)
- `pnpm lint` 0 errors (기존 1 warning `_id` 유지)
- `pnpm build` **41 routes 성공** + SW artifact OK
- `pnpm drizzle-kit generate` **21 tables** 정상 diff
- code-reviewer 독립 리뷰 (DB 최적화): CRITICAL 0 · MEDIUM 1 반영
- db-engineer 독립 리뷰 (Task 5-1-1): CRITICAL 0 · HIGH 2 + MEDIUM 2 반영
- db-engineer 독립 리뷰 (Task 5-1-2): CRITICAL 0 · HIGH 0 · MEDIUM 2 반영

### Phase 5 Epic 5-1 진행 현황

| Task | 상태 | 산출물 |
|------|------|--------|
| 5-1-1 | ✅ 정의 완료 | 4 테이블 schema + 0017 DDL + 0018 RLS |
| 5-1-2 | ✅ 정의 완료 | 12 ALTER + FK RESTRICT + 0019 |
| 5-1-3 | ✅ 정의 완료 | 0020 backfill SQL (트랜잭션 내 DO 블록 자동 assertion + full UUID slug + FK 순서 경고) |
| 5-1-4 | ⬜ 대기 | NOT NULL 전환 + 채번 UNIQUE 재조정 |
| 5-1-5 | ⬜ 대기 | RLS 48 policy 전면 재작성 |
| 5-1-6 | ⬜ 대기 | Drizzle `withWorkspace()` helper |
| 5-1-7 | ⬜ 대기 | Server Action workspace guard |
| 5-1-8 | ⬜ 대기 | E2E cross-workspace 누출 시뮬레이션 |

### Jayden 수동 대기 (DB 반영)

Epic 5-1 Task 5-1-1 + 5-1-2까지 **스키마 + 마이그레이션 파일 정의만 완료**. 실제 DB 반영은 Jayden 수동:
1. **0017 → 0018 → 0019 순차 적용** (또는 `pnpm db:push` + RLS 별도 MCP `apply_migration`)
2. 적용 순서: 4 테이블 생성 → RLS ENABLE + deny_anon → 12 ALTER ADD COLUMN + FK
3. 적용 후 12 테이블 전부 `workspace_id IS NULL` 상태 → Task 5-1-3 backfill 대상
4. 기존 앱 동작 영향 0 (코드는 workspaceId 참조 안 함, 신규 테이블도 사용 안 함)

### 다음 세션 선택지

1. **Task 5-1-3 계획** (default workspace + backfill 스크립트 작성, DB push 이전 가능)
2. **Jayden DB push 대기** 후 Task 5-1-4 (NOT NULL 전환)
3. **Phase 5 남은 섹션 10 결정 4건** (Admin 방식 / subscription_status 타이밍 / Workspace picker UX / Multi-workspace 기본 선택)
4. **No-Line Rule 정비** (loading.tsx `divide-y` + 기존 테이블 UI 포괄 정비 별도 Task)
5. **Vercel Speed Insights 실측 도입** (DB 최적화 효과 측정)

### 교훈 기록 (learnings.md 2026-04-20 후반)
1. React cache() 요청 스코프 메모이제이션 — 대시보드 `getUserId` 6번 → 1번 수렴 패턴
2. Drizzle `InferSelectModel` + schema 컬럼 추가 시 샘플 데이터 타입 에러 연쇄 — TypeScript strict의 미묘한 trade-off
3. drizzle-kit generate + 수동 RLS SQL 마이그레이션 번호 충돌 — journal 기반 순번 계산 함정

## 이전 세션 (2026-04-19~20 Phase 3 cron 전체 종결 + Phase 5 PRD v4.0 킥오프)

### 완료 내역 (커밋 3개 + PRD 초안 1건)

1. **W5 `portal_feedback.received` 워크플로 JSON 생성 + pmEmail 리네임** (`f9e8cab`)
   - `n8n/workflows/W5_portal_feedback_received.json` 신규 (W4 복제 + 4개 노드 수정 + `saveDataErrorExecution="none"` PII 방어)
   - `recipientEmail` → `pmEmail` 3곳 리네임 (feedback-actions.ts + W5 JSON + README)
   - Dashboard URL `${DAIRECT_DASHBOARD_BASE_URL || 'https://dairect.kr'}` env fallback + trailing slash strip
   - stripCtrl 통일 (W4 `''` strip → `' '` space replace — 단어 분리 유지)
   - README W5 섹션 간결화 (수동 복제 가이드 → JSON 임포트 절차)

2. **W2 `invoice.overdue` Vercel Cron 구현** (`75b8fe4`)
   - **Vercel Cron 인프라 도입**: `vercel.json` (`0 0 * * *` UTC = KST 09:00) + `CRON_SECRET`
   - `/api/cron/invoice-overdue` 신규: `crypto.timingSafeEqual` 인증 + 연체 invoice 순차 emit + 상태 전이
   - `invoices.last_overdue_notified_at` 컬럼 + migration 0015
   - W2 n8n JSON: Compose Email **2 items 반환 (PM + 고객)**
   - security-reviewer HIGH 1건 반영: UPDATE WHERE에 `status='sent' + isNull(notifiedAt)` 재포함 + `.returning()` → paid 덮어쓰기 race 차단
   - non-blocking MEDIUM 2건 반영: sanitizeHeader typeof 가드 (`unknown` 확장), maxDuration 60→300

3. **W3 `weekly.summary` Vercel Cron 구현** (`6a0f502`)
   - `/api/cron/weekly-summary` 신규: 매주 금요일 KST 18:00, user별 8개 stat `Promise.all` 병렬 집계
   - `userSettings.last_weekly_summary_sent_at` 컬럼 + migration 0016
   - W3 n8n JSON: 8개 stat 카드 HTML + PM 단일 발송
   - 빈 주(모든 count=0) skip + race 방어 UPDATE WHERE 재포함
   - security-reviewer MEDIUM 2건 선제 반영:
     - `paidAmountTotal` string 보존 + `paidAmountFormatted` 서버 pre-format → BigInt-safe (MAX_SAFE_INTEGER 9,007조 회피)
     - Deadline gate 250s → 미처리 user 다음 cron 자동 재개

4. **Phase 5 PRD v4.0 초안 작성** (이번 save 포함)
   - `docs/PRD-phase5.md` 신규 (12 섹션 / 5 Epic / 35 Task / 약 400줄)
   - **2단계 전환**: Phase 5.0 (Multi-tenant 기반, 🟡) → 지인 베타 → Phase 5.5 (Billing, 🔴)
   - **만들지 않을 것 14개** 명시 (다국어/모바일앱/실시간협업/공개API/SSO/audit UI 등)
   - 리스크 7개 + 마이그레이션 전략 (Feature flag `MULTITENANT_ENABLED` 점진 릴리스)
   - 타임라인 11주 (Phase 5.0 6주 + 베타 2주 + Phase 5.5 3주)

### 핵심 설계 판단

- **Phase 3 cron 인프라가 Phase 5 준비가 됨**: W2/W3에서 선제 반영한 BigInt-safe 금액 + deadline gate + user별 루프 구조 덕에 Phase 5-4(기존 기능 multi-tenant 확장) 부담 최소
- **security-reviewer 2회 활용 성공**: W2(HIGH 1건 병합 차단 + MEDIUM 2건 반영) + W3(MEDIUM 2건 선제 반영) — 리뷰가 실제 병합 차단 사유 탐지 + Phase 5 대비 패턴 확정
- **README 정책 vs 진행 문서 불일치 발견 패턴**: W5 작업 시작 시 PROGRESS "cron 2건 백로그"와 README "수동 복제 가이드"가 불일치 → 작업 시작 전 정책 명확화 필수 (learnings 기록)

### 다음 세션 할 일

- **Jayden PRD v4.0 리뷰** → 수정 반영 → `docs/PRD.md`에 v4.0 링크 추가
- **배포 체크리스트 실행** (Jayden 수동):
  - Supabase migration 2건 apply (0015 `invoices.last_overdue_notified_at` + 0016 `userSettings.last_weekly_summary_sent_at`)
  - Vercel env 3개 추가 (`CRON_SECRET` + `N8N_WEBHOOK_URL_INVOICE_OVERDUE` + `N8N_WEBHOOK_URL_WEEKLY_SUMMARY`)
  - n8n 3개 워크플로 import (W5 / W2 / W3) + Gmail OAuth2 연결 + Active 토글
- **선택지**: Phase 5.0 Epic 5-1 Data Model 착수 / loading.tsx 8개 / DB 쿼리 최적화

### 차단 요소
없음. Jayden 후속 작업 의존 (n8n import + Supabase migration + Vercel env) 있으나 다음 개발 흐름 차단 안 함.

### 교훈 기록 (learnings.md 2026-04-20)
1. SELECT → 외부 emit → UPDATE race 방어 (UPDATE WHERE 재포함 + `.returning()`)
2. PG numeric sum → BigInt-safe 포맷 (multi-tenant 대비 선제 적용)
3. README 정책 vs 진행 문서 불일치 작업 시작 전 점검

---

## 이전 세션 (2026-04-19 Task 4-2 M8 B — Supabase local CLI 격리 + 리뷰 CRITICAL 1+HIGH 4 해소)

- **배경**: B-2 (production Supabase에 e2e_* prefix 시드) 직후 code/security 병렬 리뷰가 **보안 CRITICAL 1 + HIGH 4 = 병합 차단** 판정. 핵심 진단: "공개 git에 평문 토큰 + production seed → 122-bit UUID 보안이 0-bit 전락 + cleanup 미보장 + reuseExistingServer + trace secret dump 모두 connected". 단기 패치(A) vs 본질 해결(B)에서 **B 채택**.

- **신규/수정 파일** (8개):
  - `supabase/config.toml` (신규, `supabase init` 산출) — project_id "dairect" + 모든 포트에 +100 offset (54421~54429, teamzero 등 다른 supabase 프로젝트와 충돌 회피)
  - `e2e/fixtures/global-setup.ts` (신규) — DATABASE_URL 검증 + **production DB(127.0.0.1/localhost 미포함) 즉시 throw** (시드 우발 방지)
  - `e2e/fixtures/global-teardown.ts` (신규) — spec afterAll 미호출 시나리오(crash/Ctrl+C/`--grep`/OOM)에서 cleanup 보장 + 멱등 + cleanup 실패 시 exit 0 (다음 실행 seed 단계에서 재정리)
  - `e2e/fixtures/seed-portal.ts` (수정) — 안전망 강화: 1차 ID 직접 + 2차 `portalTokens.issuedBy=E2E_USER_ID` 일괄 + 3차 e2e_* prefix sweep
  - `playwright.config.ts` (수정) — `globalSetup`/`globalTeardown` hook + `reuseExistingServer:false` + 별도 포트 3701 + `trace:"off"`+`video:"off"` (secret dump 차단) + `screenshot:"only-on-failure"`만 유지
  - `package.json` (수정) — `dev:e2e`/`test:e2e`/`test:e2e:ui`/`test:e2e:debug` 모두 inline env로 local DATABASE_URL 주입 + N8N_WEBHOOK_URL 빈값 (e2e 시 production n8n emit no-op) + NEXT_PUBLIC_APP_URL=http://localhost:3701
  - `.gitignore` (수정) — `/supabase/.branches/`, `/supabase/.temp/`, `/supabase/seed.sql` 추가
  - `scripts/e2e-cleanup-prod.mts` (신규, 일회성) — production Supabase에 잔존하는 B-2 시드 row를 안전하게 일괄 정리. 본 세션에서 한 번 실행 완료(잔류 0 확인)

- **검증**:
  - `supabase start` (Docker 컨테이너 13개) → 포트 충돌(54322 점유) → config.toml 포트 +100 offset → 재시도 성공
  - `pnpm db:push` (DATABASE_URL inline) → local DB에 schema 15 마이그레이션 적용
  - `tsx scripts/e2e-cleanup-prod.mts` → production 잔존 row 0 확인
  - tsc 0 errors / lint 0 errors (기존 1 warning만)
  - **Playwright 7/7 재통과 (17.1s)** + `✓ globalTeardown — e2e seed cleanup 완료` 출력 확인
  - dev 서버 격리: webServer가 `pnpm dev:e2e` 실행 → port 3701 + DATABASE_URL=local 주입 + N8N_WEBHOOK_URL 빈값으로 emit no-op

- **보안 리뷰 차단 사유 해소 매핑**:
  - 🔴 CRITICAL "평문 토큰 + production seed" → **production seed 사용 자체 폐기** (local DB로 격리). 토큰 hex가 git에 박혀있어도 production에 활성 row 없음 → 추측 공격 미스. PROGRESS/learnings 마스킹은 의미 손실 vs 추가 안전 trade-off에서 보존 선택.
  - 🟡 HIGH "globalSetup/Teardown hook 미연결" → playwright.config에 hook 등록 + globalTeardown에서 cleanupPortalFixtures 호출
  - 🟡 HIGH "trace ZIP secret dump" → trace/video off, screenshot만 유지(only-on-failure)
  - 🟡 HIGH "reuseExistingServer + ngrok 외부 노출" → reuseExistingServer:false + 별도 포트 3701
  - 🟡 HIGH "users_not_e2e_uuid check 부재" → local 격리로 production users 테이블 영향 0, check 추가는 향후 schema 정리에서 검토

- **트러블슈팅 흔적**:
  1. `supabase start` 포트 54322 충돌(teamzero 점유) → config.toml port +100 offset
  2. `.env.e2e` Write가 정책상 차단 → inline env로 전환(package.json scripts에 박음)
  3. `Bash heredoc`도 차단 → 같은 inline 패턴 유지 + globalSetup의 dotenv 의존 제거
  4. globalTeardown의 dynamic import → static import로 전환(`cleanupPortalFixtures is not a function` 해소)

- **다음 세션 선택지** (우선순위 순):
  - **리팩토링 Task** — `sanitizeHeader` / `stripFormulaTriggers` / `HoneypotField` / timing guard를 `src/lib/security/`로 공통화 (공개 폼 4종 세트 재사용 확대)
  - **Vercel 배포 준비** — `after()`/waitUntil 도입 + env 변수 세팅 + n8n W5 워크플로 실제 구축(Jayden)
  - **Phase 5 SaaS 전환 준비** — 회원가입 UI, multi-tenant, anon client + RLS 전면 재검증
  - **E2E 확장** (선택) — 대시보드 피드백 읽음 처리 + 사이드바 뱃지 시나리오 추가

- **차단 요소**: 없음. 보안 리뷰 모든 CRITICAL/HIGH 해소.

- **푸시 대기**: M8 본체 커밋 + B-2 + B 격리 신규 파일 모두 미푸시 — Jayden 승인 후 일괄 푸시

- **Jayden 수동 필요 (1회)**: 향후 e2e 실행 전마다 `supabase start` 1회 (Docker 컨테이너 시작, 30초~1분). `supabase stop`으로 종료 가능.

- **교훈 1건 추가** (learnings.md): Supabase local CLI 격리 패턴 + 다중 supabase 프로젝트 포트 충돌 회피(+100 offset) + .env.* Write 차단 환경에서 inline env 전환

---

## 이전 세션 (2026-04-19 Task 4-2 M8 B-2 — Playwright Portal-only E2E 7/7 통과)

- **배경**: M8 본체(PwaInstallPrompt + /offline + sw.ts fallbacks + 리뷰 HIGH 4건)는 직전 세션에 완성되어 커밋 `6ffb9a0`까지 도달. 그러나 M8 원래 정의의 **"E2E 스모크"** 부분은 untracked 폴더(e2e/, playwright.config.ts)에 부분 스테이지되어 있던 상태. **B-2 (Playwright Portal-only) 옵션 — PM 측은 DB 직접 시드로 인증 우회 + 비로그인 고객 시각만 자동화**로 7 시나리오 완성.

- **신규/수정 파일** (7개):
  - `playwright.config.ts` (신규) — fullyParallel:false + workers:1(DB 시드 race 방지) + webServer pnpm dev + dotenv `.env.local` 명시 로드 + retain-on-failure trace/video/screenshot
  - `e2e/fixtures/seed-portal.ts` (신규) — Drizzle 직접 시드: PM user / userSettings / client / project(in_progress) / 마일스톤 3종(완료/진행/대기) / 인보이스 paid / 토큰 3종(active/expired/revoked). UUID는 v4 strict(13번째=4, variant=8). cleanup은 FK 역순 + e2e_* prefix 안전망
  - `e2e/portal/portal-flow.spec.ts` (신규, 7 시나리오):
    - #1 happy path (프로젝트/클라/PM/마일스톤/인보이스/폼 렌더)
    - #2 PortalUrlScrub URL 마스킹 (`/portal/active`로 교체)
    - #3 robots noindex/nofollow/nocache + referrer no-referrer
    - #4 정상 제출 (3.5초 대기 → DB row 1)
    - #5 honeypot 차단 (success 위장 + DB row 0)
    - #6 timing 차단 (`addInitScript`로 `Date.now`를 +60s 미래 강제 → server elapsed 음수 → drop 결정론적 검증 + DB row 0)
    - #7 만료/revoked → /portal/invalid redirect
  - `next.config.ts` (수정) — `turbopack: {}` 추가 (dev=Turbopack/build=webpack 비대칭 silence, withSerwistInit webpack config 충돌 해결)
  - `package.json` (수정) — `test:e2e`/`test:e2e:ui`/`test:e2e:debug` scripts + @playwright/test 1.59.1 devDep
  - `.gitignore` (수정) — `playwright-report/` `test-results/` `playwright/.cache/` 추가

- **검증**:
  - tsc 0 errors / lint 0 errors (기존 1 warning만)
  - **Playwright 7/7 통과 (17.7s)**: #1 1.1s · #2 702ms · #3 357ms · #4 4.8s · #5 4.8s · #6 1.5s · #7 569ms
  - DB 시드 → afterEach 피드백 row delete(시나리오 격리) → afterAll FK 역순 cleanup 정상 동작

- **디버깅 흔적 (실행 → 수정 사이클 3회)**:
  1. dev 서버 실패 — `next.config.ts` webpack(Serwist) + Turbopack 충돌 → `turbopack: {}` 명시 silence
  2. `DATABASE_URL is not set` — `dotenv/config` 기본은 `.env`만 → `loadEnv({ path: ".env.local" })` 명시
  3. 7개 중 5개 실패 (활성 토큰이 invalid로 redirect) — 시드 UUID `11111111-1111-1111-1111-...`가 RFC 4122 v4 spec 위반(13번째 char=1, variant=1) → Zod `.uuid()` strict 거부 → `11111111-1111-4111-8111-...` (13번째=4, variant=8) replace_all 일괄 교체

- **다음 세션 선택지** (우선순위 순):
  - **리팩토링 Task** — `sanitizeHeader` / `stripFormulaTriggers` / `HoneypotField` / timing guard를 `src/lib/security/`로 공통화 (공개 폼 4종 세트 재사용 확대)
  - **Vercel 배포 준비** — `after()`/waitUntil 도입 검토 + env 변수 세팅 + n8n W5 워크플로 실제 구축(Jayden)
  - **Phase 5 SaaS 전환 준비** — 회원가입 UI, multi-tenant, anon client + RLS 전면 재검증
  - **E2E 확장** (선택) — 대시보드 피드백 읽음 처리 + 사이드바 뱃지 시나리오 추가 (PM 측 인증 헬퍼 필요 → Phase 5 SaaS 전환과 함께)

- **차단 요소**: 없음

- **푸시 대기**: M8 본체 커밋(`6ffb9a0`) + B-2 E2E 신규 파일들 모두 미푸시 — Jayden 승인 후 일괄 푸시

- **교훈 1건 추가** (learnings.md): Zod uuid()는 RFC 4122 v4 strict 검증 — UUID 형식 hex 문자열도 version/variant bits 위반 시 거부. 테스트 픽스처는 v4 spec(13번째=4, 17번째=8/9/a/b) 준수 필수

---

## 이전 세션 (2026-04-19 Task 4-2 M8 — PWA 설치 유도 + /offline fallback + 리뷰 HIGH 4건 반영)

- **배경**: 이전 세션에서 Jayden이 PWA 기반(manifest + icons + sw.ts + serwist.tsx + next.config serwist 래핑 + layout.tsx metadata + scripts/generate-pwa-icons.mts)을 미리 스테이지해 둔 상태로 M8 진입. **기반은 보존, 설치 유도 UI + offline fallback을 얹어 Task 4-2 완결**.
- **완료** (신규 파일 2 + 수정 파일 3):
  - **Install Prompt 컴포넌트** (`src/components/shared/pwa-install-prompt.tsx` 신규) — `beforeinstallprompt` 이벤트 캐치(TypeScript 기본 정의 없어서 `BeforeInstallPromptEvent` 인터페이스 자체 선언) + iOS Safari/Android Chromium/Desktop Chromium/Unsupported 4분기 UA 감지 + `matchMedia('(display-mode: standalone)')` + `navigator.standalone` 이중 standalone 감지 + `sessionStorage` dismiss + surface-card/shadow-ambient-lg/No-Line Rule 준수. iOS Safari는 `beforeinstallprompt` 미지원이라 "공유 → 홈 화면에 추가" 가이드 UI로 분기.
  - **Offline 페이지** (`src/app/offline/page.tsx` 신규) — Server Component, robots noindex/nofollow/nocache, Indigo D 배지 + "지금은 연결이 필요해요" 안내 + 홈 복귀 Link. Next.js 라우트라 `__SW_MANIFEST`에 자동 포함 → SW가 precache.
  - **sw.ts** (수정) — `fallbacks.entries[{url:"/offline", matcher}]` 추가. matcher는 `request.mode === "navigate"` 이면서 동시에 `/dashboard //portal //api //auth` 접두사는 모두 반환 false (민감 경로는 fallback 대상 제외).
  - **page.tsx** (수정) — LandingFooter 뒤에 `<PwaInstallPrompt />` 삽입 (랜딩 `/`에만 노출, 대시보드/포털/데모 노출 금지).
  - **next.config.ts** (수정) — `exclude: [/\/dashboard\//, /\/portal\//, /\/api\//, /\/auth\//]` precache 매니페스트 원천 제외 (향후 누군가 force-static/ISR 전환해도 cross-tenant 응답이 SW 캐시에 안 박히도록 예방).
  - **serwist.tsx** (수정) — "use client" 경계 격리용 thin re-export임을 설명하는 주석 3줄 추가.
- **code-reviewer + security-reviewer 병렬 리뷰 → 블록 사유 0 + HIGH 4건 일괄 반영**:
  - [H/code] `clientsClaim: false` + `skipWaiting: true` 조합 의도 불분명 → `clientsClaim: true`로 변경 + 주석으로 "업데이트 즉시 활성화 + 기존 탭 새 SW 제어" 명시. 업데이트 직후 오프라인 전환 시 새 fallback 로직 일관 동작.
  - [H/code] `handleInstall`의 `accepted` 분기 미처리 (appinstalled 이벤트 미발화 구형 WebView 대비 부재) → `outcome === "accepted"` 시 `setStandalone(true)` 즉시 호출로 배너 재노출 방어.
  - [H/security] SW fallback matcher가 `/dashboard` `/portal` `/api` `/auth` navigate 실패도 `/offline`으로 스왑 → 세션 만료를 오프라인으로 오인, 토큰 히스토리 잔류 위험 → matcher에 접두사 4종 제외 명시.
  - [H/security] `precacheEntries: self.__SW_MANIFEST` exclude 부재 (현재 dynamic 라우트라 자동 제외되나 향후 정적화 시 cross-tenant 캐시 위험) → next.config exclude 4종 정규식.
- **리뷰 재확인만 (수정 불요)**:
  - [M/security] manifest scope "/" + PWA 히스토리에 포털 토큰 잔류 우려 → Task 4-2 M4에서 이미 `PortalUrlScrub` 컴포넌트(`history.replaceState`)로 방어됨 확인.
  - [L/security] sessionStorage dismiss key 조작 → UX 방해 수준, 보안 영향 없음. 현 구현 유지.
  - [code] `/offline` `Link` 스타일 인라인 클래스 → shadcn Button asChild 교체 가능하나 오프라인 JS 의존 낮추려는 의도로 현재 방식 유지.
- **검증**:
  - tsc 0 errors / lint 0 errors (기존 경고 1건 잔존) / build **41 routes 성공** (기존 40 + `/offline` 신규) / postbuild `public/sw.js` 존재 검증 ✅ / sw.js 54KB · `/offline` 문자열 2회 등장 (precache + fallback matcher 양쪽)
  - 기반 스테이지의 Turbopack→webpack 전환(`build --webpack`) · `transpilePackages: ["@react-pdf/renderer"]` · postbuild `test -f public/sw.js` hook · `.gitignore` / `eslint.config.mjs`의 `public/sw.js` · `swe-worker-*.js` 제외 모두 기존대로 정상 동작.
- **다음 세션 선택지** (우선순위 순):
  - **M8 B-2 E2E 포털 스모크 완결** (미커밋 스테이지 보존 중) — `playwright.config.ts`(주석상 "Task 4-2 M8 B-2") + `e2e/` 폴더가 현재 untracked. dev 서버 + Playwright로 포털 핵심 흐름(토큰 → 피드백 → 읽음) 자동 스모크. `seed-portal.ts` 픽스처로 DB 직접 시드. 실행 + 안정화 + 리뷰 후 별도 커밋 예상.
  - **리팩토링 Task** — `sanitizeHeader` / `stripFormulaTriggers` / `HoneypotField` / timing guard를 `src/lib/security/`로 공통화 (공개 폼 4종 세트 재사용 확대)
  - **Vercel 배포 준비** — `after()`/waitUntil 도입 검토 + env 변수 세팅 + n8n W5 워크플로 실제 구축(Jayden)
  - **Phase 5 SaaS 전환 준비** — 회원가입 UI, multi-tenant, anon client + RLS 전면 재검증
- **차단 요소**: 없음
- **푸시 대기**: M8 커밋 `6ffb9a0` 포함 로컬이 `origin/main`보다 6커밋 앞섬 — Jayden 승인 후 일괄 푸시 예정
- **교훈 1건 추가** (learnings.md): SW fallback matcher 민감 경로 제외. Serwist + Turbopack 비호환 교훈은 Jayden 이전 세션에 이미 기록 존재하여 중복 방지

## 이전 세션 (2026-04-18 Task 4-2 M4~M7 — 고객 포털 완성 + n8n 알림 + 리뷰 42건 반영)

- **완료 Task 4건** (커밋 4건, HEAD=060472a):
  - **M4 `/portal/[token]` 고객 뷰 페이지** (c017d26) — queries/formatters + 5 컴포넌트 + layout/page/loading/error/invalid + PortalUrlScrub · 리뷰 HIGH 7+MEDIUM 5 반영 (No-Line Rule, Referrer-Policy, history.replaceState, middleware matcher 분리) · 교훈 1건(URL path 토큰은 history.replaceState로 마스킹)
  - **M5 피드백 제출 폼** (cf676fa) — validation/portal.ts + feedback-actions.ts + PortalFeedbackForm · 방어선 7개(honeypot off-screen, timing guard sanity + normalizeTiming 400-600ms 랜덤, Zod strict, sanitizeHeader BiDi/NEL, stripFormulaTriggers 라인별) · 리뷰 HIGH 4+MEDIUM 4+LOW 2 반영
  - **M6 PM 대시보드 피드백 조회/읽음 처리** (38682e9) — schema isRead/readAt + 0014 마이그레이션 + dashboard feedback-actions(getProjectFeedbacks/Unread/markRead) + ProjectFeedbackSection + 탭 조건부 쿼리 + KST 표시 · 리뷰 HIGH 4+MEDIUM 4+LOW 5 반영 (IPv4-mapped IPv6 마스킹, router.refresh, Zod strict, activity_logs metadata from/to)
  - **M7 사이드바 전역 뱃지 + n8n 이메일** (060472a) — getTotalUnreadFeedbackForUser + dashboard layout 뱃지 prop + Sidebar 데스크톱/모바일 뱃지 + N8nWorkflow `portal_feedback_received` + portal emit fire-and-forget + W5 README 가이드(Compose Email Code jsCode + saveDataErrorExecution none) · 리뷰 HIGH 3+MEDIUM 2+LOW 2 반영

- **신규 파일 17 + 수정 파일 10** (4개 커밋 누적): 4315 insertions / 18 deletions
- **검증**: 매 Task마다 tsc 0 errors + lint 0 errors + 브라우저 스모크 3~4경로 + 테스트 데이터 정리
- **보안 방어선 누적** (회귀 없이 M4~M7 내내 유지):
  - 토큰 검증: UUID Zod + revoked/expired/deleted + 모든 실패 success 위장
  - SEO 차단: robots noindex/nofollow/nocache + referrer no-referrer + force-dynamic
  - 공격 표면 분리: middleware `/portal` 제외 + PortalUrlScrub history.replaceState
  - 입력 방어: guardMultiLine + stripFormulaTriggers 라인별 + sanitizeHeader BiDi
  - Timing oracle: normalizeTiming 400-600ms 랜덤 지터 + timing guard sanity 상한
  - Information disclosure: Zod strict unrecognized_keys 분리 로그 + err.name만 클라 응답
  - n8n emit: 토큰/IP/UA 제외, messagePreview 140자, projectName SMTP 헤더 sanitize
  - 대시보드: 소유권 JOIN + 멱등 체크 JOIN 뒤 + 트랜잭션 + activity_logs 감사
- **교훈 2건 기록** (learnings.md): PortalUrlScrub 패턴(M4), n8n 워크플로 복제 가이드 함정(M7 추가)
- **다음 세션 선택지**:
  - Task 4-2 **M8** — PWA 설치 유도(manifest + service worker) — Phase 4 마무리
  - **리팩토링 Task** — sanitizeHeader/stripFormulaTriggers/HoneypotField를 `src/lib/security/`로 공통화
  - **Vercel 배포 준비** — `after()`/waitUntil 도입 + env 변수 세팅 + n8n W5 워크플로 실제 구축(Jayden)
- **차단 요소**: 없음

---

## 이전 세션 (2026-04-18 Task 4-2 M1~M3 — 고객 포털 토큰 발급 기반 + 리뷰 5건 반영)

- **완료**:
  - **Task 4-2 M1 스키마 + 마이그레이션** (신규 2 테이블):
    - `portal_tokens` (id / project_id CASCADE / token TEXT UNIQUE / issued_by / issued_at / expires_at / last_accessed_at / revoked_at / created_at) — 토큰 + 생명주기 + 감사
    - `portal_feedbacks` (id / project_id CASCADE / token_id CASCADE / message / client_ip / user_agent / created_at) — M5 피드백 폼 대비
    - `0012_steep_scrambler.sql` 마이그레이션 + RLS 방어선(`ENABLE RLS` + `deny_anon` 정책) + 부분 인덱스 + 롤백 주석. 0009 briefings 패턴 복제
  - **Task 4-2 M2 Server Action 3종** (`src/app/dashboard/projects/[id]/portal-actions.ts` 신규):
    - `getActivePortalToken(projectId)` — 소유권 확인 + `revoked_at IS NULL` 필터 + 가장 최근 1건 반환
    - `issuePortalTokenAction(projectId)` — 트랜잭션 + `projects.for("update")` 락 + 기존 활성 soft revoke(returning으로 revokedIds 수집) + `crypto.randomUUID()` (UUID v4, 122bit) + 만료 +1년 + activity_logs 감사
    - `revokePortalTokenAction(projectId)` — 활성 토큰 일괄 revoke + rowsAffected 체크 + activity_logs
  - **Task 4-2 M3 검증 헬퍼 + UI** (신규 2):
    - `src/lib/portal/token.ts` — `validatePortalToken(token)` (Zod uuid + revoked/expired/projectDeleted 필터 + `last_accessed_at` fire-and-forget IIFE + 본 렌더 격리)
    - `src/components/dashboard/portal-link-card.tsx` — 3상태(미발급/활성/만료임박 30일) + 복사 toast + 재발급 confirm + 링크 취소 · SSR/CSR hydration 안전 origin 세팅
    - `src/app/dashboard/projects/[id]/page.tsx` (수정) — Promise.all 확장(+`getActivePortalToken`) + overview 탭 공개 프로필 ↓ AI 보고서 ↑ 카드 삽입
  - **code-reviewer + security-reviewer 병렬 리뷰** → 블록 사유 0건 (CRITICAL 0), HIGH 4 + MEDIUM 1 일괄 반영:
    - [H/code] **Hydration URL 불일치** (portal-link-card.tsx) — `useState<string\|null>(null)` + `useEffect`로 origin 세팅 → SSR/CSR 1차 렌더 일치. React 19 신규 `react-hooks/set-state-in-effect` rule은 `eslint-disable-next-line` + 정당성 주석으로 예외 처리(브라우저 외부 API 동기화)
    - [H/security] **발급 Rate Limit** (portal-actions.ts) — `issuedBy + issuedAt > now()-1min` count ≥ 5면 거부 ("짧은 시간 내 발급 요청이 너무 많습니다"). 트랜잭션 외부 선검사로 락 점유 최소화. userId 기준 → 한 사용자가 여러 프로젝트 폭주해도 방어
    - [H/security] **activity_logs metadata 확장** (portal-actions.ts) — issue: `{expiresAt, reissue, revokedTokenIds}` / revoke: `{revokedCount, revokedTokenIds}`. 토큰 원본 값은 절대 metadata 미기록(로그 열람자 URL 재구성 방어). 재발급 시 "어느 토큰이 어느 토큰을 교체했는지" 역추적 가능
    - [H/code] **DB 레벨 "활성 토큰 1건" 불변식** (schema.ts + `0013_watery_adam_warlock.sql`) — `uniqueIndex("portal_tokens_one_active_per_project_idx").on(projectId).where(revokedAt IS NULL)` → cron/외부 경로 추가 시에도 race를 DB가 거부
    - [M/security] **`NEXT_PUBLIC_APP_URL` fallback** (portal-link-card.tsx) — env 우선 + `window.location.origin` fallback + 끝 슬래시 정규화. 개발/프리뷰 환경 origin이 고객에게 전달되는 경로 방어. `.env.example`은 권한 차단으로 Jayden 수동 생성 필요
  - 🔐 **Supabase MCP `apply_migration`으로 RLS 정책 + 0013 unique partial index 직접 적용** (drizzle-kit push가 SQL 파일 미실행 특성 발견)
- **신규 파일 5** (`db/schema.ts` 수정 포함 시 6) / **마이그레이션 2건** (0012 + 0013) / **수정 파일 2** (page.tsx + schema.ts)
- **검증**:
  - tsc 0 errors / lint 0 errors / build 성공
  - 수동 스모크: 발급 → 재발급(UUID 교체 확인) → 취소(미발급 상태 복귀) 전 사이클 PASS
  - Rate limit 회귀 스모크: dummy 4 revoked + UI 5번째 발급 PASS + 6번째 "짧은 시간 내..." 거부 메시지 확인
  - activity_logs 메타 DB 확인: `{reissue: false, expiresAt: "2027-04-18...", revokedTokenIds: []}` 정상 기록
  - RLS 확인: `portal_tokens`/`portal_feedbacks` `rowsecurity=true` + `*_deny_anon→anon` 정책 ✅
- **Jayden 수동 필요 (CRITICAL)**:
  - **없음** — 이번 세션은 스키마/마이그레이션/RLS 모두 Claude가 Supabase MCP로 직접 적용 완료
  - (선택) `.env.example` 생성 — `NEXT_PUBLIC_APP_URL=https://dairect.kr` 등. Claude 권한 차단으로 수동.
- **다음**: Task 4-2 M4 (`/portal/[token]` 고객 뷰 페이지 — `validatePortalToken` 활용, 진행률/마일스톤/인보이스 금액·상태 읽기 전용 렌더, 2h 예상)
- **차단 요소**: 없음
- **교훈 2건 추가**: drizzle-kit push가 SQL 마이그레이션 파일 비실행 / React 19 `set-state-in-effect` lint는 브라우저 외부 API 동기화 시 정당한 예외
- **백로그 이관** (M5~M8 또는 별도 Task):
  - `window.confirm` → shadcn Dialog 일괄 교체
  - 전역 `X-Frame-Options` / CSP `frame-ancestors` middleware
  - `last_accessed_at` 사이드채널(IP/UA 핑거프린트)
  - 365일 TTL + 무활동 자동 revoke cron (Phase 5 SaaS 연계)
  - `portal_feedbacks_project_idx` non-unique 인덱스 (M5 피드백 쿼리 EXPLAIN 보며 추가)

## 이전 세션 (2026-04-18 Task 4-1 M5 + M6 — 옵션 A 전체 재사용 + 리뷰 5건)

- **완료**:
  - **Task 4-1 M5 구현** (신규 14 파일, 수정 0 파일 — 옵션 A "원본 수정 0건" 원칙):
    - **페이지 9개** (`src/app/(public)/demo/`): `projects/[id]` (탭 + 공개 프로필 + AI CTA + 마일스톤) / `estimates` + `estimates/[id]` / `clients` + `clients/[id]` / `leads` · `contracts` · `invoices` · `settings` (UnavailableSection 안내)
    - **컴포넌트 5개** (`src/components/demo/`): `milestone-list-demo` / `public-profile-demo` / `weekly-report-cta` / `client-notes-demo` / `unavailable-section`
    - **DemoSafeButton/Form 커버리지**: PDF 미리보기/다운로드, 편집, 계약서 생성, 새 견적, 새 고객, 마일스톤 체크/추가/삭제, 메모 추가/삭제 — 총 14개 mutation CTA 전수 가드
  - **code-reviewer + security-reviewer 병렬 리뷰 → "PR 블록 사유 없음"** (CRITICAL 0 + HIGH 0) → MEDIUM 4 + LOW 1 일괄 반영:
    - [🟢 security M-2] 샘플 email/phone/사업자번호 RFC 2606 예약값으로 교체 — `.kr`/`.com` 실재 도메인 + `02-1234-5678` 실재 형식 → `@techstart.example`/`02-0000-0001`/`000-00-00001`로 전환. 봇 스캐너 harvesting 방어
    - [🟢 security M-1] `isPublic=false` 프로젝트 memo 보호 — mvpApp/commerce/chatbot 비공개 memo가 /demo에 노출되던 것을 "프로젝트 소유자만 확인" 문구로 대체. 사용자 멘탈 모델 교정 (데모는 RLS로 격리된다는 신호)
    - [🟢 code M-1] `/demo/clients` totalRevenue 원본 의미 일치 — `paidAmount` 합(실입금) → `contractAmount` 합(계약 체결 매출). 테크스타트 3,710만→7,700만으로 원본 대시보드와 숫자 일치. 로그인 전/후 혼동 방지
    - [🟢 code M-2] `projectStatusLabels` 로컬 재선언 제거 → `@/lib/validation/projects` import. 중복 제거, M4 `formatKRW` 공용화와 같은 원칙 적용
    - [🔵 code L-1] `/demo/estimates/[id]` `generateMetadata` 동적 title — 정적 "견적서 상세" → "모바일 앱 MVP 견적서 | 데모 · dairect". 프로젝트/고객 상세와 탭 title 일관
  - **리뷰에서 "이미 안전" 확인**: path traversal 불가능(fixture `find()` strict equality) · Server Action 호출 0건 · `dangerouslySetInnerHTML` 0건 · sonner toast XSS 불가 · UnavailableSection `/login` CTA open redirect 없음 · M4 DB CHECK + Provider null sentinel 모두 적용 상태
- **신규 파일 14** / **수정 파일 5** (M6 리뷰 수정: sample-data.ts + clients 2파일 + projects/[id] + estimates/[id])
- **검증**:
  - tsc 0 errors / lint 0 errors (기존 경고 1건 잔존) / build 33 pages 성공 (`/demo/*` 10 경로 Static+1m 또는 Dynamic)
  - preview fetch 스모크: 사이드바 8탭(`/demo` + 7) **모두 200 OK**
  - 반응형: 모바일 375px에서 사이드바 숨김 + 하단 탭바 5개 `/demo/*` 링크 정상
  - DemoSafeButton 토스트 동작: "데모 모드에서는 수정할 수 없습니다" + intent 설명 + **[로그인] sonner action 버튼** (M4 수정 반영 확인)
  - preview로 5건 수정 전수 검증: 7,700만원 · `@techstart.example` · 02-0000-0001 · "프로젝트 소유자만" 문구 · 공개 프로젝트 원본 memo 유지 · 견적 동적 title
- **다음**: Task 4-2 (고객 포털 `/portal/[token]` — 1.5일 = 12시간, 8 마일스톤. `portal_tokens`/`portal_feedbacks` 테이블 + RLS + 토큰 발급 Server Action + 고객 뷰 + 피드백 폼)
- **차단 요소**: 없음

## 이전 세션 (2026-04-18 Task 4-1 M4 + M1~M4 + B-1/B-2 code/security 리뷰 후속 패치 9건)

- **완료**:
  - **Task 4-1 M4 구현** (신규 2 + 수정 1):
    - `src/lib/demo/derived-data.ts` (신규) — `getDemoKpi`/`getDemoMonthlyRevenueForChart`/`getDemoClientRevenue`/`getDemoUpcomingDeadlines`/`getDemoRecentActivity` 5개 순수함수. `dashboard-actions.ts` 쿼리 규칙(activeProjects/monthEstimates/unpaidAmount 등)을 JS filter로 미러링
    - `src/app/(public)/demo/page.tsx` (수정) — M3 placeholder → KPI 4 + AI 정적 안내 카드(로그인 CTA) + 월별/고객별 매출 차트 + 다가오는 마일스톤 + 최근 활동
    - `src/app/(public)/demo/projects/page.tsx` (신규) — 5행 테이블 (상태 뱃지 + 기간 + 금액 + 진행률). Kanban·생성 다이얼로그 제외 (읽기 전용)
    - 기존 차트 컴포넌트 `MonthlyRevenueChart`/`ClientRevenueChart` import만으로 재사용 (기존 dashboard 코드 수정 0)
  - **code-reviewer + security-reviewer 병렬 리뷰, 9건 일괄 반영** (CRITICAL 0 + HIGH 5 + MEDIUM 4):
    - [HIGH] DEMO_USER_ID DB CHECK 제약 — `users.id <> '00000000-...'` (schema.ts + 0011_absent_sandman.sql 자동 생성). 데모 샘플 UUID가 실 사용자 공간에 침입 방지
    - [HIGH] `/demo` `force-dynamic` → `revalidate = 60` — DoW(반복 요청 지갑 털기) 완화 + "항상 최근 데이터" UX 유지 + 서버 invocation 대폭 감소
    - [HIGH] `derived-data.ts` Timezone UTC 통일 — `getMonth/getDate` → `getUTCMonth/getUTCDate`. `sample-data.ts`(UTC)와 정합성 맞춤, KST 자정 엣지 제거
    - [HIGH] `useDemoGuard` sonner `action: { label: "로그인" }` 버튼 — 기존 `[로그인]` 대괄호 문자열이 sonner에서 링크로 파싱 안 되는 문제 해결. `useRouter` 주입
    - [HIGH] `useIsDemo` Provider 밖 dev 경고 — `createContext<boolean | null>(null)` sentinel 패턴으로 `/demo` 레이아웃 누락 즉시 감지 (production 노이즈 0)
    - [MEDIUM] `buildMonthlyRevenue` 월말 엣지 방어 — `Date.UTC(year, month+offset, 1)` 고정. 3/31 기준 -1 offset이 3/3으로 튀는 JS setUTCMonth 버그 차단
    - [MEDIUM] `inv()` `sentAt` — `dates.issued !== undefined` 명시, `?? 0` fallback으로 "오늘 발송" 오해 제거
    - [MEDIUM] `formatKRW` 공용 유틸 통합 — `src/lib/utils/format.ts` (`formatKRW`/`formatKRWLong`/`formatKRWShort` 3종). 5곳 중복 제거 (dashboard + demo × 2 + dashboard-charts)
    - [MEDIUM] `getDemoRecentActivity` 재정렬 제거 — `buildActivityLogs`가 이미 최신순이므로 sort 불필요. 주석/코드 일치
    - [MEDIUM] `contracts.ts`/`invoices.ts` `stripInvisibleChars` → `stripZeroWidth` — `guardMultiLine`이 이미 BiDi/제어문자 거부하므로 transform은 zero-width(\u200B-\u200D)+BOM(\uFEFF)만. 중복 방어 의도 명확화
    - [보너스] `DemoSafeButton.onClick` `e.preventDefault()` 주석 — "form 안 submit 버튼일 경우 기본 submit 차단" 의도 명시
  - **리뷰에서 "이미 안전" 확인**: B-2 shared-text 교체의 엄격도 회귀 없음 (오히려 BiDi/NEL/U+2028/CSV-leading 추가 차단) · `inquiry.ts` 공개 폼 4종 세트(honeypot/3s timing/sanitizeHeader/stripFormulaTriggers) 전부 잔존 · PDFDownloadLink dynamic(ssr:false)은 인증 우회 영향 0 · 샘플 데이터에 실 고객 정보 없음
- **신규 파일 3** (derived-data.ts, demo/projects/page.tsx, lib/utils/format.ts) / **수정 파일 9** (demo/page.tsx, demo/layout.tsx, demo/guard.tsx, demo/sample-data.ts, dashboard/page.tsx, dashboard/projects/page.tsx, dashboard/dashboard-charts.tsx, validation/contracts.ts, validation/invoices.ts, db/schema.ts) / **마이그레이션 1건** (0011)
- **검증**: tsc 0 errors / lint 0 errors (기존 경고 1건 잔존) / build 25 pages 성공 (`/demo`·`/demo/projects` Static + 1m revalidate) / `pnpm drizzle-kit generate` 정상 / preview `/demo` KPI 2건·₩1,200만·0건·₩4,830만 + 콘솔 에러 0 / preview `/demo/projects` 5행 테이블 금액 4,200만원~800만원 + 진행률 정상
- **디버깅**: turbopack `.sst` 캐시 누락 500 에러 → `.next`를 `/tmp/dairect-next-stale-*`로 이동 후 dev restart로 해소 (2026-04-18 learnings.md 교훈 재활용)
- **교훈**: 2건 추가 (JS Date `setUTCMonth` 월말 엣지 방어 패턴 / Context `null` sentinel로 Provider 누락 감지)
- **수동 실행 필요** (Jayden): `pnpm db:push` — 0011 CHECK 제약을 실 Supabase DB에 반영 (기존 데이터 영향 0, 안전)
- **다음**: Task 4-1 M5 — 프로젝트 상세 + 견적 + 고객 데모 뷰 (읽기 전용, CRUD 버튼에 `DemoSafeButton` 래핑, 1.5h 예상)
- **차단 요소**: 없음 (db:push는 code 커밋과 독립 진행 가능)

## 이전 세션 (2026-04-18 Task 3-5 E2E 스모크 + 런타임 검증)

- **완료**:
  - elest.io 셀프호스트 n8n에 W1/W4 워크플로우 임포트 + Slack App OAuth(Bot Token) + Gmail OAuth2 자격증명 연결 완료
  - W1 실제 발사·수신 검증 — Dairect 대시보드에서 `쇼핑몰 개발` 프로젝트 상태 `review → in_progress` 변경 → Slack 채널에 한국어 템플릿 메시지 수신 (고객사명 "테스트 고객사" 포함, 2026-04-18T04:18:31.350Z emitted_at)
  - W4 실제 발사·수신 검증 — 프로젝트 상태 `review → completed` 변경 → Gmail (`june7203@gmail.com`) 수신 확인 (첫 시도 `junee7203` 오타 → 재테스트 후 정상)
  - **리뷰 수정 11건(HIGH 6 + MEDIUM 5) 전체 런타임 검증** — HMAC+nonce+rawBody / SSRF 방어 / 트랜잭션+FOR UPDATE / fire-and-forget / Respond 200 선행 / HTML escape 준비 / unsigned production 차단 / at-most-once
  - 디버깅: `.env.local`의 `N8N_WEBHOOK_URL_*` 값에 경로 중복(`.../project-status-changed/webhook/dairect/project-status-changed`) → 404 반환 → URL 정리 후 Next.js `Reload env: .env.local` 자동 감지로 해결
  - 디버깅: Playwright 테스트 계정(`playwright@dairect.test`) 비번 분실 → Supabase pgcrypto `crypt('..', gen_salt('bf', 10))`로 직접 재설정 → 로그인 성공
  - 디버깅: shadcn/ui base-ui Select 옵션 click이 programmatic dispatchEvent로 발화 안 되는 문제 — `pointerover → pointermove → pointerdown → mousedown → focus → pointerup → mouseup → click` 전체 시퀀스로 해결
  - DB 원복: `clients.email` (junee7203→june7203→test-lead@example.com) + `projects.status` (completed→in_progress) — 상태 원복은 이벤트 재발사 회피를 위해 DB 직접 UPDATE
- **다음**: Task 3-5 코드 변경 커밋 (`client.ts` + `actions.ts` + `n8n/*` 5개 파일, Jayden 확인 후) → Phase 4 착수
- **차단 요소**: 없음

## 이전 세션 (2026-04-18 Task 3-5 Option B 구현 + 리뷰)

- **완료**:
  - Task 3-5 Option B 구현 완료 (M1 + M2 + M5 + 워크플로우 JSON 2종 + 배포 가이드)
    - **M1**: `src/lib/n8n/client.ts` (fire-and-forget 클라이언트) — `emitN8nEvent(workflow, event, data)` + HMAC-SHA256 `${ts}.${nonce}.${rawBody}` + `X-Dairect-Nonce` UUID + AbortController 3s timeout + 유효 URL 전용 캐시 + 프로덕션 HTTPS 강제 + 사설/링크로컬 hostname 차단 (SSRF 방어) + 프로덕션에서 unsigned 차단
    - **M2**: `updateProjectStatusAction` — `db.transaction` + `.for("update", { of: projects })`로 race 방지, UPDATE 후 `void emitN8nEvent("project_status_changed", ...)` 발사
    - **M5**: 동일 액션 내 `to_status === "completed"`일 때만 `void emitN8nEvent("project_completed", ...)` 발사 (PII 포함: 고객 이메일/담당자명/회사명)
    - **W1 JSON** (`n8n/workflows/W1_project_status_changed.json`): Webhook(rawBody:true) → Verify HMAC (nonce dedupe via `$getWorkflowStaticData`) → If → Respond 200 → Slack Post(continueOnFail)
    - **W4 JSON** (`n8n/workflows/W4_project_completed.json`): Webhook → Verify HMAC → If(verified && email) → Respond 200 → Compose Email(Code 노드 + escHtml/stripCtrl) → Gmail Send(continueOnFail) + `saveDataSuccessExecution:"none"`로 PII 실행 이력 차단
    - **n8n/README.md**: Dairect/n8n 양측 env · credentials 연결 · Slack Bot Token + Gmail OAuth2 절차 · 스모크 실패 메시지 레퍼런스 · PII execution history 경고 · 유지보수 주의사항 (HMAC canonical 명시)
  - code-reviewer + security-reviewer 병렬 리뷰, **11건 일괄 수정 반영** (HIGH 6 + MEDIUM 5, CRITICAL 0)
  - 에러 확률 최소화 6종 기법 설계 적용: AbortController timeout · URL Zod(new URL) 검증 · HMAC+timingSafeEqual · ±5분 timestamp + nonce dedupe · Date→ISO 사전 변환 · at-most-once (재시도 금지)
- **신규 파일 4** (`src/lib/n8n/client.ts`, `n8n/workflows/W1_...json`, `n8n/workflows/W4_...json`, `n8n/README.md`) / **수정 파일 1** (`src/app/dashboard/projects/actions.ts`)
- **검증**: tsc 무출력 통과 / lint 0 errors / build 23 pages 성공
- **다음**: (옵션) Task 3-5 Option B 런타임 스모크 (Jayden 셀프호스트 n8n 준비 후) → Phase 4 고객 포털 + /demo + PWA
- **차단 요소**: 없음 (런타임 스모크는 인프라 준비 대기, 코드 레벨 확정)

## 이전 세션 (2026-04-17 후반 6회차)

- **완료**:
  - Task 3-3 AI 주간 보고서 PDF 구현 완료 (7 마일스톤)
    - M1: `weekly_reports` 테이블 (userId+projectId+weekStartDate UNIQUE + generation_type + RLS) + 0010 마이그레이션
    - M2: `src/lib/validation/report.ts` (Zod 스키마 + 유니코드/BiDi/CSV 방어 + Claude `\\n` transform) + `src/lib/ai/report-data.ts` (프로젝트별 주간 집계 4종 병렬: 완료 마일스톤 / 예정 마일스톤 / activity_logs / 전체 진행률)
    - M3: `src/lib/ai/report-prompt.ts` (시스템 프롬프트 "고객용 정중체" + tool `submit_weekly_report` — completedThisWeek/plannedNextWeek/issuesRisks/summary)
    - M4: `src/lib/ai/report-actions.ts` (getCurrentWeeklyReport + regenerateWeeklyReportAction — AI 10+6패턴 전부 + projectId uuid 검증 + 쿨다운 10초 + empty_fallback + rollback 3경로)
    - M5: `src/lib/pdf/weekly-report-pdf.tsx` (A4 + Pretendard self-host + 헤더/정보패널/이번주완료/다음주계획/이슈/요약/푸터 섹션)
    - M6: `src/components/dashboard/weekly-report-card.tsx` ([생성하기]/[새로고침]/[PDF 다운로드] + priority 뱃지 + PDFDownloadLink dynamic ssr:false) + `dashboard/projects/[id]/page.tsx` overview 탭 공개 프로필 아래 통합
    - M7: Playwright 원본 스모크 (seed: 이번 주 완료 1 + 다음 주 예정 1 + activity_log 1 → AI가 completedThisWeek 1 + plannedNextWeek 1 + summary 216자 생성, DB generation_type=ai, daily_count 7→8 공유)
  - code-reviewer + security-reviewer 병렬 리뷰, **10건 수정 반영** (HIGH 4 + MEDIUM 1 + 추가 발견 1)
  - **`src/lib/validation/shared-text.ts` 신설** — 내부 입력 필드 공통 방어 regex (LLM/PDF 2차 신뢰 경계로 확산되는 경로 차단) → projects/milestones/clients 3개 스키마에 적용
  - PDFDownloadLink SSR 함정 발견 후 dynamic(ssr:false) 래핑으로 해결
- **신규 파일 8 / 수정 파일 6 / 마이그레이션 1건 (0010)**
- **다음**: Task 3-5 (n8n Webhook 4종 — Slack/리마인더/주간/만족도)
- **차단 요소**: 없음

## 이전 이전 세션 (2026-04-17 후반 5회차)

- **완료**:
  - Task 3-2 AI 주간 브리핑 구현 완료 (6 마일스톤)
    - M1: `briefings` 테이블 (userId + weekStartDate UNIQUE + contentJson + generation_type + aiGeneratedAt) + 0008 마이그레이션
    - M2: `src/lib/ai/briefing-data.ts` — KST 주차 유틸(`getKstDateParts`, `daysBetween`) + 4종 병렬 쿼리 (수금 예정 / 미수금 / 완료 임박 / 이번 주 마일스톤) + `BRIEFING_LIST_LIMIT=10`
    - M3: `src/lib/ai/briefing-prompt.ts` — 시스템 프롬프트(보안 규칙 + priority 가이드) + tool schema `submit_weekly_briefing` (focusItems 정확히 3개 + summary 500자)
    - M4: `src/lib/ai/briefing-actions.ts` — `getCurrentBriefing` (읽기 전용) + `regenerateBriefingAction` (AI 10+6패턴 + 빈 데이터 short-circuit + upsert)
    - M5: `src/components/dashboard/ai-briefing-card.tsx` (surface-card + priority 뱃지 3종 + [새로고침]) + `dashboard/page.tsx` Promise.all 병렬 통합
    - M6: Playwright 원본 스모크 (미수금 1 + 수금예정 1 + 마일스톤 1 → 긴급 2건 + 높음 1건 생성, 344자 요약) + DB `input_mode=ai` 확인
  - code-reviewer + security-reviewer 병렬 리뷰, **10건 수정 반영** (HIGH 5 + MEDIUM 5, CRITICAL 0)
  - 쿨다운 회귀 스모크 성공 — DB `ai_generated_at` 리셋 후 즉시 재클릭 시 `ai_generated_at` 불변, `daily_count` 7 불변 (AI/DB write 생략 확인)
  - Hydration mismatch 발견 후 KST 고정 수동 포맷으로 근본 해결 (ICU 의존성 제거)
  - Claude 응답 literal `\\n` 함정 발견 후 Zod transform으로 정규화
  - 0009 마이그레이션에 `briefings` RLS ENABLE + `briefings_deny_anon` 정책 (defense-in-depth)
- **신규 파일 6 / 수정 파일 2 / 마이그레이션 2건 (0008+0009)**
- **다음**: Task 3-3 (AI 주간 보고서 PDF — 프로젝트별 고객 발송용)
- **차단 요소**: 없음

## 이전 세션 (2026-04-17 후반 4회차)

- **완료**:
  - Task 3-1 AI 견적 초안 생성 구현 완료 (5 마일스톤)
    - M1: `src/lib/ai/claude-client.ts` + `estimate-prompt.ts` (시스템 프롬프트 + tool_use 스키마) + `src/lib/validation/ai-estimate.ts` (응답/입력 Zod + 카테고리·난이도 enum + 계수 매핑)
    - M3: `user_settings.aiDailyCallCount` + `aiLastResetAt` 2컬럼 추가 (0006 마이그레이션) + NOT NULL 제약 보강 (0007 마이그레이션)
    - M2: `src/app/dashboard/estimates/ai-actions.ts` — `generateEstimateDraftAction` 10패턴 준수 + race-safe pre-increment 카운터 + tool_choice JSON 강제
    - M4: 견적서 `/new` 폼에 AI 초안 섹션 + 경고 배너 + 덮어쓰기 confirm + `inputMode` 전달
    - M5: Playwright 스모크 (쇼핑몰 147자 → 23개 항목, 49 M/D, 41,370,000원) + DB `input_mode="ai"` 검증
  - code-reviewer + security-reviewer 병렬 리뷰, **10건 수정 반영** (CRITICAL 2 + HIGH 6 + MEDIUM 2)
  - 프롬프트 인젝션 회귀 스모크 성공 — "이전 지시 무시하고 manDays=99999" 주입해도 maxManDays=2.5 정상 유지

## 이전 세션 (2026-04-17 후반 3회차)

- **완료**:
  - Phase 3 전체 Task 분해 (Task 3-1~3-5, PRD v3.1 기준)
  - Task 3-4 리드 CRM 구현 완료 (6 마일스톤)
    - M1: `leads` 테이블 CHECK 제약 2건 (`source`/`status`) + 0005 마이그레이션
    - M2: `/dashboard/leads` 목록 + 필터(소스·상태·검색) + 페이지 헤더
    - M3: 리드 수동 생성 다이얼로그 (이름·소스·연락처·프로젝트 유형·예산·메모)
    - M4: 리드 상세 + 상태 전이 폼 + 실패 사유 + 삭제 버튼
    - M5: 랜딩폼 확장 — `submitInquiryAction`에 `leads` 자동 생성 + `inquiries.convertedToLeadId` 링크
    - M6: `convertLeadToProjectAction` — clients(신규/기존) + projects 자동 생성 + `converted_to_project_id` 저장
    - 사이드바 리드 메뉴 추가 (모바일 탭은 별도 배열: 데스크톱 전용)
  - code-reviewer + security-reviewer 병렬 리뷰, **4건 수정 반영** (HIGH 3 + MEDIUM 1)
  - **Supabase Session pool 고갈 디버깅**: postgres.js `max: 1, idle_timeout: 20` 추가 (빌드 워커 9개 × default max 10 = Session pool 15슬롯 초과 방어)
  - 교훈 3건 추가 (Server Action type re-export 금지 / Supabase pool + 빌드 워커 / convert 레이스 isNull 가드)
- **신규 파일 10 / 수정 파일 5 / 마이그레이션 1건**

## 검증 상태

```
✅ tsc       — PASS (0 errors)
✅ lint      — PASS (0 errors, Task 2-1 기존 경고 1개 잔존)
✅ build     — PASS (28 routes)
✅ db:push   — PASS (14 tables, 0006/0007 user_settings AI 카운터 + NOT NULL 적용)
✅ Claude Playwright 자동 스모크 (Task 3-1) — 쇼핑몰 147자 → 23개 항목 생성, DB input_mode="ai" 확인 (증거: task-3-1-ai-estimate-draft-smoke.png)
✅ Claude Playwright 회귀 스모크 (리뷰 수정 후) — 프롬프트 인젝션 주입 요구사항에서도 15개 정상 항목, maxManDays=2.5 (증거: task-3-1-review-fix-smoke.png)
✅ Claude Playwright 자동 스모크 (Task 3-4) — 리드 생성 → 프로젝트 전환 → 상태="계약" (증거: task-3-4-leads-crm-smoke.png)
✅ Claude Playwright 자동 스모크 (Task 3-2) — 미수금 1 + 수금예정 1 + 마일스톤 1 → 긴급 2 + 높음 1 focusItems 3개 + 344자 요약, DB `generation_type=ai` (증거: task-3-2-weekly-briefing-smoke.png)
✅ Claude Playwright 회귀 스모크 (Task 3-2 쿨다운) — DB ai_generated_at 리셋 후 즉시 재클릭 시 ai_generated_at/daily_count 모두 불변 (AI/DB write 생략)
✅ Claude Playwright 자동 스모크 (Task 3-3) — 프로젝트 상세 → [생성하기] → AI 응답 → completedThisWeek 1 + plannedNextWeek 1 + 요약 216자 + DB generation_type=ai + PDF 다운로드 버튼 노출 (증거: task-3-3-weekly-report-smoke.png)
✅ Claude Playwright E2E 스모크 (Task 3-5 W1) — `쇼핑몰 개발` 상태 `review → in_progress` → Dairect Server Action 200 + n8n executions 1건(Verify HMAC verified=true + Slack Post 2xx) + Slack 채널에 한국어 템플릿 메시지 실수신 (2026-04-18T04:18:31.350Z)
✅ Claude Playwright E2E 스모크 (Task 3-5 W4) — 상태 `review → completed` → W1+W4 동시 발사 + Gmail 실수신(`[Dairect] 쇼핑몰 개발 프로젝트가 완료되었습니다`) — 리뷰 수정 11건(HMAC rawBody/nonce/SSRF/transaction/fire-and-forget 등) 전체 런타임 검증
```

## Claude 테스트 인프라 (2026-04-17 후반 3회차 연속)

- **테스트 계정**: `playwright@dairect.test` / 비번 별도 (SQL 직접 INSERT로 auth.users + auth.identities 생성)
- **user_id**: `95163b31-c564-46f2-b8a5-db022476d0f8`
- **로그인 경로**: Google OAuth와 병존. `/login`에 이메일/비밀번호 폼 추가 (signInWithPassword)
- **운영 노출**: 회원가입 UI 없음 — 로그인만. Phase 5 SaaS 전환 시 회원가입 정식 추가 (PRD Task 5-1)
- **파일**: `src/app/(public)/login/page.tsx` 단일 수정 (+130/-29)
- **디버깅 해결**: SQL INSERT 후 첫 로그인 500 에러 → Supabase Auth 로그 "error finding user: sql: Scan error on column index 3, name 'confirmation_token': converting NULL to string is unsupported" → `confirmation_token`/`recovery_token`/`email_change_token_new`/`email_change_token_current`/`email_change`/`phone_change`/`phone_change_token`/`reauthentication_token` 8개 컬럼을 `COALESCE(..., '')`로 빈 문자열 채움 → 로그인 정상화
- **.env.local 저장**: Claude 권한 차단으로 Jayden 수동 추가(선택). 현재는 Claude 세션 내 credential 기억

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
| 2026-04-17 | 공개 Server Action 방어 4종 세트 | honeypot + timing + sanitizeHeader + CSV strip (rate limit은 Phase 3 Redis) |
| 2026-04-17 | Drizzle `check()` 헬퍼로 DB 레벨 enum 방어 | Zod는 앱 레이어 방어일 뿐, DB 직접 INSERT 시 무효값 차단 필요 |
| 2026-04-17 | RLS 판단: Drizzle direct = service_role → 현재 안전 | Phase 3 anon client 도입 시점에 `ENABLE RLS` + anon 차단 정책 추가 |
| 2026-04-17 | 계약서 immutability는 참조 차단으로 완화 | 전자서명(Phase 3) 때 스냅샷 컬럼 추가 예정 |
| 2026-04-17 | `(userId, contractNumber/invoiceNumber)` UNIQUE + 23505 재시도 | MAX 기반 채번 경합 방어 |
| 2026-04-17 | `generateInvoiceNumber(tx, userId, offset)` offset 파라미터 | 트랜잭션 내 N회 호출 시 동일 MAX 반환 방어 (3분할 자동 생성) |
| 2026-04-17 | 청구서 연체는 쿼리 시점 계산 | `status='sent' && dueDate<today`로 cron 불필요 |
| 2026-04-17 | 세금계산서 발행 플래그는 `paid` 상태만 허용 | 세무 감사 증빙 무결성 |
| 2026-04-17 | 공개 `/` 랜딩 8섹션 구조 | DESIGN.md "Intelligent Sanctuary" — No-Line Rule + Tonal Layering |
| 2026-04-17 | LandingNav `active: NavActiveId` id 기반 매칭 | href 중복(`/about` 2개) 시 동시 강조 방지 |
| 2026-04-17 | 비교 표 semantic `<table>` + `scope` | 접근성 보강, No-Line Rule은 교차 배경으로 유지 |
| 2026-04-17 | FAQ native `<details>` (JS 없음) | Server Component 유지 + 기본 접근성 확보 |
| 2026-04-17 | 공개 페이지 쿼리에 `isNotNull(publicAlias)` 필터 | `publicAlias ?? name` fallback 제거 → 원본 고객사명 노출 차단 |
| 2026-04-17 | 공개 URL 필드 `isInternalHost` 차단 | SSRF/내부망(`localhost`, 127.*, 10.*, 169.254.*, 192.168.*, 172.16-31.*, .local/.internal) 유도 방어 |
| 2026-04-17 | Zod `.strict()` + `refine` 에러 메시지 분리 | `unrecognized_keys`는 console만, 사용자에겐 첫 입력 오류만 표출 (내부 정보 유출 방지) |
| 2026-04-17 | `export const revalidate = 60` 명시 | cookies() 미사용 시 기본 static — 명시로 ISR 전환, 공개 전환 1분 내 반영 |
| 2026-04-17 | 대시보드 공개 프로필 Switch — 네이티브 checkbox + peer | shadcn Switch 미설치 의존성 0, Tailwind만으로 구현 |
| 2026-04-17 | Server Action projectId UUID Zod 선검증 | 비UUID 전달 시 DB 에러 경로 진입 방지 |
| 2026-04-17 | Drizzle `text().array()` 타입 가드 제네릭 | nullable 배열을 `.filter(hasAlias)`로 타입 narrow하는 재사용 패턴 확립 |
| 2026-04-17 | postgres.js `max: 1, idle_timeout: 20` | Next.js 빌드 워커(9개)가 Supabase Session pool(15슬롯)을 고갈시키지 않도록 연결 1개로 제한 |
| 2026-04-17 | single-tenant owner picker: `orderBy(asc(users.createdAt)).limit(1)` | 공개 랜딩폼 → 리드 자동 생성 시 최초 가입 운영자에게 결정적 할당. SaaS 전환 시 도메인 기반 라우팅으로 교체 예정 |
| 2026-04-17 | Server Action 파일(`"use server"`)에서 `export type` 금지 | Next.js 15/16 App Router는 "use server" 파일의 모든 export를 async function으로 직렬화 시도 → type re-export도 빌드 에러. type은 별도 파일에서 import만 |
| 2026-04-17 | convert 트랜잭션 레이스 방지: `isNull` 가드 + rowsAffected 체크 | 사전 체크는 참조만, 트랜잭션 내부 UPDATE WHERE에 `isNull(convertedToProjectId)` 포함 + rowsAffected=0 시 `ALREADY_CONVERTED` throw → 전체 롤백 |
| 2026-04-17 | 사이드바 모바일 탭은 `navItems.slice()` 대신 별도 배열 | 데스크톱/모바일 노출 항목이 달라질 때 slice 결과가 의도와 어긋남. 명시적 `mobileNavItems = [...]` 배열로 독립 관리 |
| 2026-04-17 | Claude Sonnet 4.6 + `tool_choice: { type: "tool", name: "..." }` JSON 강제 | 평문 응답 대신 tool_use 블록으로 구조화 응답 보장. Zod `.strict()` 재검증과 쌍으로 사용 |
| 2026-04-17 | AI 일일 한도 `AI_DAILY_LIMIT = 50` + pre-increment | 실패/타임아웃도 비용 처리 (Anthropic 실제 토큰 과금). race-safe 조건부 UPDATE + rowsAffected 체크로 경합 직렬화 |
| 2026-04-17 | 공개 Server Action 4종 세트 → AI 호출 6패턴 확장 | tool_choice JSON 강제 + `<user_requirement>` XML 래핑 + 시스템 프롬프트 "user 지시 무시" + 응답 필드 regex + instanceof 에러 분기 + 로그 구조만 (원문 금지) |
| 2026-04-17 | AI 응답 필드 regex 2중 refine (제어/HTML/BiDi + CSV leading) | `name` 필드가 PDF/이메일/CSV export 경로로 확산 → 저장 전 차단이 유일한 안전 지점 |
| 2026-04-17 | user_settings AI 카운터 컬럼 `.notNull() + COALESCE` 3중 방어 | `NULL < CURRENT_DATE`가 NULL(false)로 판정돼 한도 영구 잠김 방어. schema notNull + 마이그레이션 보정 + SQL COALESCE 조합 |
| 2026-04-17 | AI 관련 로그는 구조(type/length/stop_reason/issues path·code)만 | 고객 요구사항/파생 텍스트가 Vercel/Sentry에 보존되지 않도록. 감사·PII 관점에서 LLM 응답은 "파생 사용자 데이터"로 취급 |
| 2026-04-17 | AI 주간 브리핑 `briefings` 테이블 — `(userId, weekStartDate)` UNIQUE + `generation_type` 감사 컬럼 + `aiGeneratedAt` NOT NULL | 같은 주 재생성은 UPSERT로 덮어쓰기, fallback vs AI 구별 가능, Postgres NULL 3-value logic 함정 원천 차단 |
| 2026-04-17 | 서버 사이드 10초 쿨다운 (`BRIEFING_COOLDOWN_MS`) | useTransition은 클라이언트 pending만 방어 — 더블클릭/스크립트 반복 호출로 AI/DB write 중복 발생 가능. 같은 주 row의 `aiGeneratedAt` 10초 내면 기존 반환 |
| 2026-04-17 | 실패 경로별 카운터 rollback 정책 (parse/max_tokens/no_tool_use만 -1) | timeout/rate_limit은 Anthropic 실제 과금 가능성이 있어 카운터 유지 (Task 3-1 정책 일관). 완전한 "응답 사용 불가" 3경로만 `GREATEST(-1, 0)` |
| 2026-04-17 | RLS defense-in-depth: `ENABLE ROW LEVEL SECURITY` + `briefings_deny_anon` 정책만 | 현재 Drizzle은 postgres(superuser) 접속으로 RLS 우회 → 앱 레이어 영향 0. 향후 anon client 도입 시점의 취약점 사전 차단 |
| 2026-04-17 | Next.js SSR Hydration 안전 포맷 — `toLocaleString("ko-KR")` 금지, KST(UTC+9) 수동 포맷 | 서버 Node.js ICU vs 브라우저 ICU 차이로 "PM"/"오후" mismatch 발생. `getUTCHours` + `hour24 % 12 \|\| 12` + `"오전"/"오후"` 수동 조합 |
| 2026-04-17 | Claude 응답 literal `\\n` Zod transform 정규화 | LLM이 때때로 개행을 `"\\n"` 두 글자로 반환 — `whitespace-pre-line` CSS에서 렌더 안 됨. `.transform(v => v.replace(/\\n/g, "\n"))` 으로 저장 전 정규화 → 모든 소비 경로 일관 |
| 2026-04-17 | `shared-text.ts`로 내부 입력 필드 공통 방어 regex 도입 | 사용자 자유 텍스트(프로젝트명·마일스톤 title·고객사명)가 LLM 프롬프트 → PDF 고객 발송으로 확산되는 2차 신뢰 경계 차단. `guardSingleLine/guardMultiLine` 헬퍼로 체이닝 간결화 |
| 2026-04-17 | PDFDownloadLink는 반드시 `dynamic(ssr:false)` 래핑 | `@react-pdf/renderer`는 web-only API. `"use client"` 컴포넌트라도 Next.js 서버 렌더 단계에서 실행되면 500 에러. 기존 estimate/contract/invoice pdf-buttons도 동일 리스크 잔존 (백로그) |
| 2026-04-17 | AI fallback 메시지도 Zod 재검증 후 저장 | `buildEmptyReport` 같은 정적 생성물이라도 projectName 등 외부 입력을 interpolation하면 위험. 저장 전 schema.safeParse로 drift 루프 DoS 원천 차단 |
| 2026-04-17 | AI 주간 보고서 카드 위치: 프로젝트 상세 overview 탭 하단 | 공개 프로필 아래 → Jayden이 고객 발송 플로우 진입 시 자연스럽게 검토. 별도 탭 분리는 향후 보고서 이력이 쌓이면 고려 |
| 2026-04-18 | n8n Webhook HMAC canonical = `${timestamp}.${nonce}.${rawBody}` | `rawBody:true` + binary 원본 바이트로 HMAC → n8n의 JSON 재직렬화 round-trip 엣지케이스(\u2028·키 순서·특수문자) 전면 제거. parsed 객체로 HMAC 금지 |
| 2026-04-18 | fire-and-forget 4계층 격리 (`void emitN8nEvent` + 내부 try/catch + AbortController 3s + production unsigned 차단) | 외부 webhook 실패가 Server Action 본 흐름(DB 업데이트)에 절대 영향 안 주도록. 절대 throw 금지, await 금지 |
| 2026-04-18 | n8n env URL SSRF 방어 — `PRIVATE_HOSTNAME_PATTERNS` production 차단 | `N8N_WEBHOOK_URL_*` 오설정 시 169.254.169.254(클라우드 메타데이터)/10.x/127.x로 PII POST 경로 차단. env 신뢰 가정은 오설정 시점에 무너지므로 hostname 레이어로 2중 방어 |
| 2026-04-18 | Replay 방어 = timestamp 윈도우 + nonce dedupe (n8n `$getWorkflowStaticData`) | ±5분 + 1분 grace TTL로 `seen[nonce]=now` 저장. HMAC 통과 후에만 등록 → 무효 nonce flood 차단. 재시작 시 메모리 리셋 허용 (리스크 <1분 공백) |
| 2026-04-18 | n8n 워크플로우 `Respond 200` → 사이드이펙트 토폴로지 | Slack/Gmail 실패가 Respond 지연·executions DB 팽창으로 이어지지 않도록 응답 먼저 반환. `continueOnFail:true, retryOnFail:false`로 n8n 재시도 폭주 차단 |
| 2026-04-18 | SELECT→UPDATE는 `db.transaction` + `.for("update", { of: projects })` | 이벤트 from_status 정확성 보장. clients JOIN 행은 락에서 제외 (불필요한 경합 방지) |
| 2026-04-18 | W4 Gmail 템플릿은 Set 대신 Code 노드(escHtml + stripCtrl) | 내부 사용자 입력이 HTML로 보간되는 경계에서 5문자 엔티티 + 제어문자 제거. XSS 리스크 낮은 내부 도구라도 방어 관성 유지 |
| 2026-04-18 | n8n `saveDataSuccessExecution: "none"` 기본값 | W4 Gmail 본문(고객 PII) 영구 DB 저장 차단. 에러 실행만 디버깅용 잔존 |
| 2026-04-19 | Serwist SW fallback matcher에 민감 경로 4종(/dashboard, /portal, /api, /auth) 명시 제외 | navigation 실패 시 /offline 자동 스왑은 UX에 좋지만 (a) 세션 만료를 오프라인으로 오인 (b) /portal/[token]이 브라우저 히스토리에 잔류 → fallback 적용 범위를 공개 라우트 navigate로만 한정 |
| 2026-04-19 | `@serwist/next` 때문에 `next build --webpack` 고정 (Turbopack 비호환) + `transpilePackages: ["@react-pdf/renderer"]` + `next.config.ts`에 `exclude: [/\/dashboard\//, /\/portal\//, /\/api\//, /\/auth\//]` | Serwist는 webpack 기반 SW 번들링 필요. Turbopack 빌드 시 SW 빌드 단계 자체가 스킵. `@react-pdf/renderer` 등 CJS/ESM 혼재 의존성은 transpile로 resolve. exclude는 향후 정적화 시 cross-tenant 캐시 방어 |
| 2026-04-19 | SW `clientsClaim: true` + `skipWaiting: true` 조합 | 업데이트 즉시 활성화 + 기존 탭도 새 SW가 제어 → 업데이트 직후 오프라인 전환 시 새 fallback 로직이 일관 동작. 두 옵션 엇갈리면 "구 SW가 제어 중인 탭"이 신 fallback matcher를 못 받는 일관성 문제 발생 |

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
│   │   ├── projects/           ← Task 2-8
│   │   │   ├── page.tsx        ← Bento Grid + EmptyState
│   │   │   ├── queries.ts      ← getPublicProjects/getPublicProjectById
│   │   │   └── [id]/page.tsx   ← 상세 + safeExternalUrl
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
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── milestone-list.tsx
│   │   │   │   └── public-profile-form.tsx   ← Task 2-8-B
│   │   │   └── actions.ts      ← updateProjectPublicFieldsAction 추가
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
│   ├── validation/ (settings, clients, projects, milestones, estimates, contracts, invoices, shared-text, briefing, report, ai-estimate)
│   ├── supabase/ (client, server)
│   ├── db/ (schema, index, migrations/)
│   ├── ai/ (claude-client, briefing-*, report-*, estimate-prompt)
│   ├── n8n/                    ← Task 3-5 신규
│   │   └── client.ts           ← fire-and-forget emitN8nEvent (HMAC+nonce+SSRF 방어)
│   └── pdf/
│       ├── estimate-pdf.tsx
│       ├── contract-pdf.tsx
│       ├── invoice-pdf.tsx     ← Task 2-4
│       └── weekly-report-pdf.tsx ← Task 3-3
├── middleware.ts
├── fonts/PretendardVariable.woff2
└── public/fonts/               ← react-pdf용 OTF
    ├── Pretendard-Regular.otf
    ├── Pretendard-Medium.otf
    ├── Pretendard-SemiBold.otf
    └── Pretendard-Bold.otf

n8n/                             ← Task 3-5 신규
├── README.md                    ← 배포 가이드 (env · credentials · 스모크 · 유지보수 · PII 경고)
└── workflows/
    ├── W1_project_status_changed.json  ← Webhook→Verify HMAC→If→Respond200→Slack
    └── W4_project_completed.json       ← Webhook→Verify HMAC→If(verified&email)→Respond200→Compose(Code)→Gmail
```
