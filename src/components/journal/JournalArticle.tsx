import type { JournalPost } from "@/lib/content/types";
import { MarkdownContent } from "./MarkdownContent";

/**
 * Journal 글 상세 wrapper.
 * 헤더(제목·메타) + 본문(MarkdownContent) 조합.
 *
 * Studio Anthem 톤:
 * - serif-display 헤드라인 (Fraunces, 자간 -0.02em)
 * - kicker 라벨 (Geist Mono, uppercase, tracking 0.12em)
 * - 태그 amber 강조
 *
 * 비유: "잡지 본문 첫 페이지" — 큰 제목 + 작은 메타 + 본문이 흐른다.
 */

type Props = {
  post: JournalPost;
};

export function JournalArticle({ post }: Props) {
  return (
    <article>
      <header className="mb-12 md:mb-16">
        <p className="kicker text-muted-foreground">— § Journal</p>
        <h1 className="serif-display text-4xl md:text-5xl font-semibold tracking-tight mt-4 ko-keep">
          {post.frontmatter.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 hairline-t pt-5">
          <time
            dateTime={post.frontmatter.date}
            className="font-mono text-sm tracking-wider text-muted-foreground"
          >
            {post.frontmatter.date}
          </time>
          {post.frontmatter.tags.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {post.frontmatter.tags.map((tag) => (
                <li
                  key={tag}
                  className="font-mono text-xs uppercase tracking-[0.18em] text-accent"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <MarkdownContent>{post.content}</MarkdownContent>
    </article>
  );
}
