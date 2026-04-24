# Dairect PRD v3.2 — Jayden 1인 사용 모드 (1차 범위 확정)

> **상태**: 확정 (2026-04-24 末 Jayden 승인)
> **범위**: **1차** Jayden 1인 실사용 / **2차** 다른 프리랜서 서비스 제공 (미래 확장)
> **관련**: PRD.md (v3.1 상위), PRD-phase5.md (v4.0 Multi-tenant 설계 — 자산 보존), PROGRESS.md
> **보안 등급**: 🟡 부분 보안 (고객 비즈니스 데이터 + 정산 정보, 1인 사용이라 유지)

---

## 0. 배경 — 왜 v3.2로 분기했나

### 0-1. 변경 계기
2026-04-24 Jayden 결정:
- **SaaS 구독 모델 취소** (Task-S1 완료 — Billing/Stripe/플랜 차등 폐기)
- **개발 범위 축소**: 원래 Phase 5.0 Multi-tenant를 완성해 "서비스 제공 모드"까지 8~13주 더 소요 예상 → **2~3주 안에 Jayden 1인 사용 완료** 쪽으로 선회
- **2차 확장 시점**: Jayden 본인 dogfooding 완료 + 실제 니즈 파악 후

### 0-2. v3.1과의 차이
| 항목 | v3.1 | v3.2 (이번) |
|---|---|---|
| 과금 모델 | Free/Pro(15k)/Team(30k/멤버) | **무료 (SaaS 취소)** |
| 타겟 (1차) | Jayden + 지인 베타 2~3명 | **Jayden 1인** |
| 타겟 (2차) | 프리랜서 일반 (SaaS) | **프리랜서 일반 (무료, 구독 없음)** |
| 완료 기준 | 지인 베타 성공 + 법적 준비 | **Jayden dogfooding 성공** |
| Multi-tenant 코드 | 서비스 제공 용도 | **자산 보존, 2차에 UI 노출만 풀기** |

### 0-3. 자산 보존 원칙
**이미 구현된 Phase 5.0 Multi-tenant 인프라는 "2차 선제 투자"로 보존**:
- `workspaces` / `workspace_members` / `workspace_invitations` / `workspace_settings` 4개 테이블 → 유지
- 12개 도메인 테이블의 `workspace_id` 컬럼 → 유지
- RLS 정책 48개 (workspace_id 기반) → 유지
- Server Actions workspace scope 가드 → 유지
- 2차 진입 시 UI/라우트 잠금만 풀면 즉시 서비스화 가능

---

## 1. 1차 범위 (Jayden 1인 실사용)

### 1-1. 유지 기능 (Jayden 본인 사용에 필요)

#### 🟢 공개 영역
| 라우트 | 역할 | 상태 |
|---|---|---|
| `/` | 랜딩 (포트폴리오 + SI 수주 창구) | 유지, CTA만 수정 |
| `/about` | 소개 페이지 | 유지 |
| `/projects`, `/projects/[id]` | 포트폴리오 프로젝트 목록 | 유지 |
| `/demo/*` (12개) | 라이브 체험 (로그인 전 대시보드 체험) | 유지 |
| `/portal/[token]`, `/portal/invalid` | 고객 포털 (Jayden → 자기 고객) | 유지 |
| `/privacy`, `/terms` | 법적 페이지 | 유지 |
| `/login` | 로그인 | 유지 |
| `/offline` | PWA 오프라인 fallback | 유지 |

#### 🟢 대시보드 영역 (로그인 후, Jayden 본인 + 하청)
| 라우트 | 역할 | 상태 |
|---|---|---|
| `/dashboard` | 홈 KPI | 유지 |
| `/dashboard/projects/*` | 프로젝트 관리 | 유지 |
| `/dashboard/clients/*` | 고객 CRM | 유지 |
| `/dashboard/leads/*` | 리드 파이프라인 | 유지 |
| `/dashboard/estimates/*` | 견적서 발행 + AI 견적 | 유지 |
| `/dashboard/contracts/*` | 계약서 발행 | 유지 |
| `/dashboard/invoices/*` | 청구서 발행 + 정산 | 유지 |
| `/dashboard/members` | **하청 프리랜서 초대** (Jayden 결정 = 유지) | **본인만 접근 허용** |
| `/dashboard/settings` | 사업자 정보 / 기능 프리셋 | 유지 |

