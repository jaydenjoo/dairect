import Link from "next/link";
import type { JournalFrontmatter } from "@/lib/content/types";

/**
 * Journal 인덱스 카드.
 *
 * Studio Anthem 톤:
 * - Paper 배경 + 1px Ink hairline
 * - Fraunces 제목, Geist Mono 날짜·태그
 * - 호버: translate(-2,-2) + 4px hard amber shadow (Studio Anthem signature)
 *
 * 비유: "매거진 인덱스 페이지" — 표지에 작은 부제(날짜·태그) + 큰 제목.
 */

type Props = {
  frontmatter: JournalFrontmatter;
};

export function JournalCard({ frontmatter }: Props) {
  return (
    <Link
      href={`/journal/${frontmatter.slug}`}
      className="group block bg-card border border-border p-6 md:p-7 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-amber-md"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <time
          dateTime={frontmatter.date}
          className="kicker text-muted-foreground"
        >
          {frontmatter.date}
        </time>
        {frontmatter.tags.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      <h2 className="mt-4 font-heading text-2xl md:text-[26px] font-semibold tracking-tight ko-keep transition-colors group-hover:text-foreground">
        {frontmatter.title}
      </h2>
    </Link>
  );
}
