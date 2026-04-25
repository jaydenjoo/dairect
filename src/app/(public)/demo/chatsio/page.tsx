import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { ScrollTour } from "./scroll-tour";
import { CitationChart } from "./citation-chart";
import { ScrollToStepButton } from "@/components/demo/scroll-to-step-button";

export const metadata: Metadata = {
  title: "Chatsio — Demo · 3분 가이드 투어",
  description:
    "AI 검색 시대, 쇼핑몰 상품을 ChatGPT·Perplexity·Gemini가 인용 가능한 구조화 데이터로 자동 변환. URL 연결 → AI 분석 → JSON-LD 적용 → AI 인용 추적 4단계.",
};

// Epic Demo-Chatsio (2026-04-25): /projects 카드 클릭 → 데모 진입.
// 단일 페이지 + sticky step bar + smooth scroll. 외부 서비스라 시뮬레이션 화면을
// Studio Anthem 디자인 시스템으로 재현 (가공된 예시 데이터 + "예시" 라벨).

const PAIN_POINTS = [
  { n: "01", pct: "70%", label: "상품 정보가 이미지에 갇힘", note: "alt 태그·구조화 데이터 부재" },
  { n: "02", pct: "20-40m", label: "상품당 수작업 시간", note: "MD 1명이 100개 등록 시 5일" },
  { n: "03", pct: "₩1,500만", label: "에이전시 월 비용", note: "500개 상품 기준 외주" },
  { n: "04", pct: "0%", label: "AI 검색 결과 노출", note: "ChatGPT·Perplexity 인용 X" },
];

const STATS = [
  { value: "97.3", unit: "%", label: "Extraction accuracy", note: "예시" },
  { value: "30", unit: "s", label: "Per product", note: "예시" },
  { value: "85", unit: "/100", label: "Citation Score", note: "예시" },
  { value: "12", unit: "회", label: "ChatGPT 인용", note: "예시" },
];

// 예시 JSON-LD (Schema.org Product 마크업) — 의류 상품 가정.
const SAMPLE_JSON_LD = `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "오버사이즈 코튼 스웨터",
  "image": "https://example.com/sweater.jpg",
  "description": "100% 면 소재의 오버사이즈 핏 스웨터",
  "brand": { "@type": "Brand", "name": "BRAND" },
  "offers": {
    "@type": "Offer",
    "price": "59000",
    "priceCurrency": "KRW",
    "availability": "https://schema.org/InStock"
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "소재", "value": "면 100%" },
    { "@type": "PropertyValue", "name": "핏", "value": "오버사이즈" },
    { "@type": "PropertyValue", "name": "색상", "value": "5종" }
  ]
}`;

const SAMPLE_LOADER = `<script src="https://chatsio.kr/loader.js" data-shop="my-shop"></script>`;