#### 🟢 백엔드 / 자동화
- `/api/cron/invoice-overdue` (n8n W2 연동)
- `/api/cron/weekly-summary` (n8n W3 연동)
- n8n 워크플로 5종 (W1~W5)
- AI 기능: 브리핑 / 리포트 / 견적 (Claude API)
- Supabase (DB / Auth / Storage)
- 22개 DB 테이블 전체 (multi-tenant 구조 포함)

#### 🟢 남용 방어 정책 (Jayden 본인 비용 보호)
- **AI 일일 호출 한도**: `AI_DAILY_LIMIT = 200` 단일 상수 (전원 동일, Claude API 비용 방어)
- ~~멤버 한도~~ → 1차에 불필요 (2차 풀기 시 재활성화). 상수는 코드 유지하되 검사 로직 비활성.
- **Rate limit**: contact form / 초대 발송 등 기존 구현 유지 (봇/남용 방어)

### 1-2. 1차에서 **잠그거나 수정할 것** (2차에 풀기)

| 대상 | 처리 | 상태 | 2차 복구 방법 |
|---|---|---|---|
| `/signup` | 접근 차단 (라우트 비활성 or 404) | 잠금 | 라우트 복원 |
| `/onboarding` | 접근 차단 (Jayden 이미 ws 있음) | 잠금 | 라우트 복원 |
| `/invite/[token]` | 접근 차단 (외부 초대 수락 플로우) | 잠금 | 라우트 복원 |
| `WorkspacePicker` UI (header.tsx) | 컴포넌트 렌더 제거 (ws 1개라 무의미) | UI 숨김 | import/JSX 복원 |
| **랜딩 CTA "디렉팅 시작하기"** | "문의하기" (이미 있는 `/about` 컨택 폼으로) | 수정 | CTA 복원 |
| **`PricingSummarySection` 랜딩 컴포넌트** | 제거 or "문의" 섹션으로 교체 | 수정 | 복원 |
| `/pricing` 페이지 | **삭제** (SaaS 취소로 무의미) | 삭제 | 2차 시 새로 작성 (신규 가격 정책 반영) |

### 1-3. 1차에서 **완전 취소된 것** (2차에도 재도입 안 함 — SaaS 구독 취소 맥락)

- ~~Free/Pro/Team 플랜 차등~~
- ~~Stripe / 토스페이먼츠 / 포트원 연동~~
- ~~구독료 자동 결제~~
- ~~워크스페이스별 사용량 제한 (`workspace_usage` 테이블)~~
- ~~Upgrade CTA / 플랜 변경 UI~~

2차 진입 시 서비스는 **무료 공개** 또는 **다른 수익 모델** (SI 수주 중개 수수료 등) 재설계.

---

## 2. 1차 완료 기준 (Definition of Done)

### 2-1. 기능 DoD
- [x] Phase 0~4 기능 전부 동작 (이미 완료)
- [x] Phase 5.0 Multi-tenant 구조 정상 동작 (이미 완료)
- [ ] **Task-S2a** plan 차등 제거 + AI 한도 단일화 완료
- [ ] **Task-S2b** `/signup` + `/onboarding` + Workspace picker UI 잠금 완료
- [ ] **Task-S2c** `/invite/[token]` 라우트 잠금 완료
- [ ] **Task-S2d** `/pricing` 삭제 + `PricingSummarySection` 제거 + 랜딩 CTA "문의하기"로 교체
- [ ] **Task-S2e** `/dashboard/members` 본인 접근 가드 강화
- [ ] **Task-S2f** PRD/PROGRESS 1차 완료 기준 갱신 + 기술 부채 1차 필수만 확정
- [ ] **Task-S2g** Jayden dogfooding 체크리스트 작성

