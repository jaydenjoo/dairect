import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DemoSafeButton } from "@/lib/demo/guard";
import { getDemoData } from "@/lib/demo/sample-data";
import { formatKRWLong } from "@/lib/utils/format";
import { Users, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "고객",
};

const statusLabels: Record<string, string> = {
  prospect: "잠재",
  active: "활성",
  completed: "완료",
  returning: "재계약",
};

const statusColors: Record<string, string> = {
  prospect: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  completed: "bg-green-50 text-green-700",
  returning: "bg-amber-50 text-amber-700",
};

/**
 * /demo/clients — 고객 목록 (Task 4-1 M5)
 *
 * `getClients()` 쿼리가 `projectCount`/`totalRevenue`를 조인해 계산하던 것을 샘플로 재현:
 * - projectCount: projects 중 clientId === client.id 카운트
 * - totalRevenue: 해당 client의 모든 invoice.paid 합
 *
 * "새 고객" 버튼은 DemoSafeButton으로 토스트 안내.
 */
export default function DemoClientsPage() {
  const sample = getDemoData();

  const projectCountByClient = new Map<string, number>();
  for (const p of sample.projects) {
    if (p.deletedAt || !p.clientId) continue;
    projectCountByClient.set(p.clientId, (projectCountByClient.get(p.clientId) ?? 0) + 1);
  }

  // 원본 `getClients()`는 `SUM(projects.contractAmount)` — 즉 "계약 체결된 예상 매출 총합"
  // (미입금 포함). M5 code 리뷰(M-1) 반영: 데모도 동일 의미로 맞춰 로그인 전/후 숫자 일관.
  const revenueByClient = new Map<string, number>();
  for (const p of sample.projects) {
    if (p.deletedAt || !p.clientId || !p.contractAmount) continue;
    revenueByClient.set(
      p.clientId,
      (revenueByClient.get(p.clientId) ?? 0) + p.contractAmount,
    );
  }

  const clientList = sample.clients.map((c) => ({
    ...c,
    projectCount: projectCountByClient.get(c.id) ?? 0,
    totalRevenue: revenueByClient.get(c.id) ?? 0,
  }));

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            고객
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clientList.length}개 고객사
          </p>
        </div>
        <DemoSafeButton
          intent="새 고객 등록"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          새 고객
        </DemoSafeButton>
      </div>

      {clientList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
            <Users className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-medium text-foreground">아직 등록된 고객이 없습니다</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-ambient">
          <table className="w-full text-sm">
            <thead>
              <tr className="surface-low">
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  회사명
                </th>
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  담당자
                </th>
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  상태
                </th>
                <th className="px-6 py-3.5 text-right font-medium text-muted-foreground">
                  프로젝트
                </th>
                <th className="px-6 py-3.5 text-right font-medium text-muted-foreground">
                  총 매출
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientList.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <Link
                      href={`/demo/clients/${client.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {client.companyName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {client.contactName ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[client.status ?? "prospect"]}
                    >
                      {statusLabels[client.status ?? "prospect"]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {client.projectCount}건
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">
                    {client.totalRevenue > 0
                      ? formatKRWLong(client.totalRevenue)
                      : "—"}
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
