# Dairect n8n 연동 가이드

Phase 3 · Task 3-5 Option B 범위 워크플로우 2종 + Phase 4 Task 4-2 M7 추가 1종.

## 전체 구조

```
Dairect Next.js (Server Action)
  └─ emitN8nEvent(...) ── POST JSON ──▶  n8n Webhook (self-hosted)
                                           └─ HMAC 검증 ─ If ─ Slack/Gmail
```

- **W1** `project.status_changed` → Slack 알림
- **W2** `invoice.overdue` → PM + 고객 결제 기한 알림 메일 (Gmail, Vercel Cron 매일 09:00 KST) — Phase 3 cron 백로그 완료
- **W4** `project.completed` → 고객사 완료 안내 메일 (Gmail)
- **W5** `portal_feedback.received` → PM에게 고객 피드백 알림 메일 (Gmail) — Task 4-2 M7에서 신규 추가

구현 파일:
- 서버측: [`src/lib/n8n/client.ts`](../src/lib/n8n/client.ts), [`src/app/dashboard/projects/actions.ts`](../src/app/dashboard/projects/actions.ts), [`src/lib/portal/feedback-actions.ts`](../src/lib/portal/feedback-actions.ts), [`src/app/api/cron/invoice-overdue/route.ts`](../src/app/api/cron/invoice-overdue/route.ts)
- n8n 워크플로우: [`workflows/W1_project_status_changed.json`](workflows/W1_project_status_changed.json), [`workflows/W2_invoice_overdue.json`](workflows/W2_invoice_overdue.json), [`workflows/W4_project_completed.json`](workflows/W4_project_completed.json), [`workflows/W5_portal_feedback_received.json`](workflows/W5_portal_feedback_received.json)
- Cron 설정: [`vercel.json`](../vercel.json)

## 에러 최소화 · 보안 설계 요약

| 기법 | 적용 위치 |
|---|---|
| `AbortController` 3s timeout | `emitN8nEvent` |
| URL `new URL()` + 캐시 (유효값만 캐싱) | `getWorkflowUrl` |
| HTTPS 강제 (프로덕션) | `getWorkflowUrl` |
| **사설/링크로컬/메타데이터 호스트 차단** (SSRF 방어) | `getWorkflowUrl` (production only) |
| HMAC sha256 `${ts}.${nonce}.${rawBody}` + `timingSafeEqual` | 서버 서명 / n8n Code 검증 |
| ±5분 타임스탬프 윈도우 + **nonce dedupe** (replay 방어) | n8n Code (`$getWorkflowStaticData`) |
| `rawBody:true` — JSON 재직렬화 round-trip 제거 | Webhook 노드 |
| **프로덕션 + secret 미설정 시 fetch 차단** | `emitN8nEvent` (unsigned 송신 금지) |
| at-most-once (재시도 없음) | `emitN8nEvent` — Slack/Gmail 중복 방지 |
| 트랜잭션 + `SELECT ... FOR UPDATE` | `updateProjectStatusAction` — 상태변경 race 방지 |
| `void` fire-and-forget | `updateProjectStatusAction` — DB 업데이트와 격리 |
| `Respond 200` → Slack/Gmail 순서 | 응답 지연 방지 + `continueOnFail` 으로 n8n 재시도 폭주 차단 |
| Env 미설정 시 no-op + warn (dev) / error (prod) | 개발환경에서 n8n 없어도 앱 정상 |

## 🔒 PII 저장 경고 (필독)

W4 페이로드는 고객 이메일·담당자 이름·회사명을 포함합니다. n8n 기본 설정은 성공/실패 실행 내역을 n8n 자체 DB에 영구 저장하므로, 다음 중 **하나 이상** 적용이 필수입니다:

1. 워크플로우 Settings → **`Save Data Successful Execution: Do not save`** (이 저장소의 JSON은 기본으로 이 값 설정됨)
2. n8n 인스턴스 환경변수 `EXECUTIONS_DATA_MAX_AGE=168` (시간 단위, 7일) + `EXECUTIONS_DATA_PRUNE=true`
3. n8n Postgres 디스크 암호화 (self-hosted 배포 체크리스트)