### 2-2. 품질 DoD
- [ ] `pnpm tsc --noEmit && pnpm lint && pnpm build && pnpm db:check` 전부 통과
- [ ] 2차로 이관된 라우트에 직접 URL 접근 시 404 or 로그인 후 "준비 중" 안내
- [ ] WorkspacePicker 숨긴 후에도 대시보드 정상 렌더
- [ ] AI 기능 3종(브리핑/리포트/견적) 일일 한도 200회에서 정상 차단
- [ ] 고객 포털 토큰 생성/수락 플로우 정상

### 2-3. 실사용 DoD (Jayden dogfooding)
- [ ] 1~2주 Jayden 본인 실업무에서 Dairect 사용
- [ ] 실제 견적서 1건 이상 발행 + 고객에게 전달
- [ ] 실제 계약서 1건 이상 발행
- [ ] 실제 청구서 1건 이상 발행 + 수금 확인
- [ ] AI 브리핑 / 리포트 / 견적 각 1회 이상 사용
- [ ] 고객 포털 링크 1건 이상 고객에게 공유
- [ ] n8n cron 5종(W1~W5) 실제 트리거 확인
- [ ] dogfooding 중 발견된 버그/UX 이슈 정리 → 우선순위별 수정

---

## 3. 만들지 않을 것 (Not Doing — 1차)

v3.1 섹션 19 + PRD-phase5.md 섹션 3에서 계승, 1차 관점으로 재정의:

### 3-1. 1차 범위에서 제외 (2차에도 할 수 있음)
- **다른 프리랜서 서비스 제공** — 2차 핵심
- **회원가입 공개** — 2차에서 풀기
- **외부 초대 시스템** (`/invite/[token]`) — 2차
- **Onboarding 플로우** (`/onboarding`) — 2차
- **Workspace picker** — 2차 (복수 ws 가능해질 때)
- **Admin 대시보드** (`/admin/*` 미구현) — 2차
- **지인 베타 2~3명 피드백 수집** — 2차
- **법적 검토 (이용약관/개인정보처리방침)** — 2차 (현재 `/privacy` `/terms` 페이지는 존재하나 사용자 없으므로 실질 무의미)
- **E2E cross-workspace 누출 테스트** — 2차 (ws 1개라 N/A)
- **Sentry 연동 / PostHog** — 2차 (필요 시)

### 3-2. 영구 취소 (SaaS 맥락)
- ~~Stripe / 한국 PG 연동~~
- ~~구독 결제 / 플랜 차등~~
- ~~Billing Webhook / idempotency~~
- ~~PCI DSS 준수~~
- ~~Customer Portal (Stripe 호스팅)~~
- ~~PDF 워터마크 (Free 차별화 수단)~~

### 3-3. v3.1에서 이월 (여전히 안 함)
- 다국어 / 모바일 네이티브 앱 / 실시간 협업 편집 / 공개 API / 커스텀 도메인 / SSO / Marketplace / AI 자동 견적(자동 발송) / 소셜 로그인 확대 / CRDT 동시성 / 모바일 전용 UX

---

## 4. 실행 Task 분해 (Task-S2a ~ S2g)

### Task-S2a: plan 차등 제거 + AI 한도 단일화 (1.5h)
**변경 파일**:
- `src/lib/validation/ai-estimate.ts` — `workspacePlans/PLAN_AI_DAILY_LIMITS/getAiDailyLimit` 제거 → `AI_DAILY_LIMIT = 200` 상수
- `src/lib/plans.ts` — `PLAN_MAX_MEMBERS/getMaxMembers/getPlanLabel/suggestUpgradeTarget/planLabels/workspacePlans/WorkspacePlan` 제거 → `MAX_MEMBERS = 10` 상수 (2차 UI 복구 시 재사용)
- `src/lib/ai/briefing-actions.ts` / `report-actions.ts` — `getAiDailyLimit` 호출 → `AI_DAILY_LIMIT` 직접 사용. `workspace_settings.plan` SELECT 제거
- `src/app/dashboard/members/actions.ts` / `src/app/invite/[token]/accept-actions.ts` — plan SELECT + `getMaxMembers` 제거 → `MAX_MEMBERS` 직접 사용. `MemberLimitExceededError`의 `plan` 필드 제거, 에러 메시지 단순화
- `src/app/dashboard/members/page.tsx` + `members-client.tsx` — plan/`planLabel`/`upgradeTarget` props 제거
- `src/lib/db/schema.ts` — `workspaces.stripeCustomerId` / `workspaces.subscriptionStatus` / `workspace_settings.plan` 3개 컬럼에 `@deprecated 2026-04-24 — 읽지 않음` JSDoc 주석 추가 (DROP X)

