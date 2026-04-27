/**
 * /guide 페이지 섹션 — 구매 희망자용 단계별 가이드.
 *
 * Server components only (FAQ JSON-LD 인덱싱 + 정적 렌더 친화).
 * Studio Anthem 디자인: Fraunces serif headings · 1px hairlines · 4px hard shadows · sharp corners.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────
export function GuideHero() {
  return (
    <section
      className="relative overflow-hidden border-b border-foreground/10 bg-canvas px-6 pt-24 pb-20 md:px-12 md:pt-32 md:pb-28"
      data-screen-label="G-01 Hero"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
          — Customer Guide
        </p>
        <h1 className="font-heading text-4xl font-light leading-[1.1] tracking-[-0.02em] text-foreground md:text-6xl">
          의뢰하기 전,
          <br />
          <em className="italic text-foreground/80">
            5분이면 충분합니다.
          </em>
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-[1.65] text-foreground/70 md:text-lg">
          처음 의뢰하는 분을 위한 단계별 안내서. 어떻게 신청하고, 견적이
          오가고, 작업이 진행되는지 — 그리고 자주 묻는 질문 답변까지 한 페이지에
          담았습니다.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="#flow"
            className="group inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-canvas transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--color-foreground)]"
          >
            의뢰 흐름 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#faq"
            className="inline-flex items-center justify-center gap-2 border border-foreground/30 px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:border-foreground hover:bg-foreground/5"
          >
            FAQ 바로 가기
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 4단계 의뢰 흐름
// ─────────────────────────────────────────────────────────
type Step = {
  num: string;
  title: string;
  duration: string;
  description: string;
  details: readonly string[];
};

const steps: readonly Step[] = [
  {
    num: "01",
    title: "의뢰",
    duration: "5분",
    description:
      "한 줄 아이디어부터 시작합니다. 폼·이메일·카카오 중 편한 방법으로 보내세요.",
    details: [
      "폼 작성 — 5분 (목적·예산·기한만 적어도 OK)",
      "이메일 — hidream72@gmail.com",
      "카카오톡 채널 — 검색 후 메시지",
      "선택: 1시간 무료 상담 신청 가능",
    ],
  },
  {
    num: "02",
    title: "견적",
    duration: "24~48시간",
    description:
      "PDF 견적서를 보내드립니다. 패키지 추천 + 작업 범위 + 일정 + 분할 결제 옵션 포함.",
    details: [
      "맞는 패키지 추천 (Discovery / Sprint / Build / Scale)",
      "작업 범위(Scope) + 만들지 않을 것(Not Doing) 명시",
      "마일스톤별 일정 + 결제 분할 옵션",
      "전자 서명용 견적서 PDF + 링크",
    ],
  },
  {
    num: "03",
    title: "계약",
    duration: "당일",
    description:
      "견적 확정 후 전자 계약서로 즉시 착수. 착수금 50% 입금 후 작업 시작.",
    details: [
      "전자 서명 (별도 SaaS 가입 불필요)",
      "착수금 50% (세금계산서 발행)",
      "Slack/이메일 채널 개설 — 매일 빌드 공유",
      "전용 고객 대시보드 링크 제공",
    ],
  },
  {
    num: "04",
    title: "정산",
    duration: "인도 시점",
    description:
      "마일스톤 완료 시 인보이스 발행. 잔금 50% 입금 후 모든 자산·코드 인계.",
    details: [
      "마일스톤별 검수 → 승인",
      "잔금 50% 인보이스 발행",
      "GitHub 코드 + 도메인 + 운영 가이드 인계",
      "선택: 14일 Slack 자문 (Build 이상)",
    ],
  },
] as const;

export function GuideFlow() {
  return (
    <section
      id="flow"
      className="border-b border-foreground/10 bg-paper px-6 py-24 md:px-12 md:py-32"
      data-screen-label="G-02 Flow"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
          — How It Works
        </p>
        <h2 className="font-heading text-3xl font-light leading-[1.15] tracking-[-0.02em] text-foreground md:text-5xl">
          의뢰부터 인도까지,
          <br />
          <em className="italic text-foreground/70">4단계.</em>
        </h2>

        <ol className="mt-16 space-y-12 md:space-y-16">
          {steps.map((step) => (
            <li
              key={step.num}
              className="grid gap-6 border-t border-foreground/10 pt-10 md:grid-cols-[180px_1fr] md:gap-12"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                  Step {step.num}
                </p>
                <p className="mt-3 font-heading text-3xl font-light text-foreground md:text-4xl">
                  {step.title}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-wider text-foreground/60">
                  {step.duration}
                </p>
              </div>
              <div>
                <p className="text-base leading-[1.7] text-foreground/80 md:text-lg">
                  {step.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-3 text-sm leading-[1.6] text-foreground/70 md:text-base"
                    >
                      <span
                        className="mt-2 h-px w-3 shrink-0 bg-foreground/40"
                        aria-hidden
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
                {/* 스크린샷 자리 — 추후 별도 Task에서 실제 이미지 교체 */}
                <div className="mt-8 flex aspect-[16/9] items-center justify-center border border-dashed border-foreground/20 bg-canvas">
                  <p className="font-mono text-xs uppercase tracking-wider text-foreground/40">
                    Step {step.num} screenshot · TBD
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// FAQ (10문항) + JSON-LD
// ─────────────────────────────────────────────────────────
type FAQ = { q: string; a: string };

