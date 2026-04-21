import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "시작하기 | dairect",
};

// 사이드바/헤더 없는 독립 레이아웃 — 신규 가입자가 workspace 이름을 확정하기 전엔
// 대시보드 UI를 미리 노출하지 않는 게 자연스럽다.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      {children}
    </div>
  );
}
