# Dairect Phase 5.0 — Multi-tenant ERD

> **상태**: 초안 (2026-04-20) · **2026-04-24 업데이트**: Phase 5.5 Billing 취소 반영
> **범위**: Phase 5.0 Epic 5-1 Data Model 착수 전 설계 정렬용
> **관련**: [PRD-phase5.md](./PRD-phase5.md) 섹션 4 Epic 5-1 / 섹션 10 후속 결정
> **성격**: 설계 초안 — 최종 스키마 아님. Drizzle 소스 자동 변환 X

> ⛔ **2026-04-24 업데이트**: Phase 5.5 Billing / SaaS 구독 취소.
> `workspaces.subscription_status` / `workspaces.stripe_customer_id` / `workspace_settings.plan` 컬럼은
> **DB에 유지하되 읽지 않는다** (재도입 여지 남김 — Jayden 결정 2 "B안"). 본 ERD에 `(deprecated 2026-04-24, DB 보존)` 표시.

---

## 1. 개요

Phase 5.0은 Dairect를 **single-user → multi-tenant workspace** 모델로 전환한다. 이 문서는 Epic 5-1 Data Model의 스키마 설계 의도를 시각화한다.

### 변경 요약

- **신규 4 테이블**: `workspaces` / `workspace_members` / `workspace_invitations` / `workspace_settings` (A1 독립 테이블 결정, 2026-04-20)
- **`workspace_id` NOT NULL 컬럼 추가 (12 테이블)**: `projects` / `milestones` / `clients` / `client_notes` / `leads` / `estimates` / `estimate_items` / `contracts` / `invoices` / `activity_logs` / `briefings` / `portal_tokens`
- **제외 (간접 격리 또는 글로벌)**:
  - `users` — 글로벌 인증 단위 (workspace_members 통해 연결)
  - `user_settings` — UI 설정(dark mode 등) + AI 카운터만 유지. 사업자 정보 14필드는 `workspace_settings` 독립 테이블로 이전 (A1 결정)
  - `inquiries` — 랜딩 공개 폼 입력 (workspace 소속 없음, 운영자 global scope)
  - `weekly_reports` — `projectId` 통해 간접 격리 (프로젝트 삭제 시 CASCADE)
  - `portal_feedbacks` — `projectId` 통해 간접 격리

### 📌 결정 완료 (2026-04-20)

| 항목 | 결정 | 반영 섹션 |
|------|------|-----------|
| `workspace_settings` 구조 | **A1 독립 테이블 1:1** | 섹션 3-4 신설 |
| 초대 만료 TTL | **7일** (Linear/Notion/Figma 표준, 14일 연장 옵션 별도) | 섹션 3-3 |
| Member write 범위 | **C2 프로젝트 범위** (자기 생성 project + 하위 엔티티 write) | 섹션 6-2 |

### 📌 플레이스홀더 (⚠️ 섹션 10 결정 대기)

| 항목 | 옵션 | 결정 시점 |
|------|------|-----------|
| Admin 계정 부여 | env `ADMIN_EMAILS` / `users.is_platform_admin` | Phase 5.0 유지 (5.5 취소됨) |
| ~~`subscription_status` 도입 시점~~ | ~~Phase 5.0 컬럼 선추가 / Phase 5.5 때 추가~~ | ⛔ 폐기 2026-04-24 (Billing 취소, 컬럼은 DB 보존) |

---

## 2. ERD (Mermaid)

핵심 관계만 시각화. 전체 컬럼 상세는 섹션 3 참조.

