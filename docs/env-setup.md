# 환경변수 세팅 가이드

> Dairect 배포에 필요한 모든 환경변수.
> Vercel: Project Settings → Environment Variables 에 아래 키-값을 그대로 입력 (Production + Preview 모두 적용 권장).
> 로컬: 프로젝트 루트에 `.env.local` 파일 직접 생성 후 실제 값 채우기. `.env.local`은 `.gitignore`의 `.env*` 패턴으로 자동 git 제외.

---

## 🔴 필수 — 누락 시 빌드/런타임 실패

### `DATABASE_URL`
Supabase production DB connection string.

- **출처**: Supabase Dashboard → Project Settings → Database → Connection string
- **권장**: Transaction Mode (Pooler, **port 6543**) — Vercel serverless 호환 + connection pool 고갈 방어
- **형식**:
  ```
  postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
  ```

### `NEXT_PUBLIC_SUPABASE_URL`
Supabase 프로젝트 base URL (클라이언트 노출 — Auth/Realtime/Storage 클라이언트가 사용).

- **출처**: Supabase Dashboard → API Settings → Project URL
- **형식**: `https://YOUR_PROJECT_REF.supabase.co`

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
Supabase anon/public key (클라이언트 노출, RLS로 권한 격리).

- **출처**: Supabase Dashboard → API Settings → Project API keys → `anon` `public`
- **형식**: `eyJhbGciOi...` (JWT 형태)

### `NEXT_PUBLIC_APP_URL`
앱 origin URL — 포털 링크 생성, 이메일 본문, 메타 태그 등에 사용.

- **Production**: `https://dairect.kr` (또는 Vercel 자동 도메인 `https://dairect.vercel.app`)
- **Preview**: Vercel preview 자동 URL (`https://YOUR_PROJECT-git-BRANCH-USERNAME.vercel.app`)
- 끝 슬래시 **없이** 입력

### `ANTHROPIC_API_KEY`
Anthropic Claude API 키 (AI 견적 초안 / 주간 브리핑 / 주간 보고서).

- **출처**: console.anthropic.com → API Keys → Create Key
- **형식**: `sk-ant-api03-...`
- **주의**: 일일 한도 50회 (`src/lib/ai/...` 정책). 한도 초과 시 사용자에게 친절 안내 메시지 노출.

### `RESEND_API_KEY` (production 필수)
Resend 트랜잭션 메일 API 키 (Phase 5 멤버 초대 이메일).

