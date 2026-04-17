import Link from "next/link";
import { ImageIcon, ArrowRight } from "lucide-react";

type PortfolioItem = {
  slug: string;
  name: string;
  subtitle: string;
  tags: string[];
  duration: string;
  span: string;
  imagePlaceholder: string;
  layout: "vertical" | "horizontal";
};

const items: PortfolioItem[] = [
  {
    slug: "chatsio",
    name: "Chatsio",
    subtitle: "AI 고객 상담 SaaS",
    tags: ["Next.js", "Supabase", "Claude API"],
    duration: "2주",
    span: "md:col-span-2 lg:col-span-2 lg:row-span-2",
    imagePlaceholder: "chat-analytics",
    layout: "vertical",
  },
  {
    slug: "findably",
    name: "Findably",
    subtitle: "AI 마케팅 진단 도구",
    tags: ["Next.js"],
    duration: "10일",
    span: "md:col-span-1 lg:col-span-2",
    imagePlaceholder: "marketing-charts",
    layout: "vertical",
  },
  {
    slug: "autovox",
    name: "AutoVox",
    subtitle: "AI 음성 자동화",
    tags: ["n8n"],
    duration: "1주",
    span: "md:col-span-1 lg:col-span-2",
    imagePlaceholder: "audio-waves",
    layout: "vertical",
  },
  {
    slug: "pm-dashboard",
    name: "PM Dashboard",
    subtitle: "프리랜서 프로젝트 관리",
    tags: ["Next.js", "Supabase", "n8n"],
    duration: "2주",
    span: "md:col-span-2 lg:col-span-2",
    imagePlaceholder: "dashboard-timeline",
    layout: "horizontal",
  },
];

export function PortfolioSection() {
  return (
    <section className="surface-base py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            이런 걸 만듭니다
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            실제 고객 프로젝트 결과물입니다
          </p>
        </div>

        <div className="grid auto-rows-[280px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/projects#${item.slug}`}
              className={`${item.span} surface-card group overflow-hidden rounded-xl shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-lg ${
                item.layout === "horizontal" ? "flex flex-col md:flex-row" : "flex flex-col"
              }`}
            >
              <div
                className={`surface-high flex items-center justify-center overflow-hidden ${
                  item.layout === "horizontal"
                    ? "h-48 md:h-auto md:w-[55%]"
                    : "h-[58%] w-full"
                }`}
                aria-hidden
              >
                <ImageIcon className="h-10 w-10 text-primary/20" />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                <div className="space-y-1">
                  <h3
                    className={`font-heading font-bold tracking-tight text-foreground ${
                      item.span.includes("row-span-2") ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="surface-high rounded-full px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {item.duration}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA 박스 */}
        <div className="relative mt-20 overflow-hidden rounded-2xl bg-accent p-12 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative z-10 space-y-6">
            <h3 className="font-heading text-3xl font-bold tracking-tight text-accent-foreground">
              다음 프로젝트의 주인공이 되어보세요
            </h3>
            <p
              className="mx-auto max-w-xl text-accent-foreground/80"
              style={{ wordBreak: "keep-all" }}
            >
              당신의 아이디어를 고퀄리티 결과물로 실현해 드립니다.
            </p>
            <Link
              href="/about#contact"
              className="surface-card inline-flex items-center gap-2 rounded-lg px-8 py-3 font-bold text-primary shadow-ambient-lg transition-transform hover:scale-105"
            >
              무료 상담 신청하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
