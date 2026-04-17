import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";

const navLinks: { label: string; href: string }[] = [
  { label: "서비스 소개", href: "/about" },
  { label: "포트폴리오", href: "/projects" },
  { label: "가격 안내", href: "/pricing" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
];

export function LandingFooter() {
  return (
    <footer className="section-dark">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {/* 브랜드 블록 */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
              dairect
            </h2>
            <p className="text-sm leading-relaxed text-white/60" style={{ wordBreak: "keep-all" }}>
              머릿속 아이디어를 진짜로 만들어드립니다.
            </p>
            <p className="font-mono text-xs text-white/60">
              The Intelligent Sanctuary for Code
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-white/60 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 연락 */}
          <div className="flex flex-col gap-3">
            <a
              href="#contact"
              className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
              카카오톡 상담
            </a>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Mail className="h-4 w-4" />
              hello@dairect.kr
            </div>
          </div>
        </div>

        {/* 하단 바 — No-Line Rule: 그라데이션 divider */}
        <div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
            <div className="font-medium text-white/60">
              © 2026 dairect. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] tracking-tight text-white/60">
              <span>사업자등록번호: 준비 중</span>
              <span className="text-white/30">|</span>
              <span>대표: Jayden</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
