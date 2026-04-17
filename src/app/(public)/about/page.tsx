import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { AboutHero } from "@/components/about/hero-section";
import { ContactSection } from "@/components/about/contact-section";
import type { PackageId } from "@/lib/validation/inquiry";

export const metadata: Metadata = {
  title: "소개",
  description:
    "AI는 자동차입니다. 운전을 못해도 괜찮아요. 택시를 타면 되니까요. — Jayden, Vibe Architect",
};

function parsePackage(raw: string | string[] | undefined): PackageId | undefined {
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
      <LandingNav active="about" />
      <main className="min-h-screen surface-base">
        <AboutHero />
        <ContactSection initialPackage={initialPackage} />
      </main>
      <LandingFooter />
    </>
  );
}