에러 실행은 디버깅용으로 남지만, 가능하면 stack trace에서 PII를 제거하는 워크플로우를 에러 트리거로 분리 운영 권장.

## Dairect(Next.js) 측 환경변수

`.env.local` (또는 Vercel project settings):

```bash
# 필수 (미설정 시 해당 워크플로우 발사 skip + warn 로그)
N8N_WEBHOOK_URL_PROJECT_STATUS_CHANGED=https://n8n.example.com/webhook/dairect/project-status-changed
N8N_WEBHOOK_URL_PROJECT_COMPLETED=https://n8n.example.com/webhook/dairect/project-completed
N8N_WEBHOOK_URL_PORTAL_FEEDBACK_RECEIVED=https://n8n.example.com/webhook/dairect/portal-feedback-received
N8N_WEBHOOK_URL_INVOICE_OVERDUE=https://n8n.example.com/webhook/dairect/invoice-overdue

# HMAC 공유 시크릿 (32바이트 이상 랜덤 권장: `openssl rand -hex 32`)
N8N_WEBHOOK_SECRET=<random_hex_32_bytes>

# Vercel Cron 인증 (W2 invoice.overdue cron에서 Authorization: Bearer <secret> timingSafeEqual 검증)
# `openssl rand -hex 32` 로 생성 권장. Vercel Cron이 자동으로 이 값을 Authorization 헤더에 주입.
CRON_SECRET=<random_hex_32_bytes>
```

**주의**:
- 프로덕션에서는 URL이 반드시 `https://`여야 합니다. `http://`면 자동 no-op 처리됩니다.
- 프로덕션에서 `N8N_WEBHOOK_SECRET` 미설정 시 **fetch 자체가 차단**됩니다 (unsigned PII 송신 방지).
- URL의 hostname이 사설/링크로컬/루프백 대역(`127.x`, `10.x`, `192.168.x`, `169.254.x`, `172.16-31.x`, `localhost`, `::1`, `fc00::/7`, `fe80::`)이면 production에서 차단됩니다 (SSRF 방어). 개발환경(`NODE_ENV=development`)에서는 localhost 허용.

요청 헤더:
- `X-Dairect-Event`: 이벤트 이름
- `X-Dairect-Timestamp`: ms epoch
- `X-Dairect-Nonce`: 요청별 UUID (n8n 측 dedupe 키)
- `X-Dairect-Signature`: `sha256=<hex>` (HMAC 입력 = `${timestamp}.${nonce}.${rawBody}`)

## n8n 측 환경변수

self-hosted n8n 실행 환경 (`docker-compose.yml` / systemd env / n8n cloud variables):

```bash
# HMAC 공유 시크릿 — Dairect의 N8N_WEBHOOK_SECRET과 동일 값
DAIRECT_WEBHOOK_SECRET=<same_as_dairect_side>

# W1 Slack 채널 ID (채널 이름 아님, C01XXXX 형식)
DAIRECT_SLACK_CHANNEL_ID=C01XXXXXX

# (선택) W4 메일 발신자 이름 — Gmail Credential 자체에서도 설정 가능
DAIRECT_FROM_EMAIL_NAME=Dairect

# (선택) W5 대시보드 링크 base URL — 미설정 시 https://dairect.kr 폴백.
# staging/dev 환경에서 동일 n8n 인스턴스 공유 시 링크 분기용.
DAIRECT_DASHBOARD_BASE_URL=https://dairect.kr
```

## 배포 절차

### 1) n8n 워크플로우 import

n8n UI → `Workflows` → `⋯` → `Import from File` → `workflows/W1_...json` 선택 → 저장.
W4도 동일하게 import.

### 2) Credentials 연결

**W1 — Slack API**
1. n8n UI → `Credentials` → `New` → `Slack API` 선택
2. Slack App → `OAuth & Permissions` → Bot Token (`xoxb-...`) 입력
   - 필요 scope: `chat:write`, `chat:write.public`
3. W1 워크플로우의 `Slack Post` 노드 → Credentials 드롭다운에서 방금 만든 것 선택

