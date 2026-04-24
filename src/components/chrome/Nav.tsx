"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WordmarkLogo } from "./WordmarkLogo";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

const menu = [
  { label: "포트폴리오", href: "/projects" },
  { label: "가격", href: "/pricing" },
  { label: "소개", href: "/about" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex items-center justify-between",
        "px-6 md:px-12 py-5",
        "transition-[background,border-color,padding] duration-[240ms] ease-[var(--ease-spring-soft)]",
        "border-b border-transparent",
        scrolled
          ? "bg-paper/97 border-hairline-canvas py-3.5 backdrop-blur-[2px]"
          : "bg-transparent",
      )}
    >
      <Link
        href="/"
        aria-label="dairect — Director of AI, working Direct"
        title="D — Director, AI — Artificial Intelligence, RECT — Direct"
        className="text-ink"
      >
        <WordmarkLogo variant="default" size="sm" />
      </Link>

      <div
        role="menubar"
        className="hidden md:flex items-center gap-10 font-sans text-[15px] font-normal"
      >
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            role="menuitem"
            className="text-ink/70 transition-colors duration-[180ms] hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <Button variant="cta-mini" href="/about#contact">
        문의하기 <span aria-hidden="true">→</span>
      </Button>
    </nav>
  );
}
