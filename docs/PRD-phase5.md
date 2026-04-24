# Dairect PRD v4.0 — Phase 5 Multi-tenant 전환

> ⚠️ **2026-04-24 末 업데이트**: 현재 유효한 상위 PRD는 **[PRD-v3.2-single-user.md](./PRD-v3.2-single-user.md)**.
> 이 문서(v4.0)의 Multi-tenant 설계는 **구현 완료 자산으로 보존** (2차 진입 시 UI만 풀면 재활성화).
> 1차 범위(Jayden 1인 사용)에서는 workspaces/members/invitations 등 multi-tenant 기능 UI를 **잠금** 처리.
> 본 문서는 2차 서비스 제공 모드를 위한 설계 레퍼런스로 활용.

---

> **상태**: 초안 (2026-04-20 킥오프) · **2026-04-24 업데이트**: Phase 5.5 Billing 전면 취소 + v3.2로 상위 이관
> **범위**: Phase 5.0 (Multi-tenant 기반) · ~~Phase 5.5 (Billing)~~ **취소**
> **관련**: [PRD-v3.2-single-user.md](./PRD-v3.2-single-user.md) (1차 상위), PRD v3.1 (Phase 0~4), PROGRESS.md
> **보안 등급**: 🟡 (Phase 5.0) · ~~🔴 (Phase 5.5)~~ **취소**

---

## ⛔ 2026-04-24 업데이트: Phase 5.5 Billing / SaaS 구독 취소

**Jayden 결정**: Dairect에 SaaS 구독 모델을 도입하지 않는다.
- Free/Pro/Team 플랜 차등 폐기
- Stripe / 한국 PG(토스페이먼츠/포트원) 연동 계획 전면 취소
- `workspace_settings.plan` / `workspaces.subscription_status` / `workspaces.stripe_customer_id` DB 컬럼은 **유지하되 읽지 않음** (나중에 재검토 여지 남김)
- 멤버 수 / AI 일일 호출 한도는 **단일 고정 정책**(전원 동일 규칙)으로 전환 — 남용 방어용 하드리밋만 유지
- 관련 설계 문서: `docs/archived/billing-mock-design.md` (역사 기록)
- 본 문서에서 Phase 5.5 / Epic 5-3 / Billing / Stripe 관련 섹션은 **⛔ 폐기됨** 인라인 표시로 보존 (참고용)

**본 PRD에서 Phase 5.0(Multi-tenant)만 유효**. 아래 "⛔ 폐기됨" 표시된 섹션은 현재 로드맵에서 실행하지 않음.

---

---

## 1. 개요

### 1-1. 현재 상태 (Phase 4 완료 시점)

Dairect v3.1은 Jayden 1인 프리랜서 PM을 위한 대시보드. Phase 0~4 + Phase 3 cron 완료:

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 0 | Next.js 16 + Supabase + DESIGN.md + Google OAuth | ✅ |
| Phase 1 | 대시보드 핵심 (프로젝트/고객/마일스톤/KPI) | ✅ |
| Phase 2 | 견적/계약/청구 + 리브랜딩 (공개 영역) | ✅ |
| Phase 3 | AI 브리핑 + 리드 CRM + n8n W1/W2/W3/W4/W5 cron | ✅ |
| Phase 4 | 고객 포털 + /demo + PWA + 주간 요약 | ✅ |

**현재 가정**: Single-user. 모든 도메인 테이블이 `userId` 기반 격리 + Supabase RLS.

### 1-2. Phase 5 전환 이유

1. **사용자 확대 준비**: 지인 PM 2~3명의 실사용 피드백 수집 필요 — 현재 Jayden 1인 dogfooding 한계
2. **데이터 격리 현실화**: 다른 PM의 고객/정산이 섞이지 않아야 함
3. ~~**장기 SaaS 비전**: 월 구독 기반 수익 모델로 프리랜서 PM 시장 검증~~ — **⛔ 취소 2026-04-24** (SaaS 구독 도입 안 함)
4. **Phase 3 cron 인프라 선제 대비 완료**: W2/W3에서 이미 BigInt-safe 금액 / deadline gate / workspace 분리 고려한 설계 완료 — 재작업 최소

### 1-3. ~~2단계~~ 단일 전환 전략 (Phase 5.5 Billing 취소됨)

