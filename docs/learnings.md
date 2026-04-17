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

## 2026-04-17 — 공개 URL 필드 SSRF/내부망 유도 방어 (regex로 부족)

- **증상**: Task 2-8-B 보안 리뷰에서 `publicLiveUrl`의 Zod 검증이 `/^https?:\/\/.+/` regex 하나뿐. `http://localhost`, `http://169.254.169.254/` (AWS metadata), `http://10.0.0.1`, `http://192.168.*` 같은 내부망/메타데이터 호스트가 저장되어 공개 페이지에 `<a href>`로 노출 가능. 사용자가 클릭하면 내부망 접근 유도.
- **원인**: regex는 문자열 패턴만 본다. URL의 **host 의미**(내부망 여부)는 `new URL()` 파싱 후 IP/도메인 분류 로직으로 판단해야 함. 공개 저장소(신뢰할 수 없는 입력)에 들어가는 URL은 저장측과 렌더측 **둘 다** 동일 로직이어야 drift 없음.
- **해결**: `isSafePublicUrl(v)` 함수로 통일.
  1. 제어문자/공백/꺾쇠 차단: `/[\x00-\x20\x7F<>]/.test(v)` → false
  2. `new URL(v)` 파싱 성공
  3. 프로토콜 `https:` 또는 `http:`만
  4. `isInternalHost(hostname)` — `localhost`/`0.0.0.0`/`::1` + `.local`/`.internal` 서픽스 + IPv4 대역(`127.*`, `10.*`, `169.254.*`, `192.168.*`, `172.16.*~172.31.*`, `0.*`) 차단
- **규칙**:
  1. 공개 저장 URL 필드는 **regex + new URL + 내부망 체크** 3단계 필수. 어느 하나라도 빠지면 SSRF/내부망 유도 창구.
  2. 저장시 검증 로직과 렌더시 검증 로직을 **같은 함수**로 → "저장됐는데 링크가 사라지는" 신뢰 버그 방지. 다만 지금은 레이어 분리상 쌍방 중복 — 필요 시 `src/lib/validation/public-url.ts`로 공용화.
  3. 외부 링크 렌더는 `target="_blank" rel="noopener noreferrer"` 필수.
  4. `javascript:` 스킴만 차단하던 단순 가드는 절반만 맞음. 메타데이터 엔드포인트(AWS: 169.254.169.254, GCP: `metadata.google.internal`) 반드시 차단.

## 2026-04-17 — Zod `.strict()` + refine의 에러 메시지 분리 (내부 정보 유출)

- **증상**: Server Action에서 `parsed.error.issues[0]?.message`로 사용자에게 에러 표출. `.strict()` 스키마가 미정의 키를 받으면 `unrecognized_keys` 에러가 issues 배열 **맨 앞**에 들어와 "알 수 없는 키 'foo'" 같은 내부 메시지가 사용자에게 노출.
- **원인**: `.strict()`는 악의적/변조된 요청 탐지용 방어 레이어. `unrecognized_keys` 이슈 자체는 **개발자/로그용 신호**이지 사용자에게 보여줄 메시지가 아님. 하지만 Zod는 issues 순서를 보장하지 않아 refine 메시지보다 먼저 올 수 있음.
- **해결**: 에러 표출 시 이슈 필터링.
  ```ts
  const userIssue = parsed.error.issues.find((i) => i.code !== "unrecognized_keys");
  if (!userIssue) console.error("[tag] unrecognized_keys", parsed.error.issues);
  return { success: false, error: userIssue?.message ?? "입력값이 올바르지 않습니다" };
  ```
- **규칙**:
  1. Zod `.strict()` 쓰는 Server Action의 에러 표출은 **반드시 `code !== "unrecognized_keys"` 필터** 적용.
  2. 미정의 키 감지는 로그로만 → 공격 탐지 신호.
  3. 일반화: 사용자 입력 오류와 스키마 구조 오류는 다른 채널로 다뤄야 함(사용자 vs 로그).
  4. Server Action 5패턴에 6번째 패턴 추가: **"Zod 에러 표출은 사용자-관련 issue만 통과"**.

## 2026-04-17 — Next.js App Router Static prerender 함정 (공개 DB 쿼리 페이지)

