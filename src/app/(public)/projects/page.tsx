import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import {
  ProjectsHero,
  ProjectsIndex,
  ProjectsCTA,
} from "@/components/sections/projects/ProjectsIndex";
import { getPublicPortfolioProjects } from "@/features/portfolio/queries";

export const metadata: Metadata = {
  title: "Work — 10 projects",
  description:
    "열 개의 프로젝트, 열 개의 이야기. 실제 고객의 실제 문제에서 시작해 2~3주간의 AI 실행으로 완성된 작업들.",
};

// Task 6-ext-2 (2026-04-25): 정적 배열 → DB 쿼리 전환.
// 60초마다 재생성 (대시보드에서 공개 토글 반영 지연 ≤60s).
export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getPublicPortfolioProjects();

  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <ProjectsHero projects={projects} />
        <ProjectsIndex projects={projects} />
        <ProjectsCTA />
      </main>
      <Footer />
    </>
  );
}
