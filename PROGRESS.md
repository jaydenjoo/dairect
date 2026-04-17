# Dairect v3.1 — 진행 현황

> 최종 업데이트: 2026-04-17 (후반 3회차)
> 현재 위치: Phase 3 진행 중 (Task 3-4 완료) → Task 3-1 대기

## 전체 진행률

| Phase | 제목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 기반 설정 | ✅ 완료 | 100% |
| Phase 1 | 대시보드 핵심 | ✅ 완료 | 100% |
| Phase 2 | 견적/계약/정산 + 리브랜딩 | ✅ 완료 | 100% |
| Phase 3 | AI + 자동화 + 리드 CRM | 🟡 진행중 | 20% (1/5) |
| Phase 4 | 고객 포털 + /demo + PWA | ⬜ 대기 | 0% |
| Phase 5 | SaaS 전환 준비 (옵션) | ⬜ 대기 | 0% |

## Phase 0: 기반 설정 ✅

- [x] **Task 0-1** — Next.js 16.2 프로젝트 생성 + 패키지 설치 + 폰트 + DESIGN.md 토큰 적용
- [x] **Task 0-2** — 라우트 구조 (공개 7 + 대시보드 8 + auth callback = 19 라우트)
- [x] **Task 0-3** — Supabase Auth + Google OAuth + middleware 인증 보호
- [x] **Task 0-4** — Drizzle ORM 스키마 13테이블 → Supabase DB push 완료
- [x] **코드 리뷰** — CRITICAL 2건 + HIGH 5건 수정 완료

## Phase 1: 대시보드 핵심 ✅

- [x] **Task 1-1** — 대시보드 레이아웃 (사이드바 + 헤더 + 반응형 하단 탭바)
- [x] **Task 1-7** — 설정 페이지 (사업자 정보 + 견적서 기본값 + 수금 비율)
- [x] **Task 1-4** — 고객 CRM (목록 + 생성 모달 + 상세 + 메모 CRUD)
- [x] **Task 1-2** — 프로젝트 CRUD (목록 + 생성 모달 + 상세 + 상태 변경 + 소프트 삭제)
- [x] **Task 1-3** — 칸반 뷰 (4컬럼 + 뷰 전환 토글)
- [x] **Task 1-5** — 마일스톤 관리 (CRUD + 체크리스트 + 진행률 프로그레스 바)
- [x] **Task 1-6** — KPI 홈 대시보드 (카드 4개 + Bar/Pie 차트 + 활동 타임라인 + 마일스톤)

## Phase 2: 견적/계약/정산 + 리브랜딩 ✅

- [x] **Task 2-1** — 견적서 생성기 수동 모드 (목록 + 생성 폼 + 상세 + 상태 변경 + 삭제)
- [x] **Task 2-2** — 견적서 PDF 생성 + 미리보기 (Pretendard self-host + A4 템플릿 + 다운로드)
- [x] **Task 2-3** — 계약서 관리 (목록 + 생성 + 상세 + 상태 전환 + PDF 조항 11개)
- [x] **Task 2-4** — 청구서/정산 관리 (수동/견적서 자동 3분할 + 상태 전이 + 입금 확인 + 세금계산서 도우미 + PDF)
- [x] **Task 2-5** — 랜딩 메인 리브랜딩 (Nav + Hero 추상 대시보드 목업 + Problem + Service + Portfolio + PricingSummary + CTA + Footer)
- [x] **Task 2-6** — `/pricing` 상세 페이지 (3패키지 앵커 + 비교 표 semantic + FAQ native details + LandingNav 공용화)
- [x] **Task 2-7** — `/about` + Contact 폼 (Hero 다크 + Contact 연보라 + inquiries.package 컬럼 + honeypot 봇방어 + sanitizeHeader + CSV injection 방어)
- [x] **Task 2-8** — `/projects` Bento Grid + 상세 페이지 (is_public 연동, Nav service 제거)
- [x] **Task 2-8-B** — 대시보드 공개 프로필 토글 UI (isPublic/alias/description/liveUrl/tags 편집 Server Action)

