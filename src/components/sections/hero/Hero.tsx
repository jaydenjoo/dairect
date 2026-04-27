import Link from "next/link";
import { TrustCounters } from "./TrustCounters";

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
              <em>직장인</em>의 사이드 아이디어부터 <em>사장님</em>의 업무
              자동화까지. 1인 프리랜서가 직접 설계·개발합니다.
            </p>

            <p className="hero-body reveal-fade" data-reveal data-reveal-delay="440">
              AI로 만들 수 있는지, <em>가장 빠르고 저렴하게</em> 검증해드립니다.
            </p>

            <div className="cta-row reveal-fade" data-reveal data-reveal-delay="560">
              <Link
                href="/about#contact"
                className="btn-primary magnetic"
                data-magnetic
                style={{ whiteSpace: "nowrap", flexShrink: 0, width: "auto" }}
              >
                상담 신청하기{" "}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/projects" className="btn-ghost">
                포트폴리오 보기
              </Link>
            </div>

            <TrustCounters />
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
