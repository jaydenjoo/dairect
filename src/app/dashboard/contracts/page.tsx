import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getContracts } from "./actions";
import {
  contractStatusLabels,
  contractStatusColors,
  type ContractStatus,
} from "@/lib/validation/contracts";
import { FileSignature, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "계약서 관리",
};

function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  if (amount === 0) return "0원";
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
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

export default async function ContractsPage() {
  const contractList = await getContracts();

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            계약서 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {contractList.length}개 계약서
          </p>
        </div>
        <Link
          href="/dashboard/contracts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          새 계약서
        </Link>
      </div>

      {contractList.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileSignature className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            아직 계약서가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            수락된 견적서로 계약서를 작성하세요
          </p>
          <Link
            href="/dashboard/contracts/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            새 계약서
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/50 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  계약번호
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  견적 제목
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  고객
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  상태
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  계약금액
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  서명일
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  작성일
                </th>
              </tr>
            </thead>
            <tbody>
              {contractList.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/30 transition-colors last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {c.contractNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/contracts/${c.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {c.estimateTitle ?? "—"}
                    </Link>
                    {c.estimateNumber && (
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {c.estimateNumber}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.clientName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        contractStatusColors[c.status as ContractStatus] ??
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {contractStatusLabels[c.status as ContractStatus] ??
                        c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatKRW(c.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(c.signedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(c.createdAt)}
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
