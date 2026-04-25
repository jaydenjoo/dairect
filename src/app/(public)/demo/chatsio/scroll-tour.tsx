"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Epic Demo-Chatsio (2026-04-25): /demo/chatsio 단일 페이지 4-Step 가이드.
 *
 * 외부 서비스(Chatsio) 시뮬레이션이라 라우트 분기 대신 같은 페이지 내 스크롤
 * 진행. dairect 의 TourOverlay 와 패턴 다름 — 단일 페이지 sticky bar + smooth
 * scroll 로 처리.
 *
 * 동작:
 *   1. 페이지 로드 시 IntersectionObserver 로 4개 step section 감시
 *   2. 화면 중앙에 가장 먼저 닿는 section 의 step 을 active 처리
 *   3. 사용자가 step 버튼 클릭 → 해당 section 으로 smooth scroll
 */

const STEPS = [
  { n: 1, label: "Connect", korLabel: "URL 연결" },
  { n: 2, label: "Analyze", korLabel: "AI 분석" },
  { n: 3, label: "Apply", korLabel: "코드 적용" },
  { n: 4, label: "Track", korLabel: "AI 인용 추적" },
] as const;

export function ScrollTour() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const sections = STEPS.map((s) => document.getElementById(`step-${s.n}`));
    if (sections.some((s) => !s)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 화면 중앙에 가장 가까운 entry 의 step 채택
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const id = visible[0].target.id; // "step-N"
        const n = Number.parseInt(id.replace("step-", ""), 10);
        if (Number.isFinite(n)) setActiveStep(n);
      },
      {
        // 화면 중앙 가까운 영역만 active 로 인식 (sticky bar 충돌 회피)
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
