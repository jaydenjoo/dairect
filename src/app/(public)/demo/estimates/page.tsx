import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DemoSafeButton } from "@/lib/demo/guard";
import { getDemoData } from "@/lib/demo/sample-data";
import { formatKRWLong } from "@/lib/utils/format";
import {
  estimateStatusLabels,
  estimateStatusColors,
  type EstimateStatus,
} from "@/lib/validation/estimates";
import { FileText, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "견적서 관리",
};

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * /demo/estimates — 견적서 목록 (Task 4-1 M5)
 *
 * 데모는 읽기 전용 — "새 견적서" 버튼은 `DemoSafeButton`으로 토스트 안내.
 * 목록 행 클릭 시 `/demo/estimates/[id]` 상세로 이동.
 */
export default function DemoEstimatesPage() {
  const sample = getDemoData();
  const clientNameById = new Map(sample.clients.map((c) => [c.id, c.companyName]));
  const projectById = new Map(sample.projects.map((p) => [p.id, p]));

  const estimateList = sample.estimates.map((e) => ({
    ...e,
    clientName: e.clientId ? clientNameById.get(e.clientId) ?? null : null,
    projectName: e.projectId ? projectById.get(e.projectId)?.name ?? null : null,
  }));

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            견적서 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {estimateList.length}개 견적서
          </p>
        </div>
        <DemoSafeButton
          intent="새 견적서 생성"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          새 견적서
        </DemoSafeButton>
      </div>

      {estimateList.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            아직 견적서가 없습니다
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-ambient">
          <table className="w-full text-sm">
            <thead>
              <tr className="surface-low">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  번호
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  제목
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  고객
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  상태
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  총액
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  유효기한
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  작성일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {estimateList.map((est) => (
                <tr key={est.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {est.estimateNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/demo/estimates/${est.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {est.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {est.clientName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        estimateStatusColors[est.status as EstimateStatus] ??
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {estimateStatusLabels[est.status as EstimateStatus] ?? est.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatKRWLong(est.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(est.validUntil)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(est.createdAt)}
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
