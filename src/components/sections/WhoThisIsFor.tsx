"use client";

import { track } from "@/lib/analytics";

const LABEL_MAP: Record<string, string> = {
  "01": "ai-barrier",
  "02": "validation",
  "03": "urgent",
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
    badge: "AI 진입 장벽",
    quote: "AI가 좋다는 건 알지만, 직접 써볼 엄두가 안 나요.",
    body: 'ChatGPT를 안 써보셔도, Claude가 뭔지 몰라도 됩니다. 한국어로, 일상 언어로만 대화합니다. 저희가 코드와 AI를 맡습니다. 다만 한 가지는 같이 해주셔야 합니다 — "고객이 누구인지, 무엇을 해결하는지." 1시간 인터뷰면 충분합니다.',
    pkg: "→ Build 패키지 (2~3주)",
    pkgHref: "#pricing",
    featured: true,
  },
  {
    num: "02",
    badge: "검증 필요",
    quote: "아이디어가 진짜 만들 만한 건지 먼저 확인하고 싶어요.",
    body: "1시간 인터뷰로 타깃·가설·예상 비용·기술 스택까지 정리합니다. 3~5일 안에 문서로 받아보세요.",
    pkg: "→ Discovery 패키지 (3~5일)",
    pkgHref: "#pricing",
  },
  {
    num: "03",
    badge: "긴급",
    quote: "이번 주 안에 데모가 필요해요.",
    body: "가능한 작업 범위가 정해져 있습니다 (랜딩 페이지, 폼+DB, 단순 데모 챗봇 등). 들어맞으면 5~7일에 만들어드립니다.",
    pkg: "→ Sprint 패키지 (조건 확인 필요)",
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
          세 가지 상황에서 가장 빛납니다.
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
