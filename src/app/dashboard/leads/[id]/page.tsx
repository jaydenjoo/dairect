import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getLead } from "../actions";
import {
  leadSourceLabels,
  leadStatusLabels,
  type LeadSource,
  type LeadStatus,
} from "@/lib/validation/leads";
import { StatusTransitionForm } from "./status-transition-form";
import { ConvertToProjectButton } from "./convert-to-project-button";
import { DeleteLeadButton } from "./delete-lead-button";

export const metadata: Metadata = {
  title: "리드 상세",
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
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const statusKey = lead.status as LeadStatus | null;
  const sourceKey = lead.source as LeadSource | null;
  const statusLabel = statusKey ? leadStatusLabels[statusKey] : "—";
  const sourceLabel = sourceKey ? leadSourceLabels[sourceKey] : "—";
  const statusClass = statusKey ? statusColors[statusKey] : "bg-muted text-muted-foreground";

  return (
    <div className="py-10">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        리드 목록
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {lead.name}
            </h1>
            <Badge variant="secondary" className={statusClass}>
              {statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {sourceLabel} · 등록 {formatDate(lead.createdAt)}
          </p>
        </div>
        <DeleteLeadButton
          leadId={lead.id}
          disabled={!!lead.convertedToProjectId}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-card p-6 shadow-ambient">
            <h2 className="text-sm font-semibold text-foreground">기본 정보</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="이메일" value={lead.email} />
              <InfoRow label="전화" value={lead.phone} />
              <InfoRow label="프로젝트 유형" value={lead.projectType} />
              <InfoRow label="예산" value={lead.budgetRange} />
            </dl>
            {lead.description && (
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">메모</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                  {lead.description}
                </dd>
              </div>
            )}
            {lead.failReason && statusKey === "failed" && (
              <div className="mt-4 rounded-lg bg-red-50/60 p-3">
                <dt className="text-xs text-red-700">실패 사유</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-red-900">
                  {lead.failReason}
                </dd>
              </div>
            )}
          </div>

          {lead.convertedToProjectId && (
            <div className="rounded-xl bg-primary/5 p-6">
              <h2 className="text-sm font-semibold text-foreground">전환된 프로젝트</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                이 리드는 프로젝트로 전환되었습니다.
              </p>
              <Link
                href={`/dashboard/projects/${lead.convertedToProjectId}`}
                className={`${buttonVariants({ variant: "secondary", size: "sm" })} mt-3`}
              >
                프로젝트 보기
              </Link>
            </div>
          )}
        </section>

        {/* 액션 패널 */}
        <aside className="space-y-6">
          <div className="rounded-xl bg-card p-6 shadow-ambient">
            <h2 className="text-sm font-semibold text-foreground">상태 변경</h2>
            <div className="mt-4">
              <StatusTransitionForm
                leadId={lead.id}
                currentStatus={statusKey ?? "new"}
                currentFailReason={lead.failReason ?? ""}
              />
            </div>
          </div>

          {!lead.convertedToProjectId && (
            <div className="rounded-xl bg-card p-6 shadow-ambient">
              <h2 className="text-sm font-semibold text-foreground">프로젝트 전환</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                리드를 프로젝트로 전환하면 고객과 프로젝트가 자동 생성되고 상태가 “계약”으로 바뀝니다.
              </p>
              <div className="mt-4">
                <ConvertToProjectButton leadId={lead.id} />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground/90">{value || "—"}</dd>
    </div>
  );
}
