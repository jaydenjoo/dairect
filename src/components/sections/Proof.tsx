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
            <p className="proof-ko">
              라이브 제품과 실험을 분리해서 보여드립니다.
            </p>
          </div>

          <div className="proof-split">
            <div className="metric proof-half-live">
              <span className="metric-value">
                04
                <span className="proof-live-dot" aria-hidden="true" />
              </span>
              <span className="metric-label">Live products</span>
              <span className="metric-desc">
                실제 사용자가 매일 쓰고 있는 제품
              </span>
            </div>
            <div className="metric proof-half-demos">
              <span className="metric-value">08</span>
              <span className="metric-label">Demos &amp; experiments</span>
              <span className="metric-desc">
                데모, 챗봇 임베드, 개인 실험
              </span>
            </div>
          </div>
        </div>

        <div className="proof-foot" data-count-root>
          <div className="metric proof-foot-item">
            <span className="metric-value proof-foot-value">
              <span data-count="2.1" data-suffix="주">
                0
              </span>
            </span>
            <span className="metric-desc">평균 기간</span>
          </div>
          <div className="metric proof-foot-item">
            <span className="metric-value proof-foot-value">
              <span data-count="98" data-suffix="%">
                0
              </span>
            </span>
            <span className="metric-desc">CSAT</span>
          </div>
          <div className="metric proof-foot-item">
            <span className="metric-value proof-foot-value">
              <span data-count="100" data-suffix="%">
                0
              </span>
            </span>
            <span className="metric-desc">직접 만든 것</span>
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