- **증상**: `/projects` Server Component에서 `db.select()` 호출했지만 `pnpm build` 결과에 `○ Static` 표시. 즉 빌드 시점의 DB 결과가 정적으로 굳어 대시보드에서 `isPublic=true`로 전환해도 공개 페이지에 안 나타남. 재배포 전까지 영구 반영 안 됨.
- **원인**: Next.js 15/16 App Router는 `cookies()`/`headers()` 등 동적 API를 호출하지 않는 Server Component를 기본 static 처리. DB 쿼리는 동적 API가 아니라서 static 대상. 이전 대시보드 페이지들이 `ƒ Dynamic`으로 잡힌 건 모두 `getUserId()` → `cookies()` 때문.
- **해결**: 공개 페이지에 `export const revalidate = 60` (또는 숫자) 명시 → ISR 전환. build 로그에 `○ ... 1m 1y` 형태로 revalidate 표시.
- **규칙**:
  1. 공개(인증 없는) Server Component에서 DB 쿼리로 데이터 노출하면 **반드시 `revalidate` 명시**. 미명시 시 build 시점 데이터 동결.
  2. 자주 바뀌면 `revalidate = 60`(1분). 거의 안 바뀌면 `revalidate = 3600`. 실시간 필요하면 `export const dynamic = "force-dynamic"`.
  3. `revalidate`는 **페이지 파일 최상단**에 export. 헬퍼 함수 내부에 숨기지 말 것.
  4. 동적 라우트 `[id]`는 기본 `ƒ Dynamic`이지만 `revalidate` 추가로 1분 캐시 가능 (build 로그 `ƒ`로 표시되어도 실제로는 캐시됨).
  5. 대시보드 mutation Server Action에서 `revalidatePath("/projects")` 호출 → revalidate 대기 없이 즉시 재생성 가능.

## 2026-04-17 — Supabase + Google OAuth 설정 3단계 함정 (redirect→key→site_url)

- **증상**: Task 2-8-B 검증 중 로그인 실패 3회 연속. 매번 다른 에러.
  1. 1차: `400 redirect_uri_mismatch`
  2. 2차: `/auth/callback` 후 "인증 실패" 화면
  3. 3차: `/auth/callback` 성공했지만 `exchangeCodeForSession failed: Invalid API key`
- **원인**: Supabase + Google OAuth 연동 시 놓치기 쉬운 3단계가 있음. 하나만 빠져도 다른 얼굴의 에러로 나타나 원인 파악 어려움.
  1. **Google Cloud Console OAuth Client 타입**: "Desktop" 타입으로 만들면 `Authorized redirect URIs` 필드 자체가 없음. **Web Application** 타입 필수. redirect URI = `https://<ref>.supabase.co/auth/v1/callback` (앱 URL 아님).
  2. **Supabase Site URL / Redirect URLs**: Supabase Auth → URL Configuration에서 개발 포트(localhost:3700)가 Site URL 또는 Redirect URLs allow list에 없으면 callback 후 다른 포트(예: localhost:3000)로 redirect되어 연결 실패.
  3. **`.env.local`의 NEXT_PUBLIC_SUPABASE_ANON_KEY**: 다른 Supabase 프로젝트(chatsio/autovox)의 키가 복붙되어 있으면 `exchangeCodeForSession`이 `Invalid API key (401)` 반환. JWT payload의 `ref` 필드가 현재 프로젝트 ref와 일치해야 함.
- **해결**: 진단 장비 3종 세트 — (a) Playwright로 실제 전송되는 `client_id`, `redirect_uri` 캡처, (b) Supabase `get_logs(service="auth")` MCP로 서버측 통과 여부 확인, (c) Next.js callback route에 임시 `console.error`로 실제 에러 메시지 출력 → dev 서버 로그 조회.
- **규칙**:
  1. 새 Supabase 프로젝트에 Google OAuth 붙일 때는 **3단계 체크리스트**를 반드시 먼저:
     - ① Google Cloud Console: OAuth Client = **Web Application** 타입 + Authorized redirect URIs에 `https://<supabase-ref>.supabase.co/auth/v1/callback` 등록
     - ② Supabase Dashboard → Auth → URL Configuration: Site URL + Redirect URLs가 **실제 앱 포트**와 일치 (dairect의 경우 `http://localhost:3700`)
     - ③ `.env.local` anon key JWT payload `ref` 필드가 현재 프로젝트 ref와 일치 (jwt.io 디코딩으로 확인 가능)
  2. OAuth 디버깅 시 **실패 지점을 3단계로 분리**해 각각 확인: Google → Supabase Auth → Next.js callback. 한 번에 다 보려 하지 말 것.
  3. 프로젝트 간 `.env.local` 복사 금지. 각 Supabase 프로젝트마다 anon key가 고유. "이전 프로젝트에서 잘 됐으니 그대로 쓰면 되겠지"가 가장 흔한 함정.
  4. `auth/callback/route.ts`에서 `exchangeCodeForSession` 에러는 **기본값으로 `console.error` 출력 필요**. 현재 구현은 에러 숨기고 `/login?error=auth_failed`로만 보냄 → 운영자가 원인 파악 불가. Phase 3에서 error 메시지 로깅 + Sentry 연동 고려.

