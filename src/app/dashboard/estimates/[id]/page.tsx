import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getEstimate, getUserCompanyInfo } from "../actions";
import {
  estimateStatusLabels,
  estimateStatusColors,
  type EstimateStatus,
} from "@/lib/validation/estimates";
import { EstimateActions } from "./estimate-actions";
import { PdfButtons } from "./pdf-buttons";
import type { EstimatePdfData } from "@/lib/pdf/estimate-pdf";
import { ArrowLeft, Calendar, FileText, User } from "lucide-react";

export const metadata: Metadata = {
  title: "견적서 상세",
};

function formatKRW(amount: number | null): string {
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

export default async function EstimateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [estimate, company] = await Promise.all([
    getEstimate(id),
    getUserCompanyInfo(),
  ]);

  if (!estimate) notFound();

  const status = estimate.status as EstimateStatus;

  const pdfData: EstimatePdfData = {
    estimateNumber: estimate.estimateNumber,
    title: estimate.title,
    validUntil: estimate.validUntil,
    createdAt: estimate.createdAt,
    clientName: estimate.clientName,
    projectName: estimate.projectName,
    supplyAmount: estimate.supplyAmount,
    taxAmount: estimate.taxAmount,
    totalAmount: estimate.totalAmount,
    totalDays: estimate.totalDays,
    notes: estimate.notes,
    items: estimate.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      manDays: item.manDays,
      difficulty: item.difficulty,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    paymentSplit: estimate.paymentSplit,
  };

  return (
    <div className="py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/estimates"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            견적서 목록
          </Link>
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
            {estimate.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono">{estimate.estimateNumber}</span>
            <Badge
              variant="secondary"
              className={estimateStatusColors[status] ?? "bg-gray-100 text-gray-700"}
            >
              {estimateStatusLabels[status] ?? status}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <PdfButtons estimate={pdfData} company={company} />
          {status === "accepted" && (
            <Link
              href={`/dashboard/contracts/new?estimateId=${estimate.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <FileText className="h-3.5 w-3.5" />
              계약서 생성
            </Link>
          )}
          <EstimateActions id={estimate.id} status={status} />
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">고객</p>
            <p className="font-medium text-foreground">
              {estimate.clientName ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">프로젝트</p>
            <p className="font-medium text-foreground">
              {estimate.projectName ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">유효기한</p>
            <p className="font-medium text-foreground">
              {formatDate(estimate.validUntil)}
            </p>
          </div>
        </div>
      </div>

      {/* 항목 테이블 */}
      <section className="mt-8 rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">견적 항목</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">
                  #
                </th>
                <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">
                  항목명
                </th>
                <th className="pb-3 pr-4 text-right font-medium text-muted-foreground">
                  M/D
                </th>
                <th className="pb-3 pr-4 text-right font-medium text-muted-foreground">
                  난이도
                </th>
                <th className="pb-3 pr-4 text-right font-medium text-muted-foreground">
                  단가
                </th>
                <th className="pb-3 pr-4 text-right font-medium text-muted-foreground">
                  수량
                </th>
                <th className="pb-3 text-right font-medium text-muted-foreground">
                  소계
                </th>
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-border/30 last:border-0"
                >
                  <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {item.manDays}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    x{item.difficulty}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatKRW(item.unitPrice)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums">
                    {formatKRW(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 금액 요약 + 수금 비율 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">금액 요약</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">총 공수</dt>
              <dd className="font-medium tabular-nums">{estimate.totalDays} M/D</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">공급가액</dt>
              <dd className="font-medium tabular-nums">
                {formatKRW(estimate.supplyAmount)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">부가세 (10%)</dt>
              <dd className="font-medium tabular-nums">
                {formatKRW(estimate.taxAmount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border/50 pt-3">
              <dt className="font-semibold text-foreground">합계</dt>
              <dd className="text-lg font-bold tabular-nums text-primary">
                {formatKRW(estimate.totalAmount)}
              </dd>
            </div>
          </dl>
        </section>

        {estimate.paymentSplit.length > 0 && (
          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">수금 비율</h2>
            <div className="mt-4 space-y-3 text-sm">
              {estimate.paymentSplit.map((split, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{split.label}</span>
                  <div className="text-right">
                    <span className="font-medium tabular-nums">
                      {split.percentage}%
                    </span>
                    <span className="ml-3 text-muted-foreground tabular-nums">
                      {formatKRW(
                        Math.round(
                          (estimate.totalAmount ?? 0) * split.percentage / 100,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 비고 */}
      {estimate.notes && (
        <section className="mt-6 rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">비고</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {estimate.notes}
          </p>
        </section>
      )}
    </div>
  );
}
