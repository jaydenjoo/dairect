/**
 * /pricing 페이지 FAQ — Phase B Task 8-4.
 *
 * Server component (SEO 우수, AI 검색 인용 친화).
 * <dl>/<dt>/<dd> 시맨틱 마크업으로 FAQPage schema 호환.
 * Studio Anthem 양식: paper 박스 + 1px hairline 구분선.
 */
type FAQ = {
  q: string;
  a: string;
};

const faqs: readonly FAQ[] = [
  {
    q: "결제 방식은 어떻게 되나요?",
    a: "계좌이체(세금계산서 발행)가 기본입니다. 카드 결제는 PG사 연동이 필요해 별도 협의가 필요합니다.",
  },
  {
    q: "분할 결제가 가능한가요?",
    a: "가능합니다. 일반적으로 50% 착수금 + 50% 인도 시 결제. MVP / 확장 패키지는 3분할(30/40/30)도 협의 가능합니다.",
  },
  {
    q: "가격에 VAT(부가세)가 포함되어 있나요?",
    a: "모든 가격은 VAT 별도 표기입니다. 사업자 고객은 매입세액 공제가 가능합니다.",
  },
  {
    q: "환불 정책이 어떻게 되나요?",
    a: "Discovery(체험)는 작업 시작 전이라면 100% 환불됩니다. 작업 시작 후엔 진행률에 따라 부분 환불됩니다.",
  },
  {
    q: "추가 비용이 발생하는 경우가 있나요?",
    a: "합의된 작업 범위가 변경될 때만 추가됩니다. 사전에 견적을 제공한 뒤 동의를 받은 후에만 진행하며, 암묵적 추가 청구는 없습니다.",
  },
  {
    q: "도메인·서버 비용은 누가 결제하나요?",
    a: "고객 명의로 직접 가입·결제하셔야 합니다(외부 서비스 정책 참조). dairect는 설정·연결만 지원합니다.",
  },
];

export function PricingFAQ() {
  return (
    <section className="pricing-faq" data-screen-label="P-04 FAQ">
      <div className="container">
        <p className="kicker amber reveal-fade" data-reveal>
          — FAQ
        </p>
        <h2
          className="faq-title reveal-fade"
          data-reveal
          data-reveal-delay="80"
        >
          자주 묻는 질문
        </h2>
        <dl className="faq-list reveal-fade" data-reveal data-reveal-delay="160">
          {faqs.map((faq, idx) => (
            <div key={faq.q} className="faq-item">
              <dt className="faq-q">
                <span className="faq-num">
                  Q{String(idx + 1).padStart(2, "0")}
                </span>
                {faq.q}
              </dt>
              <dd className="faq-a">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
