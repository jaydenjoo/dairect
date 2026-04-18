import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/nav";
import { ProblemSection } from "@/components/landing/problem-section";
import { ServiceSection } from "@/components/landing/service-section";
import { PortfolioSection } from "@/components/landing/portfolio-section";
import { PricingSummarySection } from "@/components/landing/pricing-summary-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";

const heroStats: { value: string; label: string }[] = [
  { value: "10+", label: "프로젝트 완료" },
  { value: "2주", label: "평균 전달 기간" },
  { value: "98%", label: "고객 만족도" },
];

export default function LandingPage() {
  return (
    <main className="surface-base min-h-screen">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1 space-y-6">
              <span className="inline-block rounded-full bg-accent px-3 py-1.5 font-mono text-xs tracking-wider text-accent-foreground">
                AI-Powered Development
              </span>
              <h1
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground"
                style={{ wordBreak: "keep-all" }}
              >
                머릿속 아이디어를
                <br />
                <span className="text-primary">진짜로</span> 만들어드립니다
              </h1>
              <p
                className="max-w-lg text-lg leading-relaxed text-muted-foreground"
                style={{ wordBreak: "keep-all" }}
              >
                개발을 모르셔도, AI를 못 다루셔도 괜찮습니다.
                <br />
                아이디어만 말씀해주세요. 나머지는 저희가 합니다.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/about#contact"
                  className="soul-gradient inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white shadow-ambient transition-opacity hover:opacity-90"
                >
                  내 아이디어 상담하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/projects"
                  className="rounded-lg px-6 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  포트폴리오 보기
                </Link>
              </div>
            </div>

            {/* 추상 대시보드 목업 — surface tonal layering */}
            <div className="flex-1">
              <div
                className="surface-card aspect-video rounded-2xl p-4 shadow-ambient-lg"
                aria-hidden
              >
                {/* Window chrome */}
                <div className="mb-4 flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/30" />
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-5/30" />
                  <div className="h-2.5 w-2.5 rounded-full bg-chart-4/30" />
                  <div className="ml-4 h-2 flex-1 rounded-full bg-foreground/5" />
                </div>

                <div className="flex h-[calc(100%-2rem)] gap-3">
                  {/* Sidebar */}
                  <div className="surface-high flex w-20 shrink-0 flex-col gap-2 rounded-lg p-2.5">
                    <div className="h-4 rounded bg-primary/20" />
                    <div className="h-3 rounded bg-foreground/10" />
                    <div className="h-3 rounded bg-foreground/10" />
                    <div className="h-3 rounded bg-foreground/10" />
                    <div className="mt-auto flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-primary/30" />
                      <div className="h-2 flex-1 rounded bg-foreground/10" />
                    </div>
                  </div>

                  {/* Main area */}
                  <div className="flex flex-1 flex-col gap-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded bg-foreground/15" />
                      <div className="flex gap-1.5">
                        <div className="h-6 w-14 rounded-md bg-foreground/5" />
                        <div className="h-6 w-16 rounded-md bg-primary/80" />
                      </div>
                    </div>

                    {/* KPI cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 10, value: 24, accent: true },
                        { label: 12, value: 18, accent: false },
                        { label: 8, value: 20, accent: false },
                      ].map((kpi, i) => (
                        <div
                          key={i}
                          className="surface-high flex flex-col gap-1.5 rounded-lg p-2.5"
                        >
                          <div
                            className="h-1.5 rounded bg-foreground/10"
                            style={{ width: `${kpi.label * 3}px` }}
                          />
                          <div
                            className={`h-4 rounded ${kpi.accent ? "bg-primary/40" : "bg-foreground/20"}`}
                            style={{ width: `${kpi.value * 3}px` }}
                          />
                          <div className="mt-1 flex items-center gap-1">
                            <div className="h-1 w-1 rounded-full bg-chart-4" />
                            <div className="h-1 w-6 rounded bg-chart-4/40" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div className="surface-high flex flex-1 items-end gap-1.5 rounded-lg p-3">
                      {[40, 62, 48, 78, 55, 72, 88].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm ${
                            i === 3 ? "bg-primary/60" : "bg-primary/20"
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-12 md:gap-20">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-bold text-primary tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProblemSection />
      <ServiceSection />
      <PortfolioSection />
      <PricingSummarySection />
      <CtaSection />
      <LandingFooter />
      <PwaInstallPrompt />
    </main>
  );
}
