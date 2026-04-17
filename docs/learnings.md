# Dairect — 교훈 기록

## 2026-04-16 — Next.js 16.2 라우트 그룹 충돌

- **증상**: `pnpm build` 실패 — "You cannot have two parallel pages that resolve to the same path"
- **원인**: `(dashboard)` 라우트 그룹은 URL 경로에 영향을 주지 않음. `(public)/projects`와 `(dashboard)/projects`가 둘 다 `/projects`로 충돌
- **해결**: `(dashboard)`를 `dashboard/` 실제 라우트 세그먼트로 변경
- **규칙**: 대시보드처럼 별도 URL 접두사가 필요한 영역은 라우트 그룹 `()` 대신 실제 폴더명 사용. 라우트 그룹은 레이아웃 분리 목적으로만 사용할 것.

## 2026-04-16 — Supabase 새 프로젝트 DB 연결 형식 변경

- **증상**: `db.xxx.supabase.co` DNS 해석 실패 (`ENOTFOUND`)
- **원인**: 최신 Supabase 프로젝트는 IPv4 `db.` 직접 연결 대신 Pooler URL (`aws-0-*.pooler.supabase.com`) 사용
- **해결**: Supabase Connect → ORMs 탭에서 Pooler URL 복사. 마이그레이션용은 포트 5432 (Direct), 앱 런타임은 6543 (Transaction mode)
- **규칙**: 새 Supabase 프로젝트에서는 항상 Connect 버튼의 Pooler URL 사용. `db.xxx.supabase.co` 형식은 레거시/IPv4 addon 전용.

## 2026-04-16 — shadcn/ui v4 base-ui 기반 API 변경

- **증상**: `DialogTrigger asChild` 사용 시 TypeScript 에러, `Select onValueChange`에서 `string | null` 타입 불일치
- **원인**: shadcn/ui v4는 Radix UI에서 base-ui로 마이그레이션. `asChild` prop이 `render` prop으로 변경, `onValueChange`가 `(value: string | null)` 시그니처
- **해결**: `asChild` → `render={<Component />}`, `onValueChange`에 null 가드 추가 (`v ?? ""` 또는 `if (!v) return`)
- **규칙**: shadcn/ui 최신 버전에서는 Radix UI 문서가 아닌 base-ui 문서를 참조. 컴포넌트 설치 후 실제 소스(`src/components/ui/`)의 prop 타입을 확인할 것.

## 2026-04-16 — Server Action 보안 패턴 (코드 리뷰 교훈)

- **증상**: 코드 리뷰에서 CRITICAL 4건 + HIGH 11건 발견 (DB 에러 노출, 소유권 미검증, unsafe 캐스트 등)
- **원인**: 빠르게 구현하며 "나중에 수정" 의식이 작동. Server Action은 공개 엔드포인트이므로 Client 검증만으로 불충분
- **해결**: 5가지 필수 패턴 확립
- **규칙**:
  1. catch 블록: `console.error("[tag]", err)` + 일반 메시지 반환 (DB 에러 절대 노출 금지)
  2. 소유권: `verifyOwnership` 헬퍼로 FK 체인 검증 (clientId → client.userId)
  3. JSONB 읽기: `as` 캐스트 금지 → Zod `safeParse`로 안전 변환
  4. 상태값: 서버에서 반드시 `z.enum().safeParse` 재검증 (TypeScript 타입 ≠ 런타임 보장)
  5. select: 항상 명시적 컬럼 프로젝션 (select() 호출 시 컬럼 객체 필수)

## 2026-04-17 — Server Action 읽기 함수의 try-catch는 Next.js Dynamic Server Error를 삼킨다

- **증상**: `getContracts()`에 try-catch를 둔 뒤 `pnpm build` 로그에 `[getContracts] Error: Dynamic server usage: Route /dashboard/contracts couldn't be rendered statically because it used 'cookies'` 에러가 찍힘. 빌드는 성공하나 로그 오염.
- **원인**: Next.js는 정적 렌더링을 시도하다 `cookies()` 호출을 만나면 특수 에러를 throw → 자동으로 dynamic으로 전환하는 정상 흐름. 내가 추가한 `try-catch`가 이 내부 에러를 catch하고 `console.error`로 로그. `digest === "DYNAMIC_SERVER_USAGE"` 체크 없이 무조건 잡아버림.
- **해결**: 읽기 함수(`get*`)에서 try-catch 제거. Mutation 함수(`*Action`)에만 try-catch 유지.
- **규칙**:
  1. Server Action은 **mutation**에만 `try-catch` + `console.error("[tag]", err)` + 일반 메시지 반환 패턴 적용
  2. 읽기 함수는 try-catch 없이 자연스럽게 에러 전파 → Next.js 에러 바운더리 또는 Dynamic 전환이 처리
  3. 꼭 읽기에 try-catch 필요하면 `(err as { digest?: string })?.digest?.startsWith("DYNAMIC_")` 체크 후 rethrow
  4. Server Action 5패턴 "catch 블록에서 에러 숨김"은 mutation에만 적용, 읽기는 예외

