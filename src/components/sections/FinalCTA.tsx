import Link from "next/link";

export function FinalCTA() {
  return (
    <section
      id="contact"
      className="contact"
      data-screen-label="08 Contact"
    >
      <div className="container">
        <div className="contact-grid">
          <aside className="contact-side">
            <p className="kicker amber">— Next step</p>
            <h2 className="contact-title">
              <span className="rm">Have an idea?</span>
              <span className="it">Let&apos;s build it.</span>
            </h2>
            <p className="contact-ko">
              아이디어가 있으신가요? 만들어드리겠습니다.
            </p>
            <p className="contact-desc">
              24시간 내 답신합니다. 상담은 무료입니다. 간단히 어떤 서비스를
              구상 중이신지 알려주세요.
            </p>
            <div className="contact-info">
              <a href="mailto:hello@dairect.kr">hello@dairect.kr</a>
              <span className="muted">Seoul, Korea</span>
            </div>
          </aside>

          <div className="contact-form">
            <p className="contact-desc" style={{ marginBottom: 24 }}>
              문의 폼은 About 페이지에서 작성하실 수 있습니다. 아래 버튼을
              눌러 이동해 주세요.
            </p>
            <Link
              href="/about#contact"
              className="btn-primary magnetic"
              data-magnetic
            >
              Start a project{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <p className="submit-sub" style={{ marginTop: 16 }}>
              About → Contact 섹션으로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
