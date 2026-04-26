# projects.public* 컬럼 Deprecation + DROP 계획

> **상태**: Audit 완료 (2026-04-26) · 본격 cleanup 다음 세션 진행
> **소요 견적**: 총 3시간 (5 Phase 분할)
> **위험도**: 🟢 매우 낮음 (실 데이터 0건 — 테스트 더미 1개만 손실)

---

## 1. 배경

Epic Portfolio v2 (2026-04-25) 에서 "옵션 B 분리"를 채택하여 `portfolio_items` 별도 테이블을 도입했음. 이때 `projects` 의 기존 `public*` 컬럼은 **deprecated 표시만 하고 즉시 삭제하지 않기로** 결정 (데이터 보존 + 다음 단계 정리).

본 문서는 그 **"다음 단계 정리"** 의 audit 결과 + 단계별 cleanup plan.

### Deprecated 컬럼 7개 (projects 테이블)

| 컬럼 | 타입 | 용도 (legacy) | 후계 (portfolio_items) |
|---|---|---|---|
| `is_public` | boolean | 공개 토글 | `is_public` (동명, 별 테이블) |
| `public_alias` | text | 공개용 별칭 | `name` (별 테이블) |
| `public_description` | text | 공개용 설명 | `desc_ko` / `desc_en` |
| `public_tags` | text[] | 공개용 태그 | `tags` |
| `public_screenshot_url` | text | 공개 스크린샷 | `cover_url` |
| `public_live_url` | text | 라이브 URL | `live_url` |
| `portfolio_meta` | jsonb | 부가 메타 | (대체 컬럼들) |

---

## 2. Audit 결과 (Cloud DB · 2026-04-26 기준)

### 2-1. DB 실제 데이터

```sql
SELECT
  total_projects,                  -- 3
  public_projects,                 -- 1 (is_public=true)
  projects_with_public_data,       -- 1 (any public_* NOT NULL)
  projects_with_portfolio_meta,    -- 0 (이미 미사용)
  total_portfolio_items,           -- 4
  public_portfolio_items,          -- 4 (전부 공개)
  active_portfolio_items           -- 4 (전부 active)
```

### 2-2. 유일한 public projects row 정체

```
id: 48486f19-2cfc-4cb7-904f-e1ceca1946f4
name: "test"
public_alias: "Chatsio AI 상담 대시보드"
public_live_url: "https://example.com"
created_at: 2026-04-17 (개발 초기)
```

→ **명백한 테스트 더미** (이름 "test" + example.com URL). 비즈니스 데이터 0건.

### 2-3. 코드 사용처 17파일 분류

**카테고리 A — 수정 필수 (4파일)**
- `src/app/(public)/projects/queries.ts` — 공개 /projects 페이지의 projects.public* read (이중 read 구조)
- `src/app/dashboard/projects/[id]/public-profile-form.tsx` — projects 의 공개 프로필 편집 폼 (legacy UI)
- `src/app/dashboard/projects/[id]/page.tsx` — 위 form 호출 (확인 필요)
- `src/app/dashboard/projects/actions.ts` — `updateProjectPublicFieldsAction` + `getProject` 의 public* select
- `src/lib/validation/projects.ts` — `publicFieldsSchema` 정의

**카테고리 B — 무관 (portfolio_items 도메인, 그대로 유지) — 9파일**
- `src/app/dashboard/portfolio/*` — portfolio_items 의 isPublic 사용 (다른 테이블 같은 이름)
- `src/features/portfolio/queries.ts`
- `src/lib/validation/portfolio.ts`, `portfolio-item.ts`

**카테고리 C — 무관 (Demo mock, 가공 데이터) — 3파일**
- `src/lib/demo/sample-data.ts` — 데모용 mock data (DB 컬럼과 무관)
- `src/app/(public)/demo/(app)/projects/[id]/page.tsx`
- `src/components/demo/public-profile-demo.tsx`

→ **실제 변경 파일 = 5개** (카테고리 A)

---

## 3. Phase 별 Cleanup 계획

### Phase 1: Public read 통일 (60분)

**목표**: `/projects` 공개 페이지가 `portfolio_items` 만 read 하도록 통일.

- `src/app/(public)/projects/queries.ts`:
  - `projects` 테이블 import 제거
  - `publicProjectColumns` 객체에서 `public*` 컬럼 제거
  - 만약 portfolio_items 만으로 충분하면 query 자체를 portfolio_items 로 교체 (이미 [src/features/portfolio/queries.ts](../src/features/portfolio/queries.ts) 가 portfolio_items 쓰고 있음 — 코드 통합)
- `/projects` 페이지의 ProjectsIndex 가 어디서 fetch 하는지 확인 (queries 통합 필요)

**검증**: `/projects` 페이지에 portfolio_items 4개만 노출 (테스트 더미 1개 사라짐 — 의도)

