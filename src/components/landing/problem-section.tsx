import { Receipt, Brain, Lightbulb } from "lucide-react";

const problems = [
  {
    icon: Receipt,
    title: "견적서 보고 놀란 경험",
    body: "앱 하나 만드는데 500만 원? 아이디어 검증도 전에 그 돈을 쓸 순 없는데...",
    span: "md:col-span-2",
    large: true,
  },
  {
    icon: Brain,
    title: "AI 도구 앞에서 멍해진 경험",
    body: "ChatGPT, Cursor... 다 좋다는데, 어디서부터 시작해야 하는지 모르겠다.",
    span: "md:col-span-1",
    large: false,
  },
  {
    icon: Lightbulb,
    title: "아이디어만 쌓이는 서랍",
    body: "설명하면 다들 '좋은데?' 하고 끝. 아무도 만들어주지 않는다.",
    span: "md:col-span-1",
    large: false,
  },
];

export function ProblemSection() {
  return (
    <section className="surface-base py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
            이런 경험, 있으시죠?
          </span>
          <h2
            className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            머리로 그린 그림이,
            <br className="hidden md:inline" />
            현실 앞에서 멈춰 선 순간
          </h2>
        </div>

        <div className="grid auto-rows-[280px] grid-cols-1 gap-6 md:grid-cols-3">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`${p.span} surface-card rounded-xl p-8 md:p-10 shadow-ambient flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="max-w-lg">
                  <h3
                    className={`mb-3 font-heading font-bold tracking-tight text-foreground ${
                      p.large ? "text-2xl" : "text-xl"
                    }`}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`leading-relaxed text-muted-foreground ${
                      p.large ? "text-lg" : "text-base"
                    }`}
                    style={{ wordBreak: "keep-all" }}
                  >
                    {p.body}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Decorative quote spacer */}
          <div className="relative hidden md:col-span-2 md:flex items-center justify-center overflow-hidden rounded-xl p-10">
            <div className="pointer-events-none absolute inset-0 opacity-60">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            </div>
            <p className="relative z-10 max-w-md text-center text-base font-medium italic text-muted-foreground">
              &ldquo;창업자의 90%는 실행력의 부재로 멈춥니다.
              <br />
              dairect는 그 멈춤을 해결합니다.&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-24 flex flex-col items-center text-center">
          <p
            className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            그 서랍을 열어드리겠습니다.
          </p>
          <div className="mt-6 h-12 w-1 rounded-full bg-gradient-to-b from-primary/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