## 2026-04-17 — auth.users ↔ public.users 동기화 부재 (FK 위반)

- **증상**: 로그인 성공 후 프로젝트 생성 시 `PostgresError 23503: foreign key constraint "projects_user_id_users_id_fk"` / `Key (user_id)=(...) is not present in table "users"`.
- **원인**: Supabase Auth가 관리하는 `auth.users` 스키마와, 앱 스키마의 `public.users`는 별개 테이블. Supabase는 기본적으로 **동기화 안 함**. `projects` 테이블이 `public.users`를 FK로 참조하는데, Jayden은 `auth.users`에만 존재하고 `public.users`엔 row 없음 → 삽입 실패.
- **해결**: **dashboard/layout.tsx에 자동 upsert 추가**.
  ```ts
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/login");

  await db.insert(users).values({
    id: user.id,
    email: user.email,
    name: metadata.full_name ?? metadata.name ?? null,
    avatarUrl: metadata.avatar_url ?? metadata.picture ?? null,
  }).onConflictDoNothing({ target: users.id });
  ```
- **규칙**:
  1. Supabase Auth + 커스텀 `public.users` 스키마 조합 시 **반드시 동기화 전략 1개 이상 구현**. 선택지:
     - (a) **App-level upsert**: `dashboard/layout.tsx` 또는 `middleware` 같이 인증 후 첫 진입점에서 `onConflictDoNothing` upsert. Drizzle 사용 가능. Edge runtime 제약 없는 위치여야 함 (middleware는 Edge).
     - (b) **DB-level trigger**: `auth.users` INSERT 트리거로 `public.users` 자동 생성. Supabase SQL Editor에서 설정. `handle_new_user()` function + `on_auth_user_created` trigger 표준 패턴.
  2. (a)는 코드로 해결 가능·추적 쉬움 / (b)는 자동화·성능 이득. 두 방식 중 하나만 선택, 중복 금지.
  3. `onConflictDoNothing({ target: users.id })`는 매 진입 시 한 번씩 실행되지만 충돌 시 no-op이라 비용 미미.
  4. middleware에서 처리하려면 Edge runtime 호환 DB 라이브러리(예: `postgres` with `fetch`) 필요. 기본 `postgres.js`는 Node.js 전용이라 middleware 불가 → **layout.tsx 선호**.
  5. Task 0-3 (Auth 설정)에서 이 동기화 로직이 빠졌다. 새 프로젝트 init 체크리스트에 반드시 추가.

## 2026-04-17 — Next.js 15/16 "use server" 파일에서 `export type` 금지

- **증상**: Task 3-4 리드 CRM `pnpm build` 에서 `The export LeadSource was not found in module .../actions.ts` 에러 4건. tsc는 통과하지만 Next.js 빌드 시 Server Action 번들러가 실패. 런타임이 아닌 **빌드 단계**에서만 발생.
- **원인**: Next.js App Router는 `"use server"` 지시어가 붙은 파일의 **모든 export를 Server Action(async function)으로 직렬화 시도**. RSC payload에 참조할 런타임 값이 있어야 하는데, `export type { ... }`는 컴파일 시 제거되는 타입 참조라 실제 export entry가 없음. 번들러가 "`LeadSource`라는 이름으로 export된 Server Action을 찾을 수 없다"고 에러.
- **해결**: actions.ts에서 `export type { LeadSource, LeadStatus }` 제거. 페이지/컴포넌트는 `@/lib/validation/leads`에서 직접 import.
- **규칙**:
  1. `"use server"` 파일에서는 **async function만 export**. `export type`/`export interface`/`export const`(non-function) 금지. TypeScript는 허용하지만 Next.js 빌드가 거부.
  2. 타입 정의는 별도 파일(`validation/*.ts`, `types/*.ts`)에서 관리하고 actions.ts는 그것을 import만.
  3. actions.ts 내부에서 쓰는 로컬 타입(`ActionResult` 등)은 **`type`만 선언하고 export 금지** — `type ActionResult = {...}` (export 없이).
  4. 증상 체크법: tsc PASS + build FAIL + `Export <Name> doesn't exist in target module` → 90%는 이 문제.
  5. Server Action 5→6→9패턴에 10번째 추가: **"type re-export 금지"**.

