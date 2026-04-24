type Project = {
  num: string;
  slug: string;
  cat: "saas" | "automation" | "editorial" | "tools";
  name: string; // rendered with amber segment via nameAmber split
  nameAmber: string; // last portion to wrap in amber
  ko: string;
  badge: string; // "★ Featured · SaaS" etc
  desc: React.ReactNode;
  year: string;
  dur: string;
  stack: string;
  status: string;
  statusType: "live" | "wip";
  meta: string;
};

export const projects: readonly Project[] = [
  {
    num: "N°01",
    slug: "chatsio",
    cat: "saas",
    name: "Chat",
    nameAmber: "sio",
    ko: "한국 중소기업을 위한 AI 고객 상담 SaaS",
    badge: "★ Featured · SaaS",
    desc: (
      <>
        전화·카톡·이메일로 흩어져 있던 CS 문의를 한 화면에 모으고, 반복 질문의
        82%를 AI가 <em>자동 응답</em>으로 처리합니다. 상담사는 이제 진짜 어려운
        문의에만 집중합니다. 3개 가맹점 체인에서 파일럿 후 12개로 확대.
      </>
    ),
    year: "2025",
    dur: "2w",
    stack: "Next.js · Supabase · Claude",
    status: "Live · 12 clients",
    statusType: "live",
    meta: "AI CHAT · N°01",
  },
  {
    num: "N°02",
    slug: "findably",
    cat: "saas",
    name: "Findably",
    nameAmber: ".",
    ko: "AI 마케팅 헬스 진단 도구",
    badge: "★ Featured · SaaS",
    desc: (
      <>
        회사 도메인만 입력하면 SEO·콘텐츠·광고·리뷰 4개 축을 스캔해 100점
        만점으로 리포트합니다. 대행사 컨설팅 <em>40만원</em>짜리를{" "}
        <em>4만원</em>으로. 현재 B2B 마케터 2,400명이 월 1회 자가진단에 사용 중.
      </>
    ),
    year: "2025",
    dur: "3w",
    stack: "Next.js · OpenAI · Stripe",
    status: "Live · 2.4k MAU",
    statusType: "live",
    meta: "MKT DIAG · N°02",
  },
  {
    num: "N°03",
    slug: "autovox",
    cat: "automation",
    name: "AutoVox",
    nameAmber: ".",
    ko: "음성 자동화 워크플로우",
    badge: "★ Featured · Automation",
    desc: (
      <>
        녹음 버튼 누르고 &ldquo;김대리한테 내일 회의 자료 부탁한다고 노션에
        달아줘&rdquo;라고 말하면 — 그대로 됩니다. Whisper로 받아적고 Claude가
        의도를 파싱, Make.com이 <em>실제 액션</em>으로 연결. 평균{" "}
        <em>240ms</em>.
      </>
    ),
    year: "2025",
    dur: "2w",
    stack: "Whisper · Claude · Make",
    status: "Live · 140 users",
    statusType: "live",
    meta: "VOICE → ACTION",
  },
  {
    num: "N°04",
    slug: "pm-dashboard",
    cat: "tools",
    name: "PM Dash",
    nameAmber: "board",
    ko: "프리랜서/1인 스튜디오용 프로젝트 관리 툴",
    badge: "Tools",
    desc: (
      <>
        노션·구글시트·이메일로 쪼개진 프로젝트 상태를 <em>한 장</em>에 고정.
        인보이스·견적·타임라인·회고를 프로젝트 단위로 묶어 보여줍니다. 원래는
        저희 내부용이었는데, 주변이 하도 부탁해서 오픈.
      </>
    ),
    year: "2026",
    dur: "2w",
    stack: "Next.js · Postgres · Vercel",
    status: "Live · beta",
    statusType: "live",
    meta: "INTERNAL TOOL",
  },
  {
    num: "N°05",
    slug: "sobun-daily",
    cat: "editorial",
    name: "Sōbun ",
    nameAmber: "Daily",
    ko: "업계별 뉴스레터 자동 생성 엔진",
    badge: "Editorial",
    desc: (
      <>
        RSS·SNS·뉴스 포털을 24시간 크롤링, Claude가 편집장 역할로{" "}
        <em>하루치 요약</em>을 만듭니다. 월 6,800원이면 자기 업계만의 아침
        브리핑. F&amp;B·뷰티·커머스 3개 버전 런칭.
      </>
    ),
    year: "2025",
    dur: "3w",
    stack: "Node · Claude · Buttondown",
    status: "Live · 3 editions",
    statusType: "live",
    meta: "NEWSLETTER ENGINE",
  },
  {
    num: "N°06",
    slug: "briefcase",
    cat: "saas",
    name: "Brief",
    nameAmber: "case",
    ko: "에이전시용 클라이언트 온보딩 자동화",
    badge: "SaaS",
    desc: (
      <>
        새 클라이언트가 들어올 때마다 똑같이 반복되던 브리프·NDA·아카이브
        폴더·슬랙 채널 생성을 <em>한 클릭</em>으로. 서울 크리에이티브 에이전시
        2곳이 내부 운영툴로 도입.
      </>
    ),
    year: "2025",
    dur: "3w",
    stack: "Next.js · Slack API · Notion API",
    status: "Live · 2 agencies",
    statusType: "live",
    meta: "CLIENT ONBOARDING",
  },
  {
    num: "N°07",
    slug: "ledgerly",
    cat: "automation",
    name: "Ledger",
    nameAmber: "ly",
    ko: "카페·소상공인 영수증 → 장부 자동화",
    badge: "Automation",
    desc: (
      <>
        쌓여 있는 영수증을 찍기만 하면 OCR + Claude가 카테고리별로{" "}
        <em>장부에 꽂아</em> 넣습니다. 사장님이 직접 세무사에게 보낼 수 있는
        월별 리포트까지. 서울 동네 카페 4곳 파일럿.
      </>
    ),
    year: "2025",
    dur: "2w",
    stack: "React Native · GPT-4V · Sheets",
    status: "Pilot · 4 cafes",
    statusType: "live",
    meta: "CAFÉ BOOKKEEPING",
  },
  {
    num: "N°08",
    slug: "preface",
    cat: "editorial",
    name: "Pre",
    nameAmber: "face",
    ko: "독립 출판 작가용 원고 편집 도구",
    badge: "Editorial",
    desc: (
      <>
        원고를 붙여넣으면 Claude가 <em>편집자 역할</em>로 논리 흐름·반복
        표현·톤 일관성을 코멘트합니다. 마치 경험 많은 에디터가 여백에 빨간펜을
        쓴 것처럼. 독립 작가 12명 베타.
      </>
    ),
    year: "2025",
    dur: "2w",
    stack: "Next.js · Claude · Tiptap",
    status: "Closed beta",
    statusType: "wip",
    meta: "AUTHOR TOOL",
  },
  {
    num: "N°09",
    slug: "relay",
    cat: "automation",
    name: "Re",
    nameAmber: "lay",
    ko: "야간 CS → 아침 브리프 자동 전달",
    badge: "Automation",
    desc: (
      <>
        밤새 들어온 고객 문의를 Claude가 <em>우선순위</em>로 정리, 아침 9시
        상담팀 슬랙에 &ldquo;오늘 먼저 보세요&rdquo; 카드로 던집니다. 교대
        인수인계 시간을 하루 40분 → 8분.
      </>
    ),
    year: "2024",
    dur: "1w",
    stack: "Zapier · Claude · Slack",
    status: "Live · internal",
    statusType: "live",
    meta: "CS HANDOFF",
  },
  {
    num: "N°10",
    slug: "this-site",
    cat: "saas",
    name: "",
    nameAmber: "dairect.kr",
    ko: "이 사이트 자체 — 우리가 만든 우리 현관",
    badge: "SaaS · meta",
    desc: (
      <>
        스튜디오의 첫 인상이자 데모. 워드마크부터 타이포 시스템, 모션, 케이스
        스터디 레이아웃까지 전부 <em>in-house</em>로. 이 페이지도 포함입니다.
        말 그대로 <em>eat your own dog food</em>.
      </>
    ),
    year: "2024",
    dur: "ongoing",
    stack: "HTML · CSS · vanilla JS",
    status: "Live · v1.0",
    statusType: "live",
    meta: "STUDIO CORE",
  },
];

