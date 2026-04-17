import { Plus } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "예상 범위를 초과하면 비용이 어떻게 달라지나요?",
    answer:
      "계약 시 확정된 요구사항 내 수정은 무상입니다. 범위 확장이 필요한 경우 사전에 추가 견적을 드리고 합의 후에만 진행합니다. 몰래 청구되는 비용은 없습니다.",
  },
  {
    question: "분할 납부 가능한가요?",
    answer:
      "네. 기본 조건은 착수금 30% · 중도금 40% · 잔금 30% 3분할입니다. MVP/확장 패키지는 프로젝트 길이에 맞춰 분할 비율 조정이 가능합니다. 진단 패키지는 일시불 원칙이나 협의 가능합니다.",
  },
  {
    question: "NDA(비밀유지계약) 체결 가능한가요?",
    answer:
      "상담 전에도 사전 NDA 체결이 가능합니다. 기본 템플릿을 제공하거나 고객사 양식을 검토 후 서명합니다. 상담 중 공유된 모든 정보는 계약 여부와 무관하게 비밀로 유지됩니다.",
  },
  {
    question: "소스 코드 소유권은 누구에게 있나요?",
    answer:
      "잔금 입금 완료와 동시에 모든 소스 코드와 디자인 원본이 고객에게 완전 이관됩니다. GitHub private repo를 그대로 넘겨드리며, 오픈소스 라이브러리 외 dairect가 별도로 보유하는 IP는 없습니다.",
  },
  {
    question: "환불 정책은 어떻게 되나요?",
    answer:
      "진단 단계에서 프로젝트 진행이 어려운 것으로 판단되면 잔여 착수금을 환불합니다. MVP/확장은 진행된 마일스톤만큼 정산 후 잔여분 환불이 원칙입니다. 자세한 기준은 계약서에 명시됩니다.",
  },
];

export function PricingFaq() {
  return (
    <section className="surface-base py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <header className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
            FAQ
          </span>
          <h2
            className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            자주 묻는 질문
          </h2>
        </header>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="surface-card group rounded-2xl p-6 shadow-ambient [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span
                  className="font-heading text-base font-semibold text-foreground md:text-lg"
                  style={{ wordBreak: "keep-all" }}
                >
                  {faq.question}
                </span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-open:rotate-45">
                  <Plus className="h-4 w-4" />
                </div>
              </summary>
              <p
                className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base"
                style={{ wordBreak: "keep-all" }}
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
