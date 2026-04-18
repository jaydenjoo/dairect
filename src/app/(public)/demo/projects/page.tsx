import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getDemoData } from "@/lib/demo/sample-data";
import { projectStatusLabels, projectStatusSchema, type ProjectStatus } from "@/lib/validation/projects";
import { formatKRWLong } from "@/lib/utils/format";
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

/**
 * /demo/projects — 대시보드 프로젝트 목록(`/dashboard/projects`)의 데모 버전.
 *
 * 데모는 읽기 전용 — 생성 다이얼로그/Kanban 토글 제외. 테이블 뷰만 렌더.
 * 프로젝트 행 클릭 시 상세 페이지는 M5에서 구현 예정 (현재는 비활성화 행).
 */
export default function DemoProjectsPage() {
  const sample = getDemoData();

  const clientNameById = new Map(sample.clients.map((c) => [c.id, c.companyName]));

  // 프로젝트별 마일스톤 완료/전체 집계 (단일 패스)
  const milestoneStatsByProjectId = new Map<string, { completed: number; total: number }>();
  for (const m of sample.milestones) {
    const stats = milestoneStatsByProjectId.get(m.projectId) ?? { completed: 0, total: 0 };
    stats.total += 1;
    if (m.isCompleted) stats.completed += 1;
    milestoneStatsByProjectId.set(m.projectId, stats);
  }

  const projectList = sample.projects
    .filter((p) => !p.deletedAt)
    .map((p) => {
      const stats = milestoneStatsByProjectId.get(p.id) ?? { completed: 0, total: 0 };
      return {
        ...p,
        clientName: p.clientId ? clientNameById.get(p.clientId) ?? null : null,
        milestoneCompleted: stats.completed,
        milestoneTotal: stats.total,
      };
    });

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
                  <tr key={project.id}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">
                        {project.name}
                      </span>
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
                      {formatKRWLong(project.contractAmount ?? project.expectedAmount)}
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
