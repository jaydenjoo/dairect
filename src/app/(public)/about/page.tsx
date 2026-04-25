import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import {
  AboutHero,
  AboutTimeline,
  AboutPhilosophy,
  AboutProcess,
  AboutCTA,
} from "@/components/sections/about/AboutSections";
import { TimelineInteractions } from "@/components/sections/about/TimelineInteractions";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { ContactSection } from "@/components/about/contact-section";
import type { PackageId } from "@/lib/validation/inquiry";

export const metadata: Metadata = {
  title: "About — Vibe Architect",
  description:
    "AI는 자동차입니다. 운전을 못해도 괜찮아요. 택시를 타면 되니까요. — Jayden, Vibe Architect",
};

function parsePackage(
  raw: string | string[] | undefined
): PackageId | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "diagnosis" || value === "mvp" || value === "expansion") {
    return value;
  }
  return undefined;
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialPackage = parsePackage(params.package);

  return (
    <>
      <Nav solidAlways />
      <main id="main" className="relative z-[2] bg-canvas">
        <AboutHero />
        <AboutTimeline />
        <TimelineInteractions />
        <AboutPhilosophy />
        <AboutProcess />
        <AboutCTA />
        <ContactSection initialPackage={initialPackage} />
        <LandingMotion />
      </main>
      <Footer />
    </>
  );
}
