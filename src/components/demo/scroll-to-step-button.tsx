"use client";

/**
 * Epic Demo (2026-04-25): /demo/chatsio · /demo/findably 의 Step 1 "분석 시작" /
 * "무료 진단" 버튼. 클릭 시 다음 step 섹션으로 smooth scroll — 실제 분석 시뮬레이션.
 *
 * 외부 서비스 데모이므로 실제 API 호출 X. 사용자 흐름만 보여주는 것이 목적.
 */

import { useState } from "react";

type Props = {
  targetId: string; // 예: "step-2"
  label: string; // "분석 시작 →" 등
  pendingLabel?: string; // 분석 중... 표시 (선택)
  pendingMs?: number; // 짧은 시뮬레이션 지연 (기본 600ms)
};

export function ScrollToStepButton({
  targetId,
  label,
  pendingLabel = "분석 중...",
  pendingMs = 600,
}: Props) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    if (pending) return;
    setPending(true);
    // 짧은 시뮬레이션 지연 — "분석 중" 느낌. 즉시 스크롤하면 너무 reactive.
    window.setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // 스크롤 시작 후에도 잠시 pending 유지 → 사용자가 흐름 인지
      window.setTimeout(() => setPending(false), 800);
    }, pendingMs);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="bg-[#141414] px-6 py-3 text-sm font-medium text-canvas transition-opacity disabled:opacity-70"
      aria-busy={pending}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 animate-spin border-2 border-canvas border-t-transparent"
          />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
