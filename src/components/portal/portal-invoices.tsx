import { Receipt } from "lucide-react";
import {
  formatDate,
  formatKRW,
  invoiceStatusLabel,
  invoiceTypeLabel,
} from "@/lib/portal/formatters";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  totalAmount: number;
  issuedDate: string | null;
  dueDate: string | null;
  paidDate: string | null;
}

interface Props {
  invoices: Invoice[];
}

function invoiceToneClass(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-500/10 text-emerald-700";
    case "overdue":
      return "bg-rose-500/10 text-rose-700";
    case "sent":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function PortalInvoices({ invoices }: Props) {
  if (invoices.length === 0) return null;

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
              청구서
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              발행된 청구 내역입니다. 세금계산서 발행은 담당 PM에게 요청해주세요.
            </p>
          </div>
          <div className="surface-card rounded-xl px-4 py-2 text-right shadow-ambient">
            <p className="text-[11px] font-semibold text-muted-foreground">
              입금 / 청구 합계
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
              <span className="text-emerald-700">{formatKRW(totalPaid)}</span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span>{formatKRW(totalBilled)}</span>
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="surface-card flex flex-col gap-3 rounded-xl p-5 shadow-ambient md:flex-row md:items-center md:justify-between"
            >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
                      {inv.invoiceNumber}
                    </p>
                    <p className="font-semibold text-foreground">
                      {invoiceTypeLabel(inv.type)}
                    </p>
                    <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {inv.issuedDate && (
                        <div className="flex gap-1">
                          <dt>발행</dt>
                          <dd className="font-mono">{formatDate(inv.issuedDate)}</dd>
                        </div>
                      )}
                      {inv.dueDate && (
                        <div className="flex gap-1">
                          <dt>기한</dt>
                          <dd className="font-mono">{formatDate(inv.dueDate)}</dd>
                        </div>
                      )}
                      {inv.paidDate && (
                        <div className="flex gap-1 text-emerald-700">
                          <dt>입금</dt>
                          <dd className="font-mono">{formatDate(inv.paidDate)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      invoiceToneClass(inv.status),
                    ].join(" ")}
                  >
                    {invoiceStatusLabel(inv.status)}
                  </span>
                  <p className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                    {formatKRW(inv.totalAmount)}
                  </p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
