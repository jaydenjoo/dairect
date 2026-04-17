import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getInvoices } from "./actions";
import {
  invoiceStatusLabels,
  invoiceStatusColors,
  invoiceTypeLabels,
} from "@/lib/validation/invoices";
import { Receipt, Plus, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "청구서 관리",
};

function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  if (amount === 0) return "0원";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function InvoicesPage() {
  const invoiceList = await getInvoices();

  const stats = invoiceList.reduce(
    (acc, inv) => {
      if (inv.status === "paid") acc.paid += inv.totalAmount;
      else if (inv.status !== "cancelled") acc.outstanding += inv.totalAmount;
      if (inv.isOverdue) acc.overdueCount += 1;
      return acc;
    },
    { paid: 0, outstanding: 0, overdueCount: 0 },
  );

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            청구서 · 정산
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invoiceList.length}건 · 미수금 {formatKRW(stats.outstanding)}
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          새 청구서
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-card p-5">
          <p className="text-xs text-muted-foreground">입금 완료</p>
          <p className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
            {formatKRW(stats.paid)}
          </p>
        </div>
        <div className="rounded-xl bg-card p-5">
          <p className="text-xs text-muted-foreground">미수금</p>
          <p className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
            {formatKRW(stats.outstanding)}
          </p>
        </div>
        <div className="rounded-xl bg-card p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {stats.overdueCount > 0 && (
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            )}
            연체
          </p>
          <p
            className={`mt-1 font-heading text-xl font-semibold tabular-nums ${
              stats.overdueCount > 0 ? "text-red-600" : "text-foreground"
            }`}
          >
            {stats.overdueCount}건
          </p>
        </div>
      </div>

      {invoiceList.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            아직 청구서가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            수락된 견적서를 3분할 청구서로 자동 생성하거나 직접 작성하세요
          </p>
          <Link
            href="/dashboard/invoices/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            새 청구서
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/50 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  청구번호
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  프로젝트 / 고객
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  구분
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  상태
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  합계
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  지급기한
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  발행일
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceList.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {inv.projectName ?? "—"}
                    </Link>
                    {inv.clientName && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {inv.clientName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {invoiceTypeLabels[inv.type]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className={invoiceStatusColors[inv.status]}
                      >
                        {invoiceStatusLabels[inv.status]}
                      </Badge>
                      {inv.isOverdue && (
                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-red-700"
                        >
                          연체
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatKRW(inv.totalAmount)}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      inv.isOverdue
                        ? "font-medium text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(inv.issuedDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
