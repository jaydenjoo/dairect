/**
 * /process 페이지 6 단계 절차 — Phase B Task 9-3.
 *
 * Server component. 세로 타임라인 (좌측 amber 번호 + 우측 콘텐츠).
 * Studio Anthem 양식: 1px hairline 구분선 + amber 번호 + paper meta chip.
 */
type Step = {
  num: string;
  title: string;
  who: string;
  duration: string;
  desc: string;
};

const steps: readonly Step[] = [
  {
    num: "01",
    title: "상담 신청",
    who: "고객",
    duration: "5분",
    desc: "양식 제출. 어떤 서비스를 구상 중이신지 간단히 알려주세요.",
  },
  {
    num: "02",
    title: "회신",
    who: "저희",
    duration: "영업일 24h 이내",
    desc: "가능 여부 / 예상 패키지 / 일정 안내.",
  },
  {
    num: "03",
    title: "계약",
    who: "양측",
    duration: "1~2일",
    desc: "패키지 · 일정 · 금액 확정. 50% 착수금 결제.",
  },
  {
    num: "04",
    title: "상세 설문지",
    who: "고객",
    duration: "1~3일",
    desc: "기본은 설문지 조사, 특별한 경우 1시간 상담.",
  },
  {
    num: "05",
    title: "작업",
    who: "저희",
    duration: "패키지별 기간",
    desc: "매일 진행 보고 + 주간 리뷰 + 상시 소통.",
  },
  {
    num: "06",
    title: "인도",
    who: "저희",
    duration: "1~2일",
    desc: "결과물 + 코드 + 운영 안내. 잔금 50% 결제.",
  },
];

export function ProcessSteps() {
  return (
    <section className="process-steps" data-screen-label="P-03 6 Steps">
      <div className="container">
        <p className="kicker amber reveal-fade" data-reveal>
          — THE 6 STEPS
        </p>
        <h2
          className="steps-title reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          상담 신청부터 인도까지, 6단계.
        </h2>
        <ol
          className="steps-list reveal-fade"
          data-reveal
          data-reveal-delay="160"
        >
          {steps.map((s) => (
            <li key={s.num} className="step-item">
              <span className="step-num">{s.num}</span>
              <div className="step-body">
                <div className="step-head">
                  <h3 className="step-title">{s.title}</h3>
                  <div className="step-meta">
                    <span className="step-meta-chip">{s.who}</span>
                    <span className="step-meta-chip">{s.duration}</span>
                  </div>
                </div>
                <p className="step-desc">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
