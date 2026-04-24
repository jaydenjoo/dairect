export function Founder() {
  return (
    <section
      id="founder"
      className="section-dark"
      data-screen-label="07 Founder"
    >
      <div className="container">
        <div className="founder-grid">
          <div className="founder-portrait">
            <span className="tag">— J / Seoul</span>
            <div className="silhouette" aria-hidden="true">
              <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
                <ellipse
                  cx="100"
                  cy="80"
                  rx="42"
                  ry="50"
                  fill="#141414"
                  opacity="0.6"
                />
                <path
                  d="M30 240 Q30 140 100 140 Q170 140 170 240 Z"
                  fill="#141414"
                  opacity="0.55"
                />
              </svg>
            </div>
            <span className="tag-b">FRAME 01 / 01</span>
          </div>

          <div className="founder-content">
            <p className="kicker amber">— From the founder</p>
            <h2 className="founder-name">Jayden.</h2>
            <p className="founder-role">Vibe Architect · Dairect · Seoul</p>

            <blockquote className="founder-quote">
              <span className="line">AI는 자동차입니다.</span>
              <span className="line amber">운전을 못해도 괜찮아요.</span>
              <span className="line">택시를 타면 되니까요.</span>
            </blockquote>

            <div className="founder-etym">
              <p className="founder-etym-en">
                &ldquo;So we named the studio after the job:
                <br />
                <em>Director of AI, working Direct.</em>&rdquo;
              </p>
              <p className="founder-etym-ko">
                그래서 스튜디오 이름을 그 역할 그대로 지었습니다.
                <br />
                <span className="mono-amber">D + AI + RECT</span> = &lsquo;AI를
                지휘하는 사람.&rsquo;
              </p>

              <dl
                className="founder-etym-glyphs"
                aria-label="Wordmark decomposition"
              >
                <div className="feg-row">
                  <dt className="feg-key">D</dt>
                  <dd className="feg-val">DIRECTOR</dd>
                </div>
                <div className="feg-row feg-row-amber">
                  <dt className="feg-key">AI</dt>
                  <dd className="feg-val">ARTIFICIAL INTELLIGENCE</dd>
                </div>
                <div className="feg-row">
                  <dt className="feg-key">RECT</dt>
                  <dd className="feg-val">DIRECT</dd>
                </div>
              </dl>
            </div>

            <p className="founder-body">
              코드는 AI가 씁니다. 방향은 제가 잡습니다. 고객님의 아이디어가
              세상에 나올 수 있도록, 가장 작고 확실한 첫 걸음을 함께합니다.
            </p>

            <span className="founder-sig">— J</span>
          </div>
        </div>
      </div>
    </section>
  );
}