## 2026-04-17 — Supabase Session Pool(15슬롯) vs Next.js 빌드 워커(9개) × postgres.js 기본 max(10)

- **증상**: `/projects` 페이지 prerender 중 `EMAXCONNSESSION max clients reached in session mode - max clients are limited to pool_size: 15` 에러. `pnpm build` 재시도해도 매번 동일. Task 3-4 코드와 무관하게 기존 페이지에서 발생.
- **원인**: Next.js 빌드가 워커 9개 병렬로 prerender → 각 워커가 독립 Node 프로세스라 postgres.js client도 독립 인스턴스 → 각 인스턴스 **default `max: 10`** → 총 90 connections 열림 시도. Supabase Pooler의 **Session mode(port 5432)**는 15슬롯 한도. 쉽게 초과.
- **해결**: `src/lib/db/index.ts`에서 `postgres(url, { prepare: false, max: 1, idle_timeout: 20 })`로 제한. 빌드 워커 9개 × 1 = 9 < 15. 통과.
- **규칙**:
  1. Supabase Pooler + Next.js 조합에서는 **반드시 `max` 옵션 명시**. 기본값(10)은 빌드 시 거의 항상 초과.
  2. `max: 1` + `idle_timeout: 20` 조합이 정석. 런타임 런리퀘스트당 1개 사용, 유휴 20초 후 회수.
  3. 더 확실한 해결: `DATABASE_URL`을 **Transaction mode(port 6543)**로 전환. Session mode는 긴 연결용이라 빌드 병렬에 부적합. 다만 마이그레이션(`drizzle-kit push`)은 여전히 Direct(5432) 필요 → env를 `DATABASE_URL`(런타임)과 `MIGRATE_DATABASE_URL`(마이그레이션)로 분리하는 패턴도 고려.
  4. 디버깅 시 의심 순서: (1) Drizzle Studio가 5-10 슬롯 점유 중인지 확인 (2) `pnpm dev` 중복 실행 여부 (3) postgres.js max 미명시 여부. 이 3가지만 체크하면 대부분 해결.
  5. 에러 메시지에 "session mode"가 있으면 포트 5432 사용 중이라는 결정적 증거. "transaction mode"면 포트 6543.

## 2026-04-17 — 트랜잭션 내 UPDATE WHERE 조건이 경쟁 조건을 막는 유일한 확실한 방법

- **증상**: `convertLeadToProjectAction`을 더블클릭(또는 두 탭 동시 제출) 시 `clients`와 `projects` 레코드가 2개씩 생성되고 `leads.convertedToProjectId`는 두 번째 UPDATE가 덮어씀. 첫 번째 project는 lead와 연결 끊긴 고아 상태.
- **원인**: "트랜잭션 전 사전 체크(`if (lead.convertedToProjectId) return error`)" → "트랜잭션 내 INSERT + 마지막 UPDATE" 구조. 사전 체크는 **트랜잭션 밖에서 읽은 스냅샷**이라 두 요청이 거의 동시에 들어오면 둘 다 `null` 읽고 둘 다 통과. 트랜잭션 내부 UPDATE는 `WHERE id = x AND userId = y`만 있어서 경합하지 않음.
- **해결**: 트랜잭션 내부 UPDATE의 WHERE 절에 `isNull(leads.convertedToProjectId)` 추가 + `.returning({id})` + `rowsAffected === 0` 시 `throw new Error("ALREADY_CONVERTED")` → 전체 트랜잭션 롤백. catch에서 해당 에러 잡아서 사용자 메시지 반환.
  ```ts
  const updateResult = await tx
    .update(leads)
    .set({ status: "contracted", convertedToProjectId: newProject.id })
    .where(and(
      eq(leads.id, idCheck.data),
      eq(leads.userId, userId),
      isNull(leads.convertedToProjectId),  // ← 핵심
    ))
    .returning({ id: leads.id });
  if (updateResult.length === 0) throw new Error("ALREADY_CONVERTED");
  ```
