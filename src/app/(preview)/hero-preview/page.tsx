import { Nav } from "@/components/chrome/Nav";
import { Hero } from "@/components/sections/hero/Hero";
import { Etymology } from "@/components/sections/Etymology";
import { Manifesto } from "@/components/sections/Manifesto";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { Pricing } from "@/components/sections/Pricing";
import { Founder } from "@/components/sections/Founder";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HeroPreviewPage() {
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
    </>
  );
}
