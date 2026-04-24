import Link from "next/link";
import type { ReactNode } from "react";

export function AboutHero() {
  return (
    <section className="a-hero" data-screen-label="01 About Hero">
      <div className="a-hero-portrait">
        <div className="a-portrait-frame" id="portrait" data-style="svg">
          <span className="pf-corner tl" aria-hidden="true" />
          <span className="pf-corner tr" aria-hidden="true" />
          <span className="pf-corner bl" aria-hidden="true" />
          <span className="pf-corner br" aria-hidden="true" />

          <div className="pf-top">
            <span>
              N°<span className="amber"> 01</span>
            </span>
            <span>FILE /DAIRECT/FOUNDER.TIF</span>
          </div>

          <div className="a-portrait-svg" aria-hidden="true">
            <svg viewBox="0 0 200 240" width="100%" height="100%">
              <defs>
                <pattern
                  id="pgrain"
                  width="3"
                  height="3"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="3" height="3" fill="none" />
                  <circle
                    cx="1"
                    cy="1"
                    r="0.3"
                    fill="rgba(245,241,232,0.08)"
                  />
                </pattern>
              </defs>
              <ellipse
                cx="100"
                cy="88"
                rx="38"
                ry="46"
                fill="none"
                stroke="#F5F1E8"
                strokeWidth="1.2"
              />
              <path
                d="M 36 240 C 36 180, 60 150, 100 150 C 140 150, 164 180, 164 240"
                fill="none"
                stroke="#F5F1E8"
                strokeWidth="1.2"
              />
              <circle
                cx="86"
                cy="86"
                r="9"
                fill="none"
                stroke="#FFB800"
                strokeWidth="1"
              />
              <circle
                cx="114"
                cy="86"
                r="9"
                fill="none"
                stroke="#FFB800"
                strokeWidth="1"
              />
              <line
                x1="95"
                y1="86"
                x2="105"
                y2="86"
                stroke="#FFB800"
                strokeWidth="1"
              />
              <path
                d="M 62 70 Q 100 42, 138 70"
                fill="none"
                stroke="#F5F1E8"
                strokeWidth="1.2"
              />
              <rect
                x="0"
                y="0"
                width="200"
                height="240"
                fill="url(#pgrain)"
              />
              <text
                x="14"
                y="232"
                fontFamily="Fraunces, serif"
                fontStyle="italic"
                fontWeight="300"
                fontSize="12"
                fill="rgba(245,241,232,0.55)"
              >
                — J.J.
              </text>
            </svg>
          </div>

          <div className="pf-bot">
            <span>SEOUL · 2025</span>
            <span>
              —<span className="amber"> DAIRECT</span>
            </span>
          </div>
        </div>
      </div>

      <div className="a-hero-text">
        <p className="a-persona-label">
          — VIBE · ARCHITECT
          <span className="sub">바이브 아키텍트 / 방향 설계자</span>
        </p>

        <h1 className="a-name">
          Jayden
          <br />
          Joo<span className="dot">.</span>
        </h1>

        <div className="a-title-strip">
          <span>Founder</span>
          <span className="sep">/</span>
          <span className="role-it">Director</span>
          <span className="sep">/</span>
          <span className="role-it">Writer</span>
          <span className="sep">/</span>
          <span>Seoul</span>
        </div>

        <blockquote className="a-quote">
          I don&apos;t write the code.
          <br />I write the <em>direction.</em>
          <span className="ko">제가 코드를 쓰지 않습니다. 저는 방향을 씁니다.</span>
        </blockquote>
      </div>
    </section>
  );
}

type Milestone = {
  date: ReactNode;
  year: ReactNode;
  title: ReactNode;
  desc: ReactNode;
  signal?: boolean;
};

