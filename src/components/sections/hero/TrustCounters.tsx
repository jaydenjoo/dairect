"use client";

/**
 * Hero Trust 영역 카운트업 — Phase E-1.
 *
 * IntersectionObserver로 viewport 진입 시 0 → 목표값 1.5초 동안 ease-out 증가.
 * - 04건: 정수
 * - 2.1주: 소수 첫째 자리
 * - 98%: 정수
 *
 * a11y: prefers-reduced-motion 시 즉시 final 값 표시.
 * 기존 .trust / .trust-item / .trust-label / .trust-value 클래스 그대로 보존.
 */
import { useEffect, useRef, useState } from "react";

const TARGETS = { products: 4, weeks: 2.1, csat: 98 } as const;
const DURATION_MS = 1500;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function TrustCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState(0);
  const [weeks, setWeeks] = useState(0);
  const [csat, setCsat] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // rAF로 한 프레임 미뤄 effect 본문의 동기 setState 카스케이드 회피.
      const raf = requestAnimationFrame(() => {
        setProducts(TARGETS.products);
        setWeeks(TARGETS.weeks);
        setCsat(TARGETS.csat);
      });
      return () => cancelAnimationFrame(raf);
    }

    // Hero 안 페이지 상단이라 IntersectionObserver 불필요.
    // reveal-fade delay(700ms) 직후 카운트업 시작 — 시각 동기화.
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        const e = easeOut(t);
        setProducts(e * TARGETS.products);
        setWeeks(e * TARGETS.weeks);
        setCsat(e * TARGETS.csat);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 700);
    return () => clearTimeout(timeout);
  }, []);

  const weeksInt = Math.floor(weeks);
  const weeksFrac = Math.floor((weeks % 1) * 10);

  return (
    <div
      ref={ref}
      className="trust reveal-fade"
      data-reveal
      data-reveal-delay="700"
    >
      <div className="trust-item">
        <span className="trust-label">
          N°<span className="ko"> 라이브 제품</span>
        </span>
        <span className="trust-value">
          {String(Math.floor(products)).padStart(2, "0")}
          <span
            style={{
              fontSize: "0.5em",
              color: "var(--dust)",
              fontWeight: 400,
              marginLeft: 4,
            }}
          >
            건
          </span>
        </span>
      </div>
      <div className="trust-item">
        <span className="trust-label">
          AVG<span className="ko"> 평균 기간</span>
        </span>
        <span className="trust-value">
          {weeksInt}
          <span style={{ color: "var(--signal)" }}>.</span>
          {weeksFrac}
          <span
            style={{
              fontSize: "0.5em",
              color: "var(--dust)",
              fontWeight: 400,
              marginLeft: 4,
            }}
          >
            주
          </span>
        </span>
      </div>
      <div className="trust-item">
        <span className="trust-label">
          CSAT<span className="ko"> 고객 만족도</span>
        </span>
        <span className="trust-value">
          {Math.floor(csat)}
          <span style={{ color: "var(--signal)" }}>%</span>
        </span>
      </div>
    </div>
  );
}