**위험**: 매우 낮음 (테스트 더미 1개만 사라짐)

---

### Phase 2: Dashboard legacy UI 제거 (45분)

**목표**: `/dashboard/projects/[id]` 의 공개 프로필 편집 폼 제거. 포트폴리오 편집은 `/dashboard/portfolio/*` 만 사용.

- `src/app/dashboard/projects/[id]/public-profile-form.tsx` 파일 삭제
- `src/app/dashboard/projects/[id]/page.tsx` 에서 form 사용 부분 제거 (어떤 섹션인지 확인 후 제거)
- `src/app/dashboard/projects/actions.ts`:
  - `updateProjectPublicFieldsAction` 함수 + 관련 type `UpdatePublicFieldsData` 삭제
  - `getProject` 의 select 에서 `public*` 컬럼 제거
  - `publicFieldsSchema` import 제거

**검증**: `/dashboard/projects/[id]` 페이지 정상 작동 (공개 프로필 편집 섹션만 사라짐)

**위험**: 낮음 (UI 제거만, DB 변경 X)

---

### Phase 3: Validation cleanup (15분)

**목표**: 사용 안 되는 schema 제거.

- `src/lib/validation/projects.ts`:
  - `publicFieldsSchema` 제거
  - 관련 type export 제거
- (확인) `src/lib/validation/portfolio.ts` — portfolio_items 용이라 그대로 유지

**검증**: tsc 통과

**위험**: 거의 없음

---

### Phase 4: Schema DROP + 마이그레이션 (30분)

**목표**: DB 컬럼 7개 제거.

- `src/lib/db/schema.ts`:
  - `projects` 테이블에서 `isPublic`, `publicAlias`, `publicDescription`, `publicTags`, `publicScreenshotUrl`, `publicLiveUrl`, `portfolioMeta` 7개 컬럼 제거
- `pnpm db:generate` 실행 → 자동 DROP SQL 생성
- 생성된 SQL 검토 (DROP COLUMN 7개 확인)
- MCP `apply_migration` 으로 cloud 적용
- `pnpm db:check` 정합성 확인

**데이터 손실**: 테스트 더미 1개 row 의 `public*` 데이터 (비즈니스 영향 0)

**롤백 방법**: drizzle journal revert + cloud 에서 컬럼 재추가 SQL 실행 (`ALTER TABLE projects ADD COLUMN public_alias text` 등) — 단, 데이터는 복구 불가 (사전에 dump 권장 시 별도 단계)

**위험**: 낮음 (테스트 더미만 손실 + 사전 audit 으로 데이터 영향 0 확인됨)

---

### Phase 5: 통합 검증 + 커밋 (30분)

**검증 시나리오**:
1. `pnpm tsc --noEmit && pnpm lint && pnpm db:check && pnpm build`
2. `/projects` 페이지 → portfolio_items 4개만 노출
3. `/dashboard/projects/[id]` → 공개 프로필 편집 섹션 사라짐, 다른 섹션 정상
4. `/dashboard/portfolio/[id]` → portfolio_items 편집 정상 (영향 X)

**커밋 전략 (4 분리)**:
1. `refactor(public): /projects 페이지 read 를 portfolio_items 로 통일`
2. `refactor(dashboard): projects 의 legacy 공개 프로필 편집 UI 제거`
3. `refactor(validation): publicFieldsSchema 제거 (deprecated)`
4. `feat(db): projects.public* + portfolio_meta 컬럼 7개 DROP`

---

## 4. 위험도 종합

| 항목 | 위험도 | 근거 |
|---|---|---|
| 데이터 손실 | 🟢 무시가능 | 실 데이터 0건 (테스트 더미 1개만) |
| 공개 페이지 중단 | 🟢 낮음 | portfolio_items 4개가 이미 표시 중 |
| 대시보드 기능 회귀 | 🟡 중간 | legacy UI 제거 시 page.tsx 의존 정리 필요 |
| 빌드/타입 에러 | 🟢 낮음 | 17 파일 중 5 파일만 수정 |
| 롤백 난이도 | 🟡 중간 | 컬럼 재추가는 가능, 데이터 복구는 사전 dump 필요 |

---

## 5. 다음 세션 시작 시

```
@docs/projects-public-deprecation-plan.md
→ Phase 1 부터 진행
```

---

## 6. 참고 문서

- [src/lib/db/schema.ts:586-720](../src/lib/db/schema.ts) — projects 테이블 정의 + portfolio_items 정의 (영역 분리 코멘트)
- [docs/learnings.md](learnings.md) — 2026-04-25 Epic Portfolio v2 4가지 교훈 (라이프사이클 분리 = 테이블 분리)
- 마이그레이션 0039_portfolio_items.sql (portfolio_items 신규 테이블)
