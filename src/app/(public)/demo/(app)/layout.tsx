import type { Metadata } from "next";
import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DemoHeader } from "@/components/demo/header";
import { DemoBanner } from "@/components/demo/banner";
import { DemoContextProvider } from "@/lib/demo/guard";
import { TourOverlay } from "@/components/demo/tour-overlay";
import { DemoTopBar } from "@/components/demo/demo-topbar";

// `getDemoData()`가 `new Date()` 기준 상대 날짜 계산 — 빌드 시점 고정값이 되지 않도록 ISR.
// 60초 단위 재생성으로 "항상 최근 데이터" UX 유지 + 반복 요청(DoW) 완화.
// Task 4-1 M4 보안 리뷰: force-dynamic 대비 서버 invocation 대폭 감소.
export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    default: "데모 · dairect",
    template: "%s | 데모 · dairect",
  },
  // 데모는 공개 경로지만 인덱싱 불필요 (포트폴리오와 달리 실제 데이터가 아님)
  robots: { index: false, follow: false },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoContextProvider>
      <Suspense fallback={null}>
        {/* DemoTopBar: "← Dairect 데모 메인" + "투어 시작 ▶" — 포트폴리오 진입자 도돌이/시작점.
            Suspense 로 감싸 useSearchParams 정적 prerender 대응. */}
        <DemoTopBar />
        <TourOverlay />
      </Suspense>
      <div className="flex min-h-screen bg-background">
        <Sidebar basePath="/demo" />

        {/* Main content area */}
        <div className="flex flex-1 flex-col md:ml-60">
          <DemoBanner />
          <DemoHeader />
          <main className="flex-1 px-6 pb-20 md:px-8 md:pb-10">
            {children}
          </main>
        </div>
      </div>
    </DemoContextProvider>
  );
}