const filterCounts = {
  all: 10,
  saas: 4,
  automation: 3,
  editorial: 2,
  tools: 1,
} as const;

const filters = [
  { key: "all", label: "All" },
  { key: "saas", label: "SaaS" },
  { key: "automation", label: "Automation" },
  { key: "editorial", label: "Editorial" },
  { key: "tools", label: "Tools" },
] as const;

export function ProjectsHero() {
  return (
    <section className="p-hero" data-screen-label="01 Index Hero">
      <div className="container">
        <p className="p-hero-kicker">
          — <em>index</em> of Work · N°01 → N°10
        </p>
        <h1 className="p-hero-head">
          Ten projects.
          <span className="it">Ten stories.</span>
        </h1>
        <p className="p-hero-ko">
          열 개의 프로젝트, 열 개의 이야기. 각 프로젝트는{" "}
          <em
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}
          >
            a specific direction
          </em>{" "}
          — 실제 고객의 실제 문제 — 에서 시작했고,{" "}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.94em",
            }}
          >
            execution
          </code>
          은 AI와 2~3주간의 집중이 맡았습니다.
        </p>

        <div className="p-filters" role="tablist" aria-label="Project filters">
          {filters.map((f, i) => (
            <button
              key={f.key}
              className="p-filter"
              role="tab"
              data-filter={f.key}
              aria-selected={i === 0 ? "true" : "false"}
              type="button"
            >
              {f.label}{" "}
              <span className="count">
                {String(filterCounts[f.key]).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsIndex() {
  return (
    <section className="p-index" data-screen-label="02 Project Index">
      <div className="p-index-head">
        <h2>
          The <span className="it">full index.</span>
        </h2>
        <span className="mono">
          10 records · 2024 → 2026 · hover any row
        </span>
      </div>

      {projects.map((p) => (
        <article
          key={p.slug}
          className="p-row"
          data-cat={p.cat}
          data-name={p.name + p.nameAmber}
          data-meta={p.meta}
          data-year={p.year}
        >
          <div className="pr-num">
            {p.num}
            <span className="slash"> / </span>10
          </div>
          <div className="pr-title">
            <span className="en">
              {p.name}
              <span className="amber">{p.nameAmber}</span>
            </span>
            <span className="ko">{p.ko}</span>
            <span className="cat">{p.badge}</span>
          </div>
          <p className="pr-desc">{p.desc}</p>
          <div className="pr-meta">
            <div className="row">
              <span className="k">Year</span>
              <span className="v">{p.year}</span>
            </div>
            <div className="row">
              <span className="k">Dur.</span>
              <span className="v">{p.dur}</span>
            </div>
            <div className="row">
              <span className="k">Stack</span>
              <span className="v">{p.stack}</span>
            </div>
            <div className="row status">
              <span className="k">Status</span>
              <span className={`v ${p.statusType}`}>{p.status}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function ProjectsCTA() {
  return (
    <section className="p-cta" id="contact" data-screen-label="07 Closing CTA">
      <span className="p-cta-bg" aria-hidden="true">
        next.
      </span>
      <div className="container">
        <p className="p-cta-kicker">
          — N°11 · <em>could be</em> yours
        </p>
        <h2 className="p-cta-head">
          Your project
          <span className="it">could be next.</span>
        </h2>
        <p className="p-cta-ko">
          다음 프로젝트의 주인공이 되어보세요. 브리프 한 줄이면 충분합니다 —
          방향은 저희가 함께 정리해드리고, 실행은{" "}
          <em
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}
          >
            2~3주
          </em>{" "}
          안에 끝납니다.
        </p>
        <div className="p-cta-row">
          <a href="/about#contact" className="btn-primary">
            Start a conversation{" "}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a href="mailto:hello@dairect.kr" className="btn-ghost">
            hello@dairect.kr
          </a>
        </div>
      </div>
    </section>
  );
}
