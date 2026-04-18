import { FileText } from "lucide-react";
import {
  estimateStatusLabel,
  formatDate,
  formatKRW,
} from "@/lib/portal/formatters";

interface Estimate {
  id: string;
  estimateNumber: string;
  title: string;
  status: string;
  totalAmount: number | null;
  validUntil: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
}

interface Props {
  estimates: Estimate[];
}

function estimateToneClass(status: string): string {
  switch (status) {
    case "accepted":
      return "bg-emerald-500/10 text-emerald-700";
    case "rejected":
      return "bg-rose-500/10 text-rose-700";
    case "expired":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-primary/10 text-primary";
  }
}

export function PortalEstimates({ estimates }: Props) {
  if (estimates.length === 0) return null;

  return (
    <section className="pb-12 md:pb-16">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="mb-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
            견적서
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            프로젝트에 대한 견적 이력입니다. 상세 PDF는 담당 PM에게 요청해주세요.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {estimates.map((est) => (
            <article
              key={est.id}
              className="surface-card rounded-2xl p-5 shadow-ambient"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    estimateToneClass(est.status),
                  ].join(" ")}
                >
                  {estimateStatusLabel(est.status)}
                </span>
              </div>
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                {est.estimateNumber}
              </p>
              <h3
                className="mt-1 font-semibold text-foreground"
                style={{ wordBreak: "keep-all" }}
              >
                {est.title}
              </h3>
              <p className="mt-2 font-heading text-xl font-extrabold tracking-tight text-foreground">
                {formatKRW(est.totalAmount)}
              </p>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                {est.sentAt && (
                  <div className="flex justify-between gap-3">
                    <dt>발송일</dt>
                    <dd className="font-mono">{formatDate(est.sentAt)}</dd>
                  </div>
                )}
                {est.acceptedAt && (
                  <div className="flex justify-between gap-3">
                    <dt>승인일</dt>
                    <dd className="font-mono">{formatDate(est.acceptedAt)}</dd>
                  </div>
                )}
                {est.validUntil && (
                  <div className="flex justify-between gap-3">
                    <dt>유효기한</dt>
                    <dd className="font-mono">{formatDate(est.validUntil)}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
