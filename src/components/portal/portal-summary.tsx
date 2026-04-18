import { CalendarCheck, CircleDollarSign, ListChecks, Target } from "lucide-react";
import { formatDate, formatKRW } from "@/lib/portal/formatters";

interface Props {
  contractAmount: number | null;
  progress: number;
  milestoneCompleted: number;
  milestoneTotal: number;
  endDate: string | null;
}

export function PortalSummary({
  contractAmount,
  progress,
  milestoneCompleted,
  milestoneTotal,
  endDate,
}: Props) {
  const cards = [
    {
      icon: CircleDollarSign,
      label: "계약 금액",
      value: formatKRW(contractAmount),
      sub: contractAmount === null ? "확정 전" : "VAT 포함",
    },
    {
      icon: Target,
      label: "진행률",
      value: `${progress}%`,
      sub: `마일스톤 ${milestoneCompleted}/${milestoneTotal}`,
    },
    {
      icon: ListChecks,
      label: "완료 마일스톤",
      value: `${milestoneCompleted}`,
      sub: `전체 ${milestoneTotal}개`,
    },
    {
      icon: CalendarCheck,
      label: "예정 종료",
      value: formatDate(endDate),
      sub: endDate ? "프로젝트 일정" : "일정 협의 중",
    },
  ];

  return (
    <section className="pb-12 md:pb-16" aria-labelledby="portal-summary-heading">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <h2 id="portal-summary-heading" className="sr-only">
          프로젝트 요약
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {cards.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="surface-card rounded-2xl p-5 shadow-ambient"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                {label}
              </p>
              <p
                className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-3xl"
                style={{ wordBreak: "keep-all" }}
              >
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