```mermaid
erDiagram
    users ||--o{ workspace_members : "has"
    users ||--o{ workspace_invitations : "invited_by"
    workspaces ||--|| workspace_settings : "has_settings"
    workspaces ||--o{ workspace_members : "includes"
    workspaces ||--o{ workspace_invitations : "issues"
    workspaces ||--o{ projects : "owns"
    workspaces ||--o{ clients : "owns"
    workspaces ||--o{ estimates : "owns"
    workspaces ||--o{ invoices : "owns"
    workspaces ||--o{ activity_logs : "scopes"

    clients ||--o{ projects : "has"
    projects ||--o{ milestones : "has"
    projects ||--o{ estimates : "has"
    projects ||--o{ invoices : "has"
    projects ||--o{ portal_tokens : "has"
    projects ||--o{ portal_feedbacks : "receives (indirect)"
    estimates ||--o{ estimate_items : "has"
    estimates ||--o{ contracts : "derives"
    estimates ||--o{ invoices : "splits_to"

    workspaces {
        uuid id PK
        text name
        text slug UK
        text subscription_status "⛔ deprecated 2026-04-24 (DB 보존)"
        text stripe_customer_id "⛔ deprecated 2026-04-24 (DB 보존)"
        timestamp created_at
        timestamp deleted_at "soft delete"
    }

    workspace_settings {
        uuid workspace_id PK_FK "1:1"
        text company_name
        text representative_name
        text business_number
        text business_address
        text business_phone
        text business_email
        text estimate_number_prefix
        bigint daily_rate
        jsonb payment_split
        jsonb feature_presets
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        text role "owner|admin|member"
        timestamp joined_at
    }

    workspace_invitations {
        uuid id PK
        uuid workspace_id FK
        text email
        text role "owner|admin|member"
        text token UK
        uuid invited_by FK
        timestamp expires_at "발급 +7일"
        timestamp accepted_at
        timestamp revoked_at
    }

    users {
        uuid id PK
        text email UK
        text name
        text avatar_url
        timestamp created_at
    }

    projects {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid user_id FK "보존 (created_by 의미)"
        uuid client_id FK
        text name
        text status "lead~closed enum"
        bigint contract_amount
        boolean is_public
        timestamp deleted_at
    }

    clients {
        uuid id PK
        uuid workspace_id FK "신규"
        text company_name
        text contact_name
        text email
        text status
    }

    estimates {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid project_id FK
        uuid client_id FK
        text estimate_number "workspace 단위 UNIQUE"
        bigint total_amount
        text status
    }

    invoices {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid project_id FK
        text invoice_number "workspace 단위 UNIQUE"
        text type "advance|interim|final"
        text status
        bigint total_amount
        date due_date
    }

    milestones {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid project_id FK
        text title
        boolean is_completed
        date due_date
    }

    estimate_items {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid estimate_id FK
        text name
        decimal man_days
    }

    activity_logs {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid user_id FK
        uuid project_id FK
        text action
        jsonb metadata
    }

    portal_tokens {
        uuid id PK
        uuid workspace_id FK "신규"
        uuid project_id FK
        text token UK
        timestamp expires_at
        timestamp revoked_at
    }

    portal_feedbacks {
        uuid id PK
        uuid project_id FK "projectId 상속 격리"
        uuid token_id FK
        text message
        boolean is_read
    }
```

---

## 3. 신규 4 테이블 — 핵심 컬럼 상세

### 3-1. `workspaces`

```
id                   uuid PK (gen_random_uuid)
name                 text NOT NULL
slug                 text UNIQUE NOT NULL        -- URL-safe 식별자 (예: /invite/[token] 라우팅에 사용)
subscription_status  text DEFAULT 'free'           -- ⛔ deprecated 2026-04-24 (DB 보존, 읽지 않음)
stripe_customer_id   text                          -- ⛔ deprecated 2026-04-24 (DB 보존, 읽지 않음)
created_at           timestamp DEFAULT now()
updated_at           timestamp
deleted_at           timestamp                     -- soft delete (30일 유예, R7)
```

- **인덱스**: `slug` UNIQUE, `deleted_at IS NULL` 부분 인덱스
- **CHECK**: `subscription_status IN ('free', 'active', 'past_due', 'canceled', 'paused')` — ⛔ deprecated 2026-04-24 (CHECK 제약 유지, 컬럼 읽지 않음)
- **설정 필드는 `workspace_settings` 독립 테이블로 분리** (섹션 3-4, A1 결정)

