import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DemoSafeButton } from "@/lib/demo/guard";
import { getDemoData } from "@/lib/demo/sample-data";
import {
  estimateStatusLabels,
  estimateStatusColors,
  type EstimateStatus,
} from "@/lib/validation/estimates";
import { ArrowLeft, Calendar, FileText, User, Download, Eye } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

// M5 code 리뷰(L-1): 정적 title → 동적 title로 교체 (프로젝트/고객 상세와 일관)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const estimate = getDemoData().estimates.find((e) => e.id === id);
  return { title: estimate?.title ?? "견적서 상세" };
}

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

type PaymentSplit = { label: string; percentage: number };

/**
 * /demo/estimates/[id] — 견적서 상세 (Task 4-1 M5, 옵션 A)
 *
 * 실제 `/dashboard/estimates/[id]`와 동일 레이아웃을 재현하되:
 * - PdfButtons (다운로드/미리보기) → DemoSafeButton 2개 (토스트 안내)
 * - EstimateActions (상태 변경 Select + 삭제) → DemoSafeButton "편집하기"
 * - 계약서 생성 링크 → DemoSafeButton
 * PDF 번들(@react-pdf/renderer) 의존성을 데모에서 완전히 제외.
 */
export default async function DemoEstimateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sample = getDemoData();

  const estimate = sample.estimates.find((e) => e.id === id);
  if (!estimate) notFound();

  const items = sample.estimateItems
    .filter((it) => it.estimateId === estimate.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const clientName = sample.clients.find((c) => c.id === estimate.clientId)?.companyName ?? null;
  const projectName = estimate.projectId
    ? sample.projects.find((p) => p.id === estimate.projectId)?.name ?? null
    : null;
  const paymentSplit = (estimate.paymentSplit ?? []) as PaymentSplit[];

  const status = estimate.status as EstimateStatus;

  return (
    <div className="py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/demo/estimates"
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
            {estimate.inputMode === "ai" && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                AI 초안
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <DemoSafeButton
              intent="PDF 미리보기"
              className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              <Eye className="h-3.5 w-3.5" />
              미리보기
            </DemoSafeButton>
            <DemoSafeButton
              intent="PDF 다운로드"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-3.5 w-3.5" />
              PDF 다운로드
            </DemoSafeButton>
          </div>
          {status === "accepted" && (
            <DemoSafeButton
              intent="계약서 생성"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <FileText className="h-3.5 w-3.5" />
              계약서 생성
            </DemoSafeButton>
          )}
          <DemoSafeButton
            intent="견적서 편집"
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            편집하기
          </DemoSafeButton>
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
            <p className="font-medium text-foreground">{clientName ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">프로젝트</p>
            <p className="font-medium text-foreground">{projectName ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">유효기한</p>
            <p className="font-medium text-foreground">{formatDate(estimate.validUntil)}</p>
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
                <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">#</th>
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
                <th className="pb-3 text-right font-medium text-muted-foreground">소계</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 pr-4 text-muted-foreground">{idx + 1}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{item.manDays}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">x{item.difficulty}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatKRW(item.unitPrice)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{item.quantity}</td>
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

        {paymentSplit.length > 0 && (
          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">수금 비율</h2>
            <div className="mt-4 space-y-3 text-sm">
              {paymentSplit.map((split, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{split.label}</span>
                  <div className="text-right">
                    <span className="font-medium tabular-nums">
                      {split.percentage}%
                    </span>
                    <span className="ml-3 text-muted-foreground tabular-nums">
                      {formatKRW(
                        Math.round(
                          ((estimate.totalAmount ?? 0) * split.percentage) / 100,
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
