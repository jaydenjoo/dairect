const ourPart = [
  "AI 도구 선택과 사용",
  "코드 작성과 배포",
  "기술 스택 결정과 구현",
  "매일 한 줄 진행 상황 보고",
];

const yourPart = [
  "고객이 누구인지, 무엇을 해결하는지에 대한 답변",
  "1시간 인터뷰면 충분합니다",
  "그 1시간이 없으면 저희도 만들 수 없습니다",
];

export function NoAIExperience() {
  return (
    <section
      className="no-ai-experience"
      id="no-ai"
      data-screen-label="07.7 No AI Experience"
    >
      <div className="container">
        <p className="kicker reveal-fade" data-reveal>
          — NO AI EXPERIENCE NEEDED
        </p>
        <h2
          className="no-ai-headline reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          ChatGPT를 안 써보셔도 됩니다.
          <br />
          Claude가 뭔지 몰라도 됩니다.
        </h2>

        <blockquote
          className="no-ai-quote reveal-fade"
          data-reveal
          data-reveal-delay="200"
        >
          <p>
            AI는 자동차입니다. <em>운전을 못해도 괜찮아요.</em>
          </p>
          <p>택시를 타면 되니까요. 저희가 운전합니다.</p>
        </blockquote>

        <div
          className="no-ai-grid reveal-fade"
          data-reveal
          data-reveal-delay="320"
        >
          <div className="no-ai-col">
            <h3 className="no-ai-col-title">저희가 맡는 것</h3>
            <ul className="no-ai-list no-ai-list-yes">
              {ourPart.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="no-ai-col">
            <h3 className="no-ai-col-title">같이 해주셔야 하는 것 한 가지</h3>
            <ul className="no-ai-list no-ai-list-dot">
              {yourPart.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p
          className="no-ai-foot reveal-fade"
          data-reveal
          data-reveal-delay="440"
        >
          한국어로, 일상 언어로만 대화합니다.
        </p>
      </div>
    </section>
  );
}
