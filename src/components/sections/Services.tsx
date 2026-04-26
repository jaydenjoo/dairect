const services = [
  {
    num: "01",
    en: "Deep Consult.",
    ko: "심층 상담",
    role: "— DIRECTED BY YOU",
    desc: "아이디어의 뼈대를 함께 세웁니다. 타깃 고객, 핵심 가설, 성공 기준을 한 시간 안에 문서로 정리해 드립니다. 개발자 용어 없이.",
    tags: ["< WORKSHOP />", "< 1H CALL />", "< NOTION DOC />"],
  },
  {
    num: "02",
    en: "Strategy Map.",
    ko: "전략 설계",
    role: "— DIRECTED BY US",
    desc: "MVP의 경계를 그립니다. 꼭 필요한 화면, 꼭 필요한 기능만. 2~3주 안에 런칭 가능한 범위로 설계해, 투자 대비 결과가 가장 빠른 구조를 만듭니다.",
    tags: ["< BLUEPRINT />", "< USER FLOW />", "< SCOPE />", "< MILESTONES />"],
  },
  {
    num: "03",
    en: "AI Execution.",
    ko: "맞춤 개발",
    role: "— EXECUTED BY AI",
    desc: "Claude Code와 함께 짧은 사이클로 짓습니다. 매일 오늘 만든 것을 공유하고, 내일 만들 것을 정합니다. 블랙박스 없음.",
    tags: [
      "< CLAUDE CODE />",
      "< NEXT.JS />",
      "< SUPABASE />",
      "< DAILY BUILD />",
    ],
  },
  {
    num: "04",
    en: "Ship & Handoff.",
    ko: "완성 및 이관 + 사업화 동행",
    role: "— HANDED BACK TO YOU, GROWN TOGETHER",
    desc: "런칭은 시작입니다. 운영에 필요한 문서, 계정, 인수인계 자료를 한 권의 폴더로 정리해 드립니다. 이후 Build 패키지는 14일 운영 자문, Scale 패키지는 90일 파트너십이 포함되어 첫 사용자·첫 매출까지 동행합니다.",
    tags: [
      "< HANDOFF />",
      "< DOCS />",
      "< OPS PLAYBOOK />",
      "< 14D SUPPORT (BUILD) />",
      "< 90D PARTNERSHIP (SCALE) />",
    ],
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      data-screen-label="04 Services"
      style={{ borderTop: "1px solid var(--hairline-canvas)" }}
    >
      <div className="container">
        <div className="services-grid">
          <aside className="services-side">
            <p className="kicker amber">— How we work</p>
            <h2 className="services-title">
              <span className="it">Four moves,</span>
              <span className="it">from idea</span>
              <span className="rm">to launched.</span>
            </h2>
            <p className="services-ko">4단계로, 아이디어에서 런칭까지.</p>
            <p className="services-desc">
              복잡한 코드 고민은 저희가 맡습니다. 당신의 아이디어가 실제로
              작동하는 제품이 되는 4단계입니다.
            </p>
          </aside>

          <div className="services-list">
            {services.map((s) => (
              <article key={s.num} className="service-row">
                <div className="service-num">{s.num}</div>
                <div className="service-title-col">
                  <span className="service-title-en">{s.en}</span>
                  <span className="service-title-ko">{s.ko}</span>
                  <span className="service-role">{s.role}</span>
                </div>
                <div className="service-body-col">
                  <p className="service-desc">{s.desc}</p>
                  <div className="service-tags">
                    {s.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
