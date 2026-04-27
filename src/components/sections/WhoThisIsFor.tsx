"use client";

import { track } from "@/lib/analytics";

const LABEL_MAP: Record<string, string> = {
  "01": "office-worker",
  "02": "smb-owner",
  "03": "non-it-founder",
};

type Persona = {
  num: string;
  badge: string;
  quote: string;
  body: string;
  pkg: string;
  pkgHref: string;
  featured?: boolean;
};

const personas: readonly Persona[] = [
  {
    num: "01",
    badge: "직장인",
    quote: "회사 다니면서 떠오른 사이드 아이디어, 진짜 되는지 알고 싶어요.",
    body: "출근 전·퇴근 후 잠깐의 시간만으로 시작하세요. 1시간 상담으로 가능 여부 진단 → 3~5일 안에 작동하는 데모. AI가 제대로 만들 수 있는지 가장 빠르게 확인합니다.",
    pkg: "→ 체험 패키지 (90만 / 3~5일)",
    pkgHref: "#pricing",
    featured: true,
  },
  {
    num: "02",
    badge: "사장님",
    quote: "매일 반복되는 업무, AI로 자동화하고 싶어요.",
    body: "주문 응대, 견적 발송, 재고 알림, 단순 문의. 매일 반복되는 작업을 AI가 대신 처리하도록 설계합니다. 5~10일 안에 직접 써볼 수 있는 자동화 도구를 받아보세요.",
    pkg: "→ 검증 패키지 (180만 / 5~10일)",
    pkgHref: "#pricing",
  },
  {
    num: "03",
    badge: "비IT 창업자",
    quote: "개발자 없이 첫 번째 버전을 만들어 시장에 보여주고 싶어요.",
    body: "투자자·고객·파트너에게 보여줄 작동하는 MVP를 2~3주 안에. 코드는 AI가, 설계·검증·배포는 1인 프리랜서가 책임집니다. 비IT 창업자도 시장 검증을 시작하세요.",
    pkg: "→ MVP 패키지 (300만 / 2~3주)",
    pkgHref: "#pricing",
  },
];

export function WhoThisIsFor() {
  return (
    <section
      className="who-this-is-for"
      id="who"
      data-screen-label="01.5 Who This Is For"
    >
      <div className="container">
        <p className="kicker reveal-fade" data-reveal>
          — WHO THIS IS FOR
        </p>
        <h2
          className="who-headline reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          아이디어는 있지만, 혼자서는 막막한 분들.
        </h2>

        <div
          className="who-grid reveal-fade"
          data-reveal
          data-reveal-delay="160"
        >
          {personas.map((p) => (
            <article
              key={p.num}
              className={
                p.featured ? "who-card who-card-featured" : "who-card"
              }
            >
              <span className="who-num">{p.num}</span>
              <span className="who-badge">{p.badge}</span>
              <p className="who-quote">&ldquo;{p.quote}&rdquo;</p>
              <p className="who-body">{p.body}</p>
              <a
                href={p.pkgHref}
                className="who-pkg"
                onClick={() =>
                  track("persona_card_click", LABEL_MAP[p.num] ?? p.num)
                }
              >
                {p.pkg}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