### 코드 리뷰 수정 내역 (Task 2-4)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 실질 CRITICAL | 트랜잭션 내 `generateInvoiceNumber` MAX 중복 → 자동 3분할 항상 실패 | `offset` 파라미터 추가 + 루프 인덱스 전달 |
| HIGH | `toggleTaxInvoiceAction` 상태 검증 부재 (cancelled/미입금에서도 발행 표시 가능) | 소유권 + cancelled 차단 + `issued=true`는 paid만 허용 |
| HIGH | 0원 견적서로 자동 생성 시 0원 청구서 3건 발생 | `supplyAmount <= 0` 가드 |
| HIGH | 입금 확인 "감액 반영 가능" 오해 소지 | "합의된 실입금액 기록. 부분 입금은 별도 청구서 생성" 문구 |
| MEDIUM | `deleteInvoiceAction` WHERE에 userId 누락 | `and(eq(id, id), eq(userId, userId))` 방어 추가 |

### 코드/디자인 리뷰 수정 내역 (Task 2-5)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| HIGH | Problem h3 → h2 계층 역순 | 상단 h2 도입문 추가, 하단 h2 → p |
| HIGH | Service Bento Teaser h4 계층 스킵 | h4 → h3 승격 2곳 |
| HIGH | Footer `border-t` No-Line Rule 위반 | 그라데이션 divider로 교체 |
| HIGH | 다크 섹션 white/40 WCAG AA 미달 | white/60 이상으로 상향 (CTA + Footer) |
| HIGH | Portfolio 3열 그리드가 시안 4열 의도 누락 | `md:grid-cols-2 lg:grid-cols-4` + span 재배치 |
| MEDIUM | Service 연결선 inline style | `bg-foreground/[0.08]` Tailwind 클래스 |
| MEDIUM | Service 타임라인 `top-[100px]` | `top-[32px]` 원 중심 통과 |
| 옵션 C | Hero "3D 기기 목업" placeholder | 추상 대시보드 목업 (윈도우 크롬 + 사이드바 + KPI 3카드 + 차트 7바) |

### 코드/디자인 리뷰 수정 내역 (Task 2-6)

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| HIGH | Nav `activeHref` 중복 href (서비스/소개 둘 다 `/about`) | `active: NavActiveId` id 기반 타입 안전 매칭 |
| HIGH | 비교 표 `<div>` grid 스크린리더 인식 불가 | `<table>` + `<thead>/<tbody>` + `<th scope>` semantic HTML |
| HIGH | MVP 열 강조 `primary/[0.03]` 육안 식별 불가 | 헤더 `primary/[0.08]` + 본문 `primary/[0.06]` 상향 |
| HIGH | 패키지 CTA 3개 모두 `/about#contact` 동일 | `/about?package={id}#contact` 쿼리 추가 |
| HIGH | 비교 표 한글 값에 `font-mono` | `font-medium` (Pretendard sans)로 교체 |
| MEDIUM | 비교 표 모바일 긴 라벨 잘림 | `overflow-x-auto` + `min-w-[560px]` |
| MEDIUM | Hero MVP 앵커 pre-highlighted 오인 | 3개 링크 동일 스타일 + hover만 강조 |
| MEDIUM | MVP scale `lg:` 이하 적용 안 됨 | `md:scale-[1.04]`로 breakpoint 하향 |
| MEDIUM | "정확한 금액..." 문구 중복 (Summary + Table) | Table 하단 제거, Summary만 유지 |

### 코드/보안/UX 리뷰 수정 내역 (Task 2-7)

