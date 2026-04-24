import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import {
  ProjectsHero,
  ProjectsIndex,
  ProjectsCTA,
} from "@/components/sections/projects/ProjectsIndex";

export const metadata: Metadata = {
  title: "Work — 10 projects",
  description:
    "열 개의 프로젝트, 열 개의 이야기. 실제 고객의 실제 문제에서 시작해 2~3주간의 AI 실행으로 완성된 작업들.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <ProjectsHero />
        <ProjectsIndex />
        <ProjectsCTA />
      </main>
      <Footer />
    </>
  );
}
