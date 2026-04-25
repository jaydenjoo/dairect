"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";

/**
 * Epic Demo-Dairect (2026-04-25): /demo/* 자식 페이지 상단 보조 바.
 *
 * 포트폴리오 진입자가 dairect 데모 메인(/demo/dairect) 으로 돌아가거나
 * 투어를 시작/재시작할 수 있는 도돌이 링크. tour=1 활성 시에는 TourOverlay
 * 가 자체 진행 바를 그리므로 이 토급바는 숨김.
 *
 * 디자인: Studio Anthem 1px hairline + amber accent. 우측 정렬.
 */
export function DemoTopBar() {
  const params = useSearchParams();
  const isTour = params?.get("tour") === "1";
  // 투어 모드에서는 TourOverlay 가 자체 progress bar 를 fixed top 에 그림 → 충돌 회피
  if (isTour) return null;

  return (
    <div className="border-b border-[#141414]/12 bg-canvas/80 px-6 py-2 backdrop-blur md:ml-60">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <Link
          href="/demo/dairect"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680] hover:text-[#141414]"
        >
          <ArrowLeft className="h-3 w-3" />
          Dairect 데모 메인
        </Link>
        <Link
          href="/demo/leads?tour=1&step=1"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#FFB800] hover:text-[#141414]"
        >
          <Play className="h-3 w-3" />
          90초 투어 시작
        </Link>
      </div>
    </div>
  );
}