- **규칙**:
  1. **"이미 처리됨"을 막는 사전 체크는 참조용으로만 의미**. 확실한 방어는 **트랜잭션 내 UPDATE WHERE 조건**. Postgres가 row-level lock으로 직렬화해주기 때문.
  2. UPDATE에 `.returning()` 추가 → rowsAffected 확인 → 0이면 throw. 이 3단 콤보가 Drizzle에서 "조건부 실행" 구현하는 표준 패턴.
  3. 트랜잭션 내에서 throw하면 Drizzle이 자동 롤백. 동일 트랜잭션의 INSERT도 함께 취소됨 → 고아 레코드 방지.
  4. 일반화 — "한 번만 수행되어야 하는" 상태 전환은 모두 동일 패턴:
     - 리드 → 프로젝트 전환 (이번 케이스)
     - 견적 승인 (draft → accepted)
     - 계약 서명 (sent → signed)
     - 청구서 입금 확인 (sent → paid)
     각각 UPDATE WHERE에 현재 상태 조건 포함 필요.
  5. **Dairect Server Action 9패턴 → 10패턴**: "한 번만 수행되어야 하는 상태 전환은 UPDATE WHERE에 현재 상태 조건 + rowsAffected 체크".

## 2026-04-17 — Supabase auth.users 직접 SQL INSERT 시 토큰 컬럼은 NULL 금지 (빈 문자열 필수)

- **증상**: `auth.users` + `auth.identities`에 SQL로 직접 계정을 만들었는데 `supabase.auth.signInWithPassword()` 가 500 에러 반환. UI엔 "이메일 또는 비밀번호가 올바르지 않습니다"로만 나옴. password_matches(crypt 검증)는 true, email_confirmed_at도 정상, identity 매핑도 1건 있는데 로그인 실패.
- **원인**: Supabase Auth 서비스(Go, gotrue)가 사용자 조회 시 `confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change_token_current`, `email_change`, `phone_change`, `phone_change_token`, `reauthentication_token` 컬럼들을 **NOT NULL string**으로 Scan한다. 스키마상 NULL 허용이지만 Go 드라이버는 string 타입에 NULL을 변환하지 못해 `"sql: Scan error on column index 3, name 'confirmation_token': converting NULL to string is unsupported"` 에러 발생 → HTTP 500. 에러는 서버 로그에만 노출되고 UI엔 일반 메시지로만 보임.
- **해결**: INSERT 시 해당 컬럼들을 명시적으로 `''`(빈 문자열)로 지정. 이미 만든 계정은 `UPDATE auth.users SET confirmation_token = COALESCE(confirmation_token, ''), ...` 로 보정.
- **규칙**:
  1. 가장 안전한 방법은 **Supabase Admin API**(`supabase.auth.admin.createUser`). `SERVICE_ROLE_KEY` 있으면 항상 이걸 쓸 것. 내부적으로 올바른 필드를 채워줌.
  2. SERVICE_ROLE_KEY가 없거나 MCP `execute_sql`로 작업해야 할 때는 **8개 토큰 컬럼을 `''`로 명시**:
     `confirmation_token, recovery_token, email_change_token_new, email_change_token_current, email_change, phone_change, phone_change_token, reauthentication_token`
  3. 디버깅 체크리스트 (로그인 500 에러 시):
     - (a) `SELECT email_confirmed_at, encrypted_password, aud, role FROM auth.users` — 기본 필드 확인
     - (b) `SELECT count(*) FROM auth.identities WHERE user_id = ?` — identity 1건 이상
     - (c) `crypt(password, encrypted_password) = encrypted_password` — password hash 검증
     - (d) **Supabase MCP `get_logs(service="auth")` — 실제 에러 메시지 확인** (가장 결정적)
  4. Supabase Auth 에러는 UI엔 일반 메시지로 마스킹되므로 **반드시 `get_logs`로 내부 에러 조회**. "비밀번호 틀림"처럼 보여도 실제론 스키마/NULL 이슈인 경우가 흔하다.
  5. 싱글테넌트(Jayden 혼자 운영) + Claude 테스트 자동화 니즈의 최소 침습 패턴: `/login`에 이메일/비번 로그인 폼만 추가(회원가입 버튼 없음) + Supabase 직접 생성 계정. 회원가입은 Phase 5 SaaS 전환 시점에 정식 추가.

## 2026-04-16 — proxy.ts vs middleware.ts (Next.js 16.2)

- **증상**: `proxy.ts`로 내보낸 미들웨어가 작동하지 않음 (인증 보호 무효)
- **원인**: Next.js는 `src/middleware.ts` (또는 루트 `middleware.ts`)에서 `middleware` 함수를 export해야 인식. 파일명과 export명 둘 다 맞아야 함
- **해결**: `proxy.ts` → `src/middleware.ts`, `export async function proxy` → `export async function middleware`
- **규칙**: Next.js 미들웨어는 파일명 `middleware.ts` + export명 `middleware` 둘 다 고정. PRD/문서에서 "proxy" 용어를 사용하더라도 실제 구현은 Next.js 컨벤션을 따를 것.
