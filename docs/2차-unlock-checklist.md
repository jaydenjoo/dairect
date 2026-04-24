# 2차 Unlock 체크리스트 — v3.2 → v3.3 전환 가이드

> **용도**: Jayden 1인 dogfooding 완료 후 다른 프리랜서에게 서비스 제공(2차)을 시작할 때
> Task-S2 범위에서 잠근 기능을 역순으로 복구하는 체크리스트.
>
> **전제**: v3.2에서 multi-tenant DB/RLS/Server Actions는 자산 보존됨. UI/라우트 차단만 해제하면 즉시 서비스 가능.
>
> **작성**: 2026-04-24 末 (Task-S2f)
> **관련**: [PRD-v3.2-single-user.md](./PRD-v3.2-single-user.md) §4, §7

---

## 🚦 2차 진입 전 확인 사항

### 전제 조건 (Jayden 판단)
- [ ] **Jayden dogfooding 완료** — 1차 DoD 실사용 체크리스트 전부 달성 (견적/계약/청구/AI/포털 각 1건+)
- [ ] **실사용 피드백 축적** — 최소 1~2주 실업무 운영
- [ ] **개선 아이디어 수집** — 2차 기능 우선순위 Jayden 머릿속에 명확히
- [ ] **시간/체력 여유** — 지인 베타 + 법적 준비까지 갈 예산

### 2차 착수 시 추가 결정 필요 (신규 PRD v3.3에서 정의)
- [ ] **수익 모델**: 무료 공개 vs SI 수주 중개 수수료 vs 기타 (SaaS 구독은 v3.2에서 이미 취소)
- [ ] **멤버/AI 한도**: 현재 10명/200회 유지 vs 상향 vs 플랜 재도입
- [ ] **법적 검토**: 이용약관 / 개인정보처리방침 / 환불 정책
- [ ] **지인 베타 대상자**: 2~3명 사전 컨택

---

## 🔓 Unlock 항목 (실행 순서)

### 1. 코드 복구 — 라우트 잠금 해제

#### 1-1. `/signup` 페이지 복구
- [ ] `git show 3def1de~1 -- src/app/\(public\)/signup/page.tsx > /tmp/signup-page.tsx` 로 이전 버전 확보
- [ ] 내용 확인 후 `src/app/(public)/signup/page.tsx`에 복구
- [ ] `signup-form.tsx` 자산 보존 상태 확인 (변경 없음 — 그대로 작동)
- [ ] **검증**: `pnpm dev` → `/signup` 접근 시 회원가입 폼 정상 렌더

#### 1-2. `/onboarding` 페이지 복구
- [ ] `git show 3def1de~1 -- src/app/onboarding/page.tsx > /tmp/onboarding-page.tsx` 로 이전 버전 확보
- [ ] 내용 확인 후 `src/app/onboarding/page.tsx`에 복구
- [ ] `onboarding-form.tsx` + `ensureDefaultWorkspace` + `users` upsert 로직 자산 보존 상태 확인
- [ ] **검증**: 신규 회원가입 → `/onboarding` 자동 진입 → workspace 이름 설정 → `/dashboard` 정상 이동

#### 1-3. `/login` 페이지 회원가입 링크 복구
- [ ] `src/app/(public)/login/page.tsx`에서 "Task-S2b" 주석 블록 3줄 제거
- [ ] 내부 `<Link href={/signup...}>` 블록 주석 해제
- [ ] **검증**: `/login` 페이지에 "계정이 없으신가요? 회원가입" CTA 정상 노출

---

### 2. 한도 정책 재검토 (선택)

2차에서 멤버/AI 한도를 유지할지 변경할지 결정:

#### 2-1. 현재 정책 유지 (단순)
- `src/lib/plans.ts` `MAX_MEMBERS = 10` 그대로
- `src/lib/validation/ai-estimate.ts` `AI_DAILY_LIMIT = 200` 그대로
- **사유**: 수천 사용자까지 남용 방어 충분

#### 2-2. 플랜 차등 재도입 (복잡)
- 커밋 `ee6d076~1` 이전 버전에서 `PLAN_MAX_MEMBERS` / `PLAN_AI_DAILY_LIMITS` 복원
- 단일 소스 구조(plans.ts + ai-estimate.ts)에 plan enum 재추가
- 소비처 파일들(members/actions, accept-actions, briefing-actions, report-actions, estimates/actions, estimates/ai-actions, members/page, members-client)에 plan SELECT 로직 복원
- `workspace_settings.plan` 컬럼 읽기 재개 (schema.ts `@deprecated` 주석 제거)
- **주의**: SaaS 구독 취소 결정 유지 시 plan 차등은 여전히 "무료" 전제. 플랜은 한도만 다름(유료 전환 목적 X)

#### 2-3. 한도 완전 제거 (무제한)
- `MAX_MEMBERS` / `AI_DAILY_LIMIT` 참조를 enforcement 코드에서 제거
- **주의**: AI API 비용 폭발 / 멤버 스팸 리스크 감수 필요