**W4 — Gmail OAuth2**
1. n8n UI → `Credentials` → `New` → `Gmail OAuth2 API` 선택
2. Google Cloud Console → OAuth 2.0 Client ID 발급 → Client ID/Secret 입력
   - redirect URI: n8n이 안내하는 `https://<n8n>/rest/oauth2-credential/callback`
   - scope: `https://www.googleapis.com/auth/gmail.send`
3. W4 워크플로우의 `Gmail Send` 노드 → Credentials 드롭다운 선택

### 3) 워크플로우 활성화

n8n UI에서 각 워크플로우 우상단 토글 → `Active`.
비활성 상태에서는 `Test URL`만 동작하므로 프로덕션 트래픽은 활성화 필요.

### 4) 스모크 테스트

로컬 Next.js에서 프로젝트 상태를 변경하고 n8n Executions 탭에서 실행 내역을 확인합니다.

```bash
# Dairect 개발 서버 실행 (.env.local 준비 후)
pnpm dev

# 프로젝트 칸반에서 상태 드래그 → n8n Executions 확인:
#  - Verify HMAC: verified=true
#  - Slack Post: 200 OK
```

실패 케이스 (n8n Executions 탭의 `Verify HMAC` 노드 출력):
- `signature_mismatch` → 양쪽 `*_SECRET` 값 불일치
- `timestamp_out_of_window` → 서버-n8n 시간 편차 5분 초과 (NTP 동기화 필요)
- `secret_not_configured` → n8n 측 `DAIRECT_WEBHOOK_SECRET` 환경변수 누락
- `nonce_format` → 서버 `X-Dairect-Nonce` UUID v4 형식 아님 (Dairect 버전 불일치 가능성)
- `replay_detected` → 5분 윈도우 내 동일 nonce 재전송 차단 (정상적 방어 반응)
- `raw_body_missing` → Webhook 노드 `rawBody:true` 설정 누락

## n8n Code 노드 요구사항

Code 노드에서 `require('crypto')`와 `$getWorkflowStaticData('global')`을 사용합니다. self-hosted n8n에서:
- `crypto`는 기본 허용 (built-in Node module)
- `$getWorkflowStaticData`는 n8n 내장 helper (별도 설정 불필요)

만약 `NODE_FUNCTION_ALLOW_BUILTIN` 화이트리스트를 엄격히 설정한 환경이면 `crypto`를 추가.

## 유지보수 주의사항

1. **Code 노드 로직은 W1/W4 양쪽에 복제됨**. HMAC 검증 / nonce dedupe 수정 시 두 파일 모두 동기화.
2. **서명 canonical = `${timestamp}.${nonce}.${rawBody}`**. Webhook 노드 `rawBody:true` 필수 — n8n이 `item.binary.data.data` (base64)로 원본 바이트를 넘겨주므로 JSON 재직렬화 문제 없음.
3. **typeVersion 고정**: n8n-nodes-base 2.16.x 기준 검증됨. 업그레이드 시 각 노드 `typeVersion` (webhook=2, code=2, if=2, slack=2.2, gmail=2.1, respondToWebhook=1.1) 변경 여부 확인.
4. **credentials.id 치환**: JSON 내부 `REPLACE_WITH_*_CREDENTIAL_ID`는 import 후 n8n UI에서 수동 연결. Git에는 placeholder 유지.
5. **재시도 없음**: 서버가 1회만 호출합니다. Slack/Gmail 중복 발송 방지. n8n 측에서도 `retryOnFail:false`, `continueOnFail:true` 유지 (응답 지연 방지).
6. **Nonce dedupe staticData**: `$getWorkflowStaticData('global').seen`에 누적. 5분+1분 grace 넘으면 자동 purge. n8n 재시작 시 메모리만 유지(DB 저장)되므로 재시작 후 짧게 replay 방어 공백 가능 — 실질 리스크는 낮음.

## Phase 백로그 (이번 범위 외)

- ~~**W2** `invoice.overdue` 일 1회 크론~~ — ✅ 완료 (Vercel Cron + `/api/cron/invoice-overdue` + W2 JSON)
- **W3** weekly reports 금요일 크론 — cron 인프라 도입됨, W3 JSON + `/api/cron/weekly-summary` route 작성만 남음
- **관찰성**: `activity_logs`에 webhook emit 기록 남기기 (silent failure 가시화)
- **대시보드 발송 이력 UI**: 고객사별 메일/알림 발송 로그

