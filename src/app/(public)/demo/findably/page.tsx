import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { ScrollTour } from "./scroll-tour";
import { ScoreRadar } from "./score-radar";
import { SCORE_DATA } from "./score-data";
import { ScrollToStepButton } from "@/components/demo/scroll-to-step-button";

export const metadata: Metadata = {
  title: "Findably — Demo · 3분 가이드 투어",
  description:
    "웹사이트 마케팅 비용이 어디서 새고 있는지 진단. SEO/GEO/콘텐츠/기술 4영역 60+ 항목 자동 평가 → 점수 + Quick Win + 90일 로드맵.",
};

// Epic Demo-Findably (2026-04-25): 라이브 사이트 6단계를 4단계로 압축.
// (Input/Scan/Score/Action). 외부 시뮬레이션 — Studio Anthem 디자인 시스템 일관.

const PAIN_POINTS = [
  { n: "01", pct: "73%", label: "마케팅 효과 불명확", note: "중소기업 (Constant Contact 2025)" },
  { n: "02", pct: "₩300만+", label: "월 광고비 누수", note: "랜딩·SEO·GEO 모두 점검 필요" },
  { n: "03", pct: "60+", label: "분산된 점검 항목", note: "에이전시별·툴별 산재" },
  { n: "04", pct: "5h+", label: "수동 진단 시간", note: "전문가 1회당 평균" },
];

const QUICK_WINS = [
  { n: "01", title: "메타 디스크립션 누락 17건 보완", impact: "높음", days: "1d", dim: "SEO" },
  { n: "02", title: "FAQ 스키마 적용으로 AI 인용 가능성 ↑", impact: "높음", days: "2d", dim: "GEO" },
  { n: "03", title: "Core Web Vitals LCP 4.2s → 2.5s 이하", impact: "중간", days: "5d", dim: "기술" },
];

const ROADMAP_90D = [
  { week: "W1-2", focus: "Quick Win 3건 즉시 실행", impact: "+12점" },
  { week: "W3-4", focus: "콘텐츠 토픽 클러스터 8개 발행", impact: "+8점" },
  { week: "W5-8", focus: "GEO 최적화 (FAQ·HowTo 스키마)", impact: "+15점" },
  { week: "W9-12", focus: "광고 채널 실효성 분석 + 예산 재분배", impact: "+9점" },
];

const STATS = [
  { value: "60", unit: "+ 항목", label: "Auto checks", note: "예시" },
  { value: "5", unit: "min", label: "Diagnosis", note: "예시" },
  { value: "44", unit: "/100", label: "Total score", note: "예시" },
  { value: "+44", unit: "점", label: "90-day potential", note: "예시" },
];

const TOTAL_SCORE = Math.round(
  SCORE_DATA.reduce((sum, d) => sum + d.score, 0) / SCORE_DATA.length,
);

