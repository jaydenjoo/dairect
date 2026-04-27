import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { WhyThisWorks } from "@/components/sections/WhyThisWorks";
import { NoAIExperience } from "@/components/sections/NoAIExperience";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LandingMotion } from "@/components/landing/LandingMotion";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "진행 절차 · Process",
  description:
    "상담 신청부터 인도까지 명확한 절차. AI 경험이 없어도 가능한 이유 + 비용·시간 절감 비교.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <WhyThisWorks />
        <NoAIExperience />
        <ProcessSteps />
        <FinalCTA />
        <LandingMotion />
      </main>
      <Footer />
    </>
  );
}
