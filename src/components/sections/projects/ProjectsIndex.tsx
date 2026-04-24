import type { Project } from "@/features/portfolio/types";
import type { PortfolioCategory } from "@/lib/validation/portfolio";

/**
 * 카테고리별 집계 — /projects hero 의 필터 탭 "All 10 · SaaS 04 ..." 표시용.
 *
 * 디자인 제약: 번들 원본은 고정값 (10/04/03/02/01) 이었음. DB 기반 전환 후에도
 * 탭 구조는 그대로 유지. 수는 실제 데이터에서 동적 계산.
 */
function countByCategory(
  projects: readonly Project[]
): Record<"all" | PortfolioCategory, number> {
  const counts: Record<"all" | PortfolioCategory, number> = {
    all: projects.length,
    saas: 0,
    automation: 0,
    editorial: 0,
    tools: 0,
  };
  for (const p of projects) {
    counts[p.cat] += 1;
  }
  return counts;
}

const filters = [
  { key: "all", label: "All" },
  { key: "saas", label: "SaaS" },
  { key: "automation", label: "Automation" },
  { key: "editorial", label: "Editorial" },
  { key: "tools", label: "Tools" },
] as const;

export function ProjectsHero({ projects }: { projects: readonly Project[] }) {
  const filterCounts = countByCategory(projects);
  return (
    <section className="p-hero" data-screen-label="01 Index Hero">
      <div className="container">
        <p className="p-hero-kicker">
          — <em>index</em> of Work · N°01 → N°10
        </p>
        <h1 className="p-hero-head">
          Ten projects.
          <span className="it">Ten stories.</span>
        </h1>
        <p className="p-hero-ko">
          열 개의 프로젝트, 열 개의 이야기. 각 프로젝트는{" "}
          <em
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}
          >
            a specific direction
          </em>{" "}
          — 실제 고객의 실제 문제 — 에서 시작했고,{" "}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.94em",
            }}
          >
            execution
          </code>
          은 AI와 2~3주간의 집중이 맡았습니다.
        </p>

        <div className="p-filters" role="tablist" aria-label="Project filters">
          {filters.map((f, i) => (
            <button
              key={f.key}
              className="p-filter"
              role="tab"
              data-filter={f.key}
              aria-selected={i === 0 ? "true" : "false"}
              type="button"
            >
              {f.label}{" "}
              <span className="count">
                {String(filterCounts[f.key]).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsIndex({
  projects,
}: {
  projects: readonly Project[];
}) {
  return (
    <section className="p-index" data-screen-label="02 Project Index">
      <div className="p-index-head">
        <h2>
          The <span className="it">full index.</span>
        </h2>
        <span className="mono">
          {projects.length} records · 2024 → 2026 · hover any row
        </span>
      </div>

      {projects.map((p) => (
        <article
          key={p.slug}
          className="p-row"
          data-cat={p.cat}
          data-name={p.name + p.nameAmber}
          data-meta={p.meta}
          data-year={p.year}
        >
          <div className="pr-num">
            {p.num}
            <span className="slash"> / </span>10
          </div>
          <div className="pr-title">
            <span className="en">
              {p.name}
              <span className="amber">{p.nameAmber}</span>
            </span>
            {p.ko && <span className="ko">{p.ko}</span>}
            <span className="cat">{p.badge}</span>
          </div>
          <p className="pr-desc">{p.desc}</p>
          <div className="pr-meta">
            <div className="row">
              <span className="k">Year</span>
              <span className="v">{p.year}</span>
            </div>
            <div className="row">
              <span className="k">Dur.</span>
              <span className="v">{p.dur}</span>
            </div>
            <div className="row">
              <span className="k">Stack</span>
              <span className="v">{p.stack}</span>
            </div>
            <div className="row status">
              <span className="k">Status</span>
              <span className={`v ${p.statusType}`}>{p.status}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function ProjectsCTA() {
  return (
    <section className="p-cta" id="contact" data-screen-label="07 Closing CTA">
      <span className="p-cta-bg" aria-hidden="true">
        next.
      </span>
      <div className="container">
        <p className="p-cta-kicker">
          — N°11 · <em>could be</em> yours
        </p>
        <h2 className="p-cta-head">
          Your project
          <span className="it">could be next.</span>
        </h2>
        <p className="p-cta-ko">
          다음 프로젝트의 주인공이 되어보세요. 브리프 한 줄이면 충분합니다 —
          방향은 저희가 함께 정리해드리고, 실행은{" "}
          <em
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
            }}
          >
            2~3주
          </em>{" "}
          안에 끝납니다.
        </p>
        <div className="p-cta-row">
          <a href="/about#contact" className="btn-primary">
            Start a conversation{" "}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a href="mailto:hello@dairect.kr" className="btn-ghost">
            hello@dairect.kr
          </a>
        </div>
      </div>
    </section>
  );
}