### 3-2. `workspace_members`

```
id                   uuid PK
workspace_id         uuid FK → workspaces(id) ON DELETE CASCADE
user_id              uuid FK → users(id) ON DELETE CASCADE
role                 text NOT NULL                 -- 'owner'|'admin'|'member'
joined_at            timestamp DEFAULT now()
```

- **UNIQUE**: `(workspace_id, user_id)` — 한 user는 한 workspace에 1회만
- **CHECK**: `role IN ('owner', 'admin', 'member')`
- **추가 제약**: workspace당 `role='owner'` 최소 1명 보장 (R7 — 트리거 또는 앱 레이어)

### 3-3. `workspace_invitations`

```
id                   uuid PK
workspace_id         uuid FK → workspaces(id) ON DELETE CASCADE
email                text NOT NULL                 -- 초대 대상 (가입 전일 수 있음)
role                 text NOT NULL                 -- 수락 시 부여될 역할
token                text UNIQUE NOT NULL          -- crypto.randomUUID() (W5 portal_tokens 패턴 재사용)
invited_by           uuid FK → users(id)
expires_at           timestamp NOT NULL            -- 발급 시점 + 7일 (2026-04-20 결정). 14일 연장 옵션은 별도 Task
accepted_at          timestamp                     -- NULL=대기, NOT NULL=수락 완료
revoked_at           timestamp                     -- 취소 시 기록
created_at           timestamp DEFAULT now()
```

- **부분 인덱스**: `(workspace_id, email) WHERE accepted_at IS NULL AND revoked_at IS NULL` — 같은 email 중복 초대 방어
- **UNIQUE**: `token` (W5 portal_tokens 파생 패턴)

### 3-4. `workspace_settings` (A1 독립 테이블, 2026-04-20 결정)

```
workspace_id            uuid PK FK → workspaces(id) ON DELETE CASCADE  -- 1:1 관계, PK=FK

-- 사업자 정보 (견적서/계약서/청구서 PDF에 자동 삽입)
company_name            text
representative_name     text
business_number         text
business_address        text
business_phone          text
business_email          text
bank_info               jsonb                     -- 계좌번호/은행명/예금주 (구조 유연성)

-- 견적서 기본값 (Task 2-1 user_settings에서 이전)
estimate_number_prefix  text DEFAULT 'EST'
contract_number_prefix  text DEFAULT 'CON'
invoice_number_prefix   text DEFAULT 'INV'
daily_rate              bigint DEFAULT 700000
payment_split           jsonb DEFAULT '[{"label":"착수금","percentage":30},{"label":"중도금","percentage":40},{"label":"잔금","percentage":30}]'
feature_presets         jsonb DEFAULT '[]'

created_at              timestamp DEFAULT now()
updated_at              timestamp
```

- **`workspace_id` PK=FK 패턴**: 1:1 관계. workspace 생성 시 자동 row 생성(트리거 or 앱 레이어)
- **user_settings에서 이전되는 필드 14개**: 사업자 정보 7 + 견적 기본값 5 + payment_split + feature_presets
- **`user_settings` 잔존 필드**: UI 설정 (dark mode 등) + AI 카운터 2개 (aiDailyCallCount/aiLastResetAt) + lastWeeklySummarySentAt → user 단위 유지
- **RLS**: `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())` — workspace 멤버 전원 read, owner/admin만 write

---

## 4. 기존 12 테이블 — `workspace_id` 추가 전략