export default function DemoFindablyPage() {
  return (
    <>
      <Nav solidAlways />
      <main id="main" className="relative z-[2] bg-canvas">
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="px-6 pt-32 pb-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — DEMO N°02 · FINDABLY
            </p>
            <h1
              className="mt-6 font-display text-[44px] leading-[0.95] tracking-[-0.03em] text-[#141414] sm:text-[64px] lg:text-[88px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Where is the
              <br />
              <span className="text-[#FFB800]" style={{ fontStyle: "italic" }}>
                leak?
              </span>
            </h1>
            <p className="mt-8 max-w-[640px] text-[17px] leading-[1.6] text-[#3A3A3A] sm:text-[18px]">
              마케팅 비용이 어디서 새는지 모르겠다면. 웹사이트 URL 한 줄로{" "}
              <em
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                }}
              >
                SEO · GEO · 콘텐츠 · 기술
              </em>{" "}
              4영역 60+ 항목을 5분 안에 진단합니다.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href="#step-1"
                className="group inline-flex items-center gap-3 bg-[#141414] px-8 py-4 text-sm font-medium text-canvas transition-transform hover:translate-x-[2px]"
                style={{ boxShadow: "4px 4px 0 0 #FFB800" }}
              >
                <span className="font-mono text-xs">▶</span>
                3분 가이드 투어 시작
                <span
                  aria-hidden="true"
                  className="text-[#FFB800] transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <a
                href="https://findably.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#141414] underline-offset-4 hover:underline"
              >
                실제 라이브 사이트 보기
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Sticky Step Bar ─────────────────────────────── */}
        <ScrollTour />

        {/* ── Before (Pain Points) ────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-paper px-6 py-24 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8680]">
              — BEFORE · 4 PAIN POINTS
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Money flows out, <em style={{ fontStyle: "italic" }}>silently.</em>
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-px bg-[#141414]/12 sm:grid-cols-2 lg:grid-cols-4">
              {PAIN_POINTS.map((p) => (
                <div key={p.n} className="bg-paper p-8">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B8680]">
                    N°{p.n}
                  </span>
                  <p
                    className="mt-3 font-display text-[36px] leading-[1] tracking-[-0.02em] text-[#C85A3B]"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {p.pct}
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#141414]">
                    {p.label}
                  </p>
                  <p className="mt-2 text-xs leading-[1.5] text-[#8B8680]">
                    {p.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Step 1: Input ───────────────────────────────── */}
        <section
          id="step-1"
          className="border-t border-[#141414]/12 bg-canvas px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 01 · INPUT
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Just <em style={{ fontStyle: "italic" }}>your domain.</em>
            </h2>
            <p className="mt-6 max-w-[560px] text-base leading-[1.6] text-[#3A3A3A]">
              내 사이트 URL 한 줄. 회원가입·결제 없이{" "}
              <em
                style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic" }}
              >
                10초
              </em>{" "}
              만에 진단을 시작할 수 있습니다.
            </p>

            <div
              className="mt-12 max-w-[720px] bg-paper p-8"
              style={{ boxShadow: "4px 4px 0 0 #141414" }}
            >
              <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                Website URL
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 border border-[#141414] bg-canvas px-4 py-3 font-mono text-sm text-[#141414]">
                  https://my-shop.example.com
                </div>
                <ScrollToStepButton
                  targetId="step-2"
                  label="무료 진단 →"
                  pendingLabel="진단 중..."
                />
              </div>
              <p className="mt-4 font-mono text-[11px] text-[#8B8680]">
                💡 평균{" "}
                <span className="text-[#FFB800]">5분 이내</span> 4영역 60+ 항목
                점수와 PDF 리포트 자동 생성
              </p>
            </div>
          </div>
        </section>

        {/* ── Step 2: Scan ────────────────────────────────── */}
        <section
          id="step-2"
          className="border-t border-[#141414]/12 bg-paper px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 02 · SCAN
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              60+ checks in <em style={{ fontStyle: "italic" }}>5 minutes.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              크롤·메타·구조화 데이터·Core Web Vitals·콘텐츠 깊이·내부 링크
              구조·AI 인용 적합성까지 — 4영역 60+ 항목을 동시에 자동 검사.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { dim: "SEO", checks: 18, color: "#141414" },
                { dim: "GEO", checks: 14, color: "#FFB800" },
                { dim: "콘텐츠", checks: 16, color: "#8B8680" },
                { dim: "기술", checks: 14, color: "#C85A3B" },
              ].map((d) => (
                <div
                  key={d.dim}
                  className="bg-canvas p-6"
                  style={{ boxShadow: "4px 4px 0 0 #141414" }}
                >
                  <div
                    className="h-1 w-full"
                    style={{ background: d.color }}
                    aria-hidden="true"
                  />
                  <p
                    className="mt-4 font-display text-[28px] leading-[1] tracking-[-0.02em] text-[#141414]"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {d.dim}
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className="font-display text-[40px] leading-[1] tracking-[-0.03em] text-[#141414]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      {d.checks}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                      checks
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8B8680]">
                    auto · parallel
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Step 3: Score ───────────────────────────────── */}
        <section
          id="step-3"
          className="border-t border-[#141414]/12 bg-canvas px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 03 · SCORE
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Four numbers, <em style={{ fontStyle: "italic" }}>one truth.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              SEO · GEO · 콘텐츠 · 기술 — 각 영역 0-100 점수. 약점이 한 눈에
              보이고, 어디부터 손대야 할지 즉시 결정 가능.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
              {/* RadarChart */}
              <div
                className="bg-paper p-8"
                style={{ boxShadow: "4px 4px 0 0 #141414" }}
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    Overall · 4 dimensions
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                    예시 데이터
                  </p>
                </div>
                <div className="mt-4">
                  <ScoreRadar />
                </div>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span
                    className="font-display text-[64px] leading-[1] tracking-[-0.03em] text-[#141414]"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {TOTAL_SCORE}
                  </span>
                  <span
                    className="font-display text-[20px] tracking-[-0.02em] text-[#8B8680]"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    / 100
                  </span>
                </div>
                <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                  Total · 예시
                </p>
              </div>

              {/* 4 dim 점수 카드 */}
              <div className="grid grid-cols-2 gap-px bg-[#141414]/12">
                {SCORE_DATA.map((s) => {
                  const tone =
                    s.score >= 75
                      ? { bg: "#1F5C2F", label: "GOOD" }
                      : s.score >= 50
                        ? { bg: "#FFB800", label: "FAIR" }
                        : { bg: "#C85A3B", label: "WEAK" };
                  return (
                    <div key={s.dim} className="bg-paper p-6">
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                        {s.dim}
                      </p>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span
                          className="font-display text-[44px] leading-[1] tracking-[-0.03em] text-[#141414]"
                          style={{ fontFamily: "var(--font-fraunces)" }}
                        >
                          {s.score}
                        </span>
                        <span
                          className="font-display text-[16px] tracking-[-0.02em] text-[#8B8680]"
                          style={{ fontFamily: "var(--font-fraunces)" }}
                        >
                          / 100
                        </span>
                      </div>
                      <span
                        className="mt-3 inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-canvas"
                        style={{ background: tone.bg }}
                      >
                        {tone.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Step 4: Action ──────────────────────────────── */}
        <section
          id="step-4"
          className="border-t border-[#141414]/12 bg-paper px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 04 · ACTION
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Quick wins. <em style={{ fontStyle: "italic" }}>90-day plan.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              점수만 보고 끝나지 않습니다.{" "}
              <em
                style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic" }}
              >
                즉시 실행 가능한
              </em>{" "}
              Quick Win 3건 + 90일 단계별 로드맵 자동 생성. 대표님 버전 3줄 요약 +
              실무자 버전 PDF 함께 출력.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
              {/* Quick Wins */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  Quick Wins · 즉시 실행 3건
                </p>
                <ul className="mt-4 divide-y divide-[#141414]/12 border-y border-[#141414]/12">
                  {QUICK_WINS.map((q) => (
                    <li key={q.n} className="flex items-start gap-4 py-4">
                      <span
                        className="mt-1 inline-block bg-[#FFB800] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#141414]"
                      >
                        N°{q.n}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#141414]">{q.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8B8680]">
                          <span>영역 · {q.dim}</span>
                          <span>임팩트 · {q.impact}</span>
                          <span>소요 · {q.days}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 90-day Roadmap */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  90-day Roadmap · 단계별 실행
                </p>
                <ul className="mt-4 space-y-3">
                  {ROADMAP_90D.map((r, i) => (
                    <li
                      key={r.week}
                      className="flex items-center gap-4 bg-canvas p-4"
                      style={{
                        boxShadow:
                          i === 0
                            ? "4px 4px 0 0 #FFB800"
                            : "1px 1px 0 0 rgba(20,20,20,0.16)",
                      }}
                    >
                      <span
                        className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FFB800]"
                        style={{ minWidth: "3.5rem" }}
                      >
                        {r.week}
                      </span>
                      <span className="flex-1 text-sm text-[#141414]">{r.focus}</span>
                      <span
                        className="font-display text-[18px] tracking-[-0.02em] text-[#1F5C2F]"
                        style={{ fontFamily: "var(--font-fraunces)" }}
                      >
                        {r.impact}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[11px] text-[#8B8680]">
                  💡 누적 잠재 점수{" "}
                  <span className="text-[#FFB800]">+44점</span> (44 → 88) · 예시
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ─────────────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-canvas px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8680]">
              — RESULT IN 5 MINUTES
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l-[1px] border-[#141414]/20 pl-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-display text-[44px] leading-[1] tracking-[-0.03em] text-[#141414] sm:text-[56px]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      {s.value}
                    </span>
                    <span
                      className="font-display text-[18px] tracking-[-0.02em] text-[#8B8680] sm:text-[22px]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      {s.unit}
                    </span>
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
              — N°02 · TRY IT YOURSELF
            </p>
            <h2
              className="mt-6 font-display text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[56px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Diagnose{" "}
              <em
                style={{ fontStyle: "italic", color: "#FFB800" }}
              >
                your site.
              </em>
            </h2>
            <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-canvas/72 sm:text-[18px]">
              실제 라이브 사이트는 무료 진단 → 9.9만원으로 PDF 리포트 + 90일
              로드맵까지. 또는 비슷한 도구를 우리 사업에 맞게 만들고 싶다면.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href="https://findably.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FFB800] px-8 py-4 text-sm font-medium text-[#141414] transition-transform hover:translate-x-[2px]"
                style={{ boxShadow: "4px 4px 0 0 #FAF7F0" }}
              >
                Findably 라이브 사이트 보기
                <span aria-hidden="true">↗</span>
              </a>
              <Link
                href="/about#contact"
                className="inline-flex items-center gap-2 border-b-[1.5px] border-canvas px-2 py-2 text-sm text-canvas hover:border-[#FFB800] hover:text-[#FFB800]"
              >
                비슷한 거 만들고 싶다면
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
