import { MessageCircle, Target, Hammer, Rocket, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    no: "01",
    icon: MessageCircle,
    title: "심층 상담",
    body: "해결하고자 하는 문제와 비즈니스 목표를 명확히 정의하기 위한 전문가 미팅을 진행합니다.",
  },
  {
    no: "02",
    icon: Target,
    title: "전략 설계",
    body: "수집된 정보를 바탕으로 최적의 기술 스택과 아키텍처, 개발 로드맵을 설계하여 제안합니다.",
  },
  {
    no: "03",
    icon: Hammer,
    title: "맞춤 개발",
    body: "엄격한 코드 퀄리티 기준을 준수하며, 점진적인 배포를 통해 실시간 피드백을 반영하여 개발합니다.",
  },
  {
    no: "04",
    icon: Rocket,
    title: "완성 및 이관",
    body: "철저한 QA를 거친 최종 결과물을 안정적으로 배포하고, 상세 가이드와 함께 소유권을 전달합니다.",
  },
];

export function ServiceSection() {
  return (
    <section className="surface-low py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-4 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            이렇게 진행됩니다
          </h2>
          <p
            className="mx-auto max-w-2xl text-muted-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            복잡한 코드 고민은 저희가 맡겠습니다. 당신의 아이디어가 현실이 되는
            4단계 프로세스를 확인하세요.
          </p>
        </div>

        <div className="relative">
          {/* Desktop 연결선 — 원 중심 (32px) 통과 */}
          <div className="absolute left-[10%] right-[10%] top-[32px] z-0 hidden h-px bg-foreground/[0.08] md:block" />

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.no} className="flex flex-col items-center">
                  <div className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
                    <Icon className="h-6 w-6" />
                    <span className="pointer-events-none absolute -top-12 font-heading text-5xl font-extrabold text-primary/20">
                      {step.no}
                    </span>
                  </div>
                  <div className="surface-card flex h-full w-full flex-col items-center rounded-xl p-8 shadow-ambient text-center">
                    <h3 className="mb-4 font-heading text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed text-muted-foreground"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link
            href="/about#contact"
            className="soul-gradient inline-flex items-center gap-2 rounded-xl px-10 py-4 font-bold text-lg text-white shadow-ambient-lg transition-all hover:brightness-110 active:scale-95"
          >
            내 아이디어도 가능할까?
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Bento Teaser */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="surface-high relative h-[280px] overflow-hidden rounded-xl p-10 md:col-span-2 flex flex-col justify-end">
            <Sparkles className="absolute right-8 top-8 h-16 w-16 text-primary/20" />
            <h3 className="mb-2 font-heading text-2xl font-bold text-foreground">
              AI 가이드가 함께하는 여정
            </h3>
            <p
              className="max-w-md text-muted-foreground"
              style={{ wordBreak: "keep-all" }}
            >
              모든 단계에서 AI 기반 분석 리포트를 제공하여, 현재 진행 상황과
              미래의 확장성을 투명하게 공개합니다.
            </p>
          </div>
          <div className="soul-gradient flex h-[280px] flex-col justify-between rounded-xl p-10 text-white">
            <ShieldCheck className="h-10 w-10" />
            <div>
              <h3 className="mb-2 font-heading text-xl font-bold">
                신뢰의 코드 품질
              </h3>
              <p
                className="text-sm leading-relaxed text-white/80"
                style={{ wordBreak: "keep-all" }}
              >
                엄격한 테스트와 상시 코드 리뷰로 안정성을 보장합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
