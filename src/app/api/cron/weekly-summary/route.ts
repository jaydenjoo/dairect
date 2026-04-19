import crypto from "node:crypto";
import {
  and,
  count,
  eq,
  gte,
  isNull,
  lt,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  estimates,
  invoices,
  leads,
  portalFeedbacks,
  projects,
  userSettings,
} from "@/lib/db/schema";
import { emitN8nEvent } from "@/lib/n8n/client";
import { sanitizeHeader } from "@/lib/security/sanitize-headers";

// W3 weekly_summary cron
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Vercel Cron이 매주 금요일 UTC 09:00 (KST 18:00)에 GET 호출.
// 각 user의 지난 7일 활동 8개 항목을 집계해 n8n `weekly.summary` 이벤트 발송.
//
// 대상: userSettings.businessEmail이 존재 + `lastWeeklySummarySentAt` 6일 이내 없음.
// 6일 = 7일 - 1일 여유 (Vercel Cron 지연/retry 허용).
// 지난 주 활동 합계가 0인 user는 skip (조용한 한 주 → 메일 피로도 방지).
//
// 멱등성: UPDATE WHERE에도 재발송 조건을 재포함 → race 시 두 번째 호출은 0 row 반환.

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

const MAX_EMAIL = 120;

function verifyCronAuth(authHeader: string | null, cronSecret: string): boolean {
  if (!authHeader) return false;
  const expected = `Bearer ${cronSecret}`;
  const a = Buffer.from(authHeader, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// PG numeric sum은 string 반환. JS Number 변환은 MAX_SAFE_INTEGER 9.007×10^15 근접 시
// 정밀도 손실 — Phase 5 multi-tenant 대규모 누적 금액 대비 BigInt 포맷으로 안전.
function formatKrwFromString(raw: string): string {
  try {
    return BigInt(raw).toLocaleString("ko-KR");
  } catch {
    // 소수점 포함(BigInt 실패) 등 드문 경우 Number fallback.
    const n = Number(raw);
    return Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";
  }
}

type Stats = {
  newProjects: number;
  completedProjects: number;
  newEstimates: number;
  newInvoices: number;
  paidInvoices: number;
  paidAmountTotal: string; // BigInt-safe raw (예: "1000000")
  paidAmountFormatted: string; // 한국어 포맷 (예: "1,000,000") — n8n은 이 값 직접 사용
  overdueInvoicesCount: number;
  newLeads: number;
  portalFeedbacks: number;
};

async function aggregateStatsForUser(
  userId: string,
  weekAgo: Date,
): Promise<Stats> {
  const weekAgoDate = toDateString(weekAgo);

  const [
    newProjectsRow,
    completedProjectsRow,
    newEstimatesRow,
    newInvoicesRow,
    paidRow,
    overdueRow,
    newLeadsRow,
    portalFeedbacksRow,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(projects)
      .where(
        and(eq(projects.userId, userId), gte(projects.createdAt, weekAgo)),
      ),
    db
      .select({ count: count() })
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          eq(projects.status, "completed"),
          gte(projects.updatedAt, weekAgo),
        ),
      ),
    db
      .select({ count: count() })
      .from(estimates)
      .where(
        and(eq(estimates.userId, userId), gte(estimates.createdAt, weekAgo)),
      ),
    db
      .select({ count: count() })
      .from(invoices)
      .where(
        and(eq(invoices.userId, userId), gte(invoices.createdAt, weekAgo)),
      ),
    // paid invoices count + sum 한 쿼리에서 동시 집계 (paidDate 기준)
    db
      .select({
        count: count(),
        total: sum(invoices.totalAmount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, "paid"),
          gte(invoices.paidDate, weekAgoDate),
        ),
      ),
    // 현재 연체 중인 invoice (지난 7일과 무관, 누적 상태 값)
    db
      .select({ count: count() })
      .from(invoices)
      .where(
        and(eq(invoices.userId, userId), eq(invoices.status, "overdue")),
      ),
    db
      .select({ count: count() })
      .from(leads)
      .where(and(eq(leads.userId, userId), gte(leads.createdAt, weekAgo))),
    db
      .select({ count: count() })
      .from(portalFeedbacks)
      .innerJoin(projects, eq(projects.id, portalFeedbacks.projectId))
      .where(
        and(
          eq(projects.userId, userId),
          gte(portalFeedbacks.createdAt, weekAgo),
        ),
      ),
  ]);

  // PG numeric sum은 string | null 반환. BigInt-safe 유지 위해 string 그대로 보존.
  // n8n 측이 재포맷 시 Number 변환으로 정밀도 손실 회피하도록 pre-formatted 필드 동반.
  const paidTotalRaw = paidRow[0]?.total;
  const paidAmountTotal = paidTotalRaw == null ? "0" : String(paidTotalRaw);
  const paidAmountFormatted = formatKrwFromString(paidAmountTotal);

  return {
    newProjects: newProjectsRow[0]?.count ?? 0,
    completedProjects: completedProjectsRow[0]?.count ?? 0,
    newEstimates: newEstimatesRow[0]?.count ?? 0,
    newInvoices: newInvoicesRow[0]?.count ?? 0,
    paidInvoices: paidRow[0]?.count ?? 0,
    paidAmountTotal,
    paidAmountFormatted,
    overdueInvoicesCount: overdueRow[0]?.count ?? 0,
    newLeads: newLeadsRow[0]?.count ?? 0,
    portalFeedbacks: portalFeedbacksRow[0]?.count ?? 0,
  };
}