const faqs: readonly FAQ[] = [
  {
    q: "전혀 코딩을 모르는데 의뢰할 수 있나요?",
    a: "네. 오히려 코딩을 모르는 분이 주 고객입니다. AI를 자동차에, 저를 운전기사에 비유합니다. 운전을 못 해도 택시를 타면 목적지에 가는 것처럼, 코딩을 몰라도 결과물을 받으실 수 있습니다.",
  },
  {
    q: "가격이 어느 정도인가요?",
    a: "Discovery(체험·90만 원) → Sprint(검증·180만 원) → Build(MVP·300만 원) → Scale(확장·800만 원~) 4단계입니다. 모두 VAT 별도. 예산이 적으면 Discovery부터, 출시까지 가야 하면 Build를 추천합니다.",
  },
  {
    q: "기간은 얼마나 걸리나요?",
    a: "Discovery 3~5일, Sprint 5~10일, Build 2~3주, Scale 4~8주가 표준입니다. 기능 추가나 의사결정 지연이 없으면 일정대로 진행됩니다.",
  },
  {
    q: "코드 소유권은 누구에게 있나요?",
    a: "전적으로 고객에게 있습니다. 인도 시점에 GitHub 저장소 소유권을 이관하고 모든 라이선스 정보를 함께 전달합니다. dairect는 어떠한 사용권도 보유하지 않습니다.",
  },
  {
    q: "수정 요청은 몇 번까지 가능한가요?",
    a: "마일스톤별로 합의된 작업 범위 안에서는 무제한입니다. 범위를 벗어나는 추가 요청은 변경 견적을 발행한 뒤 동의 후에만 진행하며, 암묵적 추가 청구는 없습니다.",
  },
  {
    q: "환불이 가능한가요?",
    a: "Discovery는 작업 시작 전이라면 100% 환불됩니다. 작업 시작 이후나 다른 패키지는 진행률 기준 부분 환불입니다. 자세한 조건은 계약서 환불 조항을 참조하세요.",
  },
  {
    q: "어떤 기술 스택을 쓰나요?",
    a: "기본은 Next.js + Supabase + Vercel입니다. 가장 빠르게 출시 가능하면서 나중에 다른 개발자에게 인계하기도 쉽기 때문입니다. 다른 스택이 필요하면 사전에 협의합니다.",
  },
  {
    q: "NDA(비밀유지계약) 체결이 가능한가요?",
    a: "가능합니다. 의뢰 단계에서 요청하시면 표준 NDA 양식을 보내드리거나 고객사 양식에 서명합니다. 모든 의뢰 정보는 기본적으로 외부 공유되지 않습니다.",
  },
  {
    q: "외주 개발사·프리랜서와 무엇이 다른가요?",
    a: "AI 레버리지 + 직접 PM 운영 두 축이 다릅니다. 한 사람이 AI를 지휘하므로 의사소통 단계가 짧고, 같은 결과물을 1/3~1/10 비용으로 2~3주 안에 받을 수 있습니다. 다만 모바일 앱·복잡한 결제 등은 범위 외입니다.",
  },
  {
    q: "출시 이후 운영·유지보수도 해주나요?",
    a: "Build 이상은 14~90일 Slack 자문이 기본 포함됩니다. 그 이후 정기 운영은 별도 월 단위 계약(리테이너)으로 협의 가능합니다. 혹은 인계 후 직접 운영하셔도 됩니다.",
  },
] as const;

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export function GuideFAQ() {
  return (
    <section
      id="faq"
      className="border-b border-foreground/10 bg-canvas px-6 py-24 md:px-12 md:py-32"
      data-screen-label="G-03 FAQ"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
          — FAQ
        </p>
        <h2 className="font-heading text-3xl font-light leading-[1.15] tracking-[-0.02em] text-foreground md:text-5xl">
          자주 묻는 질문
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-[1.65] text-foreground/70">
          의뢰 전 가장 많이 받은 10가지 질문에 미리 답해드립니다.
        </p>

        <dl className="mt-14 divide-y divide-foreground/10 border-t border-b border-foreground/10">
          {faqs.map((faq, idx) => (
            <div key={faq.q} className="grid gap-4 py-8 md:grid-cols-[80px_1fr] md:gap-8">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                Q{String(idx + 1).padStart(2, "0")}
              </dt>
              <div>
                <p className="font-heading text-xl font-light leading-[1.3] text-foreground md:text-2xl">
                  {faq.q}
                </p>
                <dd className="mt-3 text-sm leading-[1.7] text-foreground/70 md:text-base">
                  {faq.a}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 가격 정책 요약
// ─────────────────────────────────────────────────────────
const pricingHighlights = [
  { num: "00", name: "Discovery", price: "90", duration: "3~5일", note: "체험" },
  { num: "01", name: "Sprint", price: "180", duration: "5~10일", note: "검증" },
  { num: "02", name: "Build", price: "300", duration: "2~3주", note: "MVP — 인기" },
  { num: "03", name: "Scale", price: "800~", duration: "4~8주", note: "확장" },
] as const;

export function GuidePricing() {
  return (
    <section
      className="border-b border-foreground/10 bg-paper px-6 py-24 md:px-12 md:py-32"
      data-screen-label="G-04 Pricing Summary"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
          — Pricing Snapshot
        </p>
        <h2 className="font-heading text-3xl font-light leading-[1.15] tracking-[-0.02em] text-foreground md:text-5xl">
          가격 한눈에
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-[1.65] text-foreground/70">
          모든 가격은 VAT 별도. 50% 착수금 + 50% 인도 시 결제가 기본이며, 3분할도
          협의 가능합니다.
        </p>

        <div className="mt-14 grid gap-px border border-foreground/10 bg-foreground/10 md:grid-cols-4">
          {pricingHighlights.map((p) => (
            <div
              key={p.num}
              className="flex flex-col gap-3 bg-paper p-8 transition-colors hover:bg-canvas"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                PKG N°{p.num}
              </p>
              <p className="font-heading text-2xl font-light text-foreground">
                {p.name}.
              </p>
              <p className="font-heading text-3xl font-light text-foreground">
                <span className="font-mono text-xs text-foreground/60">₩</span>
                {p.price}
                <span className="ml-1 font-mono text-xs text-foreground/60">만</span>
              </p>
              <div className="mt-auto space-y-1 pt-4">
                <p className="font-mono text-xs uppercase tracking-wider text-foreground/60">
                  {p.duration}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground/40">
                  {p.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-foreground/70 transition-colors hover:text-foreground"
          >
            상세 비교 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 최종 CTA
// ─────────────────────────────────────────────────────────
export function GuideCTA() {
  return (
    <section
      className="bg-foreground px-6 py-24 text-canvas md:px-12 md:py-32"
      data-screen-label="G-05 CTA"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-canvas/60">
          — Ready to Start
        </p>
        <h2 className="font-heading text-4xl font-light leading-[1.15] tracking-[-0.02em] md:text-6xl">
          한 줄 아이디어,
          <br />
          <em className="italic text-canvas/80">5분이면 시작합니다.</em>
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-[1.7] text-canvas/70 md:text-lg">
          가벼운 질문도 환영합니다. 패키지 추천이 어렵다면 1시간 무료 상담부터
          시작하셔도 됩니다.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/about#contact"
            className="group inline-flex items-center justify-center gap-2 border border-canvas bg-canvas px-8 py-4 font-mono text-sm uppercase tracking-wider text-foreground transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--color-canvas)]"
          >
            지금 상담 신청
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 border border-canvas/30 px-8 py-4 font-mono text-sm uppercase tracking-wider text-canvas transition-colors hover:border-canvas hover:bg-canvas/10"
          >
            가격 자세히 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
