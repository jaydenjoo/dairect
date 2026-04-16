"use client";

import Link from "next/link";
import { ProjectStatusSelect } from "./project-status-select";
import {
  kanbanColumns,
  projectStatusSchema,
  type ProjectStatus,
} from "@/lib/validation/projects";

interface ProjectItem {
  id: string;
  name: string;
  status: string | null;
  expectedAmount: number | null;
  contractAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  clientName: string | null;
  milestoneTotal: number;
  milestoneCompleted: number;
}

interface KanbanViewProps {
  projects: ProjectItem[];
}

function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return "";
  if (amount === 0) return "0원";
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
}

type KanbanColumnKey = (typeof kanbanColumns)[number]["key"];

const columnColors: Record<KanbanColumnKey, string> = {
  waiting: "bg-muted/60",
  active: "bg-primary/5",
  done: "bg-green-50",
  settled: "bg-muted/40",
};

export function KanbanView({ projects }: KanbanViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kanbanColumns.map((column) => {
        const DEFAULT_STATUS = "lead";
        const columnProjects = projects.filter((p) =>
          (column.statuses as readonly string[]).includes(p.status ?? DEFAULT_STATUS),
        );

        return (
          <div key={column.key} className="flex flex-col">
            {/* 컬럼 헤더 */}
            <div className="flex items-center gap-2 px-1 pb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {column.label}
              </h3>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {columnProjects.length}
              </span>
            </div>

            {/* 카드 영역 */}
            <div
              className={`flex flex-1 flex-col gap-2.5 rounded-xl p-2.5 ${columnColors[column.key]}`}
            >
              {columnProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground/60">
                  프로젝트 없음
                </p>
              ) : (
                columnProjects.map((project) => {
                  const parsed = projectStatusSchema.safeParse(project.status);
                  const status: ProjectStatus = parsed.success ? parsed.data : "lead";
                  const amount = project.contractAmount ?? project.expectedAmount;
                  const progress =
                    project.milestoneTotal > 0
                      ? Math.round(
                          (project.milestoneCompleted / project.milestoneTotal) * 100,
                        )
                      : null;

                  return (
                    <div
                      key={project.id}
                      className="rounded-lg bg-card p-4 shadow-ambient transition-shadow hover:shadow-ambient-lg"
                    >
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {project.name}
                      </Link>

                      {project.clientName && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {project.clientName}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        {amount ? (
                          <span className="text-xs font-medium text-foreground">
                            {formatKRW(amount)}
                          </span>
                        ) : (
                          <span />
                        )}
                        {progress !== null && (
                          <span className="text-xs text-muted-foreground">
                            {progress}%
                          </span>
                        )}
                      </div>

                      {(project.startDate || project.endDate) && (
                        <p className="mt-2 text-[10px] text-muted-foreground/70">
                          {project.startDate ?? "—"} ~ {project.endDate ?? "—"}
                        </p>
                      )}

                      <div className="mt-3">
                        <ProjectStatusSelect
                          projectId={project.id}
                          currentStatus={status}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