```
Phase 5.0 (Multi-tenant 기반)         ⛔ Phase 5.5 (Billing) — 취소 2026-04-24
━━━━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━━
  Workspace 모델                        ~~Stripe Customer + Subscription~~
  멤버 초대 + 역할                       ~~구독 플랜 (Free/Pro/Team)~~
  RLS 전면 재작성                        ~~사용량 추적 + 플랜 한도~~
  지인 베타 2~3명 (무료 전 기능)         ~~토스페이먼츠 (Phase 5.6+)~~
  보안 등급 🟡                           ~~보안 등급 🔴~~
```

**Phase 5.0 완료 → 지인 베타 런칭(무료 전 기능) → 피드백 수집 → ~~Phase 5.5 Billing 착수~~ 지속 무료 운영.**

~~결제는 지인 테스트 마무리 후 현실적 가격 정책을 실측 데이터로 확정한 뒤 도입.~~

> **보안 등급**: 🟡 유지 (결제 미도입 확정 → 🔴 전환 불필요).
> 남용 방어용 고정 한도(멤버/AI)는 `src/lib/plans.ts` 단일 소스에서 관리.

---

## 2. 목적 (Goals)

### Phase 5.0
1. 여러 PM이 각자 Workspace에서 **완전 데이터 격리**된 상태로 사용
2. 기존 Single-user 데이터 → default Workspace로 **자동 backfill** (마이그레이션 1회)
3. RLS 전면 재작성으로 cross-tenant 누출 **DB 레벨 차단**
4. 지인 베타 2~3명이 독립적으로 운영 가능

### ~~Phase 5.5~~ ⛔ 폐기됨 (2026-04-24)
~~1. Stripe 구독 결제 도입 (Customer / Subscription / Webhook)~~
~~2. Free / Pro / Team 플랜 + 플랜별 한도 enforcement~~
~~3. 결제 실패 / 환불 / 플랜 변경 플로우~~
~~4. 한국 시장 대응: 토스페이먼츠 Phase 5.6+~~

SaaS 구독 도입 취소. 멤버/AI 한도는 단일 고정 정책으로 전환 (전원 동일 규칙).

---

## 3. 만들지 않을 것 (Not Doing — 필수 섹션)

Phase 5.0 + 5.5 범위에서 **하지 않는다**:

- **다국어 지원** — 한국 시장 우선. i18n 인프라는 Phase 6+
- **모바일 네이티브 앱** — PWA로 충분. React Native/Expo 도입 X
- **실시간 협업 편집** — 동시 편집 X. optimistic UI + refresh만
- **공개 API / 외부 Webhook** — 고객이 만드는 integration은 Phase 6+
- **커스텀 도메인 (Whitelabel)** — 엔터프라이즈 기능. 초기 고객층에 불필요
- **SSO / SAML / SCIM** — 엔터프라이즈 전용. Team 플랜까지 Email+OTP만
- **Audit Log UI** — DB에는 기록, 운영자 조회는 Supabase Studio로 충분
- **실시간 알림(WebSocket)** — 주기적 polling + n8n 이메일/슬랙으로 대체
- **다중 통화** — KRW 고정. 해외 사용자 대상 기능은 범위 밖
- **Marketplace / Plugin** — Dairect 자체 기능만. 확장 플랫폼 X
- **AI 자동 견적** — Phase 3에서 이미 보류. Phase 5 재개 안 함
- **소셜 로그인 확대** — Google 단일 유지 (Apple/Kakao X)
- **실시간 동시성 고급 (CRDT/Yjs)** — 불필요. Postgres row-lock으로 충분
- **모바일 전용 UX** — 기본 반응형만 지원. 모바일 특화 기능 X

---

## 4. 핵심 기능 (5개 Epic)

### Epic 5-1: Data Model 멀티테넌시 (Phase 5.0)

**새 테이블 (4개)**:
- `workspaces` — 조직/워크스페이스 단위. 현재 UI로는 "프리랜서 회사 단위"
- `workspace_members` — user × workspace × role (owner / admin / member)
- `workspace_invitations` — 초대 토큰 + 이메일 + 만료(7일) + 수락 시점
- `workspace_settings` — workspace 1:1 사업자 정보 + 견적서 기본값 + 결제분할 + 기능 프리셋 (섹션 10 A1 결정, 2026-04-20)

