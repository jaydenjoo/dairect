import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getInvoice, getUserBillingInfo } from "../actions";
import {
  invoiceStatusLabels,
  invoiceStatusColors,
  invoiceTypeLabels,
  type InvoiceType,
} from "@/lib/validation/invoices";
import { InvoiceActions } from "./invoice-actions";
import { InvoicePdfButtons } from "./pdf-buttons";
import { TaxInvoiceHelper } from "./tax-invoice-helper";
import type { InvoicePdfData } from "@/lib/pdf/invoice-pdf";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  Wallet,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "청구서 상세",
};

function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [invoice, billing] = await Promise.all([
    getInvoice(id),
    getUserBillingInfo(),
  ]);

  if (!invoice) notFound();

  const pdfData: InvoicePdfData = {
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type as InvoiceType,
    amount: invoice.amount,
    taxAmount: invoice.taxAmount,
    totalAmount: invoice.totalAmount,
    issuedDate: invoice.issuedDate,
    dueDate: invoice.dueDate,
    memo: invoice.memo,
    projectName: invoice.projectName,
    clientName: invoice.clientName,
    clientContactName: invoice.clientContactName,
    clientBusinessNumber: invoice.clientBusinessNumber,
    clientAddress: invoice.clientAddress,
    estimateNumber: invoice.estimateNumber,
    estimateTitle: invoice.estimateTitle,
  };

  return (
    <div className="py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            청구서 목록
          </Link>
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
            {invoice.projectName ?? "청구서"} ·{" "}
            {invoiceTypeLabels[invoice.type as InvoiceType]}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono">{invoice.invoiceNumber}</span>
            <Badge
              variant="secondary"
              className={invoiceStatusColors[invoice.status]}
            >
              {invoiceStatusLabels[invoice.status]}
            </Badge>
            {invoice.isOverdue && (
              <Badge variant="secondary" className="bg-red-50 text-red-700">
                <AlertCircle className="mr-1 h-3 w-3" />
                연체
              </Badge>
            )}
            {invoice.estimateNumber && (
              <Link
                href={`/dashboard/estimates/${invoice.estimateId}`}
                className="font-mono text-xs text-muted-foreground hover:text-primary"
              >
                ← {invoice.estimateNumber}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <InvoicePdfButtons invoice={pdfData} company={billing} />
          <InvoiceActions
            id={invoice.id}
            status={invoice.status}
            defaultPaidAmount={invoice.totalAmount}
          />
        </div>
      </div>

      {/* 메타 카드 */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">청구 합계</p>
            <p className="font-medium tabular-nums text-foreground">
              {formatKRW(invoice.totalAmount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">지급기한</p>
            <p
              className={`font-medium ${
                invoice.isOverdue ? "text-red-600" : "text-foreground"
              }`}
            >
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">입금 내역</p>
            <p className="font-medium tabular-nums text-foreground">
              {invoice.paidAmount !== null
                ? formatKRW(invoice.paidAmount)
                : "미입금"}
            </p>
            {invoice.paidDate && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(invoice.paidDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 당사자 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            공급받는자 (고객)
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">회사명</dt>
              <dd className="font-medium">{invoice.clientName ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">담당자</dt>
              <dd className="font-medium">
                {invoice.clientContactName ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">사업자번호</dt>
              <dd className="font-medium">
                {invoice.clientBusinessNumber ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">주소</dt>
              <dd className="text-right font-medium">
                {invoice.clientAddress ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            공급자 (발행)
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">회사명</dt>
              <dd className="font-medium">{billing?.companyName ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">대표자</dt>
              <dd className="font-medium">
                {billing?.representativeName ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">사업자번호</dt>
              <dd className="font-medium">
                {billing?.businessNumber ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">연락처</dt>
              <dd className="font-medium">{billing?.businessPhone ?? "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* 금액 상세 */}
      <section className="mt-6 rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">금액 내역</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">공급가액</dt>
            <dd className="font-medium tabular-nums">
              {formatKRW(invoice.amount)}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">부가세</dt>
            <dd className="font-medium tabular-nums">
              {formatKRW(invoice.taxAmount)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-3">
            <dt className="font-semibold text-foreground">합계</dt>
            <dd className="font-heading text-lg font-semibold tabular-nums text-primary">
              {formatKRW(invoice.totalAmount)}
            </dd>
          </div>
        </dl>
      </section>

      {/* 세금계산서 도우미 */}
      <TaxInvoiceHelper
        invoiceId={invoice.id}
        issued={invoice.taxInvoiceIssued ?? false}
        clientName={invoice.clientName}
        clientBusinessNumber={invoice.clientBusinessNumber}
        supplyAmount={invoice.amount}
        taxAmount={invoice.taxAmount}
      />

      {/* 메모 */}
      {invoice.memo && (
        <section className="mt-6 rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">메모</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {invoice.memo}
          </p>
        </section>
      )}
    </div>
  );
}
