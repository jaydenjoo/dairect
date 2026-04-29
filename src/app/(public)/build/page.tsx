import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { BuildCard } from "@/components/build/BuildCard";
import { getAllBuildProjects } from "@/lib/content/build";

/**
 * Build 인덱스 페이지 — /build
 *
 * Studio Anthem 톤. 각 카드는 진행 중인 프로젝트 1개 (PhaseTag + ProgressGauge).
 *
 * 비유: "공방의 작업대 목록" — 어느 작업이 어디까지 됐는지.
 */

export const metadata: Metadata = {
  title: "Build — dairect",
  description:
    "진행 중인 프로젝트의 빌드 로그. 아이디어에서 출시까지 공개합니다.",
  alternates: { canonical: "/build" },
};

export const dynamic = "force-static";

export default async function BuildPage() {
  const projects = await getAllBuildProjects();

  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <header className="mb-14 md:mb-16">
            <p className="kicker text-muted-foreground">— § Build</p>
            <h1 className="serif-display text-5xl md:text-6xl font-semibold tracking-tight mt-4 ko-keep">
              Work{" "}
              <em className="font-heading italic text-foreground">
                in progress.
              </em>
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground ko-keep max-w-prose leading-relaxed">
              만들고 있는 것들. 아이디어에서 출시까지의 과정을 공개합니다.
            </p>
          </header>

          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-4">
              {projects.map((group) => (
                <li key={group.project}>
                  <BuildCard group={group} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="bg-card border border-border p-10 md:p-12 text-center">
      <p className="kicker text-muted-foreground mb-4">— Coming soon</p>
      <p className="serif-display text-2xl md:text-3xl ko-keep">
        곧 첫 프로젝트 로그가 올라옵니다.
      </p>
      <p className="mt-3 text-sm text-muted-foreground ko-keep">
        진행 중인 프로젝트의 빌드 과정을 공개할 예정입니다.
      </p>
    </div>
  );
}
