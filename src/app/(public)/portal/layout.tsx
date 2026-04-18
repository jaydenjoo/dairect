import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// 포털 전체 서브트리 SEO 차단 — 고객별 개인화 데이터가 인덱싱되면 안 됨.
// Referrer-Policy: URL path에 토큰이 실려 있어 cross-origin 자원 요청 시 Referer로
// 누출 가능. 포털에서 나갈 때 원천 차단 (no-referrer).
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: "#F9F9F7",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-base flex min-h-screen flex-col">
      <nav className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-8">
          <Link
            href="/"
            className="font-heading text-lg font-extrabold tracking-tight text-foreground"
          >
            dairect
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-mono text-[11px] tracking-wider text-accent-foreground">
            <ShieldCheck className="h-3 w-3" />
            Private
          </span>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="pb-8 pt-6">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div className="surface-card rounded-xl px-5 py-4 text-xs text-muted-foreground shadow-ambient">
            <p>
              이 페이지는 담당 PM이 발급한 전용 링크로만 접근 가능합니다. 링크를 외부에
              공유하지 마세요. 문의는 담당 PM에게 직접 전달해주세요.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
