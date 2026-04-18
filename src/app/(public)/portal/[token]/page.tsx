import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalEstimates } from "@/components/portal/portal-estimates";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalInvoices } from "@/components/portal/portal-invoices";
import { PortalMilestones } from "@/components/portal/portal-milestones";
import { PortalSummary } from "@/components/portal/portal-summary";
import { PortalUrlScrub } from "@/components/portal/portal-url-scrub";
import { computeProgress } from "@/lib/portal/formatters";
import { getPortalProjectBundle } from "@/lib/portal/queries";
import { validatePortalToken } from "@/lib/portal/token";

// 토큰별 개별 데이터 — 캐시 금지. 매 요청마다 토큰 유효성/프로젝트 상태 재검증.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 프로젝트명 인덱싱 방지 — 포털 페이지는 항상 generic title만 노출.
export const metadata: Metadata = {
  title: "고객 포털",
};

type RouteParams = { token: string };

export default async function PortalTokenPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { token } = await params;

  const payload = await validatePortalToken(token);
  if (!payload) redirect("/portal/invalid");

  const bundle = await getPortalProjectBundle(payload.projectId);
  // 토큰은 유효하지만 프로젝트가 soft-delete된 극단 케이스.
  if (!bundle) redirect("/portal/invalid");

  const completedCount = bundle.milestones.filter((m) => m.isCompleted).length;
  const progress = computeProgress(
    bundle.milestones.length,
    completedCount,
    bundle.project.status,
  );

  return (
    <>
      <PortalUrlScrub />
      <PortalHeader
        projectName={bundle.project.name}
        projectStatus={bundle.project.status}
        clientCompanyName={bundle.client.companyName}
        clientContactName={bundle.client.contactName}
        pmCompanyName={bundle.manager.companyName}
        pmRepresentativeName={bundle.manager.representativeName}
        pmBusinessEmail={bundle.manager.businessEmail}
      />
      <PortalSummary
        contractAmount={bundle.project.contractAmount}
        progress={progress}
        milestoneCompleted={completedCount}
        milestoneTotal={bundle.milestones.length}
        endDate={bundle.project.endDate}
      />
      <PortalMilestones milestones={bundle.milestones} progress={progress} />
      <PortalEstimates estimates={bundle.estimates} />
      <PortalInvoices invoices={bundle.invoices} />
    </>
  );
}