**기존 테이블에 `workspace_id` 추가 (12개)**:

user scope 테이블 중 workspace 단위로 이전:
```
projects / milestones / clients / client_notes / leads /
estimates / estimate_items / contracts / invoices / activity_logs /
briefings / portal_tokens
```

제외 (설계 판단):
- `users` — 글로벌 인증 단위
- `user_settings` — UI 설정만 user scope 유지 (dark mode, 언어 등). 사업자 정보는 `workspace_settings`로 이전
- `inquiries` — 랜딩폼 공개 입력 (workspace 소속 없음)
- `weekly_reports` — Phase 3 백로그, 사용 안 하면 삭제 고려
- `portal_feedbacks` — projectId 통해 간접 격리 (project.workspace_id 상속)

**RLS 정책 재작성**:
- 기존: `user_id = auth.uid()`
- 신규: `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())`
- role 기반 write 제한:
  - **Owner**: 결제 관리, workspace 삭제, 모든 데이터 write
  - **Admin**: 멤버 관리, 모든 데이터 write
  - **Member**: 자기 프로젝트/고객만 write, 다른 멤버 데이터 read only

### Epic 5-2: Workspace + Onboarding (Phase 5.0)

**플로우**:
1. 회원가입 직후 **기본 workspace 자동 생성** (기존 Jayden 스타일 single-PM 유지 가능)
2. `/onboarding` 페이지: workspace 이름 / 로고 / 사업자 정보 입력
3. Workspace 전환 UI — 헤더에 workspace picker dropdown (복수 workspace 소속 시)
4. 멤버 초대: 이메일 → 토큰 발송 → `/invite/[token]` 수락 → 가입 or 기존 user 추가

**역할 권한 (3단계)**:

| 역할 | 결제 | 멤버 관리 | 데이터 write | 데이터 read |
|------|------|----------|--------------|-------------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Admin | ❌ | ✅ (member 초대/삭제) | ✅ | ✅ |
| Member | ❌ | ❌ | 자기 것만 | 전체 |

**초대 토큰 규격 (W5 portal_tokens 경험 재사용)**:
- UUID v4 + HMAC sha256
- TTL 7일 (14일 연장 옵션)
- 수락 시 `workspace_invitations.accepted_at` 기록
- URL scrub (W5 M4 패턴 재사용)

### ⛔ Epic 5-3: Billing + Subscription (Phase 5.5) — 폐기됨 (2026-04-24)

> 이 Epic 전체를 실행하지 않는다. 아래 설계는 역사 기록으로만 보존.
> 현재 유효 정책: `src/lib/plans.ts` 단일 고정 한도 (전원 동일 규칙).

<details>
<summary>원 설계 (참고용)</summary>