```sql
-- Task 5-1-2: NULLABLE 추가 (backfill 전단계)
ALTER TABLE projects ADD COLUMN workspace_id uuid REFERENCES workspaces(id);
-- (12개 테이블 반복)

-- Task 5-1-3: default workspace 생성 + 일괄 UPDATE
INSERT INTO workspaces (id, name, slug) VALUES (default_ws_id, 'Default', 'default');
INSERT INTO workspace_members (workspace_id, user_id, role)
  SELECT default_ws_id, id, 'owner' FROM users;
UPDATE projects SET workspace_id = default_ws_id WHERE workspace_id IS NULL;
-- (12개 테이블 반복)

-- Task 5-1-4: NOT NULL 전환 + FK 강제
ALTER TABLE projects ALTER COLUMN workspace_id SET NOT NULL;
```

### 각 테이블의 `workspace_id` 추가 근거

PRD-phase5.md Epic 5-1은 **12개 전체 직접 추가** 결정. 일부 테이블(milestones/client_notes/estimate_items/portal_tokens)은 상위 엔티티(project/client/estimate)의 `workspace_id`를 상속받는 "간접 격리"도 이론상 가능하나, 아래 이유로 **모두 직접 추가**한다.

| 테이블 | 직접 추가 근거 |
|--------|----------------|
| `projects` | 대시보드 조회 핵심 필터 |
| `milestones` | dashboard-actions.ts `getUpcomingDeadlines` JOIN 대신 직접 필터 가능 → 쿼리 단순화 |
| `clients` | 고객 CRM workspace 격리 |
| `client_notes` | 메모 조회 시 JOIN 회피 |
| `leads` | 리드 CRM workspace 격리 |
| `estimates` | 견적 목록 workspace 격리 |
| `estimate_items` | 견적 항목 대량 JOIN 회피 (견적 1건당 수십 row) |
| `contracts` | 계약 목록 workspace 격리 + 채번 UNIQUE 재조정 |
| `invoices` | W2 cron workspace별 필터 핵심 |
| `activity_logs` | 감사 로그 workspace 스코프 조회 |
| `briefings` | 대시보드 홈 workspace별 조회 (briefings는 사용자 개인일 가능성 → 섹션 10 결정 대기) |
| `portal_tokens` | 포털 토큰 조회 시 workspace 컨텍스트로 필터 |

**"모두 직접 추가"의 이점**:
1. JOIN 없이 단일 WHERE로 RLS 필터링 → 성능 유리
2. 복합 인덱스 `(workspace_id, created_at)` 활용 가능
3. 프로젝트 이관 기능 추후 도입 시 `workspace_id` 독립 수정 가능

**제외 테이블 (간접 격리로 충분)**:
- `portal_feedbacks` — `projectId` 통해 상속 (포털 토큰으로 격리 완결)
- `weekly_reports` — `projectId` 통해 상속 (PRD-phase5.md "사용 안 하면 삭제 고려" 대상)

---

## 5. 인덱스 + UNIQUE 전략

### 5-1. 워크스페이스 스코프 복합 인덱스

```sql
-- 대시보드 조회 패턴: WHERE workspace_id = ? ORDER BY created_at DESC
CREATE INDEX projects_workspace_created_idx ON projects(workspace_id, created_at DESC);
CREATE INDEX invoices_workspace_status_idx ON invoices(workspace_id, status)
  WHERE status IN ('pending', 'sent', 'overdue');
CREATE INDEX activity_logs_workspace_created_idx ON activity_logs(workspace_id, created_at DESC);
```

### 5-2. 채번 UNIQUE 재조정 (user 단위 → workspace 단위)

```sql
-- 기존: contracts(userId, contractNumber) UNIQUE
-- 신규: contracts(workspaceId, contractNumber) UNIQUE
ALTER TABLE contracts DROP CONSTRAINT contracts_user_number_unique;
ALTER TABLE contracts ADD CONSTRAINT contracts_workspace_number_unique
  UNIQUE(workspace_id, contract_number);

-- invoices 동일
-- briefings(userId, weekStartDate) → (workspaceId, weekStartDate)  또는 유지
--   └ briefings는 "사용자별 개인 브리핑" 성격이면 userId 유지, "workspace 공용"이면 workspaceId로 교체
--   └ ⚠️ 결정 필요 (섹션 10 권한 매트릭스와 연계)
```

