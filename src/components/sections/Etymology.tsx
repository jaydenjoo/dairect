export function Etymology() {
  return (
    <section
      className="etymology"
      data-screen-label="02.5 Etymology"
      aria-labelledby="etym-h"
    >
      <div className="container etym-wrap">
        <p className="kicker etym-kicker reveal-fade" data-reveal>
          — WHAT&apos;S IN A NAME
        </p>

        <div
          className="etym-wordmark"
          role="group"
          aria-label="D . AI . RECT name breakdown"
          id="etym-h"
        >
          <div className="etym-part">
            <span
              className="etym-glyph etym-d reveal-fade"
              data-reveal
              data-reveal-delay="80"
            >
              D
            </span>
            <span className="etym-bar" aria-hidden="true" />
            <span className="etym-label">DIRECTOR</span>
          </div>
          <span className="etym-sep" aria-hidden="true">
            .
          </span>
          <div className="etym-part">
            <span
              className="etym-glyph etym-ai reveal-fade"
              data-reveal
              data-reveal-delay="200"
            >
              AI
            </span>
            <span className="etym-bar etym-bar-amber" aria-hidden="true" />
            <span className="etym-label etym-label-amber">
              ARTIFICIAL
              <br />
              INTELLIGENCE
            </span>
          </div>
          <span className="etym-sep" aria-hidden="true">
            .
          </span>
          <div className="etym-part">
            <span
              className="etym-glyph etym-rect reveal-fade"
              data-reveal
              data-reveal-delay="320"
            >
              RECT
            </span>
            <span className="etym-bar" aria-hidden="true" />
            <span className="etym-label">DIRECT</span>
          </div>
        </div>

        <div
          className="etym-explain reveal-fade"
          data-reveal
          data-reveal-delay="480"
        >
          <p className="etym-en">
            &ldquo;A director who commands AI to build directly.&rdquo;
          </p>
          <p className="etym-ko">
            AI를 지휘하여 직접 만드는 사람. 그게 우리의 이름입니다.
          </p>
        </div>

        <div className="etym-divider" aria-hidden="true" />

        <div
          className="etym-slogan reveal-fade"
          data-reveal
          data-reveal-delay="620"
        >
          <p className="etym-slogan-en">
            &ldquo;Code by machines. Direction by us.&rdquo;
          </p>
          <p className="etym-slogan-ko">코드는 AI가, 방향은 내가.</p>
          <span className="etym-sig">— est. 2024</span>
        </div>
      </div>
    </section>
  );
}
