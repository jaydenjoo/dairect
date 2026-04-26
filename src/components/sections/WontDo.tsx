"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

type WontGroup = {
  title: string;
  items: readonly string[];
};

const groups: readonly WontGroup[] = [
  {
    title: "가치 정렬 문제 — 어떤 형태로도 도와드리지 않습니다",
    items: [
      "허위·과장 후킹형 영업 자동화 (강압적 회원 모집 도구 포함)",
      "사행성·중독 유도 서비스 (도박 인접 게이미피케이션)",
      "무단 대량 발송 마케팅 도구 (정보통신망법 충돌 소지)",
      "클론 커머스 사이트",
      "저작권 침해 콘텐츠 생성기",
    ],
  },
  {
    title: "지금은 안전하게 못 만듭니다 — 가능한 다른 곳을 소개해드립니다",
    items: [
      "의료/금융/도박 인접 앱 (심사·법규 위험)",
      "보안 감사가 필요한 시스템",
      "대규모 트래픽 (DAU 10만+) 인프라",
      "자체 AI 모델 학습/파인튜닝",
      "카카오톡 SDK 직접 연동 (정책 충돌)",
    ],
  },
];

export function WontDo() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("wont_do_view");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="wont-do"
      id="boundaries"
      data-screen-label="07.5 Won't Do"
    >
      <div className="container">
        <p className="kicker reveal-fade" data-reveal>
          — BOUNDARIES
        </p>
        <h2
          className="wont-headline reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          받지 않는 의뢰가 있습니다.
        </h2>
        <p
          className="wont-lede reveal-fade"
          data-reveal
          data-reveal-delay="160"
        >
          가치 정렬이 안 되거나, 안전하게 만들 수 없는 영역입니다. 정직한 거절이
          더 빠른 거래의 시작입니다.
        </p>

        <div
          className="wont-grid reveal-fade"
          data-reveal
          data-reveal-delay="240"
        >
          {groups.map((g) => (
            <div key={g.title} className="wont-col">
              <h3 className="wont-col-title">{g.title}</h3>
              <ul className="wont-list">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          className="wont-foot reveal-fade"
          data-reveal
          data-reveal-delay="400"
        >
          합법적이지만 저희 역량·원칙상 받지 못하는 의뢰만 다른 곳을
          소개해드립니다. 위쪽 &ldquo;가치 정렬 문제&rdquo; 항목은 어떤
          형태로도 알선하지 않습니다.
        </p>
      </div>
    </section>
  );
}
