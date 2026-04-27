import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import {
  GuideHero,
  GuideFlow,
  GuideFAQ,
  GuidePricing,
  GuideCTA,
} from "@/components/sections/guide/GuideSections";
import { LandingMotion } from "@/components/landing/LandingMotion";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "의뢰 가이드 · Guide",
  description:
    "처음 의뢰하는 분을 위한 단계별 안내서. 의뢰 흐름 4단계, 자주 묻는 질문 10가지, 가격 한눈에. 5분이면 충분합니다.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "의뢰 가이드 — dairect",
    description:
      "5분이면 충분합니다. 의뢰부터 인도까지 4단계, FAQ 10문항, 가격 정책을 한 페이지에.",
    type: "article",
  },
};

export default function GuidePage() {
  return (
    <>
      <Nav solidAlways />
      <main id="main" className="relative z-[2] bg-canvas">
        <GuideHero />
        <GuideFlow />
        <GuideFAQ />
        <GuidePricing />
        <GuideCTA />
        <LandingMotion />
      </main>
      <Footer />
    </>
  );
}
