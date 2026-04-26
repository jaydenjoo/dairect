type LearningArea = {
  emoji: string;
  title: string;
  meta: { label: string; value: string }[];
  policy?: string;
};

const learnings: readonly LearningArea[] = [
  {
    emoji: "📱",
    title: "모바일 앱 (iOS + Android)",
    meta: [
      { label: "상태", value: "첫 자체 앱 학습 중 (Expo + React Native)" },
      { label: "진행 상황", value: "X/Threads에서 학습 일지 공유 중" },
      {
        label: "첫 외부 의뢰 조건",
        value:
          "✓ 단순 앱 (생산성·뷰어·CRUD 5화면 이내) / ✗ 결제(IAP) · 푸시 알림 · 실시간 채팅 — 아직",
      },
    ],
    policy: "첫 의뢰 시 정책: 30% 할인 + 일정 1.5배 여유 + 처음 도전 명시",
  },
  {
    emoji: "💳",
    title: "모바일 IAP (앱 내 결제)",
    meta: [
      { label: "상태", value: "모바일 앱 학습 후 도전 예정" },
      {
        label: "이유",
        value: "Apple/Google 30% 수수료 정책 + 별도 심사 학습 필요",
      },
    ],
  },
];

export function WhatsLearning() {
  return (
    <section
      className="whats-learning"
      id="learning"
      data-screen-label="07.3 What We're Learning"
    >
      <div className="container">
        <p className="kicker reveal-fade" data-reveal>
          — WHAT WE&apos;RE LEARNING
        </p>
        <h2
          className="learning-headline reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          도전 중인 영역을 공개합니다.
        </h2>
        <p
          className="learning-lede reveal-fade"
          data-reveal
          data-reveal-delay="160"
        >
          스튜디오의 능력은 매달 자라고 있습니다. 지금 학습 중인 영역과, 어떤
          조건에서 첫 외부 의뢰가 가능한지 정직하게 공개합니다.
        </p>

        <div
          className="learning-grid reveal-fade"
          data-reveal
          data-reveal-delay="240"
        >
          {learnings.map((l) => (
            <article key={l.title} className="learning-card">
              <div className="learning-card-head">
                <span className="learning-emoji" aria-hidden="true">
                  {l.emoji}
                </span>
                <h3 className="learning-title">{l.title}</h3>
              </div>
              <dl className="learning-meta">
                {l.meta.map((m) => (
                  <div key={m.label} className="learning-meta-row">
                    <dt>{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
              {l.policy && <p className="learning-policy">{l.policy}</p>}
            </article>
          ))}
        </div>

        <p
          className="learning-foot reveal-fade"
          data-reveal
          data-reveal-delay="400"
        >
          이 외 영역은 의뢰 시 솔직하게 가능 여부 말씀드립니다. 견적서에 &ldquo;처음
          도전입니다&rdquo;가 있다면, 그것이 가격에 반영됩니다 (첫 외부 의뢰 30%
          할인 + 일정 1.5배 여유).
        </p>
      </div>
    </section>
  );
}
