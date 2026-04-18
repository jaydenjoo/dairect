/**
 * Dairect 데모 모드 파생 데이터 — Task 4-1 M4 (리뷰 후속 패치)
 *
 * `sample-data.ts`의 원본(projects/invoices/milestones/activityLogs)에서
 * KPI 카드·차트·타임라인이 요구하는 형태로 계산해 반환한다.
 *
 * 실제 운영 쿼리(`dashboard-actions.ts`)와 동일한 규칙을 사용:
 * - activeProjects: status IN (in_progress, review)
 * - monthEstimates: 이번 달 생성 견적 totalAmount 합
 * - unsignedContracts: contracts.status IN (draft, sent)
 * - unpaidAmount: invoices.status IN (pending, sent, overdue) totalAmount 합
 * - clientRevenue: projects.contractAmount > 0 기준 고객별 합 상위 5
 * - upcomingDeadlines: milestones !isCompleted && today ≤ dueDate ≤ today+7
 *
 * 날짜 계산은 모두 UTC 기준 — `sample-data.ts`의 `dateFromNow`/`timestampFromNow`가 UTC를
 * 쓰므로 정합성을 위해 여기서도 UTC. Local 기준으로 계산하면 KST 자정 근처에서 하루 단위
 * 일치하지 않을 수 있음.
 */

import type { DemoData } from "./sample-data";

// ─── 타입 (차트 컴포넌트 props와 호환) ───

export type DemoKpi = {
  activeProjects: number;
  monthEstimates: number;
  unsignedContracts: number;
  unpaidAmount: number;
};

export type DemoMonthlyRevenuePoint = {
  month: string;
  total: number;
};

export type DemoClientRevenuePoint = {
  clientName: string;
  total: number;
};

export type DemoUpcomingDeadline = {
  id: string;
  title: string;
  dueDate: string;
  projectName: string;
  projectId: string;
};

export type DemoRecentActivity = {
  id: string;
  action: string;
  description: string | null;
  entityType: string | null;
  createdAt: Date | null;
};

// ─── 내부 유틸 (UTC 기준) ───

function toDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function monthStartUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

// ─── KPI 4 ───

export function getDemoKpi(sample: DemoData, now: Date = new Date()): DemoKpi {
  const activeProjects = sample.projects.filter(
    (p) => !p.deletedAt && (p.status === "in_progress" || p.status === "review"),
  ).length;

  const mStart = monthStartUtc(now);
  const monthEstimates = sample.estimates
    .filter((e) => e.createdAt && e.createdAt >= mStart)
    .reduce((sum, e) => sum + (e.totalAmount ?? 0), 0);

  // 샘플에 contracts 테이블 데이터가 없으므로 0. 운영 쿼리 로직과 동일 결과.
  const unsignedContracts = 0;

  const unpaidAmount = sample.invoices
    .filter(
      (inv) => inv.status === "pending" || inv.status === "sent" || inv.status === "overdue",
    )
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return { activeProjects, monthEstimates, unsignedContracts, unpaidAmount };
}

// ─── 월별 매출 차트 (sample.monthlyRevenue.revenue → total 필드 매핑) ───

export function getDemoMonthlyRevenueForChart(sample: DemoData): DemoMonthlyRevenuePoint[] {
  return sample.monthlyRevenue.map((m) => ({ month: m.month, total: m.revenue }));
}

// ─── 고객별 매출 상위 5 (contractAmount > 0 기준) ───

export function getDemoClientRevenue(sample: DemoData): DemoClientRevenuePoint[] {
  const clientNameById = new Map(sample.clients.map((c) => [c.id, c.companyName]));
  const totals = new Map<string, number>();

  for (const p of sample.projects) {
    if (p.deletedAt) continue;
    if (!p.contractAmount || p.contractAmount <= 0) continue;
    if (!p.clientId) continue;
    const name = clientNameById.get(p.clientId) ?? "(알 수 없음)";
    totals.set(name, (totals.get(name) ?? 0) + p.contractAmount);
  }

  return Array.from(totals.entries())
    .map(([clientName, total]) => ({ clientName, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

// ─── 다가오는 마일스톤 (7일 이내 미완료) ───

export function getDemoUpcomingDeadlines(
  sample: DemoData,
  now: Date = new Date(),
): DemoUpcomingDeadline[] {
  const today = toDateStr(now);
  const weekLater = new Date(now);
  weekLater.setUTCDate(weekLater.getUTCDate() + 7);
  const weekLaterStr = toDateStr(weekLater);

  const projectById = new Map(sample.projects.map((p) => [p.id, p]));

  return sample.milestones
    .filter((m) => {
      if (m.isCompleted) return false;
      if (!m.dueDate) return false;
      if (m.dueDate < today) return false;
      if (m.dueDate > weekLaterStr) return false;
      const project = projectById.get(m.projectId);
      if (!project || project.deletedAt) return false;
      return true;
    })
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      title: m.title,
      dueDate: m.dueDate ?? "",
      projectName: projectById.get(m.projectId)?.name ?? "",
      projectId: m.projectId,
    }));
}

// ─── 최근 활동 10건 ───

export function getDemoRecentActivity(sample: DemoData): DemoRecentActivity[] {
  // buildActivityLogs가 daysAgo 0→14 순으로 생성 → 이미 최신순 정렬됨. 재정렬 불필요.
  return sample.activityLogs.slice(0, 10).map((a) => ({
    id: a.id,
    action: a.action,
    description: a.description,
    entityType: a.entityType,
    createdAt: a.createdAt,
  }));
}
