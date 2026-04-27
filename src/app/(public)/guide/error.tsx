"use client";

import Link from "next/link";

export default function GuideError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/50">
        — Error
      </p>
      <h1 className="font-heading text-3xl font-light text-foreground">
        가이드를 불러오지 못했습니다.
      </h1>
      <p className="max-w-md text-sm text-foreground/70">
        잠시 후 다시 시도해 주세요. 문제가 계속되면 hidream72@gmail.com으로
        알려주세요.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-canvas transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--color-foreground)]"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="border border-foreground/30 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-foreground hover:bg-foreground/5"
        >
          홈으로
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && error.digest && (
        <p className="font-mono text-[10px] text-foreground/40">
          digest: {error.digest}
        </p>
      )}
    </div>
  );
}
