import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, ImageIcon, Sparkles } from "lucide-react";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
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
  // 제어문자·공백·개행 포함 차단 (URL 스푸핑/헤더 injection 방어)
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
    description: project.publicDescription ?? "dairect가 만든 프로젝트 사례입니다.",
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
    <main className="surface-base min-h-screen">
      <LandingNav active="portfolio" />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <Link
            href="/projects"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            포트폴리오로 돌아가기
          </Link>

          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 font-mono text-xs tracking-wider text-accent-foreground">
              <Sparkles className="h-3 w-3" />
              Case Study
            </span>
            <h1
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
              style={{ wordBreak: "keep-all" }}
            >
              {title}
            </h1>
            {project.publicDescription && (
              <p
                className="max-w-2xl text-lg leading-relaxed text-muted-foreground"
                style={{ wordBreak: "keep-all" }}
              >
                {project.publicDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {period && (
                <span className="surface-card rounded-full px-4 py-1.5 text-xs font-semibold text-foreground shadow-ambient">
                  {period}
                </span>
              )}
              {tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-semibold text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {liveUrl && (
              <div className="pt-4">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="soul-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-ambient-lg transition-all hover:brightness-110"
                >
                  라이브 보기
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 비주얼 */}
      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div
            className="surface-high relative aspect-video w-full overflow-hidden rounded-2xl shadow-ambient-lg"
            aria-hidden
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
            <div className="relative flex h-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-primary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* 유사 프로젝트 CTA */}
      <section className="section-dark relative overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2
            className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-white"
            style={{ wordBreak: "keep-all" }}
          >
            비슷한 프로젝트가 생각나셨나요?
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-base text-white/70"
            style={{ wordBreak: "keep-all" }}
          >
            30분 무료 상담에서 범위, 일정, 비용을 함께 그려봅니다.
          </p>
          <div className="mt-8">
            <Link
              href="/about?package=mvp#contact"
              className="soul-gradient inline-flex items-center gap-2 rounded-xl px-8 py-4 font-bold text-white shadow-ambient-lg transition-all hover:brightness-110 active:scale-95"
            >
              내 아이디어 상담하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
