export function Manifesto() {
  return (
    <section
      className="manifesto section-dark"
      data-screen-label="02 Manifesto"
    >
      <div className="container">
        <p className="kicker amber reveal-fade" data-reveal>
          — MANIFESTO
        </p>
        <h2 className="manifesto-head">
          <span
            className="line it reveal-fade"
            data-reveal
            data-reveal-delay="120"
          >
            We don&apos;t sell
          </span>
          <span
            className="line rm reveal-fade"
            data-reveal
            data-reveal-delay="260"
          >
            code.
          </span>
          <span
            className="line it reveal-fade"
            data-reveal
            data-reveal-delay="420"
          >
            We sell
          </span>
          <span
            className="line rm amber reveal-fade"
            data-reveal
            data-reveal-delay="560"
          >
            direction.
          </span>
          <span
            className="line it reveal-fade"
            data-reveal
            data-reveal-delay="720"
          >
            And
          </span>
          <span
            className="line rm reveal-fade"
            data-reveal
            data-reveal-delay="860"
          >
            execution.
          </span>
        </h2>
        <p
          className="manifesto-ko reveal-fade"
          data-reveal
          data-reveal-delay="1040"
        >
          우리는 코드를 팔지 않습니다.{" "}
          <span className="ko-amber">방향을 팝니다.</span> 그리고 실행을
          팝니다.
        </p>
      </div>
    </section>
  );
}
