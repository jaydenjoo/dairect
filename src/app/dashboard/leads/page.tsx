import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Users2 } from "lucide-react";
import { getLeads } from "./actions";
import {
  leadSourceLabels,
  leadStatusLabels,
  leadSourceSchema,
  leadStatusSchema,
  type LeadStatus,
} from "@/lib/validation/leads";
import { LeadsFilter } from "./leads-filter";
import { NewLeadDialog } from "./new-lead-dialog";

export const metadata: Metadata = {
  title: "리드 CRM",
};

const statusColors: Record<LeadStatus, string> = {
  new: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-50 text-blue-700",
  consulted: "bg-indigo-50 text-indigo-700",
  estimated: "bg-violet-50 text-violet-700",
  contracted: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
};

function formatDate(value: Date | string | null): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

interface PageProps {
  searchParams: Promise<{ source?: string; status?: string; q?: string }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sourceFilter = leadSourceSchema.safeParse(params.source).success ? params.source : undefined;
  const statusFilter = leadStatusSchema.safeParse(params.status).success ? params.status : undefined;
  const q = params.q?.slice(0, 100);

  const list = await getLeads({ source: sourceFilter, status: statusFilter, q });

  return (
    <div className="py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            리드 CRM
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.length}개 리드
          </p>
        </div>
        <NewLeadDialog />
      </div>

      <div className="mt-6">
        <LeadsFilter initialSource={sourceFilter} initialStatus={statusFilter} initialQ={q} />
      </div>

      {list.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
            <Users2 className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {sourceFilter || statusFilter || q ? "조건에 맞는 리드가 없습니다" : "아직 리드가 없습니다"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              랜딩 폼 문의가 들어오거나 직접 등록하면 여기에 표시됩니다
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-ambient">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="surface-low">
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">이름</th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">소스</th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">상태</th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">연락처</th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">프로젝트 유형</th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">예산</th>
                  <th className="px-6 py-3.5 text-right font-medium text-muted-foreground">등록일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((lead) => {
                  const statusKey = lead.status as LeadStatus | null;
                  const statusLabel = statusKey ? leadStatusLabels[statusKey] : "—";
                  const statusClass = statusKey ? statusColors[statusKey] : "bg-muted text-muted-foreground";
                  const sourceLabel = lead.source ? leadSourceLabels[lead.source] : "—";
                  return (
                    <tr key={lead.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {lead.name}
                        </Link>
                        {lead.convertedToProjectId && (
                          <span className="ml-2 text-[10px] font-medium text-primary/70">
                            → 전환됨
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{sourceLabel}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={statusClass}>
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {lead.email || lead.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {lead.projectType || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {lead.budgetRange || "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
