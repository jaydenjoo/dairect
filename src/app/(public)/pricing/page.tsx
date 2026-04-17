import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LandingNav } from "@/components/landing/nav";
import { PricingSummarySection } from "@/components/landing/pricing-summary-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";
import { PackageDetails } from "@/components/pricing/package-detail";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata: Metadata = {
  title: "가격",
  description:
    "아이디어의 크기에 맞는 최적의 플랜을 제안합니다. 진단 / MVP / 확장 3가지 패키지 중 선택하세요.",
};

export default function PricingPage() {
  return (
    <main className="surface-base min-h-screen">
      <LandingNav active="pricing" />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-8">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 font-mono text-xs tracking-wider text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            Pricing
          </span>
          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            합리적인 비용, 확실한 결과
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            아이디어의 크기에 맞는 최적의 플랜을 제안합니다. 복잡한 개발 과정을
            투명하고 명확한 비용 체계로 경험하세요.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="#diagnosis" className="transition-colors hover:text-primary">
              진단
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link href="#mvp" className="transition-colors hover:text-primary">
              MVP
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link href="#expansion" className="transition-colors hover:text-primary">
              확장
            </Link>
          </div>
        </div>
      </section>

      {/* 3패키지 요약 카드 (랜딩 섹션 재사용) */}
      <PricingSummarySection />

      {/* 패키지 상세 */}
      <PackageDetails />

      {/* 비교 표 */}
      <ComparisonTable />

      {/* FAQ */}
      <PricingFaq />

      {/* 최종 CTA (랜딩 재사용) */}
      <CtaSection />

      <LandingFooter />
    </main>
  );
}
