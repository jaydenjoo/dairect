const metrics = [
  { value: "12", suffix: "건", label: "Projects", desc: "완료 프로젝트" },
  { value: "5.2", suffix: "억원", label: "Delivered", desc: "누적 개발 규모" },
  { value: "2.1", suffix: "주", label: "Avg. speed", desc: "평균 기간" },
  { value: "98", suffix: "%", label: "CSAT", desc: "고객 만족도" },
] as const;

const marqueeItems = [
  "— STARTUP A",
  "— VENTURE B",
  "— AGENCY C",
  "— CLINIC D",
  "— RETAIL E",
  "— STUDIO F",
  "— FOUNDER G",
  "— CREATOR H",
] as const;

export function Proof() {
  return (
    <section className="proof" data-screen-label="03 Proof">
      <div className="container">
        <div className="proof-top">
          <div>
            <p className="kicker">— BY THE NUMBERS</p>
            <h2 className="proof-title" style={{ marginTop: 16 }}>
              <span className="it">Small studio.</span>
              <span className="rm">Real numbers.</span>
            </h2>
          </div>
          <div className="metrics" data-count-root>
            {metrics.map((m) => (
              <div key={m.label} className="metric">
                <span className="metric-value">
                  {/*
                    Task 6-fx (2026-04-25): 번들 LandingMotion 의 CountUp 효과
                    대상 — viewport 진입 시 0 → m.value 까지 1.4s easing.
                    suffix 는 JS 에서 함께 부착하므로 별도 텍스트 출력 X.
                  */}
                  <span data-count={m.value} data-suffix={m.suffix}>
                    0
                  </span>
                </span>
                <span className="metric-label">{m.label}</span>
                <span className="metric-desc">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marquee-row">
          <span className="built-for">— Built for</span>
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
