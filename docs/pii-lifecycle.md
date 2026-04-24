# PII Lifecycle Policy — 감사 로그의 개인정보 처리

> Dairect는 감사 추적(audit trail)을 위해 일부 감사 로그에 이메일·이름 같은 개인정보(PII)를 평문으로 기록한다. 이 문서는 그 PII의 수명(lifecycle)을 명시해 규제 리스크와 code/정책 drift를 방지한다.
>
> **현재 상태**: Phase 5.5 Task 5-5-3 audit-4 (1차 정책). 보존 기간과 자동 만료 cron은 **향후 정책 필요 시 재결정**.
>
> **2026-04-24 업데이트**: Phase 5.5 Billing 취소됨. 기존 "빌링과 함께 확정" 표현은 "향후 필요 시"로 재라벨.

## 1. 저장되는 PII 목록

### 1-1. `activity_logs.metadata` (jsonb) — 1차 타겟

감사 이벤트와 함께 저장되는 freeform JSON. 초대 관련 이벤트에서 아래 필드 포함.

| 이벤트 (action) | PII 필드 | 현재 scrub 대상? | 출처 |
|----------------|----------|------------------|------|
| `workspace_invitation.created` | `metadata.email` | ✅ 대상 (즉시 이벤트 기반) | 초대 발송자가 입력 |
| `workspace_invitation.created` | `metadata.inviterName` | ❌ TBD (향후 탈퇴/삭제 플로우 구현 시) | user.name 원본 |
| `workspace_invitation.revoked` | `metadata.email` | ✅ 대상 | 초대 row의 기존 값 복사 |
| `workspace_invitation.revoked` | `metadata.reason` | ❌ 대상 아님 (enum 성격) | `email_send_failed` 등 고정 사유 |
| `workspace_invitation.revoke_skipped` | `metadata.email` | ❌ 해당 action은 실제 DB INSERT 안 함 (로그만) | — |
| `workspace_invitation.accepted` | `metadata.email` | ✅ 대상 | invitation.email 그대로 |
| `workspace_invitation.accepted` | `metadata.inviteeUserId` | ❌ 대상 아님 (FK 식별자, PII 아님) | 수락자 UUID |

> 주: `inviterName`과 `workspace_invitations.email`(§1-2)은 **정책상 PII**이지만 "사용자 탈퇴 연동(§2-5)" 플로우 구현 시점에 함께 scrub하도록 분리. 현재 구현은 `email`만.

### 1-2. `workspace_invitations.email` (text) — 초대 본체

초대 토큰이 유효한 동안 pending 상태로 존재. accepted/revoked/expired 이후에도 row는 유지 (감사 증거용).

- **현재 상태**: 평문 보존 (scrub 대상 아님)
- **사유**: 동일 email에 대한 재초대 UNIQUE 제약 · 만료 후 재발송 UX 등 운영 경로가 `email` 컬럼 자체를 참조
- **향후 (탈퇴/삭제 플로우 구현 시)**: 사용자 탈퇴/workspace 삭제 플로우 구현 시 이 컬럼도 함께 scrub 또는 삭제. §2-5 참조

### 1-3. 기타 (본 정책 대상 아님)

- `clients.email` / `clients.contact_email` — 고객사 연락처 (고객 CRM 본 데이터, 별도 정책)
- `leads.email` — 잠재 고객 연락처 (같음)
- `inquiries.contact` — 문의 폼 (보존 정책은 `docs/PRD.md` §Contact Form 참조)
- `users.email` (auth.users) — Supabase Auth 관리 (GoTrue 정책 준수)

## 2. PII 라이프사이클 (당면 정책)

### 2-1. 생성 시점
- 이벤트 발생 시 평문 저장. RLS로 **해당 workspace 멤버에게만 조회 허용** (sec MED-2 완화)
- 구조화된 필드에만 (`metadata.email` 등). freeform 텍스트 필드(`description`)에는 email 삽입 금지
- **평문 존속 기간은 의도된 설계**: 이메일 발송부터 수락/취소까지 "초대가 누구에게 갔는지"는 **진행 중 감사 증거**로 필요. 최대치는 `workspace_invitations.expiresAt`(7일) + 수동 revoke 지연. 이 기간이 지나면 최종 상태 트리거(§2-2)로 자동 소진

