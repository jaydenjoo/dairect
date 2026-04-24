import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { WordmarkLogo } from "./WordmarkLogo";

const navLinks = [
  { label: "서비스 소개", href: "/about" },
  { label: "포트폴리오", href: "/projects" },
  { label: "가격 안내", href: "/pricing" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-canvas">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12 pt-40 pb-12">
        {/* 거대 wordmark watermark (emphasis variant, opacity 15%) */}
        <div
          aria-hidden="true"
          className="mb-20 select-none font-serif font-light text-[clamp(120px,22vw,320px)] leading-[0.9] tracking-[-0.04em] text-canvas/15"
        >
          dairect<span className="text-signal">.</span>
        </div>

        {/* 4-col grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-12">
          {/* Col 1 — 브랜드 + 이중 언어 슬로건 */}
          <div className="flex flex-col gap-3.5">
            <WordmarkLogo variant="default" size="sm" />
            <p className="font-ko text-[14px] leading-[1.7] text-canvas/60">
              코드는 <em className="not-italic text-signal">AI</em>가,
              방향은 <em className="not-italic text-signal">내가</em>.
            </p>
            <p className="font-sans text-[13px] leading-[1.7] text-canvas/50 italic">
              Code by machines. Direction by us.
            </p>
          </div>

          {/* Col 2 — Nav */}
          <div className="flex flex-col gap-3.5">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-signal mb-1.5">
              Explore
            </p>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-[13px] leading-[1.7] text-canvas/70 transition-colors duration-[180ms] hover:text-signal"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Contact */}
          <div className="flex flex-col gap-3.5">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-signal mb-1.5">
              Contact
            </p>
            <Link
              href="/about#contact"
              className="group flex items-center gap-2 font-mono text-[13px] leading-[1.7] text-canvas/70 transition-colors duration-[180ms] hover:text-signal"
            >
              <MessageCircle className="h-4 w-4 transition-transform duration-[180ms] group-hover:scale-110" />
              카카오톡 상담
            </Link>
            <div className="flex items-center gap-2 font-mono text-[13px] leading-[1.7] text-canvas/70">
              <Mail className="h-4 w-4" />
              hello@dairect.kr
            </div>
          </div>

          {/* Col 4 — Meta */}
          <div className="flex flex-col gap-3.5">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-signal mb-1.5">
              Est. 2026
            </p>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-dust">
              사업자등록번호
              <br />
              준비 중
            </p>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-dust">
              대표
              <br />
              Jayden
            </p>
          </div>
        </div>

        {/* 하단 bar */}
        <div className="mt-20 pt-8 border-t border-hairline-ink flex flex-col gap-2 md:flex-row md:justify-between font-mono text-[11px] tracking-[0.08em] uppercase text-dust">
          <span>© 2026 dairect. All rights reserved.</span>
          <span>The Intelligent Sanctuary for Code</span>
        </div>
      </div>
    </footer>
  );
}
