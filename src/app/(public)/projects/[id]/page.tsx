import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { ProjectsCTA } from "@/components/sections/projects/ProjectsIndex";
import { getPublicProjectById } from "../queries";

type RouteParams = { id: string };

export const revalidate = 60;

function formatPeriod(start: string | null, end: string | null): string | null {
  const fmt = (value: string): string => {
    const parts = value.split("-");
    if (parts.length < 2) return value;
    return `${parts[0]}.${parts[1]}`;
  };
  if (start && end) return `${fmt(start)} — ${fmt(end)}`;
  if (end) return `~ ${fmt(end)}`;
  if (start) return `${fmt(start)} ~`;
  return null;
}

function safeExternalUrl(url: string | null): string | null {
  if (!url) return null;
  if (/[\x00-\x20\x7F]/.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getPublicProjectById(id);
  if (!project) return { title: "프로젝트를 찾을 수 없음" };
  return {
    title: project.publicAlias,
    description:
      project.publicDescription ?? "dairect가 만든 프로젝트 사례입니다.",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const project = await getPublicProjectById(id);
  if (!project) notFound();

  const title = project.publicAlias;
  const period = formatPeriod(project.startDate, project.endDate);
  const liveUrl = safeExternalUrl(project.publicLiveUrl);
  const tags = project.publicTags ?? [];

  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <section className="p-hero" data-screen-label="01 Case Detail Hero">
          <div className="container">
            <p className="p-hero-kicker">
              —{" "}
              <Link
                href="/projects"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                back to index
              </Link>{" "}
              · case study
            </p>
            <h1 className="p-hero-head">
              {title}
              {period && (
                <span className="it" style={{ display: "block" }}>
                  {period}
                </span>
              )}
            </h1>
            {project.publicDescription && (
              <p className="p-hero-ko">{project.publicDescription}</p>
            )}

            {tags.length > 0 && (
              <div
                className="p-filters"
                role="list"
                aria-label="Project tags"
                style={{ pointerEvents: "none" }}
              >
                {tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="p-filter" role="listitem">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {liveUrl && (
              <div style={{ marginTop: 40 }}>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Live site{" "}
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            )}
          </div>
        </section>

        <ProjectsCTA />
      </main>
      <Footer />
    </>
  );
}