**Stripe 연동**:
- Customer = Workspace (1:1)
- Subscription = plan × quantity (Team 플랜은 멤버 수 × 30,000원)
- Webhook: `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- 구독 상태 동기화: `workspaces.subscription_status` (`active` / `past_due` / `canceled` / `paused`)

**플랜 (default 제안, 베타 피드백 후 확정)**:

| 플랜 | 가격 | 프로젝트 | 고객 | 멤버 | 기능 |
|------|------|---------|------|------|------|
| Free | 0원 | 3 | 10 | 1 (Owner만) | 대부분 기능 + PDF watermark |
| Pro | 15,000원/월 | 무제한 | 무제한 | 1 | 전 기능 + PDF watermark 제거 |
| Team | 30,000원/멤버/월 | 무제한 | 무제한 | 무제한 | Pro + 멤버 관리 |

**한도 enforcement**:
- INSERT 전에 `workspaces.plan`과 현재 count 비교
- 한도 초과 시 UPGRADE CTA (inline 알림 + toast)
- 사용량 DB 저장: `workspace_usage` 테이블 (프로젝트/고객/견적 count 실시간)

</details>

### Epic 5-4: 기존 기능 Multi-tenant 확장 (Phase 5.0)

**이미 준비된 것**:
- **W2 cron**: workspace별 invoice 조회 (userId → workspace_id 필터 교체만)
- **W3 cron**: workspace별 user 집계 (이미 user별 루프 — workspace별 루프로 전환 용이)
- **포털**: 토큰에 projectId 바인딩 → 자연스럽게 workspace 격리

**추가 작업**:
- W2/W3 cron 쿼리에 `workspace_id = w.id` 필터 추가
- 고객 포털 URL에 workspace 식별자 추가 여부 결정 (token만으로 충분하면 불필요)
- Activity logs `workspace_id` 추가 + 조회 UI
- 설정 페이지: `user_settings` → `workspace_settings` 분리 (견적서 템플릿은 workspace 단위)

**n8n 워크플로 영향**:
- payload에 `workspaceId` 필드 추가 (backward-compatible)
- n8n 측은 새 필드 무시 → 영향 없음
- workspace별 분기가 필요할 때만 n8n If 노드 추가 (예: workspace별 Slack 채널 라우팅)

### Epic 5-5: Admin + Observability (Phase 5.0 · 5.5 취소됨)

**Admin 대시보드 (운영자 전용)**:
- `/admin/workspaces` — 목록 (MAU / 프로젝트 수 / 마지막 접속)
- `/admin/stats` — 사용량 통계 (전체 프로젝트 수 / cron 실행 건수 / 메일 발송 수)
- ~~`/admin/billing` — 결제 조회 (Stripe Dashboard 우선, 내부 UI 최소)~~ ⛔ 폐기 2026-04-24 (Billing 취소)
- Workspace 일시정지 / 삭제 (관리자 권한)

Admin 계정 부여 방식:
- env `ADMIN_EMAILS=jayden@example.com,...` (간단)
- DB `users.is_platform_admin` flag (확장 가능)
- → Phase 5.0에서는 env 방식 ~~Phase 5.5에서 DB flag로 업그레이드~~ (5.5 취소, env 방식 유지)

**관찰성**:
- Sentry 에러 트래킹 (기존 `console.error` → Sentry)
- Vercel Analytics + Speed Insights (기본 제공 활용)
- n8n Executions 모니터링 (현재 수동)
- cron 실패 알림 (Slack webhook — 현재 n8n W1 재사용)

---

## 5. 기술 스택 변경

### Phase 5.0 (추가 없음)
- 기존 Next.js 16 + Supabase + Drizzle + n8n 유지
- 대신 Drizzle 스키마 대규모 변경 + RLS 재작성
- Supabase Auth 기본 유지 (Workspace = custom table)
- Resend (트랜잭셔널 메일 — 초대 메일 품질 향상) — 선택, Phase 5.0 후반 검토

### ~~Phase 5.5~~ ⛔ 폐기됨 (2026-04-24)
~~- **추가**: Stripe SDK (`@stripe/stripe-js`, `stripe` server) — 🔴 보안 중요~~
- **Resend**: 초대 메일 (결제 실패/구독 변경 알림은 취소)
~~- **추가 검토**: 토스페이먼츠 (Phase 5.6+, 한국 시장 비중 확인 후)~~
- **옵션**: Sentry (에러) + PostHog (프로덕트 분석)

---

## 6. Epic → Task 분해 (상세)

### Epic 5-1: Data Model (8 Task, 2주)

| Task | 내용 |
|------|------|
| 5-1-1 | `workspaces` / `workspace_members` / `workspace_invitations` / `workspace_settings` 스키마 + migration (4 테이블 신규, A1 독립 테이블 결정 반영) |
| 5-1-2 | 12개 도메인 테이블에 `workspace_id` NULLABLE 컬럼 추가 (backfill 전단계) |
| 5-1-3 | default workspace 생성 + 기존 data 일괄 UPDATE (`workspace_id = default_ws.id`) |
| 5-1-4 | `workspace_id` NOT NULL 전환 + FK 설정 |
| 5-1-5 | RLS 전면 재작성 (12개 테이블 × 4 policy = 48개) |
| 5-1-6 | Drizzle query helper `withWorkspace(query, wsId)` |
| 5-1-7 | Server Actions workspace scope 가드 추가 |
| 5-1-8 | E2E: cross-workspace 누출 공격 시뮬레이션 (Playwright) |

### Epic 5-2: Workspace + Onboarding (8 Task, 1.5~2주)

| Task | 내용 |
|------|------|
| 5-2-0 | **회원가입 UI + 이메일 verification** (현재 `/login`은 signInWithPassword만 — Phase 5 예약분. 회원가입 본류 + email OTP/confirmation 플로우 신규 구축) |
| 5-2-1 | `/onboarding` 플로우 (workspace 생성 → 기본 설정) |
| 5-2-2 | Workspace 설정 페이지 (이름/로고/사업자 정보) |
| 5-2-3 | Workspace picker (헤더 dropdown + 모바일 bottom sheet) + `users.last_workspace_id uuid` 컬럼 추가 (섹션 10 결정 반영) |
| 5-2-4 | 초대 토큰 생성 + 이메일 발송 (Resend 우선, 미도입 시 n8n 재사용) |
| 5-2-5 | `/invite/[token]` 페이지 (수락 플로우) |
| 5-2-6 | 역할 기반 권한 middleware / Server Action guard |
| 5-2-7 | 회원가입 시 자동 default workspace |

### ⛔ Epic 5-3: Billing (Phase 5.5, 10 Task) — 폐기됨 (2026-04-24)

<details>
<summary>원 Task 분해 (참고용)</summary>

| Task | 내용 |
|------|------|
| ~~5-3-1~~ | ~~Stripe Customer 생성 (workspace 단위)~~ |
| ~~5-3-2~~ | ~~Pricing 페이지 + 플랜 선택 UI~~ |
| ~~5-3-3~~ | ~~Checkout Session 생성 (Subscription mode)~~ |
| ~~5-3-4~~ | ~~Webhook handler (`/api/webhooks/stripe`)~~ |
| ~~5-3-5~~ | ~~구독 상태 동기화 (DB ← Webhook)~~ |
| ~~5-3-6~~ | ~~플랜 한도 enforcement (INSERT 트랜잭션 내 실시간 COUNT + race 방어)~~ |
| ~~5-3-7~~ | ~~한도 초과 UI (Upgrade CTA)~~ |
| ~~5-3-8~~ | ~~플랜 변경 / 취소 UI~~ |
| ~~5-3-9~~ | ~~Customer Portal (Stripe 호스팅 + embed)~~ |
| ~~5-3-10~~ | ~~청구서 / 영수증 다운로드 (Stripe invoice 링크)~~ |

</details>

### Epic 5-4: 기존 기능 확장 (4 Task, 1주)

| Task | 내용 |
|------|------|
| 5-4-1 | W2/W3 cron workspace scope 전환 |
| 5-4-2 | Activity logs / 설정 / 포털 workspace 격리 |
| 5-4-3 | 견적서 템플릿을 `user_settings` → `workspace_settings` 이전 |
| 5-4-4 | n8n 기존 워크플로 5종 `workspaceId` payload 추가 |

### Epic 5-5: Admin + Observability (6 Task, 1주)

| Task | 내용 |
|------|------|
| 5-5-1 | Admin 미들웨어 (`ADMIN_EMAILS` env 기반) |
| 5-5-2 | `/admin/workspaces` 페이지 (목록 + 검색) |
| 5-5-3 | `/admin/stats` 페이지 (MAU / 사용량) |
| 5-5-4 | Sentry 연동 (에러 트래킹) |
| 5-5-5 | cron 실패 알림 (Slack webhook, n8n W1 재사용) |
| 5-5-6 | Incident 런북 업데이트 (`docs/incident-response.md`) |

---

## 7. 완료 기준 (Definition of Done)

### Phase 5.0 DoD

- [ ] **3명 이상 PM이 각자 workspace에서 완전 격리 운영** (지인 베타 검증)
- [ ] cross-workspace 누출 공격 Playwright E2E 전 통과
- [ ] 기존 Jayden data → default workspace로 마이그레이션 **100%** 완료
- [ ] RLS 정책 security-reviewer HIGH 이상 **0건**
- [ ] W2/W3 cron이 multi-tenant에서 정상 작동 (deadline gate 실측 + 로그 확인)
- [ ] 초대 수락율 80%+ (이메일 → 수락)
- [ ] `pnpm tsc --noEmit && pnpm lint && pnpm build` 통과
- [ ] Onboarding 플로우 완주율 70%+ (내부 측정)

### ~~Phase 5.5 DoD~~ ⛔ 폐기됨 (2026-04-24)

<details>
<summary>원 완료 기준 (참고용)</summary>

- ~~[ ] **Stripe 실제 결제 1회 이상 검증** (테스트 모드 전수 시나리오 통과 + prod 모드는 소액 실결제 1회 → 즉시 환불 확인. 🔴 등급 전환 직후이므로 full-price 방치 금지)~~
- ~~[ ] 플랜 한도 초과 시 UI 차단 + 명확한 Upgrade CTA~~
- ~~[ ] 환불 / 플랜 변경 / 취소 플로우 각 1회 이상 검증~~
- ~~[ ] Webhook **idempotency** — 중복 이벤트 2회 수신해도 DB 상태 1회만 반영~~
- ~~[ ] Stripe Webhook 서명 검증 (security-reviewer CRITICAL 통과)~~
- ~~[ ] 플랜 전환 시 데이터 보존 (downgrade 후 한도 초과 데이터 read-only로 유지)~~
- ~~[ ] PCI DSS 간접 준수: 카드 번호 / CVV / 만료일 **DB 저장 0건** 확인~~

</details>

---

## 8. 리스크 + 마이그레이션 전략

### R1. 기존 프로덕션 데이터 이전
- **위험**: Jayden의 프로젝트/고객/청구서 데이터 → default workspace로 이관 중 누락
- **완화**:
  - 마이그레이션 전 pg_dump 전체 백업
  - 이관 후 row count 일치 검증 스크립트
  - dry-run 환경(Supabase branch)에서 먼저 실행
  - 실패 시 원복 전략 (단계별):
    - Task 5-1-2 (NULLABLE 추가) 직후: `ALTER TABLE ... DROP COLUMN workspace_id` (FK 미적용 상태 → 깔끔)
    - Task 5-1-4 (NOT NULL + FK 적용) 이후: `ALTER TABLE ... DROP COLUMN workspace_id CASCADE`로 FK 제약 동시 드롭 (CASCADE 필수, 미지정 시 `dependent objects still exist` 에러)
    - RLS 정책 재작성(5-1-5) 이후: 각 테이블 RLS 정책도 개별 `DROP POLICY` 필요 — 롤백 스크립트 별도 준비

### R2. RLS 전면 재작성 → 누락 시 cross-tenant 누출
- **위험**: 12개 테이블 × 4 policy = 48개 RLS 재작성 중 1곳이라도 `workspace_id` 필터 빠지면 치명적 누출
- **완화**:
  - 체크리스트 명시 (policy별 pass/fail)
  - E2E: A workspace 세션으로 B workspace 데이터 시도 → 0건 확인
  - security-reviewer 2회 리뷰 (RLS 작성 직후 + E2E 이후)
  - PROGRESS.md에 "전체 테이블 RLS 통과" 게이트 명시

### ~~R3. Stripe Webhook 중복/결제 race (Phase 5.5)~~ ⛔ 폐기됨 (2026-04-24)
리스크 자체가 소멸 (Stripe 연동 취소).

### ~~R4. 보안 등급 🟡 → 🔴 전환~~ ⛔ 폐기됨 (2026-04-24)
보안 등급은 🟡 유지 (결제 도입 안 함). 🔴 전환 계획 없음.

### R5. 점진 릴리스
- **전략**:
  - Feature flag `MULTITENANT_ENABLED` 도입 (env)
  - dev → staging(신규 Supabase branch) → prod 순
  - prod는 `workspace_id` NULLABLE 유지 상태로 배포 → backfill 검증 → NOT NULL 전환
  - 롤백 플랜: feature flag OFF + userId 기반 쿼리 fallback

### R6. n8n 워크플로 영향
- **위험**: W1/W2/W3/W4/W5 payload에 `workspaceId` 추가 시 n8n 쪽도 업데이트 필요
- **완화**:
  - payload에 필드 추가는 backward-compatible (기존 필드 유지)
  - n8n 측은 새 필드 무시 → 영향 없음
  - workspace별 분기가 필요할 때만 n8n If 노드 추가

### R7. 멤버 탈퇴 / Owner 이관
- **위험**: Owner 혼자인 workspace의 Owner가 탈퇴하면 workspace 고아화
- **완화**:
  - 마지막 Owner 탈퇴 차단 (다른 Admin → Owner 이관 필요)
  - Workspace 삭제 시 soft delete + 30일 유예 (복구 가능)

---

## 9. 의존성 + 우선순위

### 의존성 그래프

```
Epic 5-1 (Data Model) ←─ Epic 5-4 (기존 기능 확장)
    │                          │
    ├─ Epic 5-2 (Onboarding) ──┤
    │                          │
    └─ Epic 5-5 (Admin) ───────┘
                               │
                       [지인 베타 런칭]
                               │
                               ▼
                    ⛔ Epic 5-3 (Billing) — 폐기 2026-04-24
