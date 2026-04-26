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

        <div className="footer-legal">
          <p className="footer-legal-intro">
            각 패키지는 표준 계약서에 따라 진행됩니다.
          </p>
          <ul className="footer-legal-list">
            <li>
              14일 운영 자문 후 유지보수, 보안 업데이트, 환불 정책: 계약 시
              별도 안내
            </li>
            <li>개인정보처리방침/약관 등 법무 문서 작성: 별도 프로젝트</li>
            <li>AI 생성 코드 저작권: 고객에게 양도</li>
            <li>심사 거절 시 (모바일 앱): 1회 무상 재제출</li>
            <li>
              문의: <a href="mailto:hello@dairect.kr">hello@dairect.kr</a>
            </li>
          </ul>
        </div>

        <div className="footer-bottom">
          <span>© 2026 dairect. Made with taste &amp; Claude.</span>
          <span>Seoul → Global. Always building.</span>
        </div>
      </div>
    </footer>
  );
}
