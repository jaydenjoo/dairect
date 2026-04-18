import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, FileText, FileSignature, Banknote, Calendar, Activity, Sparkles } from "lucide-react";
import { MonthlyRevenueChart, ClientRevenueChart } from "@/app/dashboard/dashboard-charts";
import { getDemoData } from "@/lib/demo/sample-data";
import {
  getDemoKpi,
  getDemoMonthlyRevenueForChart,
  getDemoClientRevenue,
  getDemoUpcomingDeadlines,
  getDemoRecentActivity,
} from "@/lib/demo/derived-data";
import { formatKRW } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "대시보드",
};

const kpiConfig = [
  { key: "activeProjects", label: "진행 중 프로젝트", icon: FolderKanban, format: (v: number) => `${v}건` },
  { key: "monthEstimates", label: "이번 달 견적", icon: FileText, format: formatKRW },
  { key: "unsignedContracts", label: "미서명 계약서", icon: FileSignature, format: (v: number) => `${v}건` },
  { key: "unpaidAmount", label: "미수금", icon: Banknote, format: formatKRW },
] as const;

/**
 * /demo 홈 페이지 — 대시보드 홈(`/dashboard`)의 데모 버전.
 *
 * 데이터 소스: `getDemoData()` 고정 샘플 → `derived-data.ts`로 KPI/차트/타임라인 계산.
 * AI 브리핑은 로그인 필수이므로 정적 안내 카드로 대체한다.
 */
export default function DemoHomePage() {
  const sample = getDemoData();
  const kpi = getDemoKpi(sample);
  const monthlyRevenue = getDemoMonthlyRevenueForChart(sample);
  const clientRevenue = getDemoClientRevenue(sample);
  const upcomingDeadlines = getDemoUpcomingDeadlines(sample);
  const recentActivity = getDemoRecentActivity(sample);

  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        대시보드
      </h1>

      {/* KPI 카드 */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.map((card) => {
          const value = kpi[card.key];
          return (
            <div key={card.key} className="rounded-xl bg-card p-6 shadow-ambient">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground">
                {card.format(value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* AI 주간 브리핑 — 데모는 정적 안내 카드 */}
      <div className="mt-6 rounded-xl bg-card p-6 shadow-ambient">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              AI 주간 브리핑
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              로그인 후 실제 프로젝트 데이터로 긴급 이슈 3건과 요약을 자동 생성합니다.
              미수금·완료 임박·이번 주 마감을 한눈에 파악할 수 있어요.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-flex items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              무료로 시작하기 →
            </Link>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-ambient">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            월별 매출
          </h2>
          <div className="mt-4">
            <MonthlyRevenueChart data={monthlyRevenue} />
          </div>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-ambient">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            고객별 매출
          </h2>
          <div className="mt-4">
            <ClientRevenueChart data={clientRevenue} />
          </div>
        </div>
      </div>

      {/* 하단 영역 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 다가오는 마일스톤 */}
        <div className="rounded-xl bg-card p-6 shadow-ambient">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-semibold text-foreground">
              다가오는 마일스톤
            </h2>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              7일 이내 마감 마일스톤이 없습니다
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {upcomingDeadlines.map((d) => (
                <li key={d.id}>
                  <Link
                    href="/demo/projects"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.projectName}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-amber-600">
                      {d.dueDate}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="rounded-xl bg-card p-6 shadow-ambient">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-semibold text-foreground">
              최근 활동
            </h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              아직 활동 기록이 없습니다
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentActivity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.description ?? a.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