### 2-2. 익명화(scrub) 시점 — **즉시 이벤트 기반** (당면)

초대가 **최종 상태에 도달**하는 시점에 관련 audit log의 `metadata.email`을 pseudonym으로 치환:

| 트리거 | 대상 audit log | 구현 상태 |
|--------|----------------|-----------|
| 초대 수락 (`acceptInvitation`) | 동일 `invitationId`의 이전 `workspace_invitation.created` | ✅ 구현됨 |
| 초대 취소 (수동 `revokeInvitationAction`) | 동일 `invitationId`의 이전 `workspace_invitation.created` | ✅ 구현됨 |
| 초대 자동 취소 (email 발송 실패) | 방금 생성한 `workspace_invitation.created` | ✅ 구현됨 |
| 초대 만료 cleanup (기한 도달 후 일괄 scrub) | 동일 `invitationId`의 이전 `workspace_invitation.created` | ❌ TBD — 별도 cron 도입 시 §7 |

**원칙**: 이메일이 "누구에게 보냈는지" 증명의 가치가 이벤트 종료로 소진되는 시점에 **평문을 pseudonym으로 치환**. audit_log row는 삭제하지 않음 (감사 증거 보존).

### 2-3. pseudonym 생성 규칙

```
pseudonym = "pii:" + sha256(lowercase(email) + ":" + workspaceId + ":" + env.PII_PSEUDONYM_SALT).slice(0, 16)
```

- **deterministic**: 같은 email + workspace → 같은 pseudonym (감사 추적성 유지)
- **tenant 격리**: workspace 간 같은 email이 다른 pseudonym (교차 추적 방지)
- **salt**: `PII_PSEUDONYM_SALT` 환경변수 (64자 이상 랜덤). production에만 필수, dev는 fallback 허용
- **16자 hex prefix**: 2^64 공간 → workspace 내부 충돌 실질 0

### 2-4. 보존 기간 정책 — **TBD (정책 필요 시 재결정)**

현재는 **평문 → pseudonym 치환만** 수행하고 row 자체는 영구 보존. 요건 발생 시 아래 중 하나로 확정:
- (a) pseudonym 포함 row도 N개월 후 완전 삭제
- (b) pseudonym은 무기한 보존 (익명화된 상태라 삭제 불필요)
- (c) 계정 탈퇴/workspace 삭제 시점에만 일괄 삭제

### 2-5. 워크스페이스/사용자 삭제 연동 — **TBD (탈퇴/삭제 플로우 구현 시)**

현재 Dairect는 user 탈퇴/workspace 삭제 플로우가 **미구현**. 구현 시점에 아래 규칙을 **동시** 추가:
- user 탈퇴 → 해당 user가 발송한 모든 `workspace_invitation.created`의 `metadata.inviterName` 익명화
- workspace 삭제 → 해당 workspace의 모든 activity_logs 익명화 + pseudonym 대체

## 3. DB 스키마 변경

### `activity_logs.pii_scrubbed_at timestamptz`
- 익명화가 수행된 시점 기록. NULL = 평문 상태
- 쿼리: `WHERE pii_scrubbed_at IS NULL AND createdAt < NOW() - INTERVAL 'X'`로 후속 정책 (2-4)에서 자연 연결
- 인덱스 불필요 (낮은 쿼리 빈도, 2-4 확정 시 재검토)

## 4. 코드 연동 지점

### 4-1. 유틸 `src/lib/privacy/scrub-pii.ts` (신규)
```ts
export function pseudonymizeEmail(email: string, workspaceId: string): string
export async function scrubInvitationMetadata(
  tx: Transaction,
  invitationId: string,
  workspaceId: string,
): Promise<{ scrubbedCount: number }>
```

