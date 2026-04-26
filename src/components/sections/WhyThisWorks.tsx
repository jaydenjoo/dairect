export function WhyThisWorks() {
  return (
    <section
      className="why-this-works"
      id="why"
      data-screen-label="03.5 Why This Works"
    >
      <div className="container">
        <p className="kicker reveal-fade" data-reveal>
          — WHY THIS WORKS
        </p>

        <h2
          className="why-headline reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          왜 이렇게 빠르고 저렴할까요?
        </h2>

        <p
          className="why-lede reveal-fade"
          data-reveal
          data-reveal-delay="160"
        >
          비밀은 <em>AI 레버리지</em>입니다. 한 사람이 AI를 지휘하면, 3~5명짜리
          팀이 한 달 동안 할 일을 2~3주에 끝냅니다. 다만 그 효과는 작업 종류에
          따라 다릅니다 — 정직하게 보여드립니다.
        </p>

        <p
          className="why-table-title reveal-fade"
          data-reveal
          data-reveal-delay="240"
        >
          비교 대상별 절감 효과
          <span className="why-tt-note">(Build 패키지 기준)</span>
        </p>

        <div
          className="why-table reveal-fade"
          data-reveal
          data-reveal-delay="320"
        >
          <div className="why-row why-head" aria-hidden="true">
            <span className="why-cell why-cell-label">비교 대상</span>
            <span className="why-cell why-cell-num">비용 절감</span>
            <span className="why-cell why-cell-num">시간 절감</span>
          </div>

          <div className="why-row">
            <span className="why-cell why-cell-label">
              <em>SI 외주 정식 발주</em>
              <span className="why-note">3,000~5,000만 / 3~6개월</span>
            </span>
            <span
              className="why-cell why-cell-num why-amber"
              data-label="비용 절감"
            >
              1/10
            </span>
            <span
              className="why-cell why-cell-num why-amber"
              data-label="시간 절감"
            >
              1/4
            </span>
          </div>

          <div className="why-row">
            <span className="why-cell why-cell-label">
              <em>시니어 풀스택 프리랜서</em>
              <span className="why-note">1,500~2,000만 / 2~3개월</span>
            </span>
            <span
              className="why-cell why-cell-num why-amber"
              data-label="비용 절감"
            >
              1/5
            </span>
            <span
              className="why-cell why-cell-num why-amber"
              data-label="시간 절감"
            >
              1/3
            </span>
          </div>

          <div className="why-row">
            <span className="why-cell why-cell-label">
              <em>중급 프리랜서</em>
              <span className="why-note">1,000~1,500만 / 2~3개월</span>
            </span>
            <span
              className="why-cell why-cell-num why-amber"
              data-label="비용 절감"
            >
              1/3
            </span>
            <span
              className="why-cell why-cell-num why-amber"
              data-label="시간 절감"
            >
              1/3
            </span>
          </div>
        </div>

        <p
          className="why-caption reveal-fade"
          data-reveal
          data-reveal-delay="400"
        >
          * 다음 조건일 때 위 비율이 성립합니다 — MVP 범위가 Sprint/Build
          화이트리스트 안 (모바일 앱·복잡한 결제 제외) · 요구사항이 디스커버리
          단계에서 80% 이상 확정 · 매일 빌드 공유 + 빠른 의사결정 가능
        </p>

        <p
          className="why-source reveal-fade"
          data-reveal
          data-reveal-delay="480"
        >
          출처: 한국소프트웨어산업협회 2026 SW기술자 노임단가 / 위시켓 2025 단가
          평균
        </p>
      </div>
    </section>
  );
}
