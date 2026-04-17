import { and, asc, desc, eq, gte, lt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLogs, clients, milestones, projects } from "@/lib/db/schema";
import { getKstDateParts } from "@/lib/ai/briefing-data";
import {
  REPORT_ACTIVITY_LIMIT,
  REPORT_MILESTONE_LIMIT,
  type WeeklyReportInput,
} from "@/lib/validation/report";

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// KST 날짜 문자열을 해당 날짜 KST 00:00의 UTC Date 객체로 변환.
// timestamp with timezone 컬럼(UTC 저장) 비교 시 정확한 KST 경계 반영.
function kstMidnightToUtc(kstDate: string): Date {
  return new Date(`${kstDate}T00:00:00+09:00`);
}

// ─── 프로젝트별 주간 보고서 집계 ───
//
// 4종 병렬 쿼리:
//  1) 이번 주 완료 마일스톤 (completedAt ∈ KST 이번 주)
//  2) 다음 주 예정 마일스톤 (dueDate ∈ KST 다음 주)
//  3) 최근 활동 로그 (createdAt ∈ KST 이번 주, 최대 20건)
//  4) 전체 마일스톤 진행률 (count + isCompleted)
//
// 프로젝트 조회 시 `user_id` 필터 포함 — 소유권 불일치 시 null 반환 (Server Action에서 500 → 404 처리).

export async function getWeeklyReportData(
  userId: string,
  projectId: string,
): Promise<WeeklyReportInput | null> {
  const parts = getKstDateParts();
  const nextWeekStart = addDays(parts.weekStart, 7);
  const nextWeekEnd = addDays(parts.weekStart, 13);

  const weekStartUtc = kstMidnightToUtc(parts.weekStart);
  const nextMondayUtc = kstMidnightToUtc(nextWeekStart);

  const [projectRow] = await db
    .select({
      name: projects.name,
      description: projects.description,
      clientName: clients.companyName,
    })
    .from(projects)
    // clients.userId=userId를 JOIN 조건에 포함 — 과거 다른 사용자 소유 clientId가 projects.clientId에
    // 저장된 케이스가 있더라도 공유 PDF에 타인 회사명이 노출되지 않도록 2중 방어 (Task 3-3 리뷰 M1).
    .leftJoin(
      clients,
      and(eq(projects.clientId, clients.id), eq(clients.userId, userId)),
    )
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!projectRow) return null;

  const [completedRows, plannedRows, activityRows, allMilestoneRows] = await Promise.all([
    db
      .select({
        title: milestones.title,
        description: milestones.description,
        completedAt: milestones.completedAt,
      })
      .from(milestones)
      .where(
        and(
          eq(milestones.projectId, projectId),
          eq(milestones.isCompleted, true),
          gte(milestones.completedAt, weekStartUtc),
          lt(milestones.completedAt, nextMondayUtc),
        ),
      )
      .orderBy(asc(milestones.completedAt))
      .limit(REPORT_MILESTONE_LIMIT),

    db
      .select({
        title: milestones.title,
        description: milestones.description,
        dueDate: milestones.dueDate,
      })
      .from(milestones)
      .where(
        and(
          eq(milestones.projectId, projectId),
          eq(milestones.isCompleted, false),
          gte(milestones.dueDate, nextWeekStart),
          lte(milestones.dueDate, nextWeekEnd),
        ),
      )
      .orderBy(asc(milestones.dueDate))
      .limit(REPORT_MILESTONE_LIMIT),

    db
      .select({
        action: activityLogs.action,
        description: activityLogs.description,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.projectId, projectId),
          eq(activityLogs.userId, userId),
          gte(activityLogs.createdAt, weekStartUtc),
          lt(activityLogs.createdAt, nextMondayUtc),
        ),
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(REPORT_ACTIVITY_LIMIT),

    db
      .select({ isCompleted: milestones.isCompleted })
      .from(milestones)
      .where(eq(milestones.projectId, projectId)),
  ]);

  const total = allMilestoneRows.length;
  const completed = allMilestoneRows.filter((m) => m.isCompleted === true).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : null;

  return {
    weekStartDate: parts.weekStart,
    weekEndDate: parts.weekEnd,
    nextWeekStart,
    nextWeekEnd,
    projectName: projectRow.name,
    projectDescription: projectRow.description,
    clientName: projectRow.clientName,
    milestoneProgress: { completed, total, percent },
    completedThisWeek: completedRows.map((m) => ({
      title: m.title,
      description: m.description,
      completedAt: m.completedAt ? m.completedAt.toISOString() : null,
    })),
    plannedNextWeek: plannedRows.map((m) => ({
      title: m.title,
      description: m.description,
      dueDate: m.dueDate,
    })),
    recentActivity: activityRows.map((a) => ({
      action: a.action,
      description: a.description,
      createdAt: a.createdAt ? a.createdAt.toISOString() : null,
    })),
  };
}
