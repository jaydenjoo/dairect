"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { X, ChevronRight } from "lucide-react";

/**
 * Epic Demo-Dairect (2026-04-25): /demo/* 가이드 투어 overlay.
 *
 * URL query: ?tour=1&step=N (1~4) 활성화. step 별 안내 카드 + 다음 단계 링크.
 * /demo 모든 자식 페이지의 layout 에 마운트 (tour=1 일 때만 렌더).
 *
 * 디자인: Studio Anthem — paper card + 4px hard shadow + amber accent.
 * 위치: 우상단 fixed (모바일은 하단 고정). 닫기 버튼으로 X 가능.
 */

const TOUR_STEPS = [
  {
    n: 1,
    title: "새 리드 추가",
    body: "쪽지·이메일·전화로 흩어져 들어온 문의를 한 보드에 모아 추적합니다. 우상단 \"+ 새 리드\" 버튼을 눌러 추가해보세요.",
    nextHref: "/demo/estimates?tour=1&step=2",
    nextLabel: "다음: 견적 추천",
  },
  {
    n: 2,
    title: "AI 추천 견적",
    body: "비슷한 과거 프로젝트 기반으로 단가·일정·범위를 자동 생성. 견적서 클릭 → AI 추천 카드 확인.",
    nextHref: "/demo/contracts?tour=1&step=3",
    nextLabel: "다음: 계약·서명",
  },
  {
    n: 3,
    title: "PDF 계약 + 전자서명",
    body: "견적이 통과되면 한 클릭으로 계약 PDF 생성. 서명되면 자동으로 status 가 진행 상태로 전환됩니다.",
    nextHref: "/demo/invoices?tour=1&step=4",
    nextLabel: "다음: 정산 알림",
  },
  {
    n: 4,
    title: "정산 + 자동 알림",
    body: "착수금·중도금·잔금 단계별 자동 알림. 미수금 days 카운트와 캐시플로우 차트로 한눈에 관리.",
    nextHref: "/demo/dairect#cta",
    nextLabel: "투어 마치기 →",
  },
] as const;

export function TourOverlay() {
  const params = useSearchParams();
  const pathname = usePathname();
  const isTour = params?.get("tour") === "1";
  const stepParam = Number.parseInt(params?.get("step") ?? "0", 10);

  // dismissed 상태를 (pathname + step) 의 key 로 추적 — useEffect 안의 setState 회피.
  // 사용자가 X 눌렀던 페이지·단계와 현재 위치가 같으면 숨기고, 다음 step 으로 넘어가면 자동 재노출.
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const currentKey = `${pathname}::${stepParam}`;
  const isDismissed = dismissedKey === currentKey;

  if (!isTour || !Number.isFinite(stepParam)) return null;
  if (stepParam < 1 || stepParam > 4) return null;
  if (isDismissed) return null;

  const step = TOUR_STEPS[stepParam - 1];

  return (
    <>
      {/* 진행 바 — 상단 고정 */}
      <div
        className="fixed left-0 right-0 top-0 z-[100] border-b border-[#141414]/12 bg-canvas/95 px-6 py-3 backdrop-blur"
        role="status"
        aria-label={`투어 진행 ${stepParam}/4 단계`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              ▶ TOUR · STEP {stepParam}/4
            </span>
            <span className="hidden font-mono text-xs text-[#8B8680] sm:inline">
              {step.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={
                    "h-[3px] w-8 transition-colors " +
                    (i <= stepParam ? "bg-[#FFB800]" : "bg-[#141414]/12")
                  }
                />
              ))}
            </div>
            <Link
              href="/demo/dairect"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680] hover:text-[#141414]"
            >
              건너뛰기
            </Link>
          </div>
        </div>
      </div>

      {/* 안내 카드 — 우하단 (모바일은 하단 전체) */}
      <div
        className="fixed bottom-6 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:max-w-sm"
        role="dialog"
        aria-label="투어 안내"
      >
        <div
          className="relative bg-paper p-6"
          style={{ boxShadow: "4px 4px 0 0 #141414" }}
        >
          <button
            onClick={() => setDismissedKey(currentKey)}
            className="absolute right-4 top-4 text-[#8B8680] hover:text-[#141414]"
            aria-label="안내 닫기"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
            STEP {stepParam}/4
          </p>
          <h3
            className="mt-2 font-display text-[20px] leading-[1.2] tracking-[-0.02em] text-[#141414]"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-[1.5] text-[#3A3A3A]">{step.body}</p>
          <Link
            href={step.nextHref}
            className="mt-5 inline-flex items-center gap-2 border-b-[1.5px] border-[#141414] pb-1 text-sm font-medium text-[#141414] hover:border-[#FFB800] hover:text-[#FFB800]"
          >
            {step.nextLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
