import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/sections/hero/Hero";
import { WhoThisIsFor } from "@/components/sections/WhoThisIsFor";
import { Etymology } from "@/components/sections/Etymology";
import { Manifesto } from "@/components/sections/Manifesto";
import { WhyThisWorks } from "@/components/sections/WhyThisWorks";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { Pricing } from "@/components/sections/Pricing";
import { WhatsLearning } from "@/components/sections/WhatsLearning";
import { WontDo } from "@/components/sections/WontDo";
import { NoAIExperience } from "@/components/sections/NoAIExperience";
import { Founder } from "@/components/sections/Founder";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { getSiteFlags } from "@/lib/site-flags";
import { getSchedulingSlots } from "@/lib/scheduling-slots-server";

// Site-flags (workspace_settings.pwa_install_prompt_enabled) 가 ON 일 때만
// 공개 페이지에 PWA "앱으로 설치" 안내 노출. 기본 false (숨김).
// /dashboard/settings 의 "사이트 노출" 섹션에서 Jayden이 직접 토글.
export const revalidate = 60;

export default async function LandingPage() {
  const [flags, schedulingSlots] = await Promise.all([
    getSiteFlags(),
    getSchedulingSlots(),
  ]);
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <Hero />
        <WhoThisIsFor />
        <Etymology />
        <Manifesto />
        <WhyThisWorks />
        <Proof />
        <Services />
        <Work />
        <Pricing schedulingSlots={schedulingSlots} />
        <WhatsLearning />
        <WontDo />
        <NoAIExperience />
        <Founder />
        <FinalCTA />
        <LandingMotion />
      </main>
      <Footer />
      {flags.pwaInstallPromptEnabled && <PwaInstallPrompt />}
    </>
  );
}
