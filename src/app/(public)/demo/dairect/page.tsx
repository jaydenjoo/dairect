import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { TourStartButton } from "./tour-start-button";

export const metadata: Metadata = {
  title: "Dairect — Demo · 90초 가이드 투어",
  description:
    "프리랜서 PM의 리드→견적→계약→정산 흐름을 한 화면에서. 90초 가이드 투어로 핵심 가치를 직접 체험해보세요.",
};

// Epic Demo-Dairect (2026-04-25): /projects 카드 클릭 → 데모 진입 hero.
// Studio Anthem 디자인 시스템 — Fraunces serif headline + amber signal + 4px hard shadow.
// 정적 페이지 (revalidate 불필요).

const SCENARIOS = [
  {
    n: "N°01",
    title: "Lead",
    titleAmber: ".",
    ko: "새 고객 인입",
    desc: "쪽지·이메일·전화로 흩어진 문의를 한 보드에. 리드 단계부터 가치 제안 시점까지 추적.",
    href: "/demo/leads?tour=1&step=1",
    flow: "/demo/leads",
  },
  {
    n: "N°02",
    title: "Estim",
    titleAmber: "ate.",
    ko: "AI 추천 견적",
    desc: "비슷한 과거 프로젝트 기반 AI 자동 견적 추천. 단가·일정·범위 한 번에.",
    href: "/demo/estimates?tour=1&step=2",
    flow: "/demo/estimates",
  },
  {
    n: "N°03",
    title: "Contr",
    titleAmber: "act.",
    ko: "PDF 계약·서명",
    desc: "견적이 통과되면 한 클릭으로 계약 PDF 생성. 전자서명 → 자동 status 전환.",
    href: "/demo/contracts?tour=1&step=3",
    flow: "/demo/contracts",
  },
  {
    n: "N°04",
    title: "Invo",
    titleAmber: "ice.",
    ko: "정산·자동 알림",
    desc: "착수금·중도금·잔금 단계별 자동 알림. 미수금 days 카운트 + 캐시플로우 차트.",
    href: "/demo/invoices?tour=1&step=4",
    flow: "/demo/invoices",
  },
] as const;

const STATS = [
  { value: "23", label: "Projects shipped", note: "예시" },
  { value: "8.2", unit: "h/wk", label: "Time saved", note: "예시" },
  { value: "2.1", unit: "wk", label: "Avg delivery", note: "예시" },
  { value: "98", unit: "%", label: "On-time rate", note: "예시" },
] as const;

export default function DemoDairectPage() {
  return (
    <>
      <Nav solidAlways />
      <main id="main" className="relative z-[2] bg-canvas">
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="px-6 pt-32 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — DEMO N°00 · DAIRECT
            </p>
            <h1
              className="mt-6 font-display text-[44px] leading-[0.95] tracking-[-0.03em] text-[#141414] sm:text-[64px] lg:text-[88px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Manage everything.
              <br />
              <span
                className="text-[#FFB800]"
                style={{ fontStyle: "italic" }}
              >
                In one canvas.
              </span>
            </h1>
            <p className="mt-8 max-w-[560px] text-[17px] leading-[1.6] text-[#3A3A3A] sm:text-[18px]">
              프리랜서 PM 의 리드 → 견적 → 계약 → 정산 → AI 보고까지 한 화면에서.{" "}
              <em
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                }}
              >
                클릭 한 번 없이
              </em>{" "}
              흐름이 이어집니다.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <TourStartButton href="/demo/leads?tour=1&step=1" />
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#141414] underline-offset-4 hover:underline"
              >
                자유 탐색
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 4 Scenarios ────────────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-paper px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8680]">
              — 4 ESSENTIAL FLOWS
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Four steps. <em style={{ fontStyle: "italic" }}>One day.</em>
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-px bg-[#141414]/12 sm:grid-cols-2 lg:grid-cols-4">
              {SCENARIOS.map((s) => (
                <Link
                  key={s.n}
                  href={s.href}
                  className="group relative flex flex-col gap-4 bg-paper p-8 transition-colors hover:bg-canvas"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
                    {s.n}
                  </span>
                  <h3
                    className="font-display text-[28px] leading-[1.1] tracking-[-0.02em] text-[#141414]"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {s.title}
                    <span className="text-[#FFB800]">{s.titleAmber}</span>
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    {s.ko}
                  </p>
                  <p className="text-sm leading-[1.55] text-[#3A3A3A]">
                    {s.desc}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[#141414] opacity-0 transition-opacity group-hover:opacity-100">
                    이 단계 체험 →
                  </span>
                  {/* hover amber accent bar */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#FFB800] transition-all group-hover:w-full"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ───────────────────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-canvas px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8680]">
              — RESULT IN 6 MONTHS
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l-[1px] border-[#141414]/20 pl-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-display text-[44px] leading-[1] tracking-[-0.03em] text-[#141414] sm:text-[64px]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      {s.value}
                    </span>
                    {"unit" in s && s.unit && (
                      <span
                        className="font-display text-[20px] tracking-[-0.02em] text-[#8B8680] sm:text-[24px]"
                        style={{ fontFamily: "var(--font-fraunces)" }}
                      >
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    {s.label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                    {s.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-[#141414] px-6 py-32 text-canvas sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — N°00 · TRY IT YOURSELF
            </p>
            <h2
              className="mt-6 font-display text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[56px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              비슷한 도구를{" "}
              <em
                style={{ fontStyle: "italic", color: "#FFB800" }}
              >
                만들고 싶다면.
              </em>
            </h2>
            <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-canvas/72 sm:text-[18px]">
              Dairect 는 한 명의 PM 이 2~3주 만에 만든 도구입니다. 당신의
              프로젝트도 같은 흐름으로 만들 수 있습니다.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href="/about#contact"
                className="inline-flex items-center gap-2 bg-[#FFB800] px-8 py-4 text-sm font-medium text-[#141414] transition-transform hover:translate-x-[2px]"
                style={{ boxShadow: "4px 4px 0 0 #FAF7F0" }}
              >
                Start a conversation
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="mailto:hello@dairect.kr"
                className="inline-flex items-center gap-2 px-6 py-4 text-sm text-canvas/72 underline-offset-4 hover:text-canvas hover:underline"
              >
                hello@dairect.kr
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
