import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer section-dark" id="journal">
      <div className="container">
        <div className="footer-logo footer-logo-split" aria-hidden="true">
          <span className="fl-part fl-d">d</span>
          <span className="fl-gap" />
          <span className="fl-part fl-ai">ai</span>
          <span className="fl-gap" />
          <span className="fl-part fl-rect">rect</span>
          <span className="fl-gap" />
          <span className="fl-part fl-dot">.</span>
        </div>
        <div className="footer-logo-caption">
          <span className="fl-cap-1">D × AI × RECT</span>
          <span className="fl-cap-sep">/</span>
          <span className="fl-cap-2">Director of AI, working Direct</span>
        </div>
        <p className="footer-logo-slogan">
          <em>&ldquo;Code by machines. Direction by us.&rdquo;</em>
          <br />
          <span className="fls-ko">코드는 AI가, 방향은 내가.</span>
        </p>

        <div className="footer-grid">
          <div className="footer-col">
            <span className="footer-brand">
              dairect<span className="dot">.</span>
            </span>
            <p className="footer-tag">코드는 AI가, 방향은 내가</p>
            <span className="footer-est">— est. 2024 / Seoul</span>
          </div>

          <div className="footer-col">
            <span className="footer-col-head">— Menu</span>
            <Link href="/#work">Work</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/#journal">Journal</Link>
          </div>

          <div className="footer-col">
            <span className="footer-col-head">— Reach us</span>
            <Link href="/about#contact">Contact form</Link>
            <a href="mailto:hello@dairect.kr">hello@dairect.kr</a>
          </div>

          <div className="footer-col">
            <span className="footer-col-head">— Fine print</span>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 dairect. Made with taste &amp; Claude.</span>
          <span>Seoul → Global. Always building.</span>
        </div>
      </div>
    </footer>
  );
}