function isEmpty(stats: Stats): boolean {
  // paidAmountTotal은 count가 아닌 금액. 다른 count 합계가 0이면 조용한 주로 간주.
  return (
    stats.newProjects === 0 &&
    stats.completedProjects === 0 &&
    stats.newEstimates === 0 &&
    stats.newInvoices === 0 &&
    stats.paidInvoices === 0 &&
    stats.overdueInvoicesCount === 0 &&
    stats.newLeads === 0 &&
    stats.portalFeedbacks === 0
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error({ event: "cron_weekly_summary_no_secret" });
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  if (!verifyCronAuth(request.headers.get("authorization"), cronSecret)) {
    console.warn({ event: "cron_weekly_summary_unauthorized" });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - WEEK_MS);
  const sixDaysAgo = new Date(now.getTime() - SIX_DAYS_MS);

  const activeUsers = await db
    .select({
      userId: userSettings.userId,
      businessEmail: userSettings.businessEmail,
    })
    .from(userSettings)
    .where(
      and(
        sql`${userSettings.businessEmail} IS NOT NULL`,
        sql`${userSettings.businessEmail} != ''`,
        or(
          isNull(userSettings.lastWeeklySummarySentAt),
          lt(userSettings.lastWeeklySummarySentAt, sixDaysAgo),
        ),
      ),
    );

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  // Deadline gate — Phase 5 multi-tenant 대비. maxDuration 300s - 50s safety margin.
  // 미처리 user는 lastWeeklySummarySentAt 미갱신이라 다음 cron에서 자동 재개(token 불필요).
  const startMs = Date.now();
  const DEADLINE_MS = 250_000;
  let deadlineBroken = false;

  for (const u of activeUsers) {
    if (Date.now() - startMs > DEADLINE_MS) {
      console.warn({
        event: "cron_weekly_summary_deadline_break",
        processed,
        remaining: activeUsers.length - processed - skipped - failed,
      });
      deadlineBroken = true;
      break;
    }

    const pmEmail = sanitizeHeader(u.businessEmail, MAX_EMAIL);
    if (!pmEmail) {
      skipped++;
      continue;
    }

    try {
      const stats = await aggregateStatsForUser(u.userId, weekAgo);

      if (isEmpty(stats)) {
        skipped++;
        continue;
      }

      await emitN8nEvent("weekly_summary", "weekly.summary", {
        pmEmail,
        periodStart: weekAgo.toISOString(),
        periodEnd: now.toISOString(),
        stats,
      });

      // 멱등성 gate 재포함 — race 시 두 번째 호출은 0 row UPDATE.
      const updated = await db
        .update(userSettings)
        .set({
          lastWeeklySummarySentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userSettings.userId, u.userId),
            or(
              isNull(userSettings.lastWeeklySummarySentAt),
              lt(userSettings.lastWeeklySummarySentAt, sixDaysAgo),
            ),
          ),
        )
        .returning({ userId: userSettings.userId });

      if (updated.length === 0) {
        // Race: 다른 cron 인스턴스가 먼저 완료. emit은 이미 발송 — 이번 request는
        // skip 처리하지 않고 processed로 집계(실제 이메일은 1회만 발송됨 보장 X).
        console.warn({
          event: "cron_weekly_summary_race_detected",
          userId: u.userId,
          reason: "lastWeeklySummarySentAt_updated_concurrently",
        });
      }

      processed++;
    } catch (err) {
      failed++;
      const errName = err instanceof Error ? err.name : "unknown";
      console.error({
        event: "cron_weekly_summary_user_failed",
        userId: u.userId,
        err_name: errName,
      });
    }
  }

  return NextResponse.json({
    total: activeUsers.length,
    processed,
    failed,
    skipped,
    deadlineBroken,
  });
}