### 5-3. workspace_members 중복 방어

```sql
CREATE UNIQUE INDEX workspace_members_unique ON workspace_members(workspace_id, user_id);
```

### 5-4. 활성 초대 중복 방어

```sql
CREATE UNIQUE INDEX workspace_invitations_pending_idx
  ON workspace_invitations(workspace_id, email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
```

---

## 6. RLS 정책 요약

> PRD-phase5.md 섹션 4 Epic 5-1 "RLS 정책 재작성" 항목. 총 **12 테이블 × 4 policy (SELECT/INSERT/UPDATE/DELETE) = 48개**.

### 6-1. 공통 패턴 (예: `projects`)

```sql
-- 조회: 자기 workspace 멤버만
CREATE POLICY projects_select ON projects FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- 쓰기 (INSERT/UPDATE/DELETE): role 기반 제한
CREATE POLICY projects_write ON projects FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
  OR (user_id = auth.uid() AND workspace_id IN (
    -- member는 자기 생성 프로젝트만 write
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND role = 'member'
  ))
);
```

### 6-2. 역할 매트릭스 (C2 프로젝트 범위 확정, 2026-04-20)

| 역할 | 결제 | 멤버 관리 | workspace_settings write | 데이터 write | 데이터 read |
|------|------|----------|--------------|--------------|-------------|
| Owner | ✅ | ✅ | ✅ | ✅ 전체 | ✅ 전체 |
| Admin | ❌ | ✅ | ✅ | ✅ 전체 | ✅ 전체 |
| Member | ❌ | ❌ | ❌ | 자기 생성 project + 하위 엔티티* | ✅ 전체 |

**Member write 상세 (C2)**:
- ✅ write 가능: 자기 생성 `projects` + 해당 project의 `milestones` / `estimates` / `estimate_items` / `contracts` / `invoices` / `activity_logs` / `portal_tokens`
- ✅ write 가능 (자기 작성만): `client_notes` (작성자 = 자기일 때만 update/delete)
- ❌ write 금지: 다른 멤버가 만든 projects/clients + workspace_settings + members 관리
- **베타 피드백 반영 여지**: 2~3명 베타 실사용 후 완화(workspace 모든 프로젝트 write) or 강화(C1 최소 write)

**RLS 정책 패턴 (Member용)**:
```sql
CREATE POLICY milestones_write_member ON milestones FOR ALL USING (
  project_id IN (
    SELECT id FROM projects
    WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    AND (
      -- owner/admin은 모든 project
      EXISTS (SELECT 1 FROM workspace_members WHERE user_id = auth.uid()
              AND workspace_id = projects.workspace_id
              AND role IN ('owner', 'admin'))
      -- member는 자기 생성 project만
      OR projects.user_id = auth.uid()
    )
  )
);
```

### 6-3. 간접 격리 테이블 RLS

```sql
-- milestones: projects 경유 격리
CREATE POLICY milestones_select ON milestones FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
);
```

### 6-4. 검증 전략 (R2 완화)

1. 12 테이블 × 4 policy 체크리스트 (pass/fail)
2. Playwright E2E: A workspace 세션으로 B workspace 데이터 접근 → 0건 확인 (Task 5-1-8)
3. security-reviewer 2회 리뷰 — RLS 작성 직후 + E2E 이후

---

## 7. 마이그레이션 순서 (Task 5-1-1 → 5-1-8)

