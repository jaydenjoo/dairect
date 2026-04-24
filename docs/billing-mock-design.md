# Billing Mock Design — Epic 5-3 Phase A (PG 계약 전)

> Dairect는 한국 PG사(토스페이먼츠/포트원 등)와 계약 예정. 계약 체결 전까지는 Mock Payment Provider로 전체 결제 플로우(Checkout → Webhook → 구독 상태 동기화 → Portal)를 구현해 계약 완료 시 **Provider 구현체만 교체**하면 되는 구조로 만든다.
>
> **현재 Phase**: Phase A (Mock). 실 PG 연동은 Phase B (계약 완료 후).

## 1. 원칙

### 1-1. Provider 중립
- DB 스키마 / 비즈니스 로직 / UI는 **어떤 PG든 공통**으로 설계
- PG별 특화 코드는 `src/lib/billing/providers/<provider>.ts` 파일에만 국한
- 인터페이스(`PaymentProvider`)를 지나는 함수 호출만 상위 코드에서 사용

### 1-2. Mock은 실 플로우와 동일한 "모양"
- 결제 버튼 → redirect URL → fake checkout 페이지 → success/fail 버튼 → webhook 호출 → 상태 업데이트
- UI/UX 전체 리허설 가능 + 다음 세션에 실 PG만 연결
- **돈 안 오감** → 🟡 보안 등급 유지. 실 PG 연동 시점에 🔴 전환

### 1-3. env flag 전환
```
PAYMENT_PROVIDER=mock        # 개발 기본값
PAYMENT_PROVIDER=toss        # 토스페이먼츠 (계약 후)
PAYMENT_PROVIDER=portone     # 포트원 v2 (계약 후)
```

## 2. PaymentProvider 인터페이스

### 2-1. 시그니처 (제안)

```ts
// src/lib/billing/types.ts

export type PlanId = "free" | "pro" | "team";

export type SubscriptionStatus =
  | "none"        // 구독 없음 (Free 플랜)
  | "active"      // 정상 구독 중
  | "past_due"    // 결제 실패 (재시도 중)
  | "canceled"    // 취소됨 (기간 만료 대기)
  | "paused";     // 일시정지 (운영자 개입)

export interface CheckoutSession {
  sessionId: string;       // provider session ID
  checkoutUrl: string;     // redirect 대상
  expiresAt: Date;
}

export interface CustomerRef {
  externalCustomerId: string;  // provider side customer ID
  workspaceId: string;         // Dairect workspace (1:1)
}

export interface SubscriptionSnapshot {
  externalSubscriptionId: string;
  status: SubscriptionStatus;
  planId: PlanId;
  currentPeriodEnd: Date;
  quantity: number;  // Team 플랜 멤버 수
  cancelAtPeriodEnd: boolean;
}

export interface PaymentProvider {
  readonly name: "mock" | "toss" | "portone";

  // Customer 생성/조회 — idempotent (이미 있으면 기존 반환)
  ensureCustomer(input: {
    workspaceId: string;
    email: string;
    name: string;
  }): Promise<CustomerRef>;

  // Checkout 세션 생성 — redirect URL 반환
  createCheckoutSession(input: {
    workspaceId: string;
    planId: PlanId;
    quantity: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;

  // Webhook 수신 → 검증 + 이벤트 객체 반환
  verifyAndParseWebhook(input: {
    rawBody: string;
    signature: string | null;
    timestamp: string | null;
  }): Promise<WebhookEvent>;

  // 현재 구독 상태 조회 (webhook 외에도 reconciliation용)
  getSubscription(externalSubscriptionId: string): Promise<SubscriptionSnapshot | null>;

  // Customer Portal URL — PG별 호스팅 페이지 or 자체 UI 라우트
  createPortalLink(input: { workspaceId: string; returnUrl: string }): Promise<string>;

  // 플랜 변경 / 취소 (멱등)
  updateSubscription(input: {
    externalSubscriptionId: string;
    planId?: PlanId;
    quantity?: number;
    cancelAtPeriodEnd?: boolean;
  }): Promise<SubscriptionSnapshot>;
}

export type WebhookEvent =
  | { type: "subscription.created"; data: SubscriptionSnapshot; customer: CustomerRef }
  | { type: "subscription.updated"; data: SubscriptionSnapshot; customer: CustomerRef }
  | { type: "subscription.canceled"; data: SubscriptionSnapshot; customer: CustomerRef }
  | { type: "invoice.paid"; data: { invoiceId: string; amount: number; currency: string }; customer: CustomerRef }
  | { type: "invoice.payment_failed"; data: { invoiceId: string; reason: string }; customer: CustomerRef };
```