**검증**: tsc/lint/build/db:check 통과, plan 관련 import 0건

### Task-S2b: signup/onboarding/WorkspacePicker UI 잠금 (1h)
**변경 파일**:
- `src/app/(public)/signup/page.tsx` — `notFound()` 반환 or "준비 중" 안내 페이지 (Jayden은 Supabase direct create로 우회)
- `src/app/onboarding/page.tsx` — 동일
- `src/components/dashboard/header.tsx` — `WorkspacePicker` JSX 조건부 숨김 (env flag `NEXT_PUBLIC_MULTI_WORKSPACE_ENABLED` 추가 검토)
- `src/middleware.ts` (없으면 신규) — /signup, /onboarding, /invite/* 요청 차단 (홈 리다이렉트)

**검증**: /signup, /onboarding 직접 접근 시 404/리다이렉트 확인. 대시보드 헤더 정상 렌더 (picker 없음)

### Task-S2c: `/invite/[token]` 라우트 잠금 (0.5h)
**변경 파일**:
- `src/app/invite/[token]/page.tsx` — `notFound()` 반환 (Server Action `accept-actions.ts`는 코드 유지 — 2차 복구용)

**검증**: /invite/임의-토큰 접근 시 404

### Task-S2d: `/pricing` 삭제 + 랜딩 CTA 수정 (1h)
**변경 파일**:
- `src/app/(public)/pricing/page.tsx` — **파일 삭제**
- `src/components/landing/pricing-summary-section.tsx` — **파일 삭제** (또는 보존하되 import 제거)
- `src/app/page.tsx` — `PricingSummarySection` import + JSX 제거
- `src/components/landing/nav.tsx` — "가격" 링크 제거
- `src/components/landing/footer.tsx` — "가격" 링크 제거
- `src/components/landing/cta-section.tsx` or `hero` — "디렉팅 시작하기" → "문의하기" (기존 `/about` 또는 `/#contact` 앵커)

**검증**: 랜딩에서 pricing 언급 0건. 빌드 통과.

### Task-S2e: `/dashboard/members` 본인 접근 가드 강화 (0.5h)
**변경 파일**:
- `src/app/dashboard/members/page.tsx` — Owner role 체크 (`canManageMembers` 이미 존재) 재확인. Jayden만 Owner이므로 실질 동작 유지. 2차 이관 주석 추가

**검증**: Jayden이 Owner 권한으로 정상 접근. 다른 role이면 차단 (Jayden만 있는 1차에선 경로 자체가 Jayden 전용)

### Task-S2f: PRD/PROGRESS 1차 완료 기준 갱신 + 기술 부채 정리 (1h)
**변경 파일**:
- `docs/PRD.md` — v3.2 링크 추가 (상단)
- `docs/PRD-phase5.md` — v3.2 이관 공지 (상단)
- `PROGRESS.md` — 세션 기록 + 1차 완료 기준 + 남은 Task 목록 확정
- `CLAUDE.md` — 필요 시 프로젝트 컨텍스트 갱신

**기술 부채 중 1차 필수**:
- Task A MED-1 try-catch UX 개선 (에러 UX)
- 그 외 2차로 이관 (다른 사용자 방어용 대부분)

### Task-S2g: Jayden dogfooding 체크리스트 작성 (1h)
**신규 파일**:
- `docs/dogfooding-checklist.md` — 1~2주 Jayden 실사용 가이드
  - 일일 체크: AI 브리핑 / 대시보드 KPI 확인
  - 주간 체크: 리포트 생성 / 청구서 발행
  - 프로젝트 생명주기: 리드 → 견적 → 계약 → 마일스톤 → 청구 → 수금
  - 고객 포털 공유 시나리오
  - 발견된 이슈 기록 양식 (우선순위 High/Med/Low)

**총 소요**: 약 **6.5~7시간** (여러 세션 분할)

---

## 5. 우선순위 + 의존성

```
Task-S2a (plan 단일화)  ─┐
                         ├─► Task-S2b (UI 잠금) ─┐
Task-S2f (PRD/문서) ─────┘                       ├─► Task-S2d (pricing 삭제) ─► Task-S2g (dogfooding 가이드)
                                                 │
Task-S2c (invite 잠금) ──────────────────────────┘
Task-S2e (members 가드) ──────────────────────────
```

**권장 순서**: S2a → S2b → S2c → S2d → S2e → S2f → S2g (단순 선형)

**세션 분할**:
- **세션 1**: S2a + S2b (2.5h) — 핵심 코드 정리
- **세션 2**: S2c + S2d + S2e (2.5h) — UI 잠금/삭제
- **세션 3**: S2f + S2g (2h) — 문서 마감 + dogfooding 시작

---

## 6. 리스크 + 완화

### R1. Jayden dogfooding 중 critical 버그 발견
- **완화**: 각 Task 완료 후 Jayden이 관련 플로우 즉시 확인. 버그 발견 시 해당 Task 내에서 수정 (스코프 크리프 방지 위해 별개 Task 분리 판단).

### R2. 2차 복구 시 잠금 해제 누락
- **완화**: Task-S2f에서 `docs/2차-unlock-checklist.md` 동시 작성 — 잠근 항목을 **역순으로 풀기** 위한 체크리스트. 2차 진입 시 이 문서로 전수 복구.

### R3. `/pricing` 삭제 시 외부 북마크/링크 404
- **완화**: 랜딩 배포 후 검색엔진 재크롤링까지 404 가능. **악영향 미미** (아직 사용자 없음). 필요 시 리다이렉트 `/pricing → /about` 옵션.

### R4. multi-tenant 코드가 1인 사용에서 작동 이상
- **완화**: 이미 Jayden 1개 ws로 작동 중이므로 회귀 거의 없음. S2a 후 검증 게이트에서 발견.

---

## 7. 2차 진입 조건 (나중에)

언제 2차 시작할지 기준 (Jayden 판단):

1. **Jayden dogfooding 완료** — 1차 DoD 2-3 전부 ✅
2. **실사용 피드백 축적** — 적어도 1~2주 실업무 운영
3. **개선 아이디어 수집** — 2차 기능 우선순위 Jayden 머릿속에 명확히
4. **시간/체력 여유** — 지인 베타 + 법적 준비까지 갈 예산

2차 진입 시 **v3.3 PRD**로 재작성 (현재 잠근 기능 + 추가될 신규 기능).

---

## 8. 관련 문서

- [PRD.md](./PRD.md) — v3.1 원본 (대부분 유효)
- [PRD-phase5.md](./PRD-phase5.md) — v4.0 Multi-tenant 설계 (구현됨, 자산 보존)
- [archived/billing-mock-design.md](./archived/billing-mock-design.md) — Billing 설계 (폐기, 참고용)
- [pii-lifecycle.md](./pii-lifecycle.md) — PII 정책 (유효)
- [db-migrations-workflow.md](./db-migrations-workflow.md) — 마이그레이션 워크플로 (유효)
- PROGRESS.md — 세션 기록

---

## 9. 버전 이력

- **2026-04-24 末 v3.2 초안**: 옵션 B 확정 반영, 1차 범위 정의, Task-S2a~g 분해
- (예정) v3.2.x: Task 진행 중 보완/수정
- (미래) v3.3: 2차 확장 (서비스 제공) 진입 시 재작성
