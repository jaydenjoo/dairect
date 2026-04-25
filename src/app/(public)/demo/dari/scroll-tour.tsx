"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Epic Demo-Dari (2026-04-25): /demo/dari 4-Step sticky scroll tour.
 *
 * chatsio·findably 패턴 동일. dari 4단계 라벨 (Setup/Train/Embed/Use).
 */

const STEPS = [
  { n: 1, label: "Setup", korLabel: "봇 생성" },
  { n: 2, label: "Train", korLabel: "지식 주입" },
  { n: 3, label: "Embed", korLabel: "한 줄 코드" },
  { n: 4, label: "Use", korLabel: "라이브!" },
] as const;

export function ScrollTour() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const sections = STEPS.map((s) => document.getElementById(`step-${s.n}`));
    if (sections.some((s) => !s)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const id = visible[0].target.id;
        const n = Number.parseInt(id.replace("step-", ""), 10);
        if (Number.isFinite(n)) setActiveStep(n);
      },
      {
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0.1, 0.3, 0.5],
      },
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function handleClick(n: number) {
    const el = document.getElementById(`step-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className="sticky top-0 z-40 border-b border-[#141414]/12 bg-canvas/95 backdrop-blur"
      role="navigation"
      aria-label="데모 진행 단계"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FFB800]">
            ▶ TOUR · STEP {activeStep}/4
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680] sm:inline">
            {STEPS[activeStep - 1].korLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => handleClick(s.n)}
              className={
                "flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors " +
                (activeStep === s.n
                  ? "text-[#141414]"
                  : "text-[#8B8680] hover:text-[#141414]")
              }
              aria-current={activeStep === s.n ? "step" : undefined}
            >
              <span
                className={
                  "h-[3px] w-6 transition-colors " +
                  (s.n <= activeStep ? "bg-[#FFB800]" : "bg-[#141414]/12")
                }
              />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
          <Link
            href="/demo/dairect"
            className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8B8680] hover:text-[#141414]"
          >
            건너뛰기
          </Link>
        </div>
      </div>
    </div>
  );
}