const milestones: readonly Milestone[] = [
  {
    date: (
      <>
        2025 · <span className="amber">OCT</span>
      </>
    ),
    year: (
      <>
        2025<span className="it">.10</span>
      </>
    ),
    title: (
      <>
        First <em>direction.</em>
      </>
    ),
    desc: (
      <>
        8년간 써온 워드프레스 블로그를 Claude Code로 다시 지으며 깨닫다 —{" "}
        <em>나는 코드를 쓰는 게 아니라, 방향을 쓰고 있었다.</em>
      </>
    ),
    signal: true,
  },
  {
    date: <>2025 · NOV</>,
    year: (
      <>
        2025<span className="it">.11</span>
      </>
    ),
    title: (
      <>
        Chatsio, <em>v0.</em>
      </>
    ),
    desc: (
      <>
        미용실 예약 챗봇 초기 버전. 고객과 첫 <em>자동 대화</em>가 성사된 밤 —
        작동하는 제품의 감각을 확인하다.
      </>
    ),
  },
  {
    date: <>2025 · DEC</>,
    year: (
      <>
        2025<span className="it">.12</span>
      </>
    ),
    title: (
      <>
        Findably <em>launches.</em>
      </>
    ),
    desc: (
      <>
        소상공인 SEO 대시보드. 첫 유료 고객.{" "}
        <em>월 4만 원이 가능한 소프트웨어</em>에 대한 질문이 서비스의 모양을
        정했다.
      </>
    ),
  },
  {
    date: (
      <>
        2026 · <span className="amber">JAN</span>
      </>
    ),
    year: (
      <>
        2026<span className="it">.01</span>
      </>
    ),
    title: (
      <>
        dairect<span style={{ color: "var(--signal)" }}>.</span> —{" "}
        <em>the name.</em>
      </>
    ),
    desc: (
      <>
        D (Director) + AI + RECT (Direct). 워드마크와 어원, 슬로건이 같은 날
        정해졌다. <em>이름은 방향의 첫 증거다.</em>
      </>
    ),
    signal: true,
  },
  {
    date: <>2026 · FEB</>,
    year: (
      <>
        2026<span className="it">.02</span>
      </>
    ),
    title: <>AutoVox · Sōbun Daily.</>,
    desc: (
      <>
        음성 에이전트와 일본어 뉴스 다이제스트가 같은 주에 배포됐다.{" "}
        <em>execution</em>이 동시에 두 방향으로 흘렀다.
      </>
    ),
  },
  {
    date: <>2026 · MAR</>,
    year: (
      <>
        2026<span className="it">.03</span>
      </>
    ),
    title: (
      <>
        PM Dashboard &amp; <em>Briefcase.</em>
      </>
    ),
    desc: (
      <>
        내부 도구 2종. 스튜디오의 하루를 스튜디오가 만든 도구로 돌리기 시작 —{" "}
        <em>dogfooding as discipline.</em>
      </>
    ),
  },
  {
    date: (
      <>
        2026 · <span className="amber">APR</span>
      </>
    ),
    year: (
      <>
        2026<span className="it">.04</span>
      </>
    ),
    title: (
      <>
        The Studio <em>Anthem.</em>
      </>
    ),
    desc: (
      <>
        색 팔레트와 타이포 시스템, 그리드와 모션 규약을 문서화.{" "}
        <em>브랜드가 언어가 되는 순간.</em> 이 페이지도 그 위에 서 있다.
      </>
    ),
    signal: true,
  },
  {
    date: <>2026 · APR</>,
    year: (
      <>
        2026<span className="it">.04</span>
      </>
    ),
    title: <>Ten shipped.</>,
    desc: (
      <>
        Ledgerly · Preface · Relay · dairect.kr — 여섯 달 사이{" "}
        <em>열 개의 실체</em>. 이 리스트가 이 스튜디오의 첫 포트폴리오다.
      </>
    ),
  },
  {
    date: (
      <>
        2026 · <span className="amber">NOW</span>
      </>
    ),
    year: (
      <>
        NOW<span className="it">.</span>
      </>
    ),
    title: (
      <>
        Writing the <em>next one.</em>
      </>
    ),
    desc: (
      <>
        다음 방향을 쓰고 있다. <em>Manuscript in progress.</em> — 당신의
        프로젝트가 여기에 들어올 수도 있다.
      </>
    ),
  },
];