export default function DemoChatsioPage() {
  return (
    <>
      <Nav solidAlways />
      <main id="main" className="relative z-[2] bg-canvas">
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="px-6 pt-32 pb-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — DEMO N°01 · CHATSIO
            </p>
            <h1
              className="mt-6 font-display text-[44px] leading-[0.95] tracking-[-0.03em] text-[#141414] sm:text-[64px] lg:text-[88px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Be cited.
              <br />
              <span className="text-[#FFB800]" style={{ fontStyle: "italic" }}>
                By every AI.
              </span>
            </h1>
            <p className="mt-8 max-w-[640px] text-[17px] leading-[1.6] text-[#3A3A3A] sm:text-[18px]">
              AI 검색 시대, 쇼핑몰 상품을 ChatGPT·Perplexity·Gemini 가{" "}
              <em
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                }}
              >
                인용 가능한
              </em>{" "}
              구조화 데이터로 자동 변환합니다. URL 연결 한 번이면 충분합니다.
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
                href="https://chatsio-topaz.vercel.app/"
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

        {/* ── Sticky Step Bar (4-Step) ────────────────────── */}
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
              The reality of <em style={{ fontStyle: "italic" }}>e-commerce.</em>
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

        {/* ── Step 1: Connect ─────────────────────────────── */}
        <section
          id="step-1"
          className="border-t border-[#141414]/12 bg-canvas px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 01 · CONNECT
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Just paste <em style={{ fontStyle: "italic" }}>your URL.</em>
            </h2>
            <p className="mt-6 max-w-[560px] text-base leading-[1.6] text-[#3A3A3A]">
              쇼핑몰 메인 또는 상품 페이지 URL 한 줄. 카페24, 쇼피파이, 자체
              제작 어떤 플랫폼이든 무관합니다.
            </p>

            <div
              className="mt-12 max-w-[720px] bg-paper p-8"
              style={{ boxShadow: "4px 4px 0 0 #141414" }}
            >
              <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                Shop URL
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 border border-[#141414] bg-canvas px-4 py-3 font-mono text-sm text-[#141414]">
                  https://my-shop.example.com
                </div>
                <ScrollToStepButton
                  targetId="step-2"
                  label="분석 시작 →"
                  pendingLabel="분석 중..."
                />
              </div>
              <p className="mt-4 font-mono text-[11px] text-[#8B8680]">
                💡 <span className="text-[#FFB800]">평균 30초</span> 안에 상품
                목록 자동 인식 → 다음 단계로 자동 진행
              </p>
            </div>
          </div>
        </section>

        {/* ── Step 2: Analyze ─────────────────────────────── */}
        <section
          id="step-2"
          className="border-t border-[#141414]/12 bg-paper px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 02 · ANALYZE
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              AI extracts <em style={{ fontStyle: "italic" }}>97.3%</em>.
            </h2>
            <p className="mt-6 max-w-[560px] text-base leading-[1.6] text-[#3A3A3A]">
              상품 이미지 + 텍스트 + 메타 데이터를 종합 분석. 카테고리별 특화
              로직 (의류·뷰티·식품 등) 으로 정교한 속성 추출.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
              {/* 좌측: 추출 결과 카드 */}
              <div
                className="bg-canvas p-8"
                style={{ boxShadow: "4px 4px 0 0 #141414" }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  Extracted · Product N°042
                </p>
                <h3 className="mt-3 font-display text-2xl text-[#141414]" style={{ fontFamily: "var(--font-fraunces)" }}>
                  오버사이즈 코튼 스웨터
                </h3>
                <dl className="mt-6 divide-y divide-[#141414]/12 font-mono text-sm">
                  {[
                    { k: "소재", v: "면 100%" },
                    { k: "핏", v: "오버사이즈" },
                    { k: "색상", v: "5종 (블랙·아이보리·올리브·네이비·버건디)" },
                    { k: "사이즈", v: "S / M / L / XL" },
                    { k: "가격", v: "₩59,000" },
                    { k: "재고", v: "InStock" },
                  ].map((row) => (
                    <div key={row.k} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">{row.k}</dt>
                      <dd className="text-[#141414]">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* 우측: 정확도 통계 */}
              <div className="flex flex-col justify-center gap-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    Accuracy
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      className="font-display text-[72px] leading-[1] tracking-[-0.03em] text-[#141414]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      97.3
                    </span>
                    <span
                      className="font-display text-[28px] tracking-[-0.02em] text-[#8B8680]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      %
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                    예시
                  </p>
                </div>
                <div className="border-l-[1px] border-[#141414]/20 pl-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    Per product
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className="font-display text-[44px] leading-[1] tracking-[-0.03em] text-[#141414]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      30
                    </span>
                    <span
                      className="font-display text-[20px] tracking-[-0.02em] text-[#8B8680]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Step 3: Apply ───────────────────────────────── */}
        <section
          id="step-3"
          className="border-t border-[#141414]/12 bg-canvas px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 03 · APPLY
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              One line of <em style={{ fontStyle: "italic" }}>code.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              생성된 JSON-LD (Schema.org Product) 를 사이트에 자동 주입. 한 줄
              Loader 만 붙이면 모든 상품 페이지가 AI 인용 가능 상태로 전환.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* JSON-LD 코드 박스 */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  Generated · JSON-LD (Schema.org Product)
                </p>
                <pre
                  className="mt-3 overflow-x-auto bg-[#141414] p-6 font-mono text-[12px] leading-[1.5] text-canvas"
                  style={{ boxShadow: "4px 4px 0 0 #FFB800" }}
                >
                  <code>{SAMPLE_JSON_LD}</code>
                </pre>
              </div>

              {/* Loader JS 1줄 */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  Install · 1-line Loader
                </p>
                <pre
                  className="mt-3 overflow-x-auto bg-paper p-6 font-mono text-[13px] leading-[1.5] text-[#141414]"
                  style={{ boxShadow: "4px 4px 0 0 #141414" }}
                >
                  <code>{SAMPLE_LOADER}</code>
                </pre>
                <p className="mt-3 font-mono text-[11px] text-[#8B8680]">
                  💡 <span className="text-[#FFB800]">{`<head>`}</span> 또는{" "}
                  <span className="text-[#FFB800]">GTM</span> 한 곳만 — 전체 상품
                  자동 적용
                </p>

                <div className="mt-8 border-l-[1px] border-[#141414]/20 pl-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    Cost saved
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className="font-display text-[44px] leading-[1] tracking-[-0.03em] text-[#141414]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      ₩1,500
                    </span>
                    <span
                      className="font-display text-[20px] tracking-[-0.02em] text-[#8B8680]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      만 → 0
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                    예시 · 500개 기준
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Step 4: Track ───────────────────────────────── */}
        <section
          id="step-4"
          className="border-t border-[#141414]/12 bg-paper px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 04 · TRACK
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              See the <em style={{ fontStyle: "italic" }}>citations</em> grow.
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              ChatGPT·Perplexity·Gemini 응답에서 우리 상품이 인용된 횟수를 자동
              감지해 점수화 (0~100). 도입 4주 만에 0 → 85점.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* 차트 */}
              <div
                className="bg-canvas p-8"
                style={{ boxShadow: "4px 4px 0 0 #141414" }}
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    Citation Score · 8 weeks
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                    예시 데이터
                  </p>
                </div>
                <div className="mt-6">
                  <CitationChart />
                </div>
                <div className="mt-4 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 bg-[#8B8680]" />
                    Before (도입 전)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 bg-[#FFB800]" />
                    After (Chatsio 적용)
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col justify-center gap-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    ChatGPT 인용 횟수
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className="font-display text-[72px] leading-[1] tracking-[-0.03em] text-[#141414]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      12
                    </span>
                    <span
                      className="font-display text-[24px] tracking-[-0.02em] text-[#8B8680]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      회/주
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB800]">
                    예시
                  </p>
                </div>
                <div className="border-l-[1px] border-[#141414]/20 pl-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                    Final Score
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className="font-display text-[64px] leading-[1] tracking-[-0.03em] text-[#FFB800]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      85
                    </span>
                    <span
                      className="font-display text-[20px] tracking-[-0.02em] text-[#8B8680]"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      / 100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ─────────────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-canvas px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8680]">
              — RESULT IN 4 WEEKS
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
              — N°01 · TRY IT YOURSELF
            </p>
            <h2
              className="mt-6 font-display text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[56px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Want one for{" "}
              <em
                style={{ fontStyle: "italic", color: "#FFB800" }}
              >
                your shop?
              </em>
            </h2>
            <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-canvas/72 sm:text-[18px]">
              실제 라이브 사이트에서 직접 체험하시거나, 비슷한 도구를 만들고
              싶다면 한 줄 메시지 보내주세요.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href="https://chatsio-topaz.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FFB800] px-8 py-4 text-sm font-medium text-[#141414] transition-transform hover:translate-x-[2px]"
                style={{ boxShadow: "4px 4px 0 0 #FAF7F0" }}
              >
                Chatsio 라이브 사이트 보기
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
