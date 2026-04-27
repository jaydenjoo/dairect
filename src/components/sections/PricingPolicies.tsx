/**
 * /pricing 페이지 정책 박스 — Phase B Task 8-2.
 *
 * 두 박스를 가로 2단(데스크탑) / 세로 stack(모바일)로 배치.
 * QuickAnswer (.qa-box) Studio Anthem 패턴 재사용:
 *   - paper 배경 + amber 4px 좌측 바 + 1px hairline 3변
 *   - mono kicker + Pretendard 본문 + <strong>=핵심 키워드
 */
export function PricingPolicies() {
  return (
    <section
      className="pricing-policies"
      data-screen-label="P-02 Policies"
    >
      <div className="container">
        <div className="policies-grid">
          <div className="qa-box reveal-fade" data-reveal>
            <p className="qa-kicker">■ 결제 시스템 — 별도 진행</p>
            <p className="qa-body">
              결제·정산 연동은 dairect <strong>작업 범위 외</strong>입니다.
              <br />
              <strong>보안·법적 책임 분리</strong>를 위한 정책으로, 역량 부족이
              아닙니다.
              <br />
              <br />
              <strong>진행 방법</strong>
              {" — "}
              사업자 등록 후 <strong>결제대행사(PG사)</strong> 직접 연결. 필요
              시 PG사 선정·연결 가이드 제공.
            </p>
          </div>

          <div
            className="qa-box reveal-fade"
            data-reveal
            data-reveal-delay="80"
          >
            <p className="qa-kicker">■ 외부 서비스 — 고객 실비</p>
            <p className="qa-body">
              <strong>Supabase / Vercel / AI API / 도메인</strong> 등 운영
              인프라는 고객 명의로 <strong>직접 가입·결제</strong>하셔야
              합니다.
              <br />
              <br />
              <strong>예시 비용</strong>
              {" — "}
              Supabase Pro $25/월, Vercel Pro $20/월, AI API 사용량별, 도메인 연
              ~₩20,000.
              <br />
              <em>dairect 패키지 비용에 포함되지 않습니다.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
