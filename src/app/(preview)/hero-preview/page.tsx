import { Nav } from "@/components/chrome/Nav";
import { Hero } from "@/components/sections/hero/Hero";

export default function HeroPreviewPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <Hero />
      </main>
    </>
  );
}
