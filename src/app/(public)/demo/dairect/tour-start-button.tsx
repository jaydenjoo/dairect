"use client";

import Link from "next/link";

/**
 * Tour 시작 CTA — Studio Anthem 스타일 (검은 배경 + 4px hard shadow + amber arrow).
 *
 * 클라이언트 컴포넌트로 분리한 이유: 차후 click 시 localStorage 에 tour 진행 상태
 * 초기화 등 인터랙션 추가 가능성 (현재는 단순 Link 라 SSR 가능하나 확장 여지).
 */
export function TourStartButton({ href }: { href: string }) {
  function handleClick() {
    // Tour 진행 상태 초기화 (재시작 시 깨끗한 상태)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "dairect-demo-tour",
          JSON.stringify({ startedAt: Date.now(), step: 1 }),
        );
      } catch {
        // localStorage 비활성 환경 무시
      }
    }
  }
  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group inline-flex items-center gap-3 bg-[#141414] px-8 py-4 text-sm font-medium text-canvas transition-transform hover:translate-x-[2px]"
      style={{ boxShadow: "4px 4px 0 0 #FFB800" }}
    >
      <span className="font-mono text-xs">▶</span>
      90초 가이드 투어 시작
      <span
        aria-hidden="true"
        className="text-[#FFB800] transition-transform group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
