import Link from "next/link";

type Plan = {
  num: string;
  name: string;
  koName: string;
  amount: string;
  duration: string;
  desc: string;
  features: readonly string[];
  featured?: boolean;
};

const plans: readonly Plan[] = [
  {
    num: "PKG N°01",
    name: "Discovery.",
    koName: "진단 패키지",
    amount: "30",
    duration: "3~5일",
    desc: "아이디어가 실현 가능한지, 어떤 스펙으로 만들어야 하는지 가장 빠르게 확인하는 단계입니다.",
    features: [
      "1시간 심층 인터뷰",
      "타깃·가설·성공 기준 정리",
      "MVP 스코프 초안",
      "기술 스택 추천서",
    ],
  },
  {
    num: "PKG N°02",
    name: "Build.",
    koName: "MVP 패키지",
    amount: "300",
    duration: "2~3주",
    desc: "실제로 작동하는 MVP를 2~3주 안에 출시합니다. 매일 빌드 공유, 주간 리뷰로 완전히 투명하게.",
    features: [
      "Discovery 전 단계 포함",
      "풀스택 개발 (Next.js + Supabase)",
      "반응형 디자인 시스템",
      "배포 및 도메인 연결",
      "30일 무상 유지보수",
    ],
    featured: true,
  },
  {
    num: "PKG N°03",
    name: "Scale.",
    koName: "확장 패키지",
    amount: "800",
    duration: "4~8주",
    desc: "런칭 후 성장에 집중하는 단계. 기능 확장, 성능 최적화, 데이터 분석 환경까지 한 번에.",
    features: [
      "Build 전 단계 포함",
      "결제·정산 시스템",
      "관리자 대시보드",
      "Analytics + A/B 프레임",
      "90일 운영 파트너십",
    ],
  },
] as const;

export function Pricing() {
  return (
    <section id="pricing" data-screen-label="06 Pricing">
      <div className="container">
        <div className="pricing-head">
          <p className="kicker amber">— Investment</p>
          <h2 className="pricing-title">
            <span className="rm">Honest pricing.</span>
            <span className="it">No surprises.</span>
          </h2>
          <p className="pricing-ko">정직한 비용, 예측 가능한 결과</p>
          <p className="pricing-sub">
            아이디어의 크기에 맞는 최적의 플랜. 복잡한 개발 과정을 투명한 비용
            체계로 경험하세요.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.num}
              className={plan.featured ? "price-col featured" : "price-col"}
            >
              {plan.featured && (
                <span className="price-badge">— Most chosen</span>
              )}
              <span className="price-num">{plan.num}</span>
              <h3 className="price-name">{plan.name}</h3>
              <span className="price-ko-name">{plan.koName}</span>
              <div>
                <div className="price-amount">
                  {plan.amount}
                  <span
                    style={{
                      fontSize: "0.5em",
                      fontWeight: 400,
                      marginLeft: 6,
                      color: "var(--dust)",
                    }}
                  >
                    만원~
                  </span>
                </div>
                <div className="price-starting">부가세 별도 · 시작 금액</div>
              </div>
              <div className="price-duration">{plan.duration}</div>
              <p className="price-desc">{plan.desc}</p>
              <ul className="price-list">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="price-cta">
                {plan.featured ? (
                  <Link
                    href="/about#contact"
                    className="btn-primary magnetic"
                    data-magnetic
                  >
                    Start this project{" "}
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ) : (
                  <Link href="/about#contact" className="price-ghost">
                    Learn more →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="pricing-note">
          정확한 금액은 프로젝트 범위에 따라 조정됩니다. 편하게 문의해주세요.
        </p>
      </div>
    </section>
  );
}
