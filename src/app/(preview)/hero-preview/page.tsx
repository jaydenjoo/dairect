import { Nav } from "@/components/chrome/Nav";
import { Hero } from "@/components/sections/hero/Hero";
import { Etymology } from "@/components/sections/Etymology";
import { Manifesto } from "@/components/sections/Manifesto";

export default function HeroPreviewPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <Hero />
        <Etymology />
        <Manifesto />
      </main>
    </>
  );
}