### 2-2. 왜 이 함수들만?
- Stripe / 토스페이먼츠 / 포트원 **공통분모** (모든 PG가 제공)
- PG별 고유 기능(예: 토스의 카드사 할부, 포트원의 간편결제 종류)은 Provider 내부에서 처리, 상위 코드에 노출 안 함
- `currency`는 Phase A에서 KRW 고정 (국제 결제는 Phase C+)

## 3. MockPaymentProvider 동작 범위

### 3-1. In-memory vs DB-backed
- **DB-backed 채택** — mock이라도 DB에 실제로 저장해야 Next.js 서버 재시작 / Vercel 서버리스 환경에서도 일관. In-memory는 로컬 개발만 가능.
- 테이블: `mock_payment_sessions` (신규, mock 전용) — sessionId / workspaceId / status / createdAt

### 3-2. Mock Checkout 페이지
- `src/app/(public)/billing/mock-checkout/[sessionId]/page.tsx` (공개 라우트)
- 3개 버튼: **"결제 성공 시뮬레이션"** / **"결제 실패 시뮬레이션"** / **"취소"**
- 클릭 시 내부 API 호출 → Mock Webhook 생성 → success/cancel URL로 redirect
- 배너로 "⚠️ Mock 결제 화면 — 실제 결제 아님" 표시

### 3-3. Mock Webhook
- 내부 POST `/api/webhooks/billing/mock` — 외부 네트워크 경유하지 않음
- `verifyAndParseWebhook`은 Mock에서 signature 검증 skip (dev-only)
- 그 외 모든 로직(동기화/상태 업데이트)은 실 webhook과 동일 경로

### 3-4. Mock Subscription 데이터
- `mock_subscriptions` 테이블 (신규) — externalSubscriptionId / workspaceId / planId / status / currentPeriodEnd
- fake "한 달 후" currentPeriodEnd 자동 계산
- 플랜 변경/취소 버튼 → 즉시 mock_subscriptions UPDATE + Mock Webhook fire

## 4. DB 스키마 변경 계획

### 4-1. 기존 컬럼 정리 (workspaces)

현재 `workspaces` 테이블:
```ts
subscriptionStatus: text().default("free").notNull(),  // CHECK ('free'|'active'|'past_due'|'canceled'|'paused')
stripeCustomerId: text(),
```

변경 제안:
```ts
// Provider 중립 컬럼으로 전환
paymentProvider: text().default("mock").notNull(),       // 'mock' | 'toss' | 'portone'
externalCustomerId: text(),                              // 기존 stripeCustomerId rename
externalSubscriptionId: text(),                          // 신규
subscriptionStatus: text().default("none").notNull(),    // 'none'|'active'|'past_due'|'canceled'|'paused' (free→none으로 변경)
currentPeriodEnd: timestamp(),                           // 신규
cancelAtPeriodEnd: boolean().default(false).notNull(),   // 신규
```

CHECK 제약 업데이트. `free` → `none`으로 변경해 "결제 상태"와 "플랜"을 명확히 분리.
- **플랜(free/pro/team)**: `workspace_settings.plan` (기존 유지)
- **결제 상태**: `workspaces.subscriptionStatus`

