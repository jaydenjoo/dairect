"use server";

import { db } from "@/lib/db";
import { projects, estimates, contracts, invoices, clients, milestones, activityLogs } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { workspaceScope } from "@/lib/db/workspace-scope";
import { eq, and, sql, isNull, desc, gte, lte, inArray, gt } from "drizzle-orm";

/** 로컬 날짜를 YYYY-MM-DD 문자열로 변환 (UTC 오차 방지) */
function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── KPI 카드 4개 ───

export async function getKpiData() {
  const userId = await getUserId();
  if (!userId) return { activeProjects: 0, monthEstimates: 0, unsignedContracts: 0, unpaidAmount: 0 };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { activeProjects: 0, monthEstimates: 0, unsignedContracts: 0, unpaidAmount: 0 };

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [activeRes, estimateRes, contractRes, unpaidRes] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(
        eq(projects.userId, userId),
        workspaceScope(projects.workspaceId, workspaceId),
        isNull(projects.deletedAt),
        inArray(projects.status, ["in_progress", "review"]),
      )),

    db.select({ total: sql<number>`coalesce(sum(${estimates.totalAmount}), 0)::bigint` })
      .from(estimates)
      .where(and(
        eq(estimates.userId, userId),
        workspaceScope(estimates.workspaceId, workspaceId),
        gte(estimates.createdAt, new Date(monthStart)),
      )),

    db.select({ count: sql<number>`count(*)::int` })
      .from(contracts)
      .where(and(
        eq(contracts.userId, userId),
        workspaceScope(contracts.workspaceId, workspaceId),
        inArray(contracts.status, ["draft", "sent"]),
      )),

    db.select({ total: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)::bigint` })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        workspaceScope(invoices.workspaceId, workspaceId),
        inArray(invoices.status, ["pending", "sent", "overdue"]),
      )),
  ]);

  return {
    activeProjects: activeRes[0]?.count ?? 0,
    monthEstimates: Number(estimateRes[0]?.total ?? 0),
    unsignedContracts: contractRes[0]?.count ?? 0,
    unpaidAmount: Number(unpaidRes[0]?.total ?? 0),
  };
}

// ─── 월별 매출 (최근 6개월) ───

export async function getMonthlyRevenue() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const startDateStr = toLocalDateStr(sixMonthsAgo);

  const rows = await db
    .select({
      month: sql<string>`to_char(${invoices.paidDate}, 'YYYY-MM')`,
      total: sql<number>`coalesce(sum(${invoices.paidAmount}), 0)::bigint`,
    })
    .from(invoices)
    .where(and(
      eq(invoices.userId, userId),
      workspaceScope(invoices.workspaceId, workspaceId),
      eq(invoices.status, "paid"),
      gte(invoices.paidDate, startDateStr),
    ))
    .groupBy(sql`to_char(${invoices.paidDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${invoices.paidDate}, 'YYYY-MM')`);

  // 빈 월 채우기 (Map으로 O(1) 조회)
  const monthMap = new Map(rows.map((r) => [r.month, Number(r.total)]));
  const result: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ month: key, total: monthMap.get(key) ?? 0 });
  }

  return result;
}

// ─── 고객별 매출 (상위 5) ───

export async function getClientRevenue() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  return db
    .select({
      clientName: clients.companyName,
      total: sql<number>`coalesce(sum(${projects.contractAmount}), 0)::bigint`,
    })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(
      eq(projects.userId, userId),
      workspaceScope(projects.workspaceId, workspaceId),
      isNull(projects.deletedAt),
      gt(projects.contractAmount, 0),
    ))
    .groupBy(clients.companyName)
    .orderBy(sql`sum(${projects.contractAmount}) DESC`)
    .limit(5);
}

// ─── 최근 활동 (10건) ───

export async function getRecentActivity() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      description: activityLogs.description,
      entityType: activityLogs.entityType,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        workspaceScope(activityLogs.workspaceId, workspaceId),
      ),
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(10);
}

// ─── 다가오는 마일스톤/납기 (7일 이내) ───

export async function getUpcomingDeadlines() {
  const userId = await getUserId();
  if (!userId) return [];

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const today = toLocalDateStr(new Date());
  const weekLater = new Date();
  weekLater.setDate(weekLater.getDate() + 7);
  const weekLaterStr = toLocalDateStr(weekLater);

  return db
    .select({
      id: milestones.id,
      title: milestones.title,
      dueDate: milestones.dueDate,
      projectName: projects.name,
      projectId: projects.id,
    })
    .from(milestones)
    .innerJoin(projects, eq(projects.id, milestones.projectId))
    .where(and(
      eq(projects.userId, userId),
      workspaceScope(projects.workspaceId, workspaceId),
      workspaceScope(milestones.workspaceId, workspaceId),
      isNull(projects.deletedAt),
      eq(milestones.isCompleted, false),
      gte(milestones.dueDate, today),
      lte(milestones.dueDate, weekLaterStr),
    ))
    .orderBy(milestones.dueDate)
    .limit(10);
}
