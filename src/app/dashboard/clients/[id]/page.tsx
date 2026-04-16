import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Badge } from "@/components/ui/badge";
import { getClient as getClientRaw, getClientProjects, getClientNotes } from "../actions";
import { ClientNotes } from "./client-notes";
import { ArrowLeft, Building2, Mail, Phone, FolderKanban } from "lucide-react";

// [MEDIUM 8] React cache로 generateMetadata + page 간 중복 호출 제거
const getClient = cache(getClientRaw);

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClient(id);
  return { title: client?.companyName ?? "고객 상세" };
}

const statusLabels: Record<string, string> = {
  prospect: "잠재",
  active: "활성",
  completed: "완료",
  returning: "재계약",
};

const projectStatusLabels: Record<string, string> = {
  lead: "리드",
  consulting: "상담",
  estimate: "견적",
  contract: "계약",
  in_progress: "진행",
  review: "검수",
  completed: "완료",
  warranty: "하자보수",
  closed: "종료",
  cancelled: "취소",
  failed: "실패",
};

function formatKRW(amount: number | null): string {
  if (!amount) return "—";
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [client, clientProjects, notes] = await Promise.all([
    getClient(id),
    getClientProjects(id),
    getClientNotes(id),
  ]);

  if (!client) notFound();

  return (
    <div className="py-10">
      {/* 뒤로가기 + 제목 */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        고객 목록
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {client.companyName}
        </h1>
        <Badge variant="secondary">
          {statusLabels[client.status ?? "prospect"]}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* 고객 정보 카드 */}
        <div className="rounded-xl bg-card p-6 shadow-ambient lg:col-span-1">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            고객 정보
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {client.contactName && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <dd className="text-foreground">{client.contactName}</dd>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <dd className="text-foreground">{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <dd className="text-foreground">{client.phone}</dd>
              </div>
            )}
            {client.memo && (
              <div className="mt-4 rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">메모</p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {client.memo}
                </p>
              </div>
            )}
          </dl>
        </div>

        {/* 프로젝트 히스토리 + 메모 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 프로젝트 히스토리 */}
          <div className="rounded-xl bg-card p-6 shadow-ambient">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              프로젝트 히스토리
            </h2>
            {clientProjects.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
                <FolderKanban className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  연결된 프로젝트가 없습니다
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {clientProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {project.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {project.startDate ?? "—"} ~ {project.endDate ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {formatKRW(project.contractAmount)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {projectStatusLabels[project.status ?? "lead"]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 소통 메모 */}
          <div className="rounded-xl bg-card p-6 shadow-ambient">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              소통 메모
            </h2>
            <div className="mt-4">
              <ClientNotes clientId={id} initialNotes={notes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
