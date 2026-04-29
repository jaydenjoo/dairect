/* eslint-disable @next/next/no-img-element -- Task 6에서 이미지 파이프라인 정비 시 next/image로 전환 예정 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 공용 마크다운 렌더러.
 * Journal 본문, Build 빌드 로그 본문에서 재사용.
 *
 * Studio Anthem 톤 매핑:
 * - 헤딩: Fraunces serif (font-heading), 자간 -0.02em (ko-keep)
 * - 본문: Geist sans, 줄간 1.8 (전역 globals.css에서 정의됨)
 * - 인용: 좌측 1px hairline + Fraunces italic
 * - 코드 인라인/블록: Geist Mono, surface-highest 배경
 * - 링크: 4px decoration offset, hover 시 짙어짐
 * - 표: 1px hairline + Fraunces 헤더
 *
 * GFM (GitHub Flavored Markdown) 지원: 표·체크박스·자동링크·취소선.
 *
 * 주의: 옵시디언 위키링크 [[]]는 GFM 미지원 → 매뉴얼에서 사용 금지 명시.
 */

type Props = {
  children: string;
};

export function MarkdownContent({ children }: Props) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mt-12 mb-6 ko-keep">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-heading text-2xl md:text-[28px] font-semibold tracking-tight mt-12 mb-5 ko-keep">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-heading text-xl font-semibold tracking-tight mt-10 mb-4 ko-keep">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="font-heading text-lg font-semibold tracking-tight mt-8 mb-3 ko-keep">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-base md:text-[17px] text-foreground mb-5 ko-keep leading-relaxed">
              {children}
            </p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="font-heading italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 mb-5 space-y-2 ko-keep">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 mb-5 space-y-2 ko-keep">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base md:text-[17px] leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-foreground pl-5 my-8 font-heading italic text-lg ko-keep">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className={`${className ?? ""} font-mono text-sm`}>
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 surface-highest font-mono text-[0.9em]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="surface-highest p-4 my-6 overflow-x-auto font-mono text-sm">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-12 border-t border-border" />,
          img: ({ src, alt }) => {
            // Task 6: 옵시디언 attachments/foo.png → 사이트 /journal-images/foo.png 변환.
            // 빌드 시 scripts/sync-content-images.mjs가 파일 복사 + 여기서 src 매핑.
            // 옵시디언과 사이트가 같은 이미지를 다른 경로로 참조 — "방 두 개의 같은 책상".
            let resolvedSrc: string | undefined;
            if (typeof src === "string") {
              if (src.startsWith("attachments/")) {
                resolvedSrc = `/journal-images/${src.slice("attachments/".length)}`;
              } else {
                resolvedSrc = src;
              }
            }
            return (
              <img
                src={resolvedSrc}
                alt={alt ?? ""}
                className="my-8 w-full"
                loading="lazy"
              />
            );
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="hairline-b">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="p-3 text-left font-heading font-semibold ko-keep">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="hairline-b p-3 ko-keep">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
