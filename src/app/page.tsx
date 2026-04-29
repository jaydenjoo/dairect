import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/sections/hero/Hero";
import { QuickAnswer } from "@/components/sections/QuickAnswer";
import { WhoThisIsFor } from "@/components/sections/WhoThisIsFor";
import { Work } from "@/components/sections/Work";
import { WhatImBuilding } from "@/components/sections/WhatImBuilding";
import { JournalLatest } from "@/components/sections/JournalLatest";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { getSiteFlags } from "@/lib/site-flags";
import { getSchedulingSlots } from "@/lib/scheduling-slots-server";

// Site-flags (workspace_settings.pwa_install_prompt_enabled) 가 ON 일 때만
// 공개 페이지에 PWA "앱으로 설치" 안내 노출. 기본 false (숨김).
// /dashboard/settings 의 "사이트 노출" 섹션에서 Jayden이 직접 토글.
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
        <QuickAnswer />
        <WhoThisIsFor />
        <Work />
        <WhatImBuilding />
        <JournalLatest />
        <Pricing schedulingSlots={schedulingSlots} />
        <FinalCTA />
        <LandingMotion />
      </main>
      <Footer />
      {flags.pwaInstallPromptEnabled && <PwaInstallPrompt />}
    </>
  );
}
