# DB Migrations Workflow — drizzle journal 정합성 유지

> Dairect는 Supabase PostgreSQL + Drizzle ORM을 쓴다. 마이그레이션 파일(`src/lib/db/migrations/*.sql`)과 drizzle 메타 파일(`meta/_journal.json`, `meta/*_snapshot.json`)이 항상 일치하도록 유지해야 한다. 이 문서는 그 규칙과 절차를 정의한다.

## 왜 이게 중요한가

drizzle-kit은 "journal의 마지막 snapshot"을 기준선으로 잡아 **다음 번 diff**를 계산한다. journal이 뒤쳐지면 drizzle은 "이미 cloud에 적용된 변경"을 다시 DDL로 재합성하고, 그 파일을 누군가가 apply하면 **이미 존재하는 테이블/컬럼을 다시 만들려다 실패**하거나 UNIQUE 제약을 **역행 재조정**할 수 있다. 실제로 Phase 5에서 Task 5-2-2h, Task A 두 번의 재동기가 필요했던 이유다.

## 두 가지 적용 경로

### 경로 A — drizzle-kit 먼저 (권장)

```
1. src/lib/db/schema.ts 수정
2. pnpm db:generate
   → src/lib/db/migrations/NNNN_<name>.sql 생성
   → meta/NNNN_snapshot.json 생성
   → meta/_journal.json에 idx 등록 (자동)
3. 생성된 SQL 검토 (위험 DDL이 없는지 — DROP, RLS 역행 등)
4. MCP apply_migration 또는 supabase CLI로 cloud에 적용
5. pnpm db:check → ✅ 확인
```

### 경로 B — MCP apply_migration 먼저 (긴급/RLS/확장 기능)

```
1. MCP apply_migration으로 cloud에 SQL 적용 (예: pg_cron, RLS 정책)
2. src/lib/db/migrations/NNNN_<name>.sql 수동 생성 (위 MCP와 동일 내용)
3. ⚠️ pnpm db:generate 반드시 실행
   → drizzle이 "빠진 변경"을 재합성한 파일을 자동 생성
   → 생성된 파일은 cloud에 이미 적용된 DDL이라 **apply 금지 대상**
4. 생성된 파일을 noop marker로 치환 (0031/0036 패턴 답습):
   a) 파일명을 `NNNN_phase<X>_resync_marker_v<N>.sql`로 rename
      **NNNN = 현재 `migrations/` 디렉터리의 수동 마이그레이션 중 최대 번호 + 1**
      (예: 0035까지 있으면 0036. drizzle이 생성한 번호는 이미 기존 파일과 충돌 중이므로 반드시 재할당)
   b) 내용 전부 삭제 후 주석 + `SELECT '...' AS resync_marker;--> statement-breakpoint` 한 줄만
   c) meta/NNNN_snapshot.json 파일명도 동일 번호로 rename
   d) meta/_journal.json에서 해당 entry의 `idx`/`tag` 수정 (NNNN과 일치)
   e) marker tag는 반드시 `NNNN_phase<X>_resync_marker` 또는 `NNNN_phase<X>_resync_marker_v<N>` 형식 —
      `scripts/check-migrations.mjs`가 이 정규식으로만 마커를 식별한다
5. pnpm db:generate 재실행 → "No schema changes, nothing to migrate 😴"
6. pnpm db:check → ✅ 확인
```

## noop resync marker 패턴

- **언제 쓰는가**: 경로 B에서 여러 마이그레이션이 "cloud에만 적용"된 후 drizzle journal을 복구할 때
- **생긴 모양**: SQL은 한 줄짜리 `SELECT 'marker' AS resync_marker;` 주석만 두꺼움
- **역할**: snapshot만 현재 schema.ts 기준으로 고정 → 이후 drizzle diff 기준선 재수립
- **예시**: `0031_phase5_resync_marker.sql`, `0036_phase5_resync_marker_v2.sql`

## 체크리스트 (경로 B 사용 시 반드시 수행)

MCP apply_migration을 호출한 직후 아래를 **같은 세션에서 연속 실행**한다.

```bash
# 1. drizzle이 빠진 변경을 재합성하도록 강제
pnpm db:generate

# 2. 생성된 파일이 이미 cloud 반영된 DDL인지 확인
cat src/lib/db/migrations/<새로 생성된 파일>

# 3. noop marker 패턴 적용 (SQL 치환 + rename + journal 정합)
#    → docs/db-migrations-workflow.md 경로 B 4단계

# 4. 재검증
pnpm db:generate   # "No schema changes, nothing to migrate 😴" 나와야 함
pnpm db:check      # ✅ migrations 정합성 OK

# 5. 검증 게이트
pnpm tsc --noEmit && pnpm lint
```

## 가드 스크립트

- **`scripts/check-migrations.mjs`**: sql 파일 수/journal entry 정합성 검증
- **호출**: `pnpm db:check`
- **실패 조건**:
  1. `sql 최신 번호 !== journal 마지막 idx` → generate 누락
  2. resync marker 이후 journal에 등록되지 않은 sql 파일 존재 → 재합성 필요

## 관련 이력

- **2026-04-21 — Task 5-2-2h**: 0020~0030이 `apply_migration` 직접 경유로 적용되어 journal drift. `0031_phase5_resync_marker` 도입으로 1차 해소.
- **2026-04-24 — Task A**: 0032~0035 다시 drift. `0036_phase5_resync_marker_v2` 도입 + 본 문서 + `db:check` 스크립트로 제도적 재발 방지.

## 금지 사항

- ❌ `db:push` 직접 사용 (drizzle-kit push는 journal 건너뛰고 schema.ts → cloud 직접 push — Dairect는 migration 파일 기반으로만 운영)
- ❌ 생성된 재합성 SQL을 그대로 cloud에 재적용 (이미 반영된 DDL이라 실패)
- ❌ journal `idx` 임의 삭제/재배열 — 반드시 rename + idx 보정만
