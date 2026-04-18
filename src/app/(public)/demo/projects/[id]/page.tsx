import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getDemoData } from "@/lib/demo/sample-data";
import { formatKRWLong } from "@/lib/utils/format";
import {
  projectStatusLabels,
  projectStatusSchema,
  type ProjectStatus,
} from "@/lib/validation/projects";
import { MilestoneListDemo } from "@/components/demo/milestone-list-demo";
import { PublicProfileDemo } from "@/components/demo/public-profile-demo";
import { WeeklyReportCta } from "@/components/demo/weekly-report-cta";
import { ArrowLeft, Calendar, Banknote, Building2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sample = getDemoData();
  const project = sample.projects.find((p) => p.id === id && !p.deletedAt);
  return { title: project?.name ?? "프로젝트 상세" };
}

const tabs: { key: string; label: string; disabled?: boolean }[] = [
  { key: "overview", label: "개요" },
  { key: "milestones", label: "마일스톤" },
  { key: "estimates", label: "견적", disabled: true },
  { key: "contracts", label: "계약", disabled: true },
  { key: "invoices", label: "정산", disabled: true },
  { key: "memo", label: "메모", disabled: true },
];

/**
 * /demo/projects/[id] — 프로젝트 상세 (Task 4-1 M5, 옵션 A)
 *
 * 실제 `/dashboard/projects/[id]`와 동일한 구조·탭·섹션을 재현하되, CRUD는 모두 가드:
 * - 상태 Select → Badge (읽기 전용)
 * - 공개 프로필 편집 Form → 표시 전용 + "편집하기" DemoSafeButton
 * - AI 주간 보고서 → 로그인 CTA 정적 카드
 * - 마일스톤 CRUD → DemoSafeButton/Form 래핑
 */
export default async function DemoProjectDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const validTabs = tabs.filter((t) => !t.disabled).map((t) => t.key);
  const activeTab = validTabs.includes(tab ?? "") ? tab! : "overview";

  const sample = getDemoData();
  const project = sample.projects.find((p) => p.id === id && !p.deletedAt);
  if (!project) notFound();

  const clientName = project.clientId
    ? sample.clients.find((c) => c.id === project.clientId)?.companyName ?? null
    : null;

  const milestoneList = sample.milestones
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({ ...m, isCompleted: m.isCompleted ?? false }));

  const milestoneTotal = milestoneList.length;
  const milestoneCompleted = milestoneList.filter((m) => m.isCompleted).length;
  const milestoneProgress =
    milestoneTotal > 0 ? Math.round((milestoneCompleted / milestoneTotal) * 100) : null;

  const parsedStatus = projectStatusSchema.safeParse(project.status);
  const status: ProjectStatus = parsedStatus.success ? parsedStatus.data : "lead";

  return (
    <div className="py-10">
      {/* 뒤로가기 */}
      <Link
        href="/demo/projects"
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
        <Badge variant="secondary" className="text-xs">
          {projectStatusLabels[status]}
        </Badge>
      </div>

      {/* 프로젝트 정보 카드 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Building2 className="h-4 w-4" />}
          label="고객"
          value={clientName ?? "미지정"}
        />
        <InfoCard
          icon={<Banknote className="h-4 w-4" />}
          label="금액"
          value={formatKRWLong(project.contractAmount ?? project.expectedAmount)}
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
          {tabs.map((t) =>
            t.disabled ? (
              <span key={t.key} className="cursor-default text-muted-foreground/40">
                {t.label}
              </span>
            ) : (
              <Link
                key={t.key}
                href={`/demo/projects/${id}${t.key === "overview" ? "" : `?tab=${t.key}`}`}
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
            ),
          )}
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
                    {/* M5 보안 리뷰(M-1): 비공개 프로젝트의 내부 메모는 PM 전용. 데모에서도
                        "소유자만 확인" 문구로 대체해 올바른 멘탈 모델 전달 */}
                    {project.isPublic
                      ? project.memo || "메모가 없습니다"
                      : "프로젝트 소유자만 확인할 수 있는 내부 메모입니다 (실 계정에서 제공)"}
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
                </div>
                <PublicProfileDemo
                  initial={{
                    isPublic: project.isPublic ?? false,
                    publicAlias: project.publicAlias,
                    publicDescription: project.publicDescription,
                    publicLiveUrl: project.publicLiveUrl,
                    publicTags: project.publicTags,
                  }}
                />
              </div>

              {/* AI 주간 보고서 — 정적 CTA */}
              <WeeklyReportCta />
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="max-w-2xl rounded-xl bg-card p-6 shadow-ambient">
              <h2 className="font-heading text-sm font-semibold text-foreground">
                마일스톤
              </h2>
              <div className="mt-4">
                <MilestoneListDemo initialMilestones={milestoneList} />
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