code-reviewer + security-reviewer 병렬 리뷰, 총 14건 수정:

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 CRITICAL | Rate limit/봇 방어 부재 (공개 엔드포인트) | **honeypot `website` 필드** + **3초 timing 가드** → 즉시 성공 응답으로 드롭 |
| HIGH | `package` enum DB 레벨 방어 없음 | Drizzle `check()` 헬퍼 추가 + `0004_flimsy_fantastic_four.sql` 적용 |
| HIGH | `initialPackage` prop만 → 사용자 변경 불가 | `pkg` state 승격 + 뱃지 X 버튼으로 취소 가능 |
| HIGH | Radio 그룹 focus-visible 링 없음 (WCAG 2.4.7) | `focus-within:ring-2 ring-primary/40 ring-offset-2` |
| HIGH | `PackageId/BudgetId/ScheduleId` 3중 중복 정의 | `validation/inquiry.ts`에서 Zod infer로 단일 export |
| HIGH | UA/IP control char + 길이 상한 없음 | `sanitizeHeader(raw, max)` — control char strip + slice (UA 500, IP 64) |
| HIGH | CSV injection 방어 없음 (`=HYPERLINK(...)` 공격) | `stripFormulaTriggers()` — `=+-@\t\r` leading strip |
| MEDIUM | 토스트 + 성공 화면 중복 피드백 | 성공 시 토스트 제거, 대형 확인 카드만 |
| MEDIUM | 연락처 input 모바일 힌트 없음 | `inputMode="email"` + `autoComplete="email"` |
| MEDIUM | 연락처/이름/요약 개행·`<>` 차단 없음 | Zod `.regex(/^[^\r\n\t<>]+$/)` 메일 헤더 injection 방어 |
| MEDIUM | Hero 그림자 순수 `rgba(0,0,0,0.6)` | `rgba(17,24,39,0.6)` gray-900 기반 (DESIGN.md 순수 #000 금지) |
| MEDIUM | `x-forwarded-for` 좌측 파싱 (Vercel 스푸핑 위험) | 우측 파싱 `split(",").at(-1)` |
| MEDIUM | Zod `.strict()` 누락 (미정의 키 drop만) | `.strict()` 추가 — 미정의 키 즉시 reject |
| LOW | 영문 대문자 "BY SUBMITTING..." 가독성 | "제출 시 개인정보 처리방침에 동의..." 한국어 |

**추가로 발견 (수정 과정)**:
- `useRef<number>(Date.now())` React purity rule 위반 → `useState(() => Date.now())` lazy init
- unused `_w`/`_s` destructure → Zod safeParse에 명시적 객체 구성으로 제거

### 코드/보안 리뷰 수정 내역 (Task 2-8) — 14건

**1차 리뷰 (4건 블로킹 + 3건 권고)**:
| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 security | `publicAlias ?? project.name` fallback → 원본 고객사명 공개 리스크 | `isNotNull(publicAlias)` 쿼리 필터 + 제네릭 타입 가드 `hasAlias<T>`로 `string` narrow + 3곳 fallback 제거 |
| 🔴 code | 변수 쉐도잉 `projects` (테이블 심볼) | `items`로 rename |
| 🟡 code | `ORDER BY endDate DESC` NULLS FIRST 기본 | `sql\`${endDate} DESC NULLS LAST\`` |
| 🟡 code | `publicScreenshotUrl` dead field | 쿼리 컬럼 + 타입에서 제거 |
| 🟡 security | `safeExternalUrl` regex만 | `new URL()` + 제어문자/공백 차단 + 정규화 반환 |
| 🟡 security | `/projects/[id]` revalidate 미명시 | `export const revalidate = 60` |
| 🟡 code | `formatPeriod` split 방어 부재 | `parts.length < 2 → value` 가드 |

### 코드/보안 리뷰 수정 내역 (Task 2-8-B) — 8건

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 security | `publicLiveUrl` SSRF/내부망 차단 누락 | `isSafePublicUrl` refine + `isInternalHost` (localhost/127.*/10.*/172.16-31.*/192.168.*/169.254.*/.local/.internal) |
| 🔴 security | `publicDescription` 제어문자/BiDi 오염 | `safeMultilineText` regex — `\x00-\x08\x0B\x0C\x0E-\x1F\x7F` + BiDi `\u202A-\u202E\u2066-\u2069` 차단 |
| 🔴 security | `projectId` UUID 선검증 누락 | `projectIdSchema.safeParse(projectId)` 가드 + 이후 `idCheck.data` 사용 |
| 🔴 code | Zod `.strict()` `unrecognized_keys` 사용자 노출 | `issues.find(i => i.code !== "unrecognized_keys")` + 미정의 키는 console.error만 |
| 🟡 code | 저장 후 로컬 상태 drift | 성공 콜백에서 `setAlias/setLiveUrl(trim)` + `setTagsRaw(normalizeTagsRaw)` |
| 🟡 code | `parseTags` 대소문자 dedupe + slice(8) 유실 | `.toLowerCase()` 키 dedupe + `slice(8)` 제거 → Zod `.max(8)` 에러 정상 표출 |
| 🟡 code | `aria-describedby` 누락 | alias/description/tags 3필드 모두 `-help`/`-error` id 연결 |
| 🟡 security + code | `publicTagsRaw` 길이 상한 + `isPublic null` | 서버 `TAGS_RAW_MAX=500` + 클라 `maxLength={500}` + page.tsx `isPublic ?? false` |

### 다음 Task로 이관된 이슈 (Task 2-8 스코프 아웃)
- loading.tsx / error.tsx (전체 공개 페이지 일관성 유지)
- total=1 풀폭 span (실제 공개 프로젝트 1개 생길 때)
- Portfolio 섹션 하드코딩 vs DB 연동 (랜딩 홈)
- Server Action 시그니처 `publicTagsRaw` → `string[]` 리팩토링 (Task 2-8-B M4)
- 저장 후 공개 페이지 링크 표시 타이밍 (Task 2-8-B M3)
- 취소/되돌리기 UX (Task 2-8-B L4)
- URL/ALIAS/DESC 최대값 상수화 (Task 2-8-B L3)
- `style={{ wordBreak: "keep-all" }}` → `break-keep` 일괄 리팩토링

### Phase 3 백로그 (Task 2-7/2-8에서 인지)
- Redis/KV 기반 IP rate limit · reCAPTCHA/hCaptcha
- PII 암호화 (at-rest)
- `ENABLE ROW LEVEL SECURITY` + anon 차단 정책 (Supabase anon client 도입 시점)
- 이메일 자동 회신 시 헤더 injection 방어 (`contact`를 `To:`에 넣을 때 `\r\n` strip)
- 구조화 로깅
- `budget_range`/`schedule`/`status` 컬럼 CHECK 제약 일괄 추가
- `leads` 자동 생성 (source='landing_form')

## Phase 3: AI + 자동화 + 리드 CRM 🟡

- [x] **Task 3-4** — 리드 CRM (목록 + 필터 + 생성 모달 + 상세 + 상태 전이 + 실패 사유 + 프로젝트 전환 + 삭제 + 랜딩폼 자동 생성)
- [ ] **Task 3-1** — AI 견적 초안 생성 (Claude Sonnet 4.6 API)
- [ ] **Task 3-2** — AI 주간 브리핑 (대시보드 홈 위젯)
- [ ] **Task 3-3** — AI 주간 보고서 (PDF)
- [ ] **Task 3-5** — n8n Webhook 4종 (Slack/리마인더/주간/만족도)

### 코드/보안 리뷰 수정 내역 (Task 3-4) — 4건

code-reviewer + security-reviewer 병렬 리뷰, HIGH 3 + MEDIUM 1 수정:

| 심각도 | 이슈 | 수정 |
|--------|------|------|
| 🔴 HIGH | owner picker `SELECT FROM users LIMIT 1` — ORDER BY 누락 → 비결정적 할당 | `orderBy(asc(users.createdAt))` — 최초 가입 운영자 고정 |
| 🔴 HIGH | `convertLeadToProjectAction` 더블클릭/동시 요청 시 client+project 2개 생성, 첫 project 고아화 | UPDATE WHERE에 `isNull(convertedToProjectId)` 가드 + rowsAffected=0 → `ALREADY_CONVERTED` throw로 전체 트랜잭션 롤백 |
| 🔴 HIGH | 랜딩폼에서 `inquiries INSERT`/`leads INSERT`/`inquiries UPDATE` 3쿼리 분리 — 중간 실패 시 감사추적 깨짐 | `leads INSERT` + `inquiries.convertedToLeadId UPDATE`를 단일 `db.transaction`으로 묶음 (inquiries INSERT는 트랜잭션 밖 — 고객 문의 보존 우선) |
| 🟡 MEDIUM | 0005 마이그레이션 롤백 SQL 누락 (글로벌 supabase.md 규칙) | `-- ROLLBACK:` 섹션에 `DROP CONSTRAINT` 주석 추가 |

### 다음 Task로 이관된 이슈 (Task 3-4 스코프 아웃)
- 전환율 분석 차트 (KPI 홈 대시보드 확장)
- 리드 소스별 주간 리포트
- 중복 리드 merge UI
- 리드 활동 타임라인
- `clients.companyName`에 개인명 직접 매핑 데이터 모델 개선
- `phone` 형식 정규식 검증 (Task 3-5 n8n SMS 전)
- 리드 기본 정보 편집 UI (현재는 삭제 후 재등록)

### Phase 3 백로그 (리뷰·기타에서 인지)
- **Rate limit** (Redis/KV) — 공개 엔드포인트 flooding 방어 (HIGH 이슈이나 인프라 필요해 별도 Task)
- reCAPTCHA/hCaptcha
- PII 암호화 (at-rest)
- `ENABLE ROW LEVEL SECURITY` + anon 차단 (Supabase anon client 도입 시)
- 이메일 자동 회신 시 헤더 injection 방어
- 구조화 로깅
- `budget_range`/`schedule`/`status` 컬럼 CHECK 제약 일괄 추가

## 현재 세션 (2026-04-17 후반 3회차)

- **완료**:
  - Phase 3 전체 Task 분해 (Task 3-1~3-5, PRD v3.1 기준)
  - Task 3-4 리드 CRM 구현 완료 (6 마일스톤)
    - M1: `leads` 테이블 CHECK 제약 2건 (`source`/`status`) + 0005 마이그레이션
    - M2: `/dashboard/leads` 목록 + 필터(소스·상태·검색) + 페이지 헤더
    - M3: 리드 수동 생성 다이얼로그 (이름·소스·연락처·프로젝트 유형·예산·메모)
    - M4: 리드 상세 + 상태 전이 폼 + 실패 사유 + 삭제 버튼
    - M5: 랜딩폼 확장 — `submitInquiryAction`에 `leads` 자동 생성 + `inquiries.convertedToLeadId` 링크
    - M6: `convertLeadToProjectAction` — clients(신규/기존) + projects 자동 생성 + `converted_to_project_id` 저장
    - 사이드바 리드 메뉴 추가 (모바일 탭은 별도 배열: 데스크톱 전용)
  - code-reviewer + security-reviewer 병렬 리뷰, **4건 수정 반영** (HIGH 3 + MEDIUM 1)
  - **Supabase Session pool 고갈 디버깅**: postgres.js `max: 1, idle_timeout: 20` 추가 (빌드 워커 9개 × default max 10 = Session pool 15슬롯 초과 방어)
  - 교훈 3건 추가 (Server Action type re-export 금지 / Supabase pool + 빌드 워커 / convert 레이스 isNull 가드)
- **신규 파일 10 / 수정 파일 5 / 마이그레이션 1건**
- **다음**: Task 3-1 (AI 견적 초안 생성, Claude Sonnet 4.6 API)
- **차단 요소**: 없음

## 검증 상태

```
✅ tsc       — PASS (0 errors)
✅ lint      — PASS (0 errors, Task 2-1 기존 경고 1개 잔존)
✅ build     — PASS (25 routes, /dashboard/leads 추가, postgres.js max:1로 pool 경합 해결)
✅ db:push   — PASS (14 tables, 0005 CHECK 제약 적용)
✅ 스모크    — Jayden 수동 확인 완료 (리드 생성·전환·랜딩폼 연동·모바일 탭 모두 정상 작동)
```

## 기술 결정 기록

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-04-16 | Drizzle ORM (Prisma 대신) | 타입 안전 + 경량 + Supabase 호환 |
| 2026-04-16 | Pretendard npm 패키지 + local font | CDN 의존 제거, FOUT 방지 |
| 2026-04-16 | 글로벌 design-system.md 적용 안 함 | 로컬 DESIGN.md가 Single Source of Truth |
| 2026-04-16 | `dashboard/` 실제 세그먼트 | 라우트 그룹은 URL에 영향 없어서 `/projects` 경로 충돌 |
| 2026-04-16 | PORT=3700 유지 | 기존 dairect 포트 번호 유지 |
| 2026-04-16 | Direct URL (5432) for Drizzle | PgBouncer(6543)는 마이그레이션 트랜잭션 미지원 |
| 2026-04-16 | `prepare: false` postgres.js 옵션 | Supabase Pooler Transaction mode 호환 |
| 2026-04-16 | getUserId 공통 모듈 추출 | 4개 actions 파일에서 중복 제거 |
| 2026-04-16 | Server Action Zod 재검증 의무화 | Client→Server 경계에서 TypeScript 타입은 런타임 보장 없음 |
| 2026-04-16 | useOptimistic + 실패 롤백 패턴 | 즉시 UI 반영 + 서버 실패 시 원래 상태 복원 |
| 2026-04-17 | react-pdf 폰트 public/fonts/ self-host | CDN 장애 시 한글 깨짐 방지 (BusinessContinuity) |
| 2026-04-17 | PDFDownloadLink = anchor → buttonVariants className | HTML nested button invalid 회피 |
| 2026-04-17 | Server Action: 읽기 함수 try-catch 없음 | Next.js Dynamic Server Error 정상 흐름 보존 |
| 2026-04-17 | 계약서 상태 전이맵 서버 검증 | 법적 증빙 무결성 (signed → draft 역행 방지) |
| 2026-04-17 | 공개 Server Action 방어 4종 세트 | honeypot + timing + sanitizeHeader + CSV strip (rate limit은 Phase 3 Redis) |
| 2026-04-17 | Drizzle `check()` 헬퍼로 DB 레벨 enum 방어 | Zod는 앱 레이어 방어일 뿐, DB 직접 INSERT 시 무효값 차단 필요 |
| 2026-04-17 | RLS 판단: Drizzle direct = service_role → 현재 안전 | Phase 3 anon client 도입 시점에 `ENABLE RLS` + anon 차단 정책 추가 |
| 2026-04-17 | 계약서 immutability는 참조 차단으로 완화 | 전자서명(Phase 3) 때 스냅샷 컬럼 추가 예정 |
| 2026-04-17 | `(userId, contractNumber/invoiceNumber)` UNIQUE + 23505 재시도 | MAX 기반 채번 경합 방어 |
| 2026-04-17 | `generateInvoiceNumber(tx, userId, offset)` offset 파라미터 | 트랜잭션 내 N회 호출 시 동일 MAX 반환 방어 (3분할 자동 생성) |
| 2026-04-17 | 청구서 연체는 쿼리 시점 계산 | `status='sent' && dueDate<today`로 cron 불필요 |
| 2026-04-17 | 세금계산서 발행 플래그는 `paid` 상태만 허용 | 세무 감사 증빙 무결성 |
| 2026-04-17 | 공개 `/` 랜딩 8섹션 구조 | DESIGN.md "Intelligent Sanctuary" — No-Line Rule + Tonal Layering |
| 2026-04-17 | LandingNav `active: NavActiveId` id 기반 매칭 | href 중복(`/about` 2개) 시 동시 강조 방지 |
| 2026-04-17 | 비교 표 semantic `<table>` + `scope` | 접근성 보강, No-Line Rule은 교차 배경으로 유지 |
| 2026-04-17 | FAQ native `<details>` (JS 없음) | Server Component 유지 + 기본 접근성 확보 |
| 2026-04-17 | 공개 페이지 쿼리에 `isNotNull(publicAlias)` 필터 | `publicAlias ?? name` fallback 제거 → 원본 고객사명 노출 차단 |
| 2026-04-17 | 공개 URL 필드 `isInternalHost` 차단 | SSRF/내부망(`localhost`, 127.*, 10.*, 169.254.*, 192.168.*, 172.16-31.*, .local/.internal) 유도 방어 |
| 2026-04-17 | Zod `.strict()` + `refine` 에러 메시지 분리 | `unrecognized_keys`는 console만, 사용자에겐 첫 입력 오류만 표출 (내부 정보 유출 방지) |
| 2026-04-17 | `export const revalidate = 60` 명시 | cookies() 미사용 시 기본 static — 명시로 ISR 전환, 공개 전환 1분 내 반영 |
| 2026-04-17 | 대시보드 공개 프로필 Switch — 네이티브 checkbox + peer | shadcn Switch 미설치 의존성 0, Tailwind만으로 구현 |
| 2026-04-17 | Server Action projectId UUID Zod 선검증 | 비UUID 전달 시 DB 에러 경로 진입 방지 |
| 2026-04-17 | Drizzle `text().array()` 타입 가드 제네릭 | nullable 배열을 `.filter(hasAlias)`로 타입 narrow하는 재사용 패턴 확립 |
| 2026-04-17 | postgres.js `max: 1, idle_timeout: 20` | Next.js 빌드 워커(9개)가 Supabase Session pool(15슬롯)을 고갈시키지 않도록 연결 1개로 제한 |
| 2026-04-17 | single-tenant owner picker: `orderBy(asc(users.createdAt)).limit(1)` | 공개 랜딩폼 → 리드 자동 생성 시 최초 가입 운영자에게 결정적 할당. SaaS 전환 시 도메인 기반 라우팅으로 교체 예정 |
| 2026-04-17 | Server Action 파일(`"use server"`)에서 `export type` 금지 | Next.js 15/16 App Router는 "use server" 파일의 모든 export를 async function으로 직렬화 시도 → type re-export도 빌드 에러. type은 별도 파일에서 import만 |
| 2026-04-17 | convert 트랜잭션 레이스 방지: `isNull` 가드 + rowsAffected 체크 | 사전 체크는 참조만, 트랜잭션 내부 UPDATE WHERE에 `isNull(convertedToProjectId)` 포함 + rowsAffected=0 시 `ALREADY_CONVERTED` throw → 전체 롤백 |
| 2026-04-17 | 사이드바 모바일 탭은 `navItems.slice()` 대신 별도 배열 | 데스크톱/모바일 노출 항목이 달라질 때 slice 결과가 의도와 어긋남. 명시적 `mobileNavItems = [...]` 배열로 독립 관리 |

## 주요 파일 구조

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css             ← DESIGN.md 토큰
│   ├── page.tsx                ← 랜딩 메인 (Task 2-5)
│   ├── (public)/
│   │   ├── about/
│   │   ├── pricing/page.tsx    ← /pricing 상세 (Task 2-6)
│   │   ├── projects/           ← Task 2-8
│   │   │   ├── page.tsx        ← Bento Grid + EmptyState
│   │   │   ├── queries.ts      ← getPublicProjects/getPublicProjectById
│   │   │   └── [id]/page.tsx   ← 상세 + safeExternalUrl
│   │   ├── demo/
│   │   ├── login/
│   │   ├── privacy/
│   │   └── terms/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx            ← KPI 대시보드
│   │   ├── dashboard-actions.ts
│   │   ├── projects/
│   │   ├── clients/
│   │   ├── settings/
│   │   ├── estimates/
│   │   ├── contracts/
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── milestone-list.tsx
│   │   │   │   └── public-profile-form.tsx   ← Task 2-8-B
│   │   │   └── actions.ts      ← updateProjectPublicFieldsAction 추가
│   │   └── invoices/           ← Task 2-4
│   │       ├── actions.ts      ← CRUD + 3분할 + 상태 전이 + 입금 + 세금계산서
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── invoice-actions.tsx
│   │           ├── tax-invoice-helper.tsx
│   │           └── pdf-buttons.tsx
│   └── auth/callback/route.ts
├── components/
│   ├── landing/                ← Task 2-5 신규
│   │   ├── nav.tsx             ← Task 2-6에서 공용화 (id 기반 active)
│   │   ├── problem-section.tsx
│   │   ├── service-section.tsx
│   │   ├── portfolio-section.tsx
│   │   ├── pricing-summary-section.tsx
│   │   ├── cta-section.tsx
│   │   └── footer.tsx
│   ├── pricing/                ← Task 2-6 신규
│   │   ├── package-detail.tsx
│   │   ├── comparison-table.tsx
│   │   └── pricing-faq.tsx
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── auth/get-user-id.ts
│   ├── validation/ (settings, clients, projects, milestones, estimates, contracts, invoices)
│   ├── supabase/ (client, server)
│   ├── db/ (schema, index, migrations/)
│   └── pdf/
│       ├── estimate-pdf.tsx
│       ├── contract-pdf.tsx
│       └── invoice-pdf.tsx     ← Task 2-4
├── middleware.ts
├── fonts/PretendardVariable.woff2
└── public/fonts/               ← react-pdf용 OTF
    ├── Pretendard-Regular.otf
    ├── Pretendard-Medium.otf
    ├── Pretendard-SemiBold.otf
    └── Pretendard-Bold.otf
```
