import Link from "next/link";

export function Hero() {
  return (
    <section className="hero" id="hero" data-screen-label="01 Hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-left">
            <p className="kicker reveal-fade" data-reveal>
              — A STUDIO <em>directed</em> BY HUMAN, <em>executed</em> BY AI
            </p>

            <p
              className="hero-etym-tag reveal-fade"
              data-reveal
              data-reveal-delay="80"
              aria-hidden="true"
            >
              <span>
                D<span className="sep"> . </span>
              </span>
              <span className="ai">AI</span>
              <span>
                <span className="sep"> . </span>RECT
              </span>
              <span className="em-dash">&nbsp;&nbsp;—&nbsp;&nbsp;</span>
              <span>
                DIRECTOR OF <span className="ai">AI</span>, WORKING DIRECT
              </span>
            </p>

            <h1 className="hero-headline">
              <span className="line reveal-chars" data-chars>
                머릿속 아이디어를
              </span>
              <span
                className="line reveal-chars"
                data-chars
                data-amber="진짜로"
              >
                진짜로 만들어드립니다.
              </span>
            </h1>

            <p className="hero-sub reveal-fade" data-reveal data-reveal-delay="180">
              Human <em>directs.</em>{" "}
              <span className="strong">
                Machine <em>executes.</em>
              </span>
              <br />
              And the page looks <em>like both.</em>
            </p>

            <p className="hero-body reveal-fade" data-reveal data-reveal-delay="320">
              코드는 AI가, <em>방향은 저희가.</em> 비개발자 창업가와 중소기업의
              아이디어를, 2~3주 안에 작동하는 제품으로.
            </p>

            <p className="hero-body reveal-fade" data-reveal data-reveal-delay="440">
              일반 개발사가 3개월 들이는 일을, <em>저희는 3주에.</em>
            </p>

            <div className="cta-row reveal-fade" data-reveal data-reveal-delay="560">
              <Link
                href="/about#contact"
                className="btn-primary magnetic"
                data-magnetic
                style={{ whiteSpace: "nowrap", flexShrink: 0, width: "auto" }}
              >
                프로젝트 시작하기{" "}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/projects" className="btn-ghost">
                포트폴리오 보기
              </Link>
            </div>

            <div className="trust reveal-fade" data-reveal data-reveal-delay="700">
              <div className="trust-item">
                <span className="trust-label">
                  N°<span className="ko"> 라이브 제품</span>
                </span>
                <span className="trust-value">
                  04
                  <span
                    style={{
                      fontSize: "0.5em",
                      color: "var(--dust)",
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    건
                  </span>
                </span>
              </div>
              <div className="trust-item">
                <span className="trust-label">
                  AVG<span className="ko"> 평균 기간</span>
                </span>
                <span className="trust-value">
                  2<span style={{ color: "var(--signal)" }}>.</span>1
                  <span
                    style={{
                      fontSize: "0.5em",
                      color: "var(--dust)",
                      fontWeight: 400,
                      marginLeft: 4,
                    }}
                  >
                    주
                  </span>
                </span>
              </div>
              <div className="trust-item">
                <span className="trust-label">
                  CSAT<span className="ko"> 고객 만족도</span>
                </span>
                <span className="trust-value">
                  98<span style={{ color: "var(--signal)" }}>%</span>
                </span>
              </div>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="film-strip">
              {/* Frame 1 — Chatsio */}
              <div className="frame f1 mask-reveal" data-mask data-mask-delay="520">
                <div className="art-inner art-chatsio">
                  <div className="head">
                    <span>N°01 · 2025</span>
                    <span>Chatsio</span>
                  </div>
                  <div className="chat">
                    <div className="bubble bot">고객님의 문의를 기다리고 있어요.</div>
                    <div className="bubble user">배송은 언제 오나요?</div>
                    <div className="bubble bot">2~3일 내로 도착합니다.</div>
                    <div className="bubble typing">· · ·</div>
                  </div>
                </div>
                <span className="caption">
                  <span className="amber">N°01</span> — CHATSIO · SMB CX
                </span>
              </div>

              {/* Frame 2 — Findably */}
              <div className="frame f2 mask-reveal" data-mask data-mask-delay="360">
                <div className="art-inner art-findably">
                  <div className="head">
                    <span>N°02 · 2025</span>
                    <span>Findably</span>
                  </div>
                  <div className="findably-chart">
                    <div className="label">82</div>
                    <div className="sub">MKT HEALTH</div>
                    <div className="bars" aria-hidden="true">
                      <span className="bar" style={{ height: "28%" }} />
                      <span className="bar" style={{ height: "44%" }} />
                      <span className="bar on" style={{ height: "62%" }} />
                      <span className="bar" style={{ height: "36%" }} />
                      <span className="bar on" style={{ height: "78%" }} />
                      <span className="bar" style={{ height: "54%" }} />
                      <span className="bar on" style={{ height: "88%" }} />
                    </div>
                    <div className="axis" />
                  </div>
                </div>
                <span className="caption">
                  <span className="amber">N°02</span> — FINDABLY · MKT DIAG
                </span>
              </div>

              {/* Frame 3 — Dari */}
              <div className="frame f3 mask-reveal" data-mask data-mask-delay="200">
                <div className="art-inner art-dari">
                  <div className="head">
                    <span>N°03 · 2025</span>
                    <span>Dari</span>
                  </div>
                  <div className="dari-code" aria-hidden="true">
                    <span className="dari-line">
                      <span className="dari-tag">&lt;script</span>
                      <span className="dari-attr"> src=</span>
                      <span className="dari-val">&quot;//dari.kr/v1.js&quot;</span>
                    </span>
                    <span className="dari-line">
                      <span className="dari-attr">&nbsp;&nbsp;data-bot=</span>
                      <span className="dari-val">&quot;acme&quot;</span>
                      <span className="dari-tag">&gt;</span>
                      <span className="dari-tag">&lt;/script&gt;</span>
                    </span>
                    <span className="dari-line dari-line-comment">
                      {"// 한 줄로 끝."}
                    </span>
                  </div>
                  <div className="dari-label">
                    <em>One line. Any site.</em>
                    <span className="mono">EMBED → CHAT · 5 MIN</span>
                  </div>
                </div>
                <span className="caption">
                  <span className="amber">N°03</span> — DARI · CHATBOT EMBED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