---

## W2 — `invoice.overdue` → PM + 고객 결제 기한 알림 (Vercel Cron)

매일 KST 09:00 (UTC 00:00)에 Vercel Cron이 `/api/cron/invoice-overdue`를 호출. 연체 invoice(`status='sent'` AND `due_date < today` AND `last_overdue_notified_at IS NULL`)를 조회해 n8n `invoice.overdue` 이벤트 발송 → invoice 상태를 `overdue`로 전이 + `last_overdue_notified_at` 기록. D+1에 **1회만** 발송.

### 서버 측 cron endpoint (이미 구현)

- 위치: [`src/app/api/cron/invoice-overdue/route.ts`](../src/app/api/cron/invoice-overdue/route.ts)
- 인증: `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron 자동 주입, `crypto.timingSafeEqual` 검증 — timing attack 방어)
- 스케줄: [`vercel.json`](../vercel.json) — `0 0 * * *` (UTC 00:00 = KST 09:00)
- 순차 처리 (병렬 Promise.all은 n8n burst 리스크)
- 멱등성: `last_overdue_notified_at IS NULL` 필터 + emit 성공 후에만 UPDATE → 실패 시 다음 cron 재시도
- 페이로드:
  ```json
  {
    "event": "invoice.overdue",
    "version": "1",
    "emitted_at": "ISO",
    "data": {
      "invoiceId": "uuid",
      "invoiceNumber": "INV-2026-001",
      "projectId": "uuid",
      "projectName": "string",
      "pmEmail": "pm@example.com",
      "clientEmail": "client@example.com",
      "clientCompanyName": "string",
      "totalAmount": 1000000,
      "dueDate": "2026-04-01",
      "daysOverdue": 18,
      "bankName": "국민은행",
      "accountNumber": "123-456-789"
    }
  }
  ```

### DB 마이그레이션

`invoices.last_overdue_notified_at TIMESTAMPTZ NULL` 컬럼 추가. Drizzle migration 파일이 `src/lib/db/migrations/`에 자동 생성됩니다. Supabase UI의 SQL Editor에서 직접 실행하거나 `pnpm db:push`로 적용.

### n8n 워크플로 임포트

1. n8n UI → Import from File → [`workflows/W2_invoice_overdue.json`](workflows/W2_invoice_overdue.json)
2. **Gmail OAuth2 Credentials 연결** (W4/W5와 동일 자격증명 재사용 가능)
3. **env 세팅**:
   - Vercel: `N8N_WEBHOOK_URL_INVOICE_OVERDUE` + `CRON_SECRET` (공유)
   - n8n: 기존 `DAIRECT_WEBHOOK_SECRET` + (선택) `DAIRECT_DASHBOARD_BASE_URL`
4. 워크플로 Active 토글

### 스모크 테스트

**수동 트리거** (Vercel Cron 대기 없이 즉시 확인):
```bash
curl -H "Authorization: Bearer ${CRON_SECRET}" https://dairect.kr/api/cron/invoice-overdue
# 응답: { "total": N, "processed": N, "failed": 0, "skipped": 0 }
```

n8n Executions 탭:
- `Verify HMAC`: `verified=true`
- `Verified & Has Recipient?`: true 분기
- `Compose Email`: 1~2 items output (pmEmail/clientEmail 존재에 따라)
- `Gmail Send`: 각 item 순차 발송 (continueOnFail — 1건 실패해도 다른 건 진행)

### W2 내부 동작 (참고)

- **Compose Email Code가 2 items까지 반환** (PM용 + 고객용) — Gmail Send가 각각 순차 발송. 한쪽 이메일 누락이면 1건만.
- **PM용 메일**: `[프로젝트명] 청구서 INV-... 결제 기한 경과 (D+N)` — 대시보드 링크 포함, 고객 연락 안내.
- **고객용 메일**: `[프로젝트명] 결제 안내` — 정중한 톤, 청구 금액 + 계좌 정보(`userSettings.bankInfo`).
- **대시보드 링크**: `${DAIRECT_DASHBOARD_BASE_URL}/dashboard/invoices/{invoiceId}` — env 미설정 시 `https://dairect.kr` 폴백, W5와 동일 패턴.
- **PII 방어**: `saveDataErrorExecution: "none"` — 실패 실행에도 pmEmail/clientEmail/금액 저장 금지.
- **D+1 1회만 발송**: `last_overdue_notified_at IS NULL` 필터. 이후 재발송 불가. Phase 5에서 재발송 정책(D+7, D+14) 재검토 예정.

