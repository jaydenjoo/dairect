"use client";

import Link from "next/link";
import { SchedulingStatus } from "./SchedulingStatus";
import { track } from "@/lib/analytics";
import type { Slot } from "@/lib/scheduling-slots";

type Plan = {
  num: string;
  name: string;
  koName: string;
  amount: string;
  duration: string;
  desc: string;
  features: readonly string[];
  notDoing?: string;
  tagline?: string;
  featured?: boolean;
};

const plans: readonly Plan[] = [
  {
    num: "PKG N°00",
    name: "Discovery.",
    koName: "체험 패키지",
    amount: "90",
    duration: "3~5일",
    desc: "아이디어가 진짜 만들 수 있는지, 가장 저렴하게 확인하는 첫 단계입니다.",
    features: [
      "기본 설문지 조사 (특별한 경우 1시간 상담)",
      "타깃·가설·성공 기준 정리",
      "기술 가능성 진단서",
      "MVP 스코프 초안",
    ],
  },
  {
    num: "PKG N°01",
    name: "Sprint.",
    koName: "검증 패키지",
    amount: "180",
    duration: "5~10일",
    desc: "핵심 가설이 작동하는지 가장 빠르게 검증합니다. 가장 인기 있는 시작점.",
    features: [
      "Discovery 전 단계 포함",
      "핵심 기능 1~2개 작동 데모",
      "기본 UI/UX 구현",
      "Vercel 배포 + 도메인 연결",
    ],
  },
  {
    num: "PKG N°02",
    name: "Build.",
    koName: "MVP 패키지",
    amount: "300",
    duration: "2~3주",
    desc: "사용자에게 보여줄 첫 번째 버전을 2~3주 안에 출시합니다. 매일 빌드 공유, 주간 리뷰.",
    tagline: "+ 첫 사용자 확보까지 14일 동행",
    features: [
      "Sprint 전 단계 포함",
      "풀스택 개발 (Next.js + Supabase)",
      "반응형 디자인 시스템",
      "배포 및 도메인 연결",
      "+ 14일 슬랙 자문 (월 5회, 24h SLA)",
    ],
    featured: true,
  },
  {
    num: "PKG N°03",
    name: "Scale.",
    koName: "확장 패키지",
    amount: "800",
    duration: "4~8주",
    desc: "MVP 이후 본격 운영 인프라. 결제·관리자·분석 등 기능·사용자 확장.",
    tagline: "+ 첫 매출 발생까지 90일 파트너십",
    features: [
      "Build 전 단계 포함",
      "결제·정산 시스템",
      "관리자 대시보드",
      "Analytics + A/B 프레임",
      "90일 운영 파트너십",
    ],
  },
] as const;

export function Pricing({ schedulingSlots }: { schedulingSlots?: readonly Slot[] }) {
  return (
    <section id="pricing" data-screen-label="06 Pricing">
      <div className="container">
        <div className="pricing-head">
          <p className="kicker amber">— Investment</p>
          <h2 className="pricing-title">
            <span className="rm">Honest pricing.</span>{" "}
            <span className="it">No surprises.</span>
          </h2>
          <p className="pricing-ko">정직한 비용, 예측 가능한 결과</p>
          <p className="pricing-sub">
            아이디어의 크기에 맞는 최적의 플랜. 복잡한 개발 과정을 투명한 비용
            체계로 경험하세요.
          </p>
        </div>

        <SchedulingStatus slots={schedulingSlots} />

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
                <div className="price-starting">VAT 별도 · 시작 금액</div>
              </div>
              <div className="price-duration">{plan.duration}</div>
              <p className="price-desc">{plan.desc}</p>
              {plan.tagline && (
                <p className="price-tagline">{plan.tagline}</p>
              )}
              <ul className="price-list">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {plan.notDoing && (
                <p className="price-not-doing">{plan.notDoing}</p>
              )}
              <div className="price-cta">
                {plan.featured ? (
                  <Link
                    href="/about#contact"
                    className="btn-primary magnetic"
                    data-magnetic
                    onClick={() =>
                      track(
                        "pricing_click",
                        plan.name.replace(".", "").toLowerCase(),
                      )
                    }
                  >
                    상담 신청하기{" "}
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/about#contact"
                    className="price-ghost"
                    onClick={() =>
                      track(
                        "pricing_click",
                        plan.name.replace(".", "").toLowerCase(),
                      )
                    }
                  >
                    자세히 →
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
