import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { MarkdownContent } from "@/components/journal/MarkdownContent";
import { PhaseTag } from "@/components/build/PhaseTag";
import { ProgressGauge } from "@/components/build/ProgressGauge";
import {
  getAllBuildProjectSlugs,
  getBuildProjectBySlug,
} from "@/lib/content/build";

/**
 * Build 프로젝트 상세 — /build/[project-slug]
 *
 * 한 프로젝트의 모든 빌드 로그를 시간순으로.
 * Studio Anthem 톤: serif-display 헤더 + PhaseTag + ProgressGauge + Mono 메타.
 *
 * 각 로그는 hairline-t로 구분, 최신부터 위로.
 *
 * 비유: "한 작업대의 작업 일지" — 매일의 진척과 발견을 시간순으로.
 */

type Props = {
  params: Promise<{ "project-slug": string }>;
};

export async function generateStaticParams() {
  return getAllBuildProjectSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const projectSlug = resolved["project-slug"];
  const group = await getBuildProjectBySlug(projectSlug);
  if (!group) return { title: "Not Found — Build" };
  return {
    title: `${group.latestTitle} — Build`,
    description: `${group.totalLogs}개 빌드 로그${
      group.latestPhase === "building" ? ` · ${group.latestProgress}% 진행` : ""
    }.`,
    alternates: { canonical: `/build/${projectSlug}` },
  };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function BuildProjectPage({ params }: Props) {
  const resolved = await params;
  const projectSlug = resolved["project-slug"];
  const group = await getBuildProjectBySlug(projectSlug).catch((err) => {
    console.error(
      `[build/[project-slug]] lookup failed for projectSlug=${projectSlug}`,
      err,
    );
    notFound();
  });
  if (!group) notFound();

  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <article className="mx-auto max-w-2xl px-6 py-20 md:py-28">
          <Link
            href="/build"
            className="kicker text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Build
          </Link>

          <header className="mt-10 mb-14 md:mb-16">
            <p className="kicker text-muted-foreground">{group.project}</p>
            <h1 className="serif-display text-4xl md:text-5xl font-semibold tracking-tight mt-4 ko-keep">
              {group.latestTitle}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 hairline-t pt-5">
              <PhaseTag phase={group.latestPhase} />
              {group.latestPhase === "building" && (
                <ProgressGauge progress={group.latestProgress} />
              )}
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {group.totalLogs} LOG{group.totalLogs !== 1 ? "S" : ""}
              </span>
            </div>
          </header>

          {/* 시간순 빌드 로그 (최신 → 과거). */}
          <div className="space-y-12 md:space-y-16">
            {group.posts.map((post, idx) => {
              const showPhaseTag =
                idx > 0 || post.frontmatter.phase !== group.latestPhase;
              return (
                <section
                  key={post.filePath}
                  className="hairline-t pt-10 first:border-t-0 first:pt-0"
                >
                  <header>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                      <time
                        dateTime={post.frontmatter.date}
                        className="kicker text-muted-foreground"
                      >
                        {post.frontmatter.date}
                      </time>
                      {showPhaseTag && (
                        <PhaseTag phase={post.frontmatter.phase} />
                      )}
                    </div>
                    <h2 className="mt-3 font-heading text-2xl md:text-3xl font-semibold tracking-tight ko-keep">
                      {post.frontmatter.title}
                    </h2>
                    {post.frontmatter.phase === "building" && (
                      <div className="mt-3">
                        <ProgressGauge
                          progress={post.frontmatter.progress}
                          size="sm"
                        />
                      </div>
                    )}
                  </header>
                  <div className="mt-6">
                    <MarkdownContent>{post.content}</MarkdownContent>
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
