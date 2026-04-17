import Link from "next/link";
import { CheckCircle2, Clock, Zap, Rocket, ArrowRight } from "lucide-react";

type Pkg = {
  name: string;
  subtitle: string;
  price: string;
  duration: string;
  durationIcon: typeof Clock;
  features: string[];
  featured?: boolean;
  cta: string;
  href: string;
};

const packages: Pkg[] = [
  {
    name: "진단 패키지",
    subtitle: "아이디어 실현 가능성 진단 + 기능 정의",
    price: "30만원~",
    duration: "3~5일",
    durationIcon: Clock,
    features: [
      "아이디어 분석 보고서",
      "핵심 기능 정의",
      "기술 스택 추천",
      "개발 로드맵",
    ],
    cta: "자세히 알아보기",
    href: "/pricing#diagnosis",
  },
  {
    name: "MVP 패키지",
    subtitle: "핵심 기능 1개를 실제 작동하는 프로토타입으로",
    price: "100만원~",
    duration: "2~3주",
    durationIcon: Zap,
    features: [
      "진단 패키지 포함",
      "MVP 개발 + 배포",
      "2주 무상 수정",
      "사용 가이드",
    ],
    featured: true,
    cta: "상담 신청하기",
    href: "/about#contact",
  },
  {
    name: "확장 패키지",
    subtitle: "MVP를 정식 서비스로 확장. 추가 기능 + 운영 환경",
    price: "300만원~",
    duration: "4~8주",
    durationIcon: Rocket,
    features: [
      "MVP 패키지 포함",
      "추가 기능 개발",
      "도메인 + 배포",
      "운영 가이드",
    ],
    cta: "자세히 알아보기",
    href: "/pricing#expansion",
  },
];

export function PricingSummarySection() {
  return (
    <section className="surface-low py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <header className="mx-auto mb-20 max-w-4xl text-center">
          <h2
            className="mb-6 font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            합리적인 비용, 확실한 결과
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            아이디어의 크기에 맞는 최적의 플랜을 제안합니다. 복잡한 개발 과정을
            투명하고 명확한 비용 체계로 경험하세요.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
          {packages.map((pkg) => {
            const DurationIcon = pkg.durationIcon;
            return (
              <div
                key={pkg.name}
                className={`surface-card relative flex flex-col justify-between rounded-xl p-8 md:p-10 shadow-ambient transition-all duration-300 hover:shadow-ambient-lg ${
                  pkg.featured ? "md:scale-[1.04] ring-2 ring-primary" : ""
                }`}
              >
                {pkg.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="soul-gradient rounded-full px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-ambient">
                      가장 많이 선택해요
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3
                      className={`mb-2 font-heading font-bold text-foreground ${
                        pkg.featured ? "text-2xl" : "text-xl"
                      }`}
                    >
                      {pkg.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed text-muted-foreground"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {pkg.subtitle}
                    </p>
                  </div>

                  <div className="mb-8">
                    <span
                      className={`font-heading font-extrabold tracking-tight ${
                        pkg.featured
                          ? "text-4xl text-primary"
                          : "text-3xl text-foreground"
                      }`}
                    >
                      {pkg.price}
                    </span>
                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        pkg.featured
                          ? "bg-accent text-accent-foreground"
                          : "surface-high text-muted-foreground"
                      }`}
                    >
                      <DurationIcon className="h-3.5 w-3.5" />
                      {pkg.duration}
                    </div>
                  </div>

                  <ul className="mb-10 space-y-4">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span
                          className={`text-sm ${
                            pkg.featured
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={pkg.href}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all ${
                    pkg.featured
                      ? "soul-gradient text-white shadow-ambient-lg hover:brightness-110"
                      : "surface-high text-foreground hover:bg-accent/50"
                  }`}
                >
                  {pkg.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <p
          className="mt-16 text-center text-sm text-muted-foreground"
          style={{ wordBreak: "keep-all" }}
        >
          정확한 금액은 프로젝트 범위에 따라 달라집니다. 편하게 문의해주세요.
        </p>
      </div>
    </section>
  );
}
