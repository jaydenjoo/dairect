import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { ScrollTour } from "./scroll-tour";

export const metadata: Metadata = {
  title: "Dari — Demo · 한 줄 코드로 AI 챗봇",
  description:
    "한 줄 코드로 어떤 사이트든 AI 챗봇 추가. 자연어로 봇 성격·지식 정의. 이 사이트 우하단의 챗봇이 바로 dari 의 라이브 증명.",
};

// Epic Demo-Dari (2026-04-25): 4-step + 라이브 증명 (사이트 우하단 위젯).
// Setup → Train → Embed → Use. Step 4 에서 "지금 우하단을 보세요" 메타 마케팅.

const PAIN_POINTS = [
  { n: "01", pct: "₩2,000만+", label: "챗봇 외주 평균", note: "초기 개발만, 학습·운영 별도" },
  { n: "02", pct: "3-6m", label: "기획→출시 기간", note: "개발자·디자이너·QA 핸드오프" },
  { n: "03", pct: "0줄", label: "비개발자가 쓸 수 있는 코드", note: "지식·페르소나 변경 매번 의뢰" },
  { n: "04", pct: "0%", label: "한국어 RAG 정확도 검증", note: "영문 모델 + 영문 벡터 한계" },
];

const STATS = [
  { value: "1", unit: "줄", label: "Embed code", note: "예시" },
  { value: "5", unit: "min", label: "Setup", note: "예시" },
  { value: "97", unit: "%", label: "한국어 정확도", note: "예시" },
  { value: "$0.01", unit: "/대화", label: "Cost", note: "예시" },
];

const SAMPLE_DARI_CONFIG = `{
  "name": "dari",
  "persona": "정중하고 친근한 안내봇. 한국어 응답.",
  "primaryColor": "#FFB800",
  "knowledge": {
    "urls": ["https://my-site.kr"],
    "files": ["FAQ.md"],
    "text": ["Q: 가격은? A: 9.9만~"]
  },
  "model": "claude-sonnet-4.5",
  "rateLimit": "10/min/IP"
}`;

const EMBED_SNIPPET = `<script
  src="https://dari-theta.vercel.app/widget.js"
  data-bot-id="my-bot"
  async
></script>`;