### 4-2. 호출 경로 (3건)
- `src/app/dashboard/members/actions.ts` — 수동 `revokeInvitationAction` + 자동 revoke(email 실패) + cleanup-3 stuck row
- `src/app/invite/[token]/accept-actions.ts` — 수락
- (추가 경로 발견 시 본 문서 4-1 목록 갱신 필수)

### 4-3. 구현 계약
- 익명화는 **상위 이벤트 commit 후 별도 transaction**에서 수행 → scrub 실패가 비즈니스 액션을 rollback시키지 않도록 격리
- 호출부는 `try/catch`로 scrub 실패를 swallow + `console.error({event: "invitation.pii_scrub_failed", ...})` 구조화 로그 → 상위 응답은 유지
- 이미 `pii_scrubbed_at IS NOT NULL`이면 skip (멱등)
- scrub 내부에서는 `WHERE entityType='workspace_invitation' AND entityId=<id> AND pii_scrubbed_at IS NULL` — invitationId 단위 일괄 처리
- 향후 "상위 tx 안에서 원자성 보장"으로 승격 가능하나, 현재는 단순성/독립성 우선

## 5. 환경변수

### `PII_PSEUDONYM_SALT` (신규)
- 64자+ 랜덤 hex
- production **필수** — env.ts validation에서 production일 때만 enforce
- dev/test에서는 hardcoded fallback(`"dev-only-salt-do-not-use-in-prod"`) 허용 + console.warn
- 회전(rotation) 시 기존 pseudonym과 불일치 발생 — 회전은 신중하게 설계 (회전 필요 시 per-email translation table 선행)

## 6. 금지 사항

- ❌ `activity_logs.description` 필드에 email/phone 삽입 (구조화된 metadata에만)
- ❌ audit log row 자체를 DELETE — 감사 증거 훼손 (2-4에서 정책 확정 후 조건부 삭제만 허용)
- ❌ 같은 email을 다른 salt로 hash한 pseudonym을 나중에 재발급 — 이전 추적성 끊김 (4-3 멱등 가드)
- ❌ metadata에 평문 email과 pseudonym을 같이 저장 (둘 중 하나, 치환이 원칙)
- ❌ production에서 `PII_PSEUDONYM_SALT` 누락 시 익명화 skip — 반드시 env validation에서 부팅 차단
- ❌ **프로덕션 `PII_PSEUDONYM_SALT` 회전 사실상 금지** — salt가 바뀌면 같은 email이 다른 pseudonym으로 생성되어 기존 scrub된 row와 서로 다른 pseudonym이 공존. 감사 추적성 단절. 반드시 필요하면 **별도 Task로 per-email translation table을 먼저 도입** 후 수행
- ❌ production에 dev fallback 문자열(`"dev-only-salt-do-not-use-in-prod"`)을 실수로 설정 — env.ts superRefine에서 명시 차단됨

## 7. 추후 확장 (TBD)

- 보존 기간 cron (2-4)
- 탈퇴/삭제 플로우 연동 (2-5)
- audit UI 도입 시 pseudonym 사람이 읽기 쉬운 형태(예: `anon-12ab`)로 표시 변환 계층
- 감사 로그 export 시 pseudonym 유지 여부 법적 검토
- 전 테이블 PII 일괄 점검 (`clients`/`leads` 등 본데이터는 별도 policy)

## 8. 관련 이력

- **2026-04-22 Task 5-5-5**: audit-4 최초 식별 — metadata.email 평문 저장 정책 미비
- **2026-04-24 Task B**: 1차 정책 확정 + `pii_scrubbed_at` 컬럼 도입 + 3개 경로 즉시 익명화 구현
- **2026-04-24 Task-S1**: Phase 5.5 Billing 취소 반영 — "빌링과 함께 확정" 표현을 "향후 필요 시 재결정"으로 재라벨
- **향후 (TBD)**: 보존 기간 정책 / 탈퇴·삭제 플로우 연동 / cleanup cron
