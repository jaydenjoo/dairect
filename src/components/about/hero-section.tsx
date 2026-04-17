import { Sparkles, Zap } from "lucide-react";

export function AboutHero() {
  return (
    <section className="section-dark relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-20 h-[480px] w-[480px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.8) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 lg:gap-20">
        {/* 포트레이트 placeholder — 이니셜 + 그라데이션 */}
        <div className="mx-auto w-full max-w-[360px] md:mx-0">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-[28px]"
            style={{
              background:
                "linear-gradient(135deg, #1F2937 0%, #111827 55%, #0B1220 100%)",
              boxShadow:
                "0 30px 60px -12px rgba(17,24,39,0.6), 0 18px 32px -16px rgba(79,70,229,0.35)",
            }}
          >
            {/* 텍스처 도트 */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.35) 0.5px, transparent 0.5px)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Indigo glow */}
            <div
              aria-hidden
              className="absolute -top-16 -right-8 h-48 w-48 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(79,70,229,0.45) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 p-10">
              <div
                className="font-heading text-[120px] font-black leading-none tracking-tighter text-white/95"
                style={{ letterSpacing: "-0.05em" }}
              >
                J
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                Jayden · dairect
              </div>
            </div>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col gap-6">
          <h1
            className="font-heading text-[44px] font-extrabold leading-[1.05] tracking-tight text-white md:text-[56px] lg:text-[64px]"
            style={{ letterSpacing: "-0.03em", wordBreak: "keep-all" }}
          >
            Jayden
          </h1>
          <p
            className="font-mono text-sm uppercase tracking-[0.18em] text-primary/90 md:text-[13px]"
          >
            Vibe Architect · dairect 대표
          </p>

          {/* 인용 — Indigo 좌측 바 */}
          <blockquote
            className="relative pl-5 text-[17px] italic leading-relaxed text-white/80 md:text-lg"
            style={{ wordBreak: "keep-all" }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%)",
              }}
            />
            &ldquo;AI는 자동차입니다. 운전을 못해도 괜찮아요. 택시를 타면 되니까요.&rdquo;
          </blockquote>

          <p
            className="text-base leading-[1.75] text-white/70 md:text-[17px]"
            style={{ wordBreak: "keep-all" }}
          >
            코드는 AI가 쓰고, 방향은 제가 잡습니다. 고객님의 아이디어가 세상에 나올 수 있도록, 가장 작고 확실한 첫 걸음을 함께합니다.
          </p>

          {/* 뱃지 2개 */}
          <div className="mt-2 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              EXPERT GUIDANCE
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white/90 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-primary" />
              FAST DELIVERY
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
