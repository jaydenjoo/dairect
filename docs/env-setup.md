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

---

## 권장 입력 순서

1. **먼저 5개 필수 env 모두 입력** → Vercel Redeploy → 빌드 통과 확인
2. **n8n 워크플로 구축 후** Webhook URL + HMAC secret 추가 (선택)
3. **도메인 연결** (`dairect.kr`) 완료 후 `NEXT_PUBLIC_APP_URL`을 production 도메인으로 갱신