export function AboutTimeline() {
  return (
    <section className="a-timeline" data-screen-label="02 Timeline">
      <div className="a-tl-head">
        <div>
          <p className="a-tl-kicker">
            — §02 / <em>timeline</em> · 2025→2026
          </p>
          <h2 className="a-tl-title">
            Six months,
            <span className="it">ten projects.</span>
          </h2>
        </div>
        <div className="a-tl-aside">
          2025년 말, 첫 번째 <em>direction</em>을 썼다. 그로부터 반 년 사이에
          스튜디오 이름이 생겼고, 열 개의 <code>execution</code>이 출고됐다.
          — <em>짧은 시간이 아니라, 밀도의 문제.</em>
        </div>
      </div>

      <div className="a-tl-drag-hint">
        <span>
          <span className="amber">←</span> &nbsp;DRAG &nbsp;/&nbsp; SCROLL
          &nbsp;/&nbsp; SWIPE&nbsp; <span className="amber">→</span>
        </span>
        <span className="dots" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} />
          ))}
        </span>
      </div>

      <div
        className="a-tl-scroll"
        id="tl-scroll"
        tabIndex={0}
        aria-label="Timeline, scroll horizontally"
      >
        <div className="a-tl-track">
          {milestones.map((m, i) => (
            <article
              key={i}
              className={`a-tl-mile${m.signal ? " is-signal" : ""}`}
            >
              <div className="a-tl-date">{m.date}</div>
              <div className="a-tl-year">{m.year}</div>
              <h3 className="a-tl-title-m">{m.title}</h3>
              <p className="a-tl-desc">{m.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type Essay = {
  num: string;
  title: ReactNode;
  ko: string;
  en: ReactNode;
  enKo: string;
  meta: string;
  quarter: string;
};

const essays: readonly Essay[] = [
  {
    num: "ESSAY № 01",
    title: (
      <>
        Why <em>direction</em>
        <br />
        is a product.
      </>
    ),
    ko: "방향은, 이미 하나의 제품이다.",
    en: (
      <>
        — the first draft lives in my notebook. I&apos;ll translate it here
        when the ink is dry.
      </>
    ),
    enKo: "초고는 아직 노트에 있습니다. 잉크가 마르면 옮겨 적습니다.",
    meta: "~ 2,400 words · drafted",
    quarter: "Q2 · 2026",
  },
  {
    num: "ESSAY № 02",
    title: (
      <>
        The cost of <em>not</em>
        <br />
        being a coder.
      </>
    ),
    ko: "코더가 아닌 자의 값.",
    en: (
      <>
        — on what Jayden gained by <em>not</em> learning to type semicolons,
        and what he paid for that choice.
      </>
    ),
    enKo: "세미콜론을 배우지 않음으로써 얻은 것, 그리고 그 대가에 대하여.",
    meta: "~ 3,100 words · outlined",
    quarter: "Q3 · 2026",
  },
  {
    num: "ESSAY № 03",
    title: (
      <>
        A studio of <em>one,</em>
        <br />
        and a thousand hands.
      </>
    ),
    ko: "한 명의 스튜디오, 천 개의 손.",
    en: (
      <>
        — how Jayden runs ten projects with one head and many machines, and
        why the math still favors the human.
      </>
    ),
    enKo: "한 사람이 열 개의 프로젝트를 운전한다는 것, 그 산수에 대하여.",
    meta: "~ 1,800 words · titled",
    quarter: "Q4 · 2026",
  },
];

export function AboutPhilosophy() {
  return (
    <section className="a-philosophy" data-screen-label="03 Philosophy">
      <div className="container">
        <div className="a-ph-head">
          <div>
            <p className="a-ph-kicker">
              — §03 / <em>philosophy</em>
            </p>
            <h2 className="a-ph-title">
              Three essays,
              <span className="it">in progress.</span>
            </h2>
          </div>
          <p className="a-ph-lead">
            스튜디오의 <em>방향</em>을 세 편의 글로 정리하는 중입니다. 제목과
            골격이 먼저 섰고, 본문은 다음 계절에 완성됩니다. —이 페이지에 먼저
            공개됩니다.
          </p>
        </div>

        <div className="a-essays">
          {essays.map((e) => (
            <article key={e.num} className="a-essay">
              <span className="a-essay-num">{e.num}</span>
              <h3 className="a-essay-title">{e.title}</h3>
              <p className="a-essay-ko">{e.ko}</p>
              <div className="a-essay-body">
                <span className="mip-label">MANUSCRIPT IN PROGRESS</span>
                <p className="mip-text">{e.en}</p>
                <p className="mip-ko">{e.enKo}</p>
                <div className="mip-meta">
                  <span>{e.meta}</span>
                  <span>{e.quarter}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutProcess() {
  return (
    <section className="a-process" data-screen-label="04 Process">
      <div className="container">
        <p className="a-proc-kicker">
          — §04 / <em>how</em> it works
        </p>
        <h2 className="a-proc-title">
          Direction in,
          <span className="it">product out.</span>
        </h2>

        <div className="a-proc-diagram" aria-hidden="true">
          <div className="proc-node">
            <span className="marker it">You.</span>
            <span className="label">DIRECTOR</span>
            <span className="ko">방향을 가진 사람</span>
          </div>
          <div className="proc-link" />
          <div className="proc-node">
            <span className="marker mono">⟶ AI</span>
            <span className="label">EXECUTION</span>
            <span className="ko">기계가 코드를 씁니다</span>
          </div>
          <div className="proc-link" />
          <div className="proc-node">
            <span className="marker">
              Product<span style={{ color: "var(--signal)" }}>.</span>
            </span>
            <span className="label">RESULT</span>
            <span className="ko">작동하는 제품</span>
          </div>
        </div>

        <p className="a-proc-caption">
          You bring the <em>direction.</em>
          <br />
          The machine brings the hands. The studio brings the <em>taste.</em>
        </p>
      </div>
    </section>
  );
}

export function AboutCTA() {
  return (
    <section className="a-cta" data-screen-label="05 CTA">
      <div className="container">
        <h2 className="a-cta-head">
          Your direction,
          <span className="it">our execution.</span>
        </h2>
        <p className="a-cta-ko">
          방향이 있다면, 나머지는 저희가 맡겠습니다. —24시간 내 답신, 상담은
          무료.
        </p>
        <div className="a-cta-row">
          <Link href="#contact" className="btn-primary magnetic" data-magnetic>
            Start a project{" "}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Link href="/projects" className="btn-ghost">
            See the ten projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
