import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Badge } from "@/components/ui/badge";
import { getProject as getProjectRaw } from "../actions";
import { getMilestones } from "./milestone-actions";
import { ProjectStatusSelect } from "../project-status-select";
import { MilestoneList } from "./milestone-list";
import { PublicProfileForm } from "./public-profile-form";
import { WeeklyReportCard } from "@/components/dashboard/weekly-report-card";
import { getCurrentWeeklyReport } from "@/lib/ai/report-actions";
import { getUserCompanyInfo } from "../../estimates/actions";
import { projectStatusLabels, projectStatusSchema, type ProjectStatus } from "@/lib/validation/projects";
import { ArrowLeft, Calendar, Banknote, Building2 } from "lucide-react";

const getProject = cache(getProjectRaw);

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project?.name ?? "프로젝트 상세" };
}

function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  if (amount === 0) return "0원";
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
}

const tabs: { key: string; label: string; disabled?: boolean }[] = [
  { key: "overview", label: "개요" },
  { key: "milestones", label: "마일스톤" },
  { key: "estimates", label: "견적", disabled: true },
  { key: "contracts", label: "계약", disabled: true },
  { key: "invoices", label: "정산", disabled: true },
  { key: "memo", label: "메모", disabled: true },
];

// weekStartDate(월요일 YYYY-MM-DD) + 6일 → 일요일. PDF 헤더에 주차 범위 표시.
function computeWeekEnd(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const validTabs = tabs.filter((t) => !t.disabled).map((t) => t.key);
  const activeTab = validTabs.includes(tab ?? "") ? tab! : "overview";

  const [project, milestoneList, weeklyReport, company] = await Promise.all([
    getProject(id),
    getMilestones(id),
    getCurrentWeeklyReport(id),
    getUserCompanyInfo(),
  ]);

  if (!project) notFound();

  const parsedStatus = projectStatusSchema.safeParse(project.status);
  const status: ProjectStatus = parsedStatus.success ? parsedStatus.data : "lead";

  const milestoneTotal = milestoneList.length;
  const milestoneCompleted = milestoneList.filter((m) => m.isCompleted).length;
  const milestoneProgress = milestoneTotal > 0
    ? Math.round((milestoneCompleted / milestoneTotal) * 100)
    : null;

  return (
    <div className="py-10">
      {/* 뒤로가기 */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        프로젝트 목록
      </Link>

      {/* 헤더 */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {project.name}
        </h1>
        <ProjectStatusSelect projectId={id} currentStatus={status} />
      </div>

      {/* 프로젝트 정보 카드 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Building2 className="h-4 w-4" />}
          label="고객"
          value={project.clientName ?? "미지정"}
        />
        <InfoCard
          icon={<Banknote className="h-4 w-4" />}
          label="금액"
          value={formatKRW(project.contractAmount ?? project.expectedAmount)}
        />
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="기간"
          value={`${project.startDate ?? "—"} ~ ${project.endDate ?? "—"}`}
        />
        <div className="rounded-xl bg-card p-5 shadow-ambient">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {projectStatusLabels[status]}
            </Badge>
            <span className="text-xs font-medium">상태</span>
          </div>
          {milestoneProgress !== null && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>진행률</span>
                <span className="font-medium text-foreground">{milestoneProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mt-10">
        <div className="flex gap-6 text-sm font-medium text-muted-foreground">
          {tabs.map((t) => (
            t.disabled ? (
              <span key={t.key} className="cursor-default text-muted-foreground/40">
                {t.label}
              </span>
            ) : (
              <Link
                key={t.key}
                href={`/dashboard/projects/${id}${t.key === "overview" ? "" : `?tab=${t.key}`}`}
                className={
                  activeTab === t.key
                    ? "text-foreground underline underline-offset-8 decoration-2 decoration-primary"
                    : "hover:text-foreground"
                }
              >
                {t.label}
                {t.key === "milestones" && milestoneTotal > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {milestoneCompleted}/{milestoneTotal}
                  </span>
                )}
              </Link>
            )
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-card p-6 shadow-ambient">
                  <h2 className="font-heading text-sm font-semibold text-foreground">
                    프로젝트 설명
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {project.description || "설명이 없습니다"}
                  </p>
                </div>
                <div className="rounded-xl bg-card p-6 shadow-ambient">
                  <h2 className="font-heading text-sm font-semibold text-foreground">
                    메모
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {project.memo || "메모가 없습니다"}
                  </p>
                </div>
              </div>

              {/* 공개 프로필 */}
              <div className="rounded-xl bg-card p-6 shadow-ambient">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-heading text-sm font-semibold text-foreground">
                      공개 프로필
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      랜딩 포트폴리오 페이지(/projects)에 노출할 내용을 설정합니다.
                    </p>
                  </div>
                  {project.isPublic && project.publicAlias && (
                    <Link
                      href={`/projects/${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      공개 페이지 열기 →
                    </Link>
                  )}
                </div>
                <PublicProfileForm
                  projectId={id}
                  initial={{
                    isPublic: project.isPublic ?? false,
                    publicAlias: project.publicAlias,
                    publicDescription: project.publicDescription,
                    publicLiveUrl: project.publicLiveUrl,
                    publicTags: project.publicTags,
                  }}
                />
              </div>

              {/* AI 주간 보고서 */}
              <WeeklyReportCard
                projectId={id}
                projectName={project.name}
                clientName={project.clientName}
                milestoneProgress={{
                  completed: milestoneCompleted,
                  total: milestoneTotal,
                  percent: milestoneProgress,
                }}
                company={company}
                initialContent={weeklyReport?.content ?? null}
                initialGeneratedAt={weeklyReport?.aiGeneratedAt ?? null}
                initialWeekStartDate={weeklyReport?.weekStartDate ?? null}
                initialWeekEndDate={
                  weeklyReport ? computeWeekEnd(weeklyReport.weekStartDate) : null
                }
              />
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="max-w-2xl rounded-xl bg-card p-6 shadow-ambient">
              <h2 className="font-heading text-sm font-semibold text-foreground">
                마일스톤
              </h2>
              <div className="mt-4">
                <MilestoneList projectId={id} initialMilestones={milestoneList} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-card p-5 shadow-ambient">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
