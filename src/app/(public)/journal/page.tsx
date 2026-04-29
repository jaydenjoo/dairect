import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { JournalCard } from "@/components/journal/JournalCard";
import { getAllJournalPosts } from "@/lib/content/journal";

/**
 * Journal 인덱스 페이지 — /journal
 *
 * Studio Anthem 톤: serif-display 헤드라인 + Paper 카드 + amber 호버 그림자.
 * 빈 상태에서도 "Coming soon" 카드로 살아있는 신호.
 */

export const metadata: Metadata = {
  title: "Journal — dairect",
  description:
    "짧고 자주 쓰는 노트. 도구·아이디어·인사이트를 가볍게 공유합니다.",
  alternates: { canonical: "/journal" },
};

export const dynamic = "force-static";

export default async function JournalPage() {
  const posts = await getAllJournalPosts();

  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <section className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <header className="mb-14 md:mb-16">
            <p className="kicker text-muted-foreground">— § Journal</p>
            <h1 className="serif-display text-5xl md:text-6xl font-semibold tracking-tight mt-4 ko-keep">
              Notes <em className="font-heading italic text-foreground">&amp; ideas.</em>
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground ko-keep max-w-prose leading-relaxed">
              짧고 자주. 도구·아이디어·인사이트를 가볍게 공유합니다.
            </p>
          </header>

          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.frontmatter.slug}>
                  <JournalCard frontmatter={post.frontmatter} />
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
        곧 첫 글이 올라옵니다.
      </p>
      <p className="mt-3 text-sm text-muted-foreground ko-keep">
        작성 중인 노트가 곧 발행될 예정입니다.
      </p>
    </div>
  );
}
