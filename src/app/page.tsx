import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { Hero } from "@/components/sections/hero/Hero";
import { Etymology } from "@/components/sections/Etymology";
import { Manifesto } from "@/components/sections/Manifesto";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { Pricing } from "@/components/sections/Pricing";
import { Founder } from "@/components/sections/Founder";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <Hero />
        <Etymology />
        <Manifesto />
        <Proof />
        <Services />
        <Work />
        <Pricing />
        <Founder />
        <FinalCTA />
      </main>
      <Footer />
      <PwaInstallPrompt />
    </>
  );
}