## 2026-04-17 — @react-pdf/renderer + Next.js 15/16 통합 함정 3가지

- **증상**:
  1. `PDFDownloadLink` 안에 `<Button>` 중첩 시 HTML invalid (anchor 안에 button)
  2. Pretendard jsdelivr CDN OTF 사용 시 CDN 장애/오프라인에서 한글 미지원 폴백(Helvetica)으로 전체 글자 깨짐
  3. `PDFDownloadLink`는 마운트 즉시 blob 생성 → 페이지 진입만으로 폰트 3개 fetch + PDF 렌더
- **원인**:
  1. `PDFDownloadLink`는 `<a>` 태그를 렌더링. 자식 `button` 중첩 금지(HTML spec)
  2. `@react-pdf/renderer`는 WOFF2 미지원 + OTF/TTF만 허용. CDN 의존 시 재해 상황 단일 실패 지점
  3. React element reference가 매 렌더마다 새로 생성되면 `PDFDownloadLink`가 재렌더 마다 blob을 다시 만듦
- **해결**:
  1. `buttonVariants({ variant, size })`를 `className`으로 전달 → anchor에 버튼 스타일만 적용
  2. `node_modules/pretendard/dist/public/static/` OTF 파일을 `public/fonts/`에 복사 + `Font.register({ src: "/fonts/..." })`
  3. `pdfDocument = useMemo(() => <EstimatePdf ...>, [data])`로 메모이즈
- **규칙**:
  1. `PDFDownloadLink`는 anchor 태그이므로 **shadcn Button 컴포넌트를 자식으로 두지 말 것**. `buttonVariants()` className만 사용
  2. react-pdf 폰트는 **항상 로컬 self-host** (외부 CDN 의존성 제거 — 법적 문서에 CDN 장애 리스크 부적절)
  3. PDF React element는 **반드시 useMemo** — reference stability 확보, 재렌더 시 재생성 방지
  4. `PDFViewer`는 브라우저 전용(iframe+blob) → `dynamic(ssr: false)`로만 사용
  5. 파일명은 `sanitizeFileName()` 통과 (`[^A-Za-z0-9_-]` → `_`) — 사용자 설정 prefix의 injection 차단

## 2026-04-17 — 트랜잭션 내 MAX 기반 채번의 offset 함정 (자동 3분할 버그)

- **증상**: 견적서 기반 청구서 자동 3분할 생성 시, 첫 번째 INSERT는 성공하지만 두 번째부터 `23505 unique_violation`으로 전체 트랜잭션 롤백. 재시도 루프도 같은 로직이라 항상 실패.
- **원인**: `generateInvoiceNumber(tx, userId)`가 같은 트랜잭션 내에서 N번 호출되는데, READ COMMITTED 격리 수준에서 **직전 INSERT는 커밋 전이므로 MAX 서브쿼리에 반영되지 않음** → 모두 동일한 번호 반환 → UNIQUE 제약 위반.
- **해결**: `generateInvoiceNumber(tx, userId, offset)` 세 번째 파라미터 추가. 호출자(루프)가 `i`를 offset으로 전달. `nextNum = max + 1 + offset`으로 중복 방어.
- **규칙**:
  1. 트랜잭션 내에서 **같은 테이블에 N회 INSERT하면서 MAX로 채번**하는 패턴은 항상 offset 필요. 단일 INSERT에서는 문제 없음 (트랜잭션 커밋 후 다음 트랜잭션이 MAX 재조회).
  2. 더 안전한 대안: `FOR UPDATE` 락 + 전용 카운터 컬럼, 또는 DB sequence. 현재 방어법은 "offset + UNIQUE + 23505 재시도" 조합.
  3. 리뷰 관점: 루프 내 채번은 반드시 재현 테스트 필요. 단건 생성만 테스트하면 버그가 숨는다.

## 2026-04-17 — 공용 Nav 컴포넌트의 activeHref vs id 기반 매칭

