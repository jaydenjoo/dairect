/**
 * Phase 2 (2026-04-27) — Findably 진단 대응 Quick Answer 박스.
 *
 * Hero 직후 200자 내 진입점. AI 검색(ChatGPT/Claude/Perplexity)이 답변 인용 시
 * 페이지 상단의 명확한 요약 섹션을 우선 채택 — Princeton 연구 +40% 인용률.
 *
 * 디자인: Studio Anthem paper+amber bar 패턴.
 *   - 섹션 배경 var(--canvas), 박스 var(--paper)
 *   - 좌측 4px amber 하드 바 + 1px hairline 보더
 *   - mono kicker "■ 핵심 요약" + Pretendard 본문
 *   - <strong>=핵심 키워드 (누가/무엇/얼마·기간 + 90만·180만·300만 + 1/3 비용)
 */
export function QuickAnswer() {
  return (
    <section
      className="quick-answer"
      id="quick-answer"
      data-screen-label="01.5 Quick Answer"
    >
      <div className="container">
        <div className="qa-box">
          <p className="qa-kicker reveal-fade" data-reveal>
            ■ 핵심 요약
          </p>
          <p
            className="qa-body reveal-fade"
            data-reveal
            data-reveal-delay="80"
          >
            <strong>누가</strong>
            {" — "}
            직장인 · 사장님 · 비IT 창업자
            <br />
            <strong>무엇</strong>
            {" — "}
            AI 아이디어 작동 가능 여부 검증 + 작동하는 데모 제공
            <br />
            <strong>얼마 · 기간</strong>
            {" — "}
            체험 <strong>90만 (3~5일)</strong>
            {" / "}
            검증 <strong>180만 (5~10일)</strong>
            {" / "}
            MVP <strong>300만 (2~3주)</strong>
            <br />
            일반 개발사 대비 <strong>1/3 비용</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
