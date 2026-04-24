import Link from "next/link";

export function Work() {
  return (
    <section
      id="work"
      className="section-dark"
      data-screen-label="05 Work"
    >
      <div className="container">
        <div className="work-head">
          <div>
            <p className="kicker amber">— Selected work</p>
            <h2 className="work-title">
              <span className="rm">Things we made.</span>
              <span className="it">People use them.</span>
            </h2>
          </div>
          <div className="work-head-right">
            <p className="work-head-desc">
              저희가 만들었고, 실제 사용 중인 제품들. 각 프로젝트는 평균 2.1주
              안에 런칭됐습니다.
            </p>
            <Link href="/projects" className="work-all-link">
              View all work →
            </Link>
          </div>
        </div>

        <div className="work-grid">
          <article className="work-card big work-chatsio">
            <div className="work-img-wrap">
              <div className="work-img">
                <div className="wc-head">
                  <span>N°01 / 2025</span>
                  <span>CX CHAT</span>
                </div>
                <div className="wc-chat">
                  <div className="wc-bub u">반품 가능한가요?</div>
                  <div className="wc-bub b">
                    네, 7일 이내 미개봉 상품은 가능합니다. 주문번호
                    알려주실까요?
                  </div>
                  <div className="wc-bub u">20251024-3377</div>
                  <div className="wc-bub b">
                    확인했습니다. 반품 링크 보내드릴게요.
                  </div>
                </div>
              </div>
            </div>
            <div className="work-meta">
              <span className="work-id">N°01 / 2025</span>
              <span className="work-name">Chatsio</span>
              <span className="work-desc">AI 고객 상담 SaaS for Korean SMEs</span>
              <span className="work-stack">
                NEXT.JS · SUPABASE · CLAUDE API · 2주
              </span>
            </div>
          </article>

          <article className="work-card mid work-findably">
            <div className="work-img-wrap">
              <div className="work-img">
                <div className="wf-top">
                  <span>N°02 / 2025</span>
                  <span>MKT DIAG</span>
                </div>
                <div className="wf-score">
                  82<span className="sub">Marketing health · strong</span>
                </div>
                <div className="wf-bars" aria-hidden="true">
                  <span className="b" style={{ height: "32%" }} />
                  <span className="b" style={{ height: "48%" }} />
                  <span className="b on" style={{ height: "68%" }} />
                  <span className="b" style={{ height: "40%" }} />
                  <span className="b on" style={{ height: "78%" }} />
                  <span className="b" style={{ height: "58%" }} />
                  <span className="b on" style={{ height: "92%" }} />
                  <span className="b" style={{ height: "44%" }} />
                </div>
              </div>
            </div>
            <div className="work-meta">
              <span className="work-id">N°02 / 2025</span>
              <span className="work-name">Findably</span>
              <span className="work-desc">AI 마케팅 헬스 진단 도구</span>
              <span className="work-stack">
                NEXT.JS · OPENAI · 결제연동 · 3주
              </span>
            </div>
          </article>

          <article className="work-card mid work-autovox">
            <div className="work-img-wrap">
              <div className="work-img">
                <div className="wa-top">
                  <span>N°03 / 2025</span>
                  <span>VOICE</span>
                </div>
                <div className="wa-wave" aria-hidden="true">
                  <span className="t" style={{ height: "22%" }} />
                  <span className="t" style={{ height: "42%" }} />
                  <span className="t a" style={{ height: "70%" }} />
                  <span className="t" style={{ height: "34%" }} />
                  <span className="t a" style={{ height: "86%" }} />
                  <span className="t" style={{ height: "28%" }} />
                  <span className="t a" style={{ height: "62%" }} />
                  <span className="t" style={{ height: "46%" }} />
                  <span className="t a" style={{ height: "74%" }} />
                  <span className="t" style={{ height: "30%" }} />
                  <span className="t" style={{ height: "52%" }} />
                  <span className="t a" style={{ height: "90%" }} />
                  <span className="t" style={{ height: "38%" }} />
                  <span className="t" style={{ height: "20%" }} />
                </div>
                <span className="wa-label">Voice → Action, in 240ms.</span>
              </div>
            </div>
            <div className="work-meta">
              <span className="work-id">N°03 / 2025</span>
              <span className="work-name">AutoVox</span>
              <span className="work-desc">음성 자동화 워크플로우</span>
              <span className="work-stack">
                WHISPER · CLAUDE · MAKE.COM · 2주
              </span>
            </div>
          </article>

          <article className="work-card big work-pm">
            <div className="work-img-wrap">
              <div className="work-img">
                <div className="wp-top">
                  <span>N°04 / 2026</span>
                  <span>PM DASHBOARD</span>
                </div>
                <div className="wp-grid">
                  <div className="wp-cell">
                    <span className="l">Active</span>
                    <span className="v amber">07</span>
                  </div>
                  <div className="wp-cell">
                    <span className="l">Overdue</span>
                    <span className="v">02</span>
                  </div>
                  <div className="wp-cell">
                    <span className="l">Shipped</span>
                    <span className="v">14</span>
                  </div>
                  <div className="wp-cell">
                    <span className="l">매출</span>
                    <span className="v">1.8억</span>
                  </div>
                  <div className="wp-cell">
                    <span className="l">Clients</span>
                    <span className="v">09</span>
                  </div>
                  <div className="wp-cell">
                    <span className="l">NPS</span>
                    <span className="v amber">72</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="work-meta">
              <span className="work-id">N°04 / 2026</span>
              <span className="work-name">PM Dashboard</span>
              <span className="work-desc">프리랜서 프로젝트 관리 툴</span>
              <span className="work-stack">
                NEXT.JS · POSTGRES · VERCEL · 2주
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
