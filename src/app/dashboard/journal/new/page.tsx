import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JournalNewForm } from "./_components/JournalNewForm";

export const metadata: Metadata = {
  title: "새 Journal 글",
};

export default function NewJournalPostPage() {
  return (
    <div className="py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          새 Journal 글
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          옵시디언 없는 환경에서도 작성 가능합니다. 발행 시 GitHub에 commit되며,
          1~2분 후{" "}
          <Link
            href="/journal"
            target="_blank"
            className="underline underline-offset-2 hover:text-foreground"
          >
            dairect.kr/journal
          </Link>
          에 반영됩니다.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border border-border/60 bg-background p-6">
        <JournalNewForm />
      </div>
    </div>
  );
}