---

### 3. DB 컬럼 상태 결정 (선택)

`workspaces.subscriptionStatus`, `workspaces.stripeCustomerId`, `workspace_settings.plan` 3개 컬럼:

#### 3-1. 계속 유지 (현재 상태)
- `schema.ts` `@deprecated` 주석 그대로 둠
- 읽기 코드 재활성화 필요 시 소비처에서 SELECT 재추가

#### 3-2. DROP (정리)
- 마이그레이션 새로 작성:
  ```sql
  ALTER TABLE workspaces DROP COLUMN subscription_status;
  ALTER TABLE workspaces DROP COLUMN stripe_customer_id;
  ALTER TABLE workspace_settings DROP COLUMN plan;
  ALTER TABLE workspaces DROP CONSTRAINT workspaces_subscription_status_check;
  ```
- **비가역** — 되돌리려면 데이터 backfill 필요
- 2차에서 SaaS 재도입 가능성을 완전 배제할 때만 권장

---

### 4. Billing Mock 설계 재참조 (선택)

2차에서 수익 모델로 SaaS 구독을 **재도입하기로 결정**한 경우:

- [ ] `docs/archived/billing-mock-design.md` 읽기 (10 섹션, 역사 기록)
- [ ] `PaymentProvider` 인터페이스 / Mock checkout 플로우 / provider-중립 DB 스키마 설계 참고 가치 평가
- [ ] 한국 PG 계약 진행 여부 결정 (토스페이먼츠/포트원 v2)
- [ ] v3.3 PRD에 Epic 5-3 재도입 반영

### 5. 랜딩 메시지 업데이트 (선택)

2차 = 서비스 공개 시점이므로 랜딩 CTA 재검토:

- [ ] Hero "내 아이디어 상담하기" → "지금 시작하기" 등으로 변경 검토 (signup 유도)
- [ ] Nav 에 "가입" CTA 추가 검토
- [ ] `/pricing` 페이지 — SaaS 플랜 재도입 시 업데이트, 아니면 SI 견적 그대로 유지

---

### 6. 기술 부채 + 운영 준비 (2차 진입 전 필수)

v3.2 §3-1 "1차 범위에서 제외"로 미뤄둔 항목 중 2차 필수:

- [ ] **E2E cross-workspace 누출 테스트** (Playwright) — 2차 핵심 보안 검증
- [ ] **Admin 대시보드** 구현 (`/admin/workspaces`, `/admin/stats`) — Task 5-5-2~5 다시 진행
- [ ] **Sentry 연동** — 에러 트래킹
- [ ] **Resend 실사용 전환** — 초대 메일 검증 + 운영 발신자 설정
- [ ] **법적 검토**: 이용약관 / 개인정보처리방침 / 환불 정책 (결제 재도입 시)
- [ ] **PII_PSEUDONYM_SALT** production 값 설정 (64자+ 랜덤 hex)
- [ ] **Task A 후속**: drizzle-kit 버전 업그레이드 / `0036 duplicate_object` 경고 보강
- [ ] **Task B 후속**: `pseudonymizeEmail` vitest 단위 테스트 / `entityId` 부분 인덱스 / PII §2-4 보존 기간 확정 / §2-5 탈퇴 플로우 연동
- [ ] **rate limit 확장**: login / signup / password reset 등 (현재 contact form + invite만 구현)

---

## 📋 최종 검증 (2차 진입 직전)

- [ ] 잠긴 라우트 전부 복구 확인: `/signup`, `/onboarding` 200 응답
- [ ] 회원가입 플로우 E2E 통과: 신규 이메일 → /signup → /onboarding → /dashboard
- [ ] 초대 플로우 E2E 통과: 발송 → 메일 수신 → /invite/[token] → /dashboard
- [ ] Workspace picker 복수 ws 환경에서 dropdown 정상 동작 확인 (2~3개 테스트 ws 생성)
- [ ] cross-workspace 누출 공격 시뮬레이션 Playwright 통과
- [ ] `pnpm tsc --noEmit && pnpm lint && pnpm build && pnpm db:check` 통과
- [ ] production 배포 후 sanity check (도메인 / OAuth redirect / Resend)

---

## 🔗 커밋 참조

Task-S2 시리즈 커밋 (복구 참조용):
- `c131b35` — v3.2 수정 PRD 초안
- `ee6d076` — Task-S2a (plan 차등 제거)
- `3def1de` — Task-S2b (/signup + /onboarding 잠금)
- `8a504cc` — Task-S2d 축소 (/about#contact 링크 정정)

2차 진입 시 각 커밋의 `~1` (직전 버전)에서 복구 대상 파일 추출 가능.

---

## 📝 이 문서의 수명

2차(v3.3) 진입 완료 시점에 이 문서는:
- 아카이브 이동: `docs/archived/2차-unlock-checklist.md`
- 또는 완전 삭제 (git history에 보존됨)

유지 시점: v3.2 → v3.3 전환 기간 동안만.