### 4-2. 신규 테이블 (Mock 전용)

```ts
// Mock only. 실 PG 연동 시 drop.
export const mockPaymentSessions = pgTable("mock_payment_sessions", {
  sessionId: text().primaryKey(),
  workspaceId: uuid().notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  planId: text().notNull(),
  quantity: integer().default(1).notNull(),
  status: text().default("pending").notNull(),  // pending|succeeded|failed|canceled
  createdAt: timestamp().default(sql`now()`).notNull(),
  expiresAt: timestamp().notNull(),
});

export const mockSubscriptions = pgTable("mock_subscriptions", {
  externalSubscriptionId: text().primaryKey(),
  workspaceId: uuid().notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  planId: text().notNull(),
  quantity: integer().default(1).notNull(),
  status: text().notNull(),
  currentPeriodEnd: timestamp().notNull(),
  cancelAtPeriodEnd: boolean().default(false).notNull(),
  createdAt: timestamp().default(sql`now()`).notNull(),
});
```

### 4-3. 청구서 (Mock)

기존 `invoices` 테이블은 **고객사 발행 청구서** 용도 (EST-YYYY-NNN 번호 체계). 이것과 별개로 **구독 청구서**가 필요:

```ts
// 별도 테이블 — 기존 invoices와 혼동 방지
export const subscriptionInvoices = pgTable("subscription_invoices", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: uuid().notNull().references(() => workspaces.id),
  externalInvoiceId: text(),           // Mock이면 임의 UUID, 실 PG는 provider 값
  paymentProvider: text().notNull(),
  amount: integer().notNull(),          // 원화 정수 (KRW 센트 없음)
  currency: text().default("KRW").notNull(),
  status: text().notNull(),             // paid|open|void|uncollectible
  paidAt: timestamp(),
  periodStart: timestamp().notNull(),
  periodEnd: timestamp().notNull(),
  receiptUrl: text(),                    // PG별 영수증 URL (Mock은 내부 PDF 생성)
  createdAt: timestamp().default(sql`now()`).notNull(),
});
```

## 5. 플랜 한도 enforcement 전략

Task 5-3-6'는 실제로 **Mock과 무관한** 영역. 이미 구현된 패턴:
- `createInvitationAction` + `acceptInvitationAction`에 `getMaxMembers(plan)` 게이트 존재
- 프로젝트/고객 수 한도는 INSERT 전 COUNT 비교 추가 필요

신규: `PLAN_MAX_PROJECTS` / `PLAN_MAX_CLIENTS` (src/lib/plans.ts 확장) — Task 5-3-6'에서.

## 6. 보안 경계

### Mock Phase (🟡)
- 돈이 안 오감 → 🟡 유지
- Mock webhook signature 검증 skip (dev-only) — **실 PG 연동 시 반드시 켜야 함**
- `PAYMENT_PROVIDER=mock`이 production env에 설정되면 부팅 차단 (env.ts superRefine 추가)
- Mock Checkout 페이지 접근 제어: 본인 workspace만 (sessionId 소유권 검증)

### 실 PG Phase (🔴 — Phase B)
- Webhook HMAC 서명 검증 필수 (PG별 방식)
- Customer Portal 자동 로그인 URL에 서명 포함
- PII (카드정보) **절대 DB 저장 금지** — PG 토큰화만
- 청구서 원본 데이터(receiptUrl)는 PG 쪽 CDN 참조만, 복제 금지

## 7. Task 재분해 (Phase A, 10 Task)

