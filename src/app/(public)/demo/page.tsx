import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
};

/**
 * /demo 홈 페이지 — 대시보드 홈(`/dashboard`)의 데모 버전.
 *
 * M3 단계: 레이아웃(사이드바 + 배너 + 헤더)이 정상 작동하는지 확인용 placeholder.
 * M4에서 KPI 카드 4개 + 6개월 매출 차트 + 활동 타임라인 + 마일스톤이 연결됨.
 */
export default function DemoHomePage() {
  return (
    <div className="py-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
        대시보드
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        프리랜서 PM이 실제로 사용하는 화면을 그대로 체험해보세요
      </p>

      <div className="mt-10 rounded-xl bg-card p-12 text-center shadow-ambient">
        <p className="text-sm font-medium text-foreground">
          M4에서 KPI 카드 · 6개월 매출 차트 · 프로젝트 목록이 연결됩니다
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          샘플 데이터는 <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">lib/demo/sample-data.ts</code>
          의 <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">getDemoData()</code>로 주입됩니다
        </p>
      </div>
    </div>
  );
}