```

### 우선순위

1. **P0 (Phase 5.0 core, 4주)**: 5-1 → 5-2 → 5-4
2. **P1 (Phase 5.0 + 베타 준비, 1주)**: 5-5 (Admin + Observability 최소)
3. **P2 (지인 베타 2주)**: 피드백 수집 + 버그 수정만 (신기능 X)
4. ~~**P3 (Phase 5.5, 2주)**: 5-3 Billing~~ ⛔ **폐기 2026-04-24**
5. ~~**P4 (Phase 5.6+)**: 토스페이먼츠~~ · SSO / 다국어 / 기타 "만들지 않을 것"에서 재검토

### 예상 타임라인 (현실 조정 여지 있음)

```
Week 1-2:  Epic 5-1 Data Model
Week 3-4:  Epic 5-2 Workspace + Onboarding (5-4 병행)
Week 5:    Epic 5-5 Admin + Observability
Week 6:    QA + security-reviewer 2차 + 배포 준비
Week 7-8:  지인 베타 (2~3명 실사용 피드백)
⛔ Week 9-10: Epic 5-3 Billing — 폐기 2026-04-24
⛔ Week 11:   Phase 5.5 QA — 폐기 2026-04-24
```

**(취소 반영) 총 약 8주. 주당 작업량은 Jayden 페이스에 맞춤 조정.**

---

## 10. 후속 결정 사항 (PRD v4.x 업데이트 필요)

Phase 5 착수 직전에 확정:

- [x] **`workspace_settings` 구조 결정 (2026-04-20)** — **A1 독립 테이블 확정**. `workspace_settings` 1:1 with `workspaces` (사업자 정보 7 + 견적서 기본값 5 + 결제분할/기능 프리셋 jsonb 2 = 14 필드). 타입 안전 + PDF 생성 시 쿼리 성능 + 도메인 분리 근거. Stripe 관련(stripe_customer_id/subscription_status)은 `workspaces` 본체에 직접 추가.
- [x] **Workspace picker UX 결정 (2026-04-20)** — **A 헤더 dropdown 확정**. Slack/Linear/Notion 업계 표준, 공간 절약, PM 타겟 동시 소속 workspace ≤3 가정. 5+ 도달 시 dropdown 상단에 검색 input 추가하는 점진 개선 경로. Task 5-2-3 구현 시 모바일은 bottom sheet로 폴백.
- [x] **역할별 권한 매트릭스 최종 (2026-04-20)** — **C2 프로젝트 범위 write 확정**. Member는 자기 생성 projects + 해당 프로젝트 하위 엔티티(milestones/estimates/estimate_items/contracts/invoices/activity_logs) write 가능. client_notes는 자기 작성만 write. 다른 멤버 데이터는 read only. 베타 2~3명 피드백으로 완화/강화 가능.
- [x] **초대 만료 TTL (2026-04-20)** — **7일 확정**. Linear/Notion/Figma 업계 표준. 연장 옵션(14일) 별도 구현. 🟡 보안 등급상 탈취 토큰 수명 제한 우선.
- [x] **사용량 측정 주기 결정 (2026-04-20)** — **A 실시간 count 확정** (Phase 5.5 플랜 한도 enforcement용). INSERT 전 `SELECT COUNT(*) FROM {table} WHERE workspace_id = ?` 1-row scan. 플랜 한도가 소규모 수치(예: 10 프로젝트)라 latency 영향 무시 가능. race 방어: INSERT와 같은 트랜잭션 내 COUNT → `IF n >= limit THEN RAISE EXCEPTION`. Phase 5.6+ 스케일 도달 시 증분 카운터(INSERT/DELETE trigger) 전환 검토.
- [x] **Admin 계정 부여 방식 결정 (2026-04-20)** — **A env `ADMIN_EMAILS=jayden@...` 확정**. 초기 운영자 1명(Jayden), 재배포 = 결재선 역할로 오히려 보안 안전. DB flag 방식은 `is_admin` 컬럼 조작 방어 + RLS 복잡도 추가 발생. Task 5-5-1 middleware에서 `ADMIN_EMAILS.split(',').map(trim.toLowerCase).includes(user.email.toLowerCase())` 단순 체크. 운영자 증가 시 옵션 B/C로 점진 전환 가능.
- ~~[ ] Plan 한도 정확한 수치 (베타 피드백 반영)~~ ⛔ 폐기 (단일 고정 한도로 전환)
- ~~[ ] 토스페이먼츠 통합 시점 (한국 사용자 비중 기준)~~ ⛔ 폐기 (Billing 취소)
- [ ] Workspace 로고 업로드 (Supabase Storage 활용)
- [ ] 단일 고정 한도 수치 확정 (멤버 수 / AI 일일 호출 수 — `src/lib/plans.ts`에서 관리)
- [x] **Multi-workspace 기본 선택 결정 (2026-04-20)** — **A 마지막 접속 workspace 확정**. `users.last_workspace_id uuid nullable REFERENCES workspaces(id) ON DELETE SET NULL` 1 컬럼 추가 (Epic 5-2 Task 5-2-3 마이그레이션에 포함). 로그인 직후 `/dashboard` 리다이렉트 시 이 값 우선. NULL 폴백: 소속 workspace 중 `workspace_members.joinedAt` MIN. workspace 전환 시마다 UPDATE 1건 (쓰기 비용 미미, 캐싱 없이 매번 최신).

---

## 11. Phase 4 이전 기능과의 관계

**Phase 0~4 기능은 workspace_id 추가 외 변경 최소**. 세부:

| Phase 4 이전 기능 | Phase 5 변경 | 예상 부담 |
|------------------|-------------|----------|
| 프로젝트 CRUD | `workspace_id` 필터 추가 | 낮음 (Server Action helper) |
| 고객 CRM | 동일 | 낮음 |
| 견적/계약/청구서 | 동일 + `workspace_settings` 분리 | 중간 |
| KPI 홈 대시보드 | `workspace_id` 기반 집계 | 낮음 |
| AI 브리핑 (Phase 3) | workspace 단위 호출 제한 (AI 한도 — **단일 고정**으로 운영, 플랜 차등 아님) | 낮음 |
| 고객 포털 (Phase 4) | 포털 토큰에 workspace 바인딩 | 중간 |
| PWA (Phase 4) | 영향 없음 | 없음 |
| n8n cron 5종 | payload `workspaceId` 추가 (backward-compatible) | 낮음 |

**이미 Phase 3 cron 작업에서 multi-tenant 대비 패턴을 적용한 덕에 Phase 5-4 Epic의 부담이 상당히 감소했다.** (BigInt-safe / deadline gate / user별 루프 구조)

---

## 12. 리뷰 체크리스트

Phase 5.0 착수 전 확인:

- [ ] PRD v4.0 Jayden 리뷰 + 승인
- [ ] PRD 내 "만들지 않을 것" 재확인
- [x] Workspace 모델 ERD 다이어그램 별도 작성 → [PRD-phase5-erd.md](./PRD-phase5-erd.md) (2026-04-20)
- [ ] Drizzle 스키마 drafting (코드 작성 전)
- [ ] 기존 RLS 정책 전체 목록화 (변경 대상 명확히)
- [ ] 지인 베타 대상자 2~3명 사전 컨택
- [ ] **메일 인프라 결정** — Resend 도입 vs n8n 재사용 (Epic 5-2-4 초대 메일 발송). Phase 5.0 착수 시점에 확정 필요
- ~~[ ] Phase 5.5 착수 전 결제 가격 정책 확정 (베타 피드백 반영)~~ ⛔ 폐기 (Billing 취소)

~~Phase 5.5 착수 전 추가:~~ ⛔ 폐기됨 (2026-04-24)

- ~~[ ] Stripe Customer / Subscription 데이터 모델 설계~~
- ~~[ ] Webhook idempotency 테이블 스키마~~
- ~~[ ] 플랜별 한도 수치 확정~~
- ~~[ ] 법적 검토: 이용약관 / 개인정보처리방침 / 환불 정책~~

---

**다음 단계**:
1. Jayden 리뷰 → 수정 반영
2. `docs/PRD.md`에 v4.0 링크 추가
3. ERD 다이어그램 작성 (별도 Task)
4. Epic 5-1 Task 착수 대기
