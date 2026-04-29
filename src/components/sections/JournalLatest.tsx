import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JournalCard } from "@/components/journal/JournalCard";
import { getAllJournalPosts } from "@/lib/content/journal";

/**
 * 홈 임베드 섹션 — "Latest from Journal".
 *
 * 최근 Journal 글 3개를 JournalCard로 노출.
 * WhatImBuilding 다음 위치 — "지금 작업 → 생각·인사이트" 자연스러움.
 *
 * 빈 상태일 땐 섹션 자체 표시 안 함.
 *
 * 비유: "작업실 옆 매거진 코너" — 글의 흐름.
 */

const HOME_LIMIT = 3;

export async function JournalLatest() {
  const posts = await getAllJournalPosts();
  const latest = posts.slice(0, HOME_LIMIT);

  if (latest.length === 0) return null;

  return (
    <section className="bg-canvas py-20 md:py-28 hairline-t">
      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-10 md:mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-muted-foreground">
              — § Journal / Latest
            </p>
            <h2 className="mt-3 serif-display text-3xl md:text-5xl font-semibold tracking-tight ko-keep">
              Notes &amp;{" "}
              <em className="font-heading italic text-foreground">
                ideas.
              </em>
            </h2>
          </div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </header>

        <ul className="space-y-4">
          {latest.map((post) => (
            <li key={post.frontmatter.slug}>
              <JournalCard frontmatter={post.frontmatter} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
