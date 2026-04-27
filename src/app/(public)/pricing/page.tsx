import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Pricing } from "@/components/sections/Pricing";
import { PricingPolicies } from "@/components/sections/PricingPolicies";
import { PricingFAQ } from "@/components/sections/PricingFAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { getSchedulingSlots } from "@/lib/scheduling-slots-server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "가격 · Pricing",
  description:
    "정직한 비용, 예측 가능한 결과. 4단계 패키지로 검증부터 확장까지. 체험 90만 / 검증 180만 / MVP 300만 / 확장 800만 (VAT 별도).",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const schedulingSlots = await getSchedulingSlots();
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <Pricing schedulingSlots={schedulingSlots} />
        <PricingPolicies />
        <PricingFAQ />
        <FinalCTA />
        <LandingMotion />
      </main>
      <Footer />
    </>
  );
}
