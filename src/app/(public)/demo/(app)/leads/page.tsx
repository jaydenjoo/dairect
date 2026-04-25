import type { Metadata } from "next";
import { DEMO_LEADS, DEMO_LEAD_STATS, type DemoLead } from "@/lib/demo/leads-data";

export const metadata: Metadata = {
  title: "리드",
};

const STATUS_LABELS: Record<DemoLead["status"], { label: string; cls: string }> = {
  contacted: { label: "접촉", cls: "bg-[rgba(20,20,20,0.06)] text-[#141414] border-[#141414]/20" },
  qualified: { label: "적합", cls: "bg-[rgba(255,184,0,0.12)] text-[#141414] border-[#FFB800]" },
  converted: { label: "전환", cls: "bg-[rgba(34,139,69,0.10)] text-[#1F5C2F] border-[#1F5C2F]/40" },
  lost: { label: "이탈", cls: "bg-[rgba(200,90,59,0.08)] text-[#8B4A36] border-[#C85A3B]/30" },
};

const CHANNEL_LABEL: Record<DemoLead["channel"], string> = {
  kakao: "카카오",
  email: "이메일",
  phone: "전화",
  referral: "소개",
};

export default function DemoLeadsPage() {
  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">리드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            지난 6개월간 인입된 리드 {DEMO_LEAD_STATS.total}건
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          {(["contacted", "qualified", "converted", "lost"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${
                s === "contacted" ? "bg-[#141414]" :
                s === "qualified" ? "bg-[#FFB800]" :
                s === "converted" ? "bg-[#1F5C2F]" : "bg-[#C85A3B]"
              }`} />
              <span className="text-muted-foreground">
                {STATUS_LABELS[s].label} {DEMO_LEAD_STATS[s]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">회사 / 담당자</th>
              <th className="px-4 py-3 text-left">채널</th>
              <th className="px-4 py-3 text-left">예산</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-left">메모</th>
              <th className="px-4 py-3 text-right">인입</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {DEMO_LEADS.map((lead) => (
              <tr key={lead.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{lead.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{lead.company}</div>
                  <div className="text-xs text-muted-foreground">{lead.contact}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {CHANNEL_LABEL[lead.channel]}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{lead.budget}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_LABELS[lead.status].cls}`}
                  >
                    {STATUS_LABELS[lead.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px] truncate">
                  {lead.note}
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                  {lead.daysAgo}일 전
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        💡 데모 데이터입니다. 실제 계정에서는 랜딩 문의·이메일·카카오 채팅이 자동으로 리드로 인입되어 칸반 보드에서 관리됩니다.
      </p>
    </div>
  );
}