- **출처**: resend.com → API Keys → Create API Key
- **권한**: **반드시 "Sending access"만** 선택 (Full access 금지 — Phase 5.5 보안 강화 항목, 아래 [Resend key 권한 분리](#resend-key-권한-분리-phase-55-보안-강화) 참조)
- **형식**: `re_...`
- **production 필수**: 부팅 시점 `src/lib/env.ts`에서 NODE_ENV=production일 때 누락이면 server start 차단

### `RESEND_FROM_EMAIL` (production 필수)
Resend가 verified한 발신자 이메일 주소.

- **현재값(2026-04-22 verified)**: `invite@send.dairect.kr`
- **형식 주의**: 주소만 입력 (`invite@send.dairect.kr`). `"Name <email>"` 형식은 dotenv 따옴표 leak 사고 발생 이력이 있어 사용 시 Vercel UI 입력 시 따옴표 절대 포함 금지 — 권장은 주소만.
- **Vercel 입력 시 주의**: `.env.local` 안내에 적힌 따옴표(`"..."`)는 shell escape용. **Vercel Environment Variables UI에는 따옴표 없이 raw 값만 입력**. 따옴표가 값 일부로 저장되면 Resend API가 from 파싱 거부 → 발송 전면 실패.

---

## 🟡 옵션 — 기능 활성 시만 입력

### `RESEND_REPLY_TO`
수신자가 "답장" 클릭 시 도착할 주소 (verified 불필요, Gmail 등 외부 가능).

- **현재값**: `hidream72@gmail.com`
- **형식**: 단순 이메일 주소 (`user@domain.com`)
- **누락 시**: 답장이 발신자 주소(`invite@send.dairect.kr`)로 가서 무시될 수 있음

### `CRON_SECRET`
Vercel Cron 호출 인증 시크릿 (`/api/cron/*` 보호).

- **출처**: 직접 생성. `openssl rand -hex 32`
- **누락 시**: Cron 엔드포인트가 401 반환. 미설정이면 Vercel Cron 자체 비활성.

---

## 🛡️ Resend key 권한 분리 (Phase 5.5 보안 강화)

**원칙**: 발급한 API key는 **최소 권한 원칙**(Principle of Least Privilege)에 따라 "이메일 발송"만 가능한 권한으로 제한.

### 왜 분리하는가
- **Full access key가 leak되면**: 도메인 추가/삭제, 다른 API key 회전, audience(연락처 목록) 다운로드, 팀 멤버 변경까지 가능 → Resend 계정 자체 탈취 위험
- **Sending access key가 leak되면**: 발송 spam만 가능 → leak 발견 시 key 즉시 revoke + 새 key 발급으로 1분 내 차단

### 분리 절차 (Jayden 수동, 5분)
1. **resend.com → API Keys → "Create API Key"**
2. Name: `dairect-prod-sending` 또는 환경 명확히 식별 가능한 이름
3. **Permission: "Sending access" 선택** (Full access 아님)
4. **Domain: `send.dairect.kr` 선택** (도메인 단위 제한 — 다른 도메인 발송도 차단)
5. Create → key 1회만 표시되므로 **즉시 복사**
6. **Vercel** → Project Settings → Environment Variables → `RESEND_API_KEY` 값 교체 → Save → **Redeploy 클릭** (Save만으론 warm Lambda가 구 값 유지)
7. **검증**: `/dashboard/members`에서 본인 이메일로 테스트 초대 1건 발송 → 수신 확인
8. **기존 Full access key revoke**: resend.com → API Keys → 기존 key → Revoke (검증 성공 확인 후)

### 주기적 회전 권장
- 분기 1회 또는 의심 사고 시 새 key 발급 → env 교체 → Redeploy → 구 key revoke
- Vercel 배포 로그/Resend Sending Logs에서 "구 key 사용 중인 함수 없음" 확인 후 revoke

---

## 🛡️ 환경변수 startup 검증 (Phase 5.5)

`src/lib/env.ts` + `src/instrumentation.ts`가 server start 시점에 모든 필수 env를 Zod로 검증.

- **누락 시**: server 부팅 자체가 차단됨 + 한국어 에러 메시지로 어떤 env가 어떤 이유로 누락됐는지 명시.
- **production 추가 검증**: NODE_ENV=production이면 `RESEND_API_KEY` + `RESEND_FROM_EMAIL`도 강제.
- **효과**: "첫 요청 처리 중 500 에러" 대신 "배포 단계에서 즉시 인지" → 다운타임 0.

검증 출력 예시:
```
[env] 환경변수 검증 실패 (NODE_ENV=production):
  - RESEND_API_KEY: production 필수 — Resend Sending Access key (멤버 초대 이메일 발송)
  - NEXT_PUBLIC_APP_URL: 앱 베이스 URL — 초대/포털 링크 생성에 사용

해결: .env.local(개발) 또는 Vercel Project Settings → Environment Variables(배포)에 누락된 값을 추가하고 dev 서버 재시작 또는 Vercel Redeploy를 실행하세요.
```

---

## 🟡 옵션 — n8n 워크플로 활성 시만 입력

### `N8N_WEBHOOK_SECRET`
HMAC 서명 검증 시크릿 (n8n의 Verify HMAC 노드와 **반드시 동일 값**).

- **출처**: 직접 생성. 32바이트 이상 random hex 권장:
  ```bash
  openssl rand -hex 32
  ```
- **누락 시**:
  - production 환경: n8n emit 자체가 거부됨 (안전 fail-fast)
  - 개발 환경: 경고만 출력 후 emit 시도 (디버그 편의)

### Webhook URL — 워크플로별 별도 키
각 워크플로가 활성화될 때만 해당 URL 입력. **미입력 시 해당 emit이 자동 no-op** (본 비즈니스 흐름은 정상 동작).

| 환경변수 | 워크플로 | 트리거 |
|---------|---------|--------|
| `N8N_WEBHOOK_URL_PROJECT_STATUS_CHANGED` | W1 — 프로젝트 상태 변경 알림 | dashboard 프로젝트 상태 변경 시 Slack 알림 |
| `N8N_WEBHOOK_URL_PROJECT_COMPLETED` | W4 — 프로젝트 완료 보고 | 프로젝트 status=completed 시 Gmail 자동 발송 |
| `N8N_WEBHOOK_URL_PORTAL_FEEDBACK_RECEIVED` | W5 — 포털 피드백 알림 | 고객이 portal에서 피드백 제출 시 PM에게 Gmail 알림 |

- **출처**: n8n → 각 워크플로 → Webhook 노드 → "Production URL" 복사

---

## 자동 설정 (입력 불필요)

- `NODE_ENV` — Next.js가 자동 설정 (`development` / `production`)
- `NEXT_PHASE` — Next.js가 빌드/런타임 단계 자동 설정
- `VERCEL_*` — Vercel 플랫폼이 자동 주입 (region, deployment URL 등)

---

## 🚨 빌드 실패 트러블슈팅

### `Error: DATABASE_URL is not set` → "Failed to collect page data for /projects"
- **원인**: `/projects` 같은 ○ Static 페이지가 빌드 시점에 prerender되며 db 모듈을 import. `src/lib/db/index.ts`가 `process.env.DATABASE_URL`이 없으면 즉시 throw.
- **해결**: Vercel Environment Variables에 `DATABASE_URL` 입력 후 Redeploy.

### `Error: ANTHROPIC_API_KEY is not set` (런타임)
- AI 기능 호출 시 발생. AI 미사용이면 무시 가능. 사용 시 Vercel env에 입력.

### Vercel Preview URL이 portal 이메일에 잘못 노출
- `NEXT_PUBLIC_APP_URL`이 production 환경에서도 preview URL로 박힌 경우.
- Production env는 `https://dairect.kr` 명시. Preview env는 비워서 `window.location.origin` fallback 사용.

### `Resend API error: validation_error` (production)
- **원인 1 (가장 흔함)**: `RESEND_FROM_EMAIL` 값에 따옴표가 포함됨 (`"Dairect <invite@send.dairect.kr>"` 전체가 값으로 저장). Vercel UI는 입력 그대로 raw 저장 — 따옴표를 제거하고 Save → **Redeploy** 필수.
- **원인 2**: `RESEND_FROM_EMAIL` 도메인이 verified 안 됨. resend.com → Domains에서 상태 확인.
- **원인 3 (sandbox)**: `RESEND_FROM_EMAIL=onboarding@resend.dev`로 두면 본인 이메일만 수신 가능.

### `[env] 환경변수 검증 실패` (부팅 차단)
- Phase 5.5 startup 검증이 정상 작동한 결과. 메시지에 명시된 env를 추가하고 Redeploy.
- 어떤 env가 어떤 환경(dev/prod)에서 필요한지 메시지 자체가 안내.

---

## 권장 입력 순서

1. **먼저 5개 필수 env 모두 입력** → Vercel Redeploy → 빌드 통과 확인
2. **n8n 워크플로 구축 후** Webhook URL + HMAC secret 추가 (선택)
3. **도메인 연결** (`dairect.kr`) 완료 후 `NEXT_PUBLIC_APP_URL`을 production 도메인으로 갱신
