import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { JournalArticle } from "@/components/journal/JournalArticle";
import {
  getAllJournalSlugs,
  getJournalPostBySlug,
} from "@/lib/content/journal";

/**
 * Journal 글 상세 페이지 — /journal/[slug]
 *
 * Studio Anthem 톤 + react-markdown 본문 렌더링.
 * 헤더(제목·메타)와 본문 분리 — JournalArticle 컴포넌트에서 처리.
 */

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllJournalSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return { title: "Not Found — Journal" };
  return {
    title: `${post.frontmatter.title} — Journal`,
    description: post.content.slice(0, 140).replace(/\s+/g, " ").trim(),
    alternates: { canonical: `/journal/${slug}` },
  };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug).catch((err) => {
    console.error(`[journal/[slug]] lookup failed for slug=${slug}`, err);
    notFound();
  });
  if (!post) notFound();

  return (
    <>
      <Nav />
      <main id="main" className="relative z-[2] bg-canvas">
        <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
          <Link
            href="/journal"
            className="kicker text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Journal
          </Link>
          <div className="mt-10">
            <JournalArticle post={post} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
