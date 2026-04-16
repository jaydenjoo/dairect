import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getProjects, getClientsForSelect } from "./actions";
import { ProjectCreateDialog } from "./project-create-dialog";
import { ViewToggle } from "./view-toggle";
import { KanbanView } from "./kanban-view";
import { projectStatusLabels, projectStatusSchema, type ProjectStatus } from "@/lib/validation/projects";
import { FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "프로젝트",
};

const statusColors: Record<string, string> = {
  lead: "bg-muted text-muted-foreground",
  consulting: "bg-blue-50 text-blue-700",
  estimate: "bg-indigo-50 text-indigo-700",
  contract: "bg-violet-50 text-violet-700",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-amber-50 text-amber-700",
  completed: "bg-green-50 text-green-700",
  warranty: "bg-orange-50 text-orange-700",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-red-50 text-red-600",
  failed: "bg-red-50 text-red-600",
};

function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  if (amount === 0) return "0원";
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
}

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  const isKanban = view === "kanban";

  const [projectList, clientOptions] = await Promise.all([
    getProjects(),
    getClientsForSelect(),
  ]);

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            프로젝트
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projectList.length}개 프로젝트
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-9 w-[156px] rounded-lg bg-muted" />}>
            <ViewToggle />
          </Suspense>
          <ProjectCreateDialog clientOptions={clientOptions} />
        </div>
      </div>

      {projectList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
            <FolderKanban className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-medium text-foreground">아직 프로젝트가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              첫 프로젝트를 생성해보세요
            </p>
          </div>
        </div>
      ) : isKanban ? (
        <div className="mt-6">
          <KanbanView projects={projectList} />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-ambient">
          <table className="w-full text-sm">
            <thead>
              <tr className="surface-low">
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  프로젝트명
                </th>
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  고객
                </th>
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  상태
                </th>
                <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                  기간
                </th>
                <th className="px-6 py-3.5 text-right font-medium text-muted-foreground">
                  금액
                </th>
                <th className="px-6 py-3.5 text-right font-medium text-muted-foreground">
                  진행률
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projectList.map((project) => {
                const parsed = projectStatusSchema.safeParse(project.status);
                const status: ProjectStatus = parsed.success ? parsed.data : "lead";
                const progress =
                  project.milestoneTotal > 0
                    ? Math.round((project.milestoneCompleted / project.milestoneTotal) * 100)
                    : 0;

                return (
                  <tr
                    key={project.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {project.clientName ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={statusColors[status]}>
                        {projectStatusLabels[status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {project.startDate ?? "—"} ~ {project.endDate ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      {formatKRW(project.contractAmount ?? project.expectedAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {project.milestoneTotal > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {project.milestoneCompleted}/{project.milestoneTotal}{" "}
                          <span className="font-medium text-foreground">({progress}%)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