```
5-1-1 스키마 생성 (workspaces/members/invitations/settings 4 테이블)
      ├─ workspaces 테이블 + CHECK (subscription_status — ⛔ deprecated 2026-04-24, 컬럼 보존)
      ├─ workspace_members 테이블 + UNIQUE (workspace_id, user_id) + CHECK (role)
      ├─ workspace_invitations 테이블 + 부분 인덱스 + 7일 TTL 기본
      └─ workspace_settings 테이블 (A1 독립 1:1) + 기본값 (EST/CON/INV prefix, 700000 daily_rate 등)

5-1-2 12개 테이블에 workspace_id NULLABLE 추가
      └─ FK (ON DELETE RESTRICT) 설정, 아직 NOT NULL 아님

5-1-3 default workspace 생성 + 기존 data 일괄 backfill
      ├─ INSERT workspaces('Default', 'default')
      ├─ INSERT workspace_members (user_id, owner)
      └─ UPDATE 12 테이블 SET workspace_id = default_ws_id

5-1-4 workspace_id NOT NULL 전환 + FK 강제
      └─ 롤백 시 CASCADE 필수 (PRD-phase5.md R1 참조)

5-1-5 RLS 전면 재작성 (48 policy)
      ├─ 각 테이블 ENABLE ROW LEVEL SECURITY
      ├─ SELECT/INSERT/UPDATE/DELETE policy 4종
      └─ 간접 격리 테이블 (milestones/estimate_items 등) 4종

5-1-6 Drizzle query helper `withWorkspace(query, wsId)` 도입
      └─ 모든 쿼리가 workspace_id 필터 자동 주입 (앱 레이어 2중 방어)

5-1-7 Server Actions workspace scope 가드 추가
      └─ `getCurrentWorkspace()` helper + 매 Action 첫 줄 호출

5-1-8 E2E cross-workspace 누출 공격 (Playwright)
      └─ A workspace 세션 → B workspace URL → 0건 or 404 확인
```

---

## 8. 미해결 / 섹션 10 크로스 레퍼런스

이 ERD는 다음 항목이 **섹션 10에서 확정된 후** 최종본으로 갱신된다:

| ERD 영향 | 섹션 10 결정 항목 | 영향 범위 |
|----------|-------------------|-----------|
| Admin 계정 부여 방식 | env `ADMIN_EMAILS` / DB `users.is_platform_admin` flag | Phase 5.0 유지 (5.5 취소됨) |
| ~~`subscription_status` 도입 시점~~ | ~~Phase 5.0 컬럼 선추가 / Phase 5.5 때 추가~~ | ⛔ 폐기 2026-04-24 (컬럼은 DB 보존) |
| Workspace picker UX | dropdown / 사이드바 panel | Epic 5-2 착수 전 |
| Multi-workspace 기본 선택 | 마지막 접속 workspace / 알파벳 순 / 대시보드 설정 | Epic 5-2-3 |

**결정 완료 (2026-04-20)**: `workspace_settings` 구조(A1 독립 테이블) / 초대 TTL(7일) / Member write 범위(C2 프로젝트 범위) → 본 ERD 반영됨.

**briefings UNIQUE 키 후속 결정**: 현재 `(userId, weekStartDate)` UNIQUE. Member write 범위 C2 결정에 따라 briefings는 **"사용자 개인 브리핑"** 성격으로 유지 → userId 유지 (workspace 격리는 SELECT 시 JOIN). 섹션 5-2 업데이트 불필요.

---

## 9. 참고 문서

- [PRD-phase5.md](./PRD-phase5.md) — Phase 5 PRD v4.0 (요구사항 정의)
- [PRD.md](./PRD.md) — v3.1 통합 PRD (Phase 0~4 + Phase 5 링크)
- `src/lib/db/schema.ts` — 현재 Drizzle 스키마 (17 테이블)
- `src/lib/db/migrations/` — 마이그레이션 이력 (0001~0016)

---

**다음 단계**:
1. ✅ Jayden 리뷰 + 3개 결정 확정 (A1/B1/C2, 2026-04-20)
2. Epic 5-1 Task 5-1-1 착수 → 이 ERD를 Drizzle 스키마로 구현
3. 남은 섹션 10 결정 항목(Admin 방식 / ~~subscription_status 도입~~ ⛔ 폐기 / Workspace picker UX / Multi-workspace 기본 선택)은 각 Epic 착수 시점에 확정