---

## W5 — `portal_feedback.received` → PM 알림 메일 (Task 4-2 M7)

고객이 `/portal/[token]`에서 피드백 제출 시, PM(프로젝트 소유자)의 `businessEmail`로 알림 메일 발송.

### 서버 측 emit (이미 구현)

- 발송 위치: [`src/lib/portal/feedback-actions.ts`](../src/lib/portal/feedback-actions.ts) → INSERT 성공 후 fire-and-forget
- 페이로드:
  ```json
  {
    "event": "portal_feedback.received",
    "version": "1",
    "emitted_at": "ISO",
    "data": {
      "feedbackId": "uuid",
      "projectId": "uuid",
      "projectName": "string",
      "pmEmail": "pm@example.com",
      "messagePreview": "앞 140자",
      "receivedAt": "ISO"
    }
  }
  ```
- **PII 정책**: 토큰 원본/tokenId/clientIp/userAgent는 포함하지 않습니다. 전체 message도 제외(140자 미리보기만) — 상세 확인은 대시보드에서 유도.

### n8n 워크플로 임포트

1. n8n UI → `Workflows` → `⋯` → `Import from File` → [`workflows/W5_portal_feedback_received.json`](workflows/W5_portal_feedback_received.json) 선택 → 저장
2. **Gmail OAuth2 Credentials 연결** (W4와 동일 자격증명 재사용 가능):
   - `Gmail Send` 노드 → Credentials 드롭다운에서 기존 W4 자격증명 선택
   - JSON 내부 `REPLACE_WITH_GMAIL_CREDENTIAL_ID`는 n8n UI에서 자동 치환됨
3. **Dairect env 세팅** (Vercel project settings 또는 `.env.local`):
   ```bash
   N8N_WEBHOOK_URL_PORTAL_FEEDBACK_RECEIVED=https://<n8n>/webhook/dairect/portal-feedback-received
   ```
4. 워크플로 우상단 토글 → `Active`

### 스모크 테스트

`/portal/[token]` 페이지에서 실제 피드백 제출 → n8n Executions 탭에서 확인:
- `Verify HMAC`: `verified=true`
- `Verified & Has pmEmail?`: true 분기
- `Gmail Send`: 200 OK

PM의 `businessEmail`이 비어있으면 `Respond Skipped` 분기로 `no_pm_email` 응답 (정상 동작).

**환경변수 미설정 시**: Dairect 측에서 `n8n_emit_env_missing` warn 로그만 찍고 조용히 no-op (앱 정상 동작).

### W5 내부 동작 (참고)

- HMAC/nonce 검증 로직은 W1/W4와 동일 (`rawBody:true` + `$getWorkflowStaticData` dedupe)
- Compose Email Code 노드에서 `pmEmail`/`projectName`/`messagePreview` 각각 `stripCtrl`/`escHtml` 처리
- 대시보드 링크: `${DAIRECT_DASHBOARD_BASE_URL}/dashboard/projects/{projectId}?tab=feedback` — env 미설정 시 `https://dairect.kr` 폴백. trailing slash 있으면 자동 strip. `encodeURIComponent(projectId)`로 path injection 방어.
- **Workflow Settings 차이**: W5는 `saveDataErrorExecution: "none"` — 실패 실행에도 `pmEmail + messagePreview` PII 저장 금지 (W4는 `all` 기본값). 실패 디버깅은 n8n 에러 트리거 별도 워크플로에서 PII strip 후 로깅 권장.
- **SMTP 헤더 injection 심층 방어**: 서버측 `safeProjectName` (`\r\n\t` strip) + n8n측 `stripCtrl(pmEmail/projectName)` 2중 방어. W1/W4/W5 모두 `stripCtrl` 로직 통일 — `[\u0000-\u001F\u007F]` 제어문자를 공백으로 대체(단어 분리 유지).
