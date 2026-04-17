import { and, asc, eq, gte, isNull, lt, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, invoices, milestones, projects } from "@/lib/db/schema";
import {
  BRIEFING_LIST_LIMIT,
  type WeeklyBriefingData,
  type WeeklyMilestone,
  type WeeklyOverdue,
  type WeeklyPayment,
  type WeeklyProjectDeadline,
} from "@/lib/validation/briefing";

// ─── KST 주차 계산 ───
//
// Supabase는 UTC 기준이지만 "이번 주" 경계는 한국 운영자 체감(월~일) 기준이어야 함.
// JS Date에 +9h 오프셋을 적용한 뒤 UTC 메서드로 벽시계 값 추출 (Intl 없이 결정적 계산).

export type KstDateParts = {
  today: string; // "YYYY-MM-DD"
  weekStart: string; // 이번 주 월요일
  weekEnd: string; // 이번 주 일요일
  nearingHorizon: string; // today + 14d
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toKstWallClock(reference: Date): Date {
  return new Date(reference.getTime() + KST_OFFSET_MS);
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getKstDateParts(reference: Date = new Date()): KstDateParts {
  const kstNow = toKstWallClock(reference);
  const kstDay = kstNow.getUTCDay(); // 0=Sun ... 6=Sat
  const mondayOffset = kstDay === 0 ? -6 : 1 - kstDay;

  const mondayMs = kstNow.getTime() + mondayOffset * DAY_MS;
  const sundayMs = mondayMs + 6 * DAY_MS;
  const nearingMs = kstNow.getTime() + 14 * DAY_MS;

  return {
    today: toIsoDate(kstNow),
    weekStart: toIsoDate(new Date(mondayMs)),
    weekEnd: toIsoDate(new Date(sundayMs)),
    nearingHorizon: toIsoDate(new Date(nearingMs)),
  };
}

export function daysBetween(earlier: string, later: string): number {
  const a = new Date(`${earlier}T00:00:00Z`).getTime();
  const b = new Date(`${later}T00:00:00Z`).getTime();
  return Math.round((b - a) / DAY_MS);
}

// ─── 주간 데이터 집계 ───
//
// 4종 쿼리를 Promise.all로 병렬 실행. 각 섹션은 BRIEFING_LIST_LIMIT로 상한 (토큰 낭비 방지).

export async function getWeeklyBriefingData(userId: string): Promise<WeeklyBriefingData> {
  const parts = getKstDateParts();

  const [paymentRows, overdueRows, deadlineRows, milestoneRows] = await Promise.all([
    // 1) 이번 주 수금 예정: status='sent' + dueDate ∈ [월, 일]
    db
      .select({
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        dueDate: invoices.dueDate,
        clientName: clients.companyName,
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, "sent"),
          gte(invoices.dueDate, parts.weekStart),
          lte(invoices.dueDate, parts.weekEnd),
        ),
      )
      .orderBy(asc(invoices.dueDate))
      .limit(BRIEFING_LIST_LIMIT),

    // 2) 미수금 경고: status='overdue' OR (status='sent' AND dueDate < today KST)
    db
      .select({
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        dueDate: invoices.dueDate,
        clientName: clients.companyName,
        projectName: projects.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(
        and(
          eq(invoices.userId, userId),
          or(
            eq(invoices.status, "overdue"),
            and(eq(invoices.status, "sent"), lt(invoices.dueDate, parts.today)),
          ),
        ),
      )
      .orderBy(asc(invoices.dueDate))
      .limit(BRIEFING_LIST_LIMIT),

    // 3) 완료 임박: status='in_progress' + endDate ∈ [today, today+14d] + deletedAt IS NULL
    db
      .select({
        name: projects.name,
        endDate: projects.endDate,
        clientName: clients.companyName,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(
        and(
          eq(projects.userId, userId),
          isNull(projects.deletedAt),
          eq(projects.status, "in_progress"),
          gte(projects.endDate, parts.today),
          lte(projects.endDate, parts.nearingHorizon),
        ),
      )
      .orderBy(asc(projects.endDate))
      .limit(BRIEFING_LIST_LIMIT),

    // 4) 이번 주 마일스톤: projects JOIN milestones WHERE project.userId + milestone.dueDate ∈ [월, 일]
    db
      .select({
        title: milestones.title,
        projectName: projects.name,
        dueDate: milestones.dueDate,
        isCompleted: milestones.isCompleted,
      })
      .from(milestones)
      .innerJoin(projects, eq(milestones.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, userId),
          isNull(projects.deletedAt),
          gte(milestones.dueDate, parts.weekStart),
          lte(milestones.dueDate, parts.weekEnd),
        ),
      )
      .orderBy(asc(milestones.dueDate))
      .limit(BRIEFING_LIST_LIMIT),
  ]);

  const upcomingPayments: WeeklyPayment[] = paymentRows.map((r) => ({
    invoiceNumber: r.invoiceNumber,
    totalAmount: r.totalAmount,
    dueDate: r.dueDate,
    clientName: r.clientName,
    projectName: r.projectName,
  }));

  const overdueInvoices: WeeklyOverdue[] = overdueRows.map((r) => ({
    invoiceNumber: r.invoiceNumber,
    totalAmount: r.totalAmount,
    dueDate: r.dueDate,
    clientName: r.clientName,
    projectName: r.projectName,
    // dueDate가 오늘 이전일 때만 일수 계산 — 'overdue' 상태지만 dueDate가 미래인 엣지 케이스에서
    // Math.max(0, ...)로 0 반환하면 LLM이 "연체 0일"로 오해 가능 (리뷰 H4).
    overdueDays: r.dueDate && r.dueDate < parts.today ? daysBetween(r.dueDate, parts.today) : 0,
  }));

  const nearingDeadlines: WeeklyProjectDeadline[] = deadlineRows.map((r) => ({
    name: r.name,
    endDate: r.endDate,
    clientName: r.clientName,
  }));

  const weekMilestones: WeeklyMilestone[] = milestoneRows.map((r) => ({
    title: r.title,
    projectName: r.projectName,
    dueDate: r.dueDate,
    isCompleted: r.isCompleted ?? false,
  }));

  return {
    weekStartDate: parts.weekStart,
    weekEndDate: parts.weekEnd,
    today: parts.today,
    upcomingPayments,
    overdueInvoices,
    nearingDeadlines,
    weekMilestones,
  };
}