- **증상**: `LandingNav activeHref="/about"` 전달 시 "서비스"와 "소개" 두 메뉴가 동시에 active로 강조됨.
- **원인**: 두 메뉴 모두 `href="/about"`으로 같은 경로를 공유. `href === activeHref` 문자열 비교만으로는 구분 불가.
- **해결**: `active: NavActiveId` (`"service" | "portfolio" | "pricing" | "about"`) enum prop으로 변경. 각 항목이 고유 id를 가지고 id === active로 매칭.
- **규칙**:
  1. 공용 Nav 설계 시 **활성화 매칭은 항상 고유 id(enum)로 구현**. href 기반 매칭은 동일 경로가 여러 메뉴에서 쓰일 때 깨진다.
  2. TypeScript strict로 `active?: NavActiveId`를 쓰면 호출측에서 오타/잘못된 값 컴파일 차단.
  3. 서비스 소개 섹션을 `/about#service` 같은 해시로 분리하는 편이 명확하나, UX상 같은 페이지를 향하는 두 메뉴 자체를 재검토할 것.

## 2026-04-17 — No-Line Rule과 접근성(semantic `<table>`)의 양립

- **증상**: 비교 표를 `<div className="grid grid-cols-4">` + `role` 없이 구현. 스크린리더에서 "4개의 리스트"로 인식되고 행/열 헤더 관계가 전달되지 않음. 반면 시안의 `border-b` 기반 테이블은 DESIGN.md "No-Line Rule" 위반.
- **원인**: "No-Line Rule"을 지키기 위해 div grid로 도피했으나 semantic HTML 상실.
- **해결**: `<table>` + `<thead>/<tbody>` + `<th scope="row|col">` + `<colgroup>` 정통 구조로 전환. `border-collapse` + border 클래스 전혀 사용 안 하고, 행 구분은 `surface-card`/`surface-base` **교차 배경**, MVP 열 강조는 `bg-primary/[0.06]` tint로 처리.
- **규칙**:
  1. **semantic HTML과 디자인 원칙은 충돌하지 않는다**. `<table>`도 `border-0`으로 No-Line Rule 준수 가능.
  2. 테이블 형태 데이터(행 × 열 의미 있음)는 반드시 `<table>` + scope 사용. `<div>` + `role="table"` ARIA는 차선책.
  3. MVP 열처럼 한 열 전체를 강조할 때는 `<colgroup>`에 배경 지정보다, 각 td/th에 개별 bg 클래스를 주는 편이 Tailwind와 궁합이 좋다 (colgroup background는 일부 브라우저에서 무시됨).

## 2026-04-17 — 공개 Server Action 방어 4종 세트 (honeypot + timing + sanitize + CSV strip)

- **증상**: Task 2-7 `/about` Contact 폼 구현 후 보안 리뷰에서 "공개 엔드포인트에 rate limit 없음 + UA/IP 무제한 + CSV injection 가능"로 CRITICAL 판정. dashboard Server Action 5패턴은 **인증된** 경로 기준이라 공개 엔드포인트에 부족.
- **원인**: dashboard 5패턴(catch 태그 + Zod safeParse + 소유권 + enum 재검증 + 명시 컬럼)은 인증 우회 가정이 없음. 공개 폼은 (1) 봇 스팸, (2) 헤더 스푸핑 + control char, (3) 엑셀 export 시 CSV injection, (4) `x-forwarded-for` 좌측 스푸핑이 추가 위협.
- **해결**: 공개 Server Action 추가 4종 세트 확립.
  1. **Honeypot + timing**: 숨은 `website` 필드 + `startedAt` 타임스탬프 → 3초 미만 or website 채워짐 → `{ success: true }` 조용히 드롭 (봇은 성공으로 착각하고 재시도 안 함).
  2. **sanitizeHeader(raw, max)**: control char(`\x00-\x1F\x7F`) 제거 + 길이 상한 slice. `user-agent` 500자, IP 64자.
  3. **stripFormulaTriggers**: `^[=+\-@\t\r]+` 저장 직전 제거 → 엑셀 export 시 `=HYPERLINK(...)` 공격 차단.
  4. **x-forwarded-for 우측 파싱**: `split(",").at(-1)` (Vercel은 맨 오른쪽이 프록시 강제 세팅값). 좌측은 클라이언트 스푸핑 가능.
  5. **Zod `.strict()`**: 미정의 키를 drop만 하지 않고 reject → 변조된 인자 조기 차단.
