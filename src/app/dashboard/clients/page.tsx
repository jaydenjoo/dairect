import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getClients } from "./actions";
import { ClientCreateDialog } from "./client-create-dialog";
import { Users } from "lucide-react";

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

function formatKRW(amount: number): string {
  if (amount === 0) return "—";
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
}

export default async function ClientsPage() {
  const clientList = await getClients();

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
        <ClientCreateDialog />
      </div>

      {clientList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
            <Users className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-medium text-foreground">아직 등록된 고객이 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              첫 고객을 등록해보세요
            </p>
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
                <tr
                  key={client.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
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
                    {formatKRW(client.totalRevenue)}
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
