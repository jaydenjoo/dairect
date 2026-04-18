# Dairect n8n 연동 가이드

Phase 3 · Task 3-5 Option B 범위 워크플로우 2종.

## 전체 구조

```
Dairect Next.js (Server Action)
  └─ emitN8nEvent(...) ── POST JSON ──▶  n8n Webhook (self-hosted)
                                           └─ HMAC 검증 ─ If ─ Slack/Gmail
```

- **W1** `project.status_changed` → Slack 알림
- **W4** `project.completed` → 고객사 완료 안내 메일 (Gmail)

구현 파일:
- 서버측: [`src/lib/n8n/client.ts`](../src/lib/n8n/client.ts), [`src/app/dashboard/projects/actions.ts`](../src/app/dashboard/projects/actions.ts)
- n8n 워크플로우: [`workflows/W1_project_status_changed.json`](workflows/W1_project_status_changed.json), [`workflows/W4_project_completed.json`](workflows/W4_project_completed.json)

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

# HMAC 공유 시크릿 (32바이트 이상 랜덤 권장: `openssl rand -hex 32`)
N8N_WEBHOOK_SECRET=<random_hex_32_bytes>
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

- **W2** `invoice.overdue` 일 1회 크론 — cron 도입 후 Task 3-5 재개 시 추가
- **W3** weekly reports 금요일 크론 — 동일
- **관찰성**: `activity_logs`에 webhook emit 기록 남기기 (silent failure 가시화)
- **대시보드 발송 이력 UI**: 고객사별 메일/알림 발송 로그
