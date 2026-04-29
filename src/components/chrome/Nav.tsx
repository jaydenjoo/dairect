"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Portfolio", href: "/projects" },
  { label: "Pricing", href: "/pricing" },
  { label: "Process", href: "/process" },
  // Task 5 (2026-04-29): 진행 중인 사이드 프로젝트 빌드 로그 — build-in-public 신호.
  { label: "Build", href: "/build" },
  { label: "About", href: "/about" },
] as const;

type NavProps = {
  /**
   * 페이지 최상단이 dark section으로 시작할 때 true.
   * 초기(scrollY=0) 상태에서도 Nav를 solid canvas 배경으로 강제해 가독성 확보.
   */
  solidAlways?: boolean;
};

export function Nav({ solidAlways = false }: NavProps = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="nav"
      aria-label="Primary"
      className={cn("nav", (scrolled || solidAlways) && "scrolled")}
    >
      <Link
        href="/"
        className="brand"
        aria-label="dairect — Director of AI, working Direct"
        title="D — Director, AI — Artificial Intelligence, RECT — Direct"
      >
        <span className="bp bp-d">d</span>
        <span className="bp bp-ai">ai</span>
        <span className="bp bp-rect">rect</span>
        <span className="dot">.</span>
      </Link>
      <div className="menu" role="menubar">
        {menu.map((item) => (
          <Link key={item.href} href={item.href} role="menuitem">
            {item.label}
          </Link>
        ))}
      </div>
      <Link
        href="/about#contact"
        className="cta-mini magnetic"
        data-magnetic
      >
        상담 신청하기 <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}