- **규칙**:
  1. 공개 Server Action은 항상 4종 세트 + `.strict()`. 이 5가지 없으면 공개 배포 금지.
  2. Phase 3에서 Redis/KV rate limit + reCAPTCHA가 추가되더라도 **honeypot + timing은 선제 방어로 유지** (비용 0, 차단율 ~80%).
  3. IP 로깅은 **감사 목적**. rate limit/auth 결정에 IP 단독 사용 금지 (Vercel `request.ip` 또는 Edge runtime의 신뢰 소스 사용).
  4. 외부에서 들어오는 자유 텍스트(`name`, `contact`, `ideaSummary`)는 Zod에 `.regex(/^[^\r\n\t<>]+$/)` 추가 (textarea `description` 제외 — 개행 허용) → 메일 헤더 injection 방어.
  5. dashboard 5패턴 + 공개 엔드포인트 4종 세트 = **Dairect Server Action 9패턴**.

## 2026-04-17 — useRef에 impure function 호출 시 React purity rule 에러

- **증상**: `const startedAtRef = useRef<number>(Date.now());` → eslint `react-hooks/purity` rule error. "Cannot call impure function during render".
- **원인**: `useRef`는 **초깃값을 lazy init 형태로 받지 못함** (항상 즉시 평가). 반면 `useState`는 `useState(() => Date.now())` lazy init 지원. React 19 + `react-hooks/purity` 규칙이 렌더 중 impure 호출을 에러로 올림.
- **해결**: `const [startedAt] = useState(() => Date.now());` — lazy init + 불변 참조.
- **규칙**:
  1. 렌더 시점에 한 번만 평가되어야 할 impure 값(`Date.now()`, `crypto.randomUUID()`, `Math.random()`)은 `useState(() => fn())` 패턴 사용.
  2. 꼭 `useRef`를 써야 한다면 `useRef<T | null>(null)` + `useEffect` 안에서 세팅.
  3. lint 에러를 `eslint-disable`로 우회하지 말 것. React 19의 purity rule은 Concurrent Mode + Strict Mode에서 실제 double-invoke 버그를 낳음.

## 2026-04-17 — Drizzle `check()` 헬퍼로 DB 레벨 enum 방어

- **증상**: `text({ enum: [...] })`로 선언된 컬럼에 Drizzle이 CHECK constraint를 **자동 생성하지 않음**. Zod는 앱 레이어 방어라 DB 직접 접근(SQL 클라이언트, 다른 서비스)으로 `"evil"` 같은 무효값 INSERT 가능.
- **원인**: Drizzle 0.45의 `text` 타입에서 `enum` 옵션은 **TypeScript 타입 좁히기 + Drizzle 쿼리 자동완성**만 담당. `ALTER TABLE ... ADD CONSTRAINT ... CHECK`는 별도 선언 필요.
- **해결**: `pgTable(name, cols, (t) => [check("name", sql\`${t.col} IS NULL OR ${t.col} IN (...)\`)])` 3번째 인자(테이블 옵션 배열)에 `check()` 헬퍼 추가 → `db:generate` 시 `ALTER TABLE ... ADD CONSTRAINT` 자동 생성.
- **규칙**:
  1. `text({ enum: [...] })` 컬럼은 **반드시 `check()` 제약을 쌍으로 선언**. Zod 단독 방어는 DB 직접 접근 경로에서 무효.
  2. 기존 테이블에 CHECK 추가 시 기존 데이터가 제약 위반이면 마이그레이션 실패. 먼저 `SELECT DISTINCT col FROM table`로 값 분포 확인 후 정리.
  3. 네이밍: `<table>_<col>_check` (예: `inquiries_package_check`) — Supabase 대시보드에서 가독성.
  4. `NULL` 허용 컬럼은 `col IS NULL OR col IN (...)` 형태로 명시 작성 (NULL은 `IN`에서 unknown으로 통과하지만 명시가 안전).

## 2026-04-16 — proxy.ts vs middleware.ts (Next.js 16.2)

- **증상**: `proxy.ts`로 내보낸 미들웨어가 작동하지 않음 (인증 보호 무효)
- **원인**: Next.js는 `src/middleware.ts` (또는 루트 `middleware.ts`)에서 `middleware` 함수를 export해야 인식. 파일명과 export명 둘 다 맞아야 함
- **해결**: `proxy.ts` → `src/middleware.ts`, `export async function proxy` → `export async function middleware`
- **규칙**: Next.js 미들웨어는 파일명 `middleware.ts` + export명 `middleware` 둘 다 고정. PRD/문서에서 "proxy" 용어를 사용하더라도 실제 구현은 Next.js 컨벤션을 따를 것.