export default function DemoDariPage() {
  return (
    <>
      <Nav solidAlways />
      <main id="main" className="relative z-[2] bg-canvas">
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="px-6 pt-32 pb-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — DEMO N°03 · DARI · POWERING THIS SITE
            </p>
            <h1
              className="mt-6 font-display text-[44px] leading-[0.95] tracking-[-0.03em] text-[#141414] sm:text-[64px] lg:text-[88px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              One line.
              <br />
              <span className="text-[#FFB800]" style={{ fontStyle: "italic" }}>
                Any site.
              </span>
            </h1>
            <p className="mt-8 max-w-[640px] text-[17px] leading-[1.6] text-[#3A3A3A] sm:text-[18px]">
              한 줄 코드로 어떤 사이트든{" "}
              <em
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontStyle: "italic",
                }}
              >
                자연어로 정의된
              </em>{" "}
              AI 챗봇 추가. Claude·Gemini·pgvector 가 한국어 질문을 정확히 이해하고
              사이트 콘텐츠 기반으로 답합니다.
            </p>

            {/* 라이브 증명 강조 */}
            <div
              className="mt-10 inline-flex items-center gap-3 bg-paper px-5 py-3"
              style={{ boxShadow: "4px 4px 0 0 #FFB800" }}
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFB800] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FFB800]" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#141414]">
                Live · 이 사이트 우하단 챗봇이 바로 dari
              </span>
            </div>

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
                href="https://dari-theta.vercel.app/"
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
              Building a chatbot? <em style={{ fontStyle: "italic" }}>Painful.</em>
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

        {/* ── Step 1: Setup ───────────────────────────────── */}
        <section
          id="step-1"
          className="border-t border-[#141414]/12 bg-canvas px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 01 · SETUP
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Define in <em style={{ fontStyle: "italic" }}>natural language.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              개발자가 아니어도 OK. 봇 이름·페르소나·색상·rate limit 까지 모두
              JSON 한 덩어리에서 자연어로 정의. dari 콘솔에서 GUI 로 편집 가능.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
              {/* DariConfig 코드 박스 */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                  DariConfig · JSON
                </p>
                <pre
                  className="mt-3 overflow-x-auto bg-[#141414] p-6 font-mono text-[12px] leading-[1.5] text-canvas"
                  style={{ boxShadow: "4px 4px 0 0 #FFB800" }}
                >
                  <code>{SAMPLE_DARI_CONFIG}</code>
                </pre>
              </div>

              {/* 항목 설명 */}
              <ul className="flex flex-col justify-center gap-4 font-mono text-sm">
                {[
                  { k: "name", v: "위젯 헤더에 표시" },
                  { k: "persona", v: "톤·답변 스타일" },
                  { k: "primaryColor", v: "런처 + 메시지 amber" },
                  { k: "knowledge", v: "URL/파일/텍스트 3-way" },
                  { k: "model", v: "Claude · Sonnet/Opus/Haiku" },
                  { k: "rateLimit", v: "악용 방지 (Upstash Redis)" },
                ].map((row) => (
                  <li
                    key={row.k}
                    className="flex items-baseline gap-3 border-l-[1px] border-[#141414]/20 pl-4"
                  >
                    <span className="text-[11px] uppercase tracking-[0.12em] text-[#FFB800]">
                      {row.k}
                    </span>
                    <span className="text-[#3A3A3A]">{row.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Step 2: Train ───────────────────────────────── */}
        <section
          id="step-2"
          className="border-t border-[#141414]/12 bg-paper px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 02 · TRAIN
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Three ways to <em style={{ fontStyle: "italic" }}>teach.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              사이트 URL·PDF·직접 텍스트 — 어느 방식으로든 지식 주입. Gemini
              임베딩 + pgvector 가 자동으로 의미 벡터화·검색.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-px bg-[#141414]/12 lg:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "URL 크롤링",
                  desc: "Firecrawl 로 사이트 통째 학습. JS 렌더링도 OK.",
                  example: "https://my-site.kr → 50개 페이지 자동 수집",
                  color: "#141414",
                },
                {
                  n: "02",
                  title: "파일 업로드",
                  desc: "PDF·TXT·MD 파일. unpdf 로 정확한 텍스트 추출.",
                  example: "FAQ.pdf · 매뉴얼.docx · 정책.md",
                  color: "#FFB800",
                },
                {
                  n: "03",
                  title: "텍스트 직접",
                  desc: "FAQ Q&A 처럼 짧은 지식. 즉시 반영.",
                  example: "Q: 환불 정책? A: 7일 이내 100%",
                  color: "#8B8680",
                },
              ].map((d) => (
                <div key={d.n} className="bg-paper p-8">
                  <div
                    className="h-1 w-full"
                    style={{ background: d.color }}
                    aria-hidden="true"
                  />
                  <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B8680]">
                    N°{d.n}
                  </span>
                  <h3
                    className="mt-3 font-display text-[24px] leading-[1.1] tracking-[-0.02em] text-[#141414]"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {d.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.5] text-[#3A3A3A]">
                    {d.desc}
                  </p>
                  <p className="mt-4 font-mono text-[11px] text-[#8B8680]">
                    💡 {d.example}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 border-l-[1px] border-[#141414]/20 pl-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                RAG 파이프라인
              </p>
              <p className="mt-2 font-mono text-sm text-[#141414]">
                Gemini text-embedding-004 → pgvector ivfflat → Claude 응답
              </p>
            </div>
          </div>
        </section>

        {/* ── Step 3: Embed ───────────────────────────────── */}
        <section
          id="step-3"
          className="border-t border-[#141414]/12 bg-canvas px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 03 · EMBED
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              One line. <em style={{ fontStyle: "italic" }}>Anywhere.</em>
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-[1.6] text-[#3A3A3A]">
              생성된 임베드 코드를 사이트 <code className="font-mono">{`<head>`}</code> 또는 GTM 한
              곳에 붙이면 끝. Shadow DOM 격리라 호스트 사이트 CSS 와 충돌 0.
            </p>

            <div className="mt-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                Embed snippet · 1 line
              </p>
              <pre
                className="mt-3 overflow-x-auto bg-paper p-6 font-mono text-[13px] leading-[1.5] text-[#141414]"
                style={{ boxShadow: "4px 4px 0 0 #141414" }}
              >
                <code>{EMBED_SNIPPET}</code>
              </pre>
              <p className="mt-3 font-mono text-[11px] text-[#8B8680]">
                💡 <span className="text-[#FFB800]">Shadow DOM</span> · CORS{" "}
                <span className="text-[#FFB800]">*</span> · z-index{" "}
                <span className="text-[#FFB800]">2147483000</span> · 모바일 자동 반응형
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { k: "Shadow DOM", v: "호스트 CSS 와 격리" },
                { k: "CORS *", v: "어떤 도메인에서도 작동" },
                { k: "Streaming SSE", v: "타이핑 애니메이션" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="border-l-[1px] border-[#141414]/20 pl-5"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FFB800]">
                    {row.k}
                  </p>
                  <p className="mt-2 text-sm text-[#141414]">{row.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Step 4: Use (라이브 증명!) ──────────────────── */}
        <section
          id="step-4"
          className="border-t border-[#141414]/12 bg-paper px-6 py-24 scroll-mt-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FFB800]">
              — STEP 04 · USE · LIVE PROOF
            </p>
            <h2
              className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-[#141414] sm:text-[44px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              See it <em style={{ fontStyle: "italic" }}>now.</em>
            </h2>

            {/* 메타 마케팅 핵심 메시지 */}
            <div
              className="mt-10 max-w-[720px] bg-canvas p-8"
              style={{ boxShadow: "8px 8px 0 0 #FFB800" }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FFB800]">
                💡 Look at the bottom-right corner
              </p>
              <p
                className="mt-4 font-display text-[28px] leading-[1.2] tracking-[-0.02em] text-[#141414] sm:text-[36px]"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                지금 우하단을 보세요 ↘
              </p>
              <p className="mt-4 text-base leading-[1.6] text-[#3A3A3A]">
                저 amber 동그라미가 바로{" "}
                <em
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontStyle: "italic",
                  }}
                >
                  dari
                </em>{" "}
                입니다. 클릭해서 직접 대화해보세요. 가격·포트폴리오·기술 스택,
                무엇이든 물어보면 답합니다 — Claude + dairect 학습 데이터로요.
              </p>
              <p className="mt-4 font-mono text-[11px] text-[#8B8680]">
                ⚡ 가공된 데모 X · 라이브 운영 챗봇 ✓
              </p>
            </div>

            {/* 추천 질문 */}
            <div className="mt-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8B8680]">
                Try asking · 추천 질문
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "가격이 어떻게 되나요?",
                  "Chatsio 가 어떤 거예요?",
                  "AI 챗봇 만들고 싶어요",
                  "지금 이 챗봇 어떻게 만들어요?",
                  "납기 1주일에 가능?",
                  "포트폴리오 다 보여주세요",
                ].map((q) => (
                  <li
                    key={q}
                    className="bg-canvas p-4 font-mono text-sm text-[#141414]"
                    style={{ boxShadow: "2px 2px 0 0 rgba(20,20,20,0.16)" }}
                  >
                    <span className="text-[#FFB800]">▸</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ─────────────────────────────────── */}
        <section className="border-t border-[#141414]/12 bg-canvas px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8B8680]">
              — RESULT
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
              — N°03 · TRY IT YOURSELF
            </p>
            <h2
              className="mt-6 font-display text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[56px]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Want{" "}
              <em
                style={{ fontStyle: "italic", color: "#FFB800" }}
              >
                your own?
              </em>
            </h2>
            <p className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-canvas/72 sm:text-[18px]">
              dari 라이브 사이트에서 직접 봇을 만들거나, 비슷한 챗봇 SaaS 를
              우리 사업에 맞게 만들고 싶다면. 둘 다 가능해요.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href="https://dari-theta.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FFB800] px-8 py-4 text-sm font-medium text-[#141414] transition-transform hover:translate-x-[2px]"
                style={{ boxShadow: "4px 4px 0 0 #FAF7F0" }}
              >
                Dari 라이브 사이트 보기
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
