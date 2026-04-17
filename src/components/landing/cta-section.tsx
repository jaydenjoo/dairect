import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="section-dark relative overflow-hidden py-24 md:py-32">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-white/60">
          <Sparkles className="h-3 w-3" />
          Start your project
        </div>

        <h2
          className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-white"
          style={{ wordBreak: "keep-all" }}
        >
          아이디어만 있으면,
          <br />
          나머지는 저희가 합니다
        </h2>

        <p
          className="mx-auto mt-6 max-w-xl text-lg text-white/70"
          style={{ wordBreak: "keep-all" }}
        >
          개발을 몰라도, AI를 못 다뤄도 괜찮습니다. 머릿속 그림만 가지고 와주세요.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/about#contact"
            className="soul-gradient inline-flex items-center gap-2 rounded-xl px-8 py-4 font-bold text-white shadow-ambient-lg transition-all hover:brightness-110 active:scale-95"
          >
            내 아이디어 상담하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            데모 먼저 보기
          </Link>
        </div>

        <p className="mt-10 font-mono text-xs uppercase tracking-widest text-white/60">
          24시간 이내 답변 · 상담은 무료
        </p>
      </div>
    </section>
  );
}
