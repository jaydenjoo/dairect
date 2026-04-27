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
 *   - <strong>=핵심 키워드 (AI 개발 프리랜서 / 2~3주 / 1/3 비용 / Sprint 180만원)
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
            <strong>AI 개발 프리랜서</strong>가 비개발자·창업가의 아이디어를{" "}
            <strong>2~3주</strong> 안에 라이브 제품으로 만들어드립니다. 일반
            개발사 <strong>1/3 비용 · 1/4 기간</strong>.{" "}
            <strong>Sprint 180만원</strong>부터 Build · Scale까지.
          </p>
        </div>
      </div>
    </section>
  );
}