| Task | 내용 | 예상 소요 |
|------|------|-----------|
| 5-3-1' | `PaymentProvider` 인터페이스 + `MockPaymentProvider` 구현 + DB 스키마 마이그레이션 (1단계) | 2~3h |
| 5-3-2' | `/dashboard/billing` 플랜 선택 UI (가격 상수 + 3카드) | 1.5h |
| 5-3-3' | Mock Checkout 플로우 (세션 생성 → redirect → mock-checkout 페이지) | 2h |
| 5-3-4' | Mock Webhook endpoint (`/api/webhooks/billing/mock`) + 파서 | 1.5h |
| 5-3-5' | 구독 상태 DB 동기화 (Webhook → workspaces.subscription_status 등) | 2h |
| 5-3-6' | 플랜 한도 enforcement 확장 (PLAN_MAX_PROJECTS/CLIENTS 추가) | 2h |
| 5-3-7' | 한도 초과 Upgrade CTA (inline + toast) | 1.5h |
| 5-3-8' | Mock 플랜 변경/취소 UI (`updateSubscription` 호출) | 2h |
| 5-3-9' | Customer Portal UI (현재 플랜 / 다음 결제일 / 결제수단) | 2h |
| 5-3-10' | 구독 청구서 목록 + PDF 다운로드 | 2h |

**총 소요**: 약 18~20시간. 여러 세션에 걸쳐 진행.

## 8. Phase B 전환 시 변경 범위 (예상)

계약 체결 후 실 PG 연동 시 변경 파일:

**추가/교체**:
- `src/lib/billing/providers/toss.ts` 또는 `portone.ts` (신규 구현)
- `src/lib/billing/provider-factory.ts` (env flag 기반 선택)
- 실 webhook endpoint (mock 유지 + 실 endpoint 병존)
- env 검증 (`TOSS_SECRET_KEY` 등 provider-specific)

**drop**:
- `mock_payment_sessions` / `mock_subscriptions` 테이블
- `/billing/mock-checkout/[sessionId]` 페이지
- `/api/webhooks/billing/mock` endpoint

**유지 (변경 없음)**:
- `workspaces` 테이블 (provider-agnostic)
- `subscription_invoices` 테이블
- UI 컴포넌트 전체
- 플랜 한도 enforcement 로직

## 9. 결정 필요 사항 (Jayden 승인 대기)

### 9-1. 가격/플랜 확정
PRD 기본값 (PRD-phase5.md:154-162):
- Free: 0원 / 프로젝트 3 / 고객 10 / 멤버 1 / PDF watermark
- Pro: 15,000원/월 / 무제한 / 1명 / watermark 제거
- Team: 30,000원/멤버/월 / 무제한 / 멤버 관리

베타 피드백 반영 여부 결정 필요. **Mock 단계에서는 PRD default로 진행하고 실 PG 연동 전 재확정** 제안.

### 9-2. PG 후보 방향성
계약 결정이 아직 없더라도 **인터페이스 설계 단계에서 어떤 PG를 가정**할지 간략 결정:
- **토스페이먼츠** — 단일 PG, 간결한 API
- **포트원 v2** — 멀티 PG 추상화 (토스+KG+나이스+KCP 한번에)
- **직접 PG 계약** (KG이니시스 등) — 레거시, 비권장

권장: **포트원 v2** — 이미 PG 통합 추상화가 한 단계 되어있어 우리의 Mock→실 전환이 자연스러움. 토스페이먼츠 선택 시에도 인터페이스 호환.

### 9-3. Mock 세션 유효기간
- 30분 제안 (결제 진행 중 방치 방어)
- Jayden 검토

### 9-4. Subscription 청구 주기
- 월간만 (Phase A)
- 연간은 Phase B 이후

### 9-5. Free 플랜 PDF watermark
- PRD에 정의된 "PDF watermark" 기능 — Phase A에서 구현? 아니면 Phase B?
- 제안: **Phase A에서 구현** (mock 전환 후에도 정책 일관)

## 10. 관련 이력
- **2026-04-20 Phase 5.0**: workspaces에 subscription_status / stripeCustomerId placeholder 컬럼 추가
- **2026-04-24 Task B**: PII 라이프사이클 정책 §2-4/§2-5가 이 Epic과 함께 확정 예정
- **Task C 재설계 (현 시점)**: Stripe → 한국 PG + Mock 중심으로 전환. 본 문서 작성.
