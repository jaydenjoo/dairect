import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "오프라인",
  description: "네트워크 연결이 필요합니다.",
  robots: { index: false, follow: false, nocache: true },
};

export default function OfflinePage() {
  return (
    <main className="surface-base min-h-screen flex items-center justify-center px-6 py-24">
      <section className="w-full max-w-md text-center space-y-8">
        <div
          aria-hidden="true"
          className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-heading text-2xl font-bold"
        >
          D
        </div>
        <div className="space-y-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            지금은 연결이 필요해요
          </h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            인터넷 연결을 확인해주세요. 네트워크가 돌아오면
            <br />홈 화면에서 다시 열어주세요.
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
