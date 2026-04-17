import type { Metadata } from "next";
import Link from "next/link";
import { ImageIcon, ArrowRight, Sparkles } from "lucide-react";
import { LandingNav } from "@/components/landing/nav";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";
import { getPublicProjects, type PublicProject } from "./queries";

export const metadata: Metadata = {
  title: "포트폴리오",
  description:
    "실제 고객 프로젝트 결과물입니다. 머릿속 아이디어가 어떻게 제품이 되는지 확인해보세요.",
};

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

function spanFor(index: number, total: number): string {
  if (total <= 2) return "md:col-span-1 lg:col-span-2";
  if (index === 0) return "md:col-span-2 lg:col-span-2 lg:row-span-2";
  return "md:col-span-1 lg:col-span-2";
}

function BentoCard({ project, span }: { project: PublicProject; span: string }) {
  const title = project.publicAlias;
  const period = formatPeriod(project.startDate, project.endDate);
  const isHero = span.includes("row-span-2");

  return (
    <Link
      href={`/projects/${project.id}`}
      className={`${span} surface-card group flex flex-col overflow-hidden rounded-xl shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-lg`}
    >
      <div
        className="surface-high flex h-[58%] w-full items-center justify-center overflow-hidden"
        aria-hidden
      >
        <ImageIcon className="h-10 w-10 text-primary/20" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
        <div className="space-y-1.5">
          <h2
            className={`font-heading font-bold tracking-tight text-foreground ${
              isHero ? "text-2xl" : "text-lg"
            }`}
            style={{ wordBreak: "keep-all" }}
          >
            {title}
          </h2>
          {project.publicDescription && (
            <p
              className="text-sm font-medium leading-relaxed text-muted-foreground"
              style={{ wordBreak: "keep-all" }}
            >
              {project.publicDescription}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(project.publicTags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          {period && (
            <span className="surface-high rounded-full px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {period}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="surface-card relative overflow-hidden rounded-2xl p-16 text-center shadow-ambient">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative z-10 mx-auto max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <ImageIcon className="h-7 w-7 text-primary/60" />
        </div>
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            공개 준비 중인 프로젝트가 곧 여기에
          </h2>
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            최근 완료된 프로젝트를 큐레이션해 공개할 예정입니다.
            먼저 어떤 작업이 가능한지 궁금하시다면 바로 문의해주세요.
          </p>
        </div>
        <Link
          href="/about#contact"
          className="soul-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-ambient transition-all hover:brightness-110"
        >
          1:1 상담 신청
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default async function ProjectsPage() {
  const items = await getPublicProjects();

  return (
    <main className="surface-base min-h-screen">
      <LandingNav active="portfolio" />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-8">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 font-mono text-xs tracking-wider text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            Portfolio
          </span>
          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            이런 걸 만듭니다
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            머릿속 아이디어가 어떻게 실제 제품이 되는지, 최근 완료된 프로젝트로 확인해보세요.
          </p>
        </div>
      </section>

      {/* Grid or Empty */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid auto-rows-[280px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {items.map((project, index) => (
                <BentoCard
                  key={project.id}
                  project={project}
                  span={spanFor(index, items.length)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaSection />
      <LandingFooter />
    </main>
  );
}
