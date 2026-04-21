import crypto from "node:crypto";
import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  clients,
  invoices,
  projects,
  workspaceSettings,
} from "@/lib/db/schema";
import { emitN8nEvent } from "@/lib/n8n/client";
import { sanitizeHeader } from "@/lib/security/sanitize-headers";
import type { BankInfo } from "@/lib/validation/settings";

// W2 invoice.overdue cron
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Vercel Cron이 매일 UTC 00:00 (KST 09:00)에 GET 호출.
// Authorization: Bearer ${CRON_SECRET}을 Vercel이 자동 주입.
//
// 동작:
//  1. 연체 invoice 조회 (status='sent' AND dueDate < today AND lastOverdueNotifiedAt IS NULL)
//  2. 각 row → n8n 이벤트 발송 (PM + 고객 둘 다) → 상태 'overdue' 전이 + notifiedAt 기록
//
// 멱등성:
//  - WHERE `lastOverdueNotifiedAt IS NULL`로 중복 호출 방지
//  - emit 성공 후에만 UPDATE → emit 실패 시 다음 cron 재시도
//
// 순차 처리: 병렬 Promise.all은 n8n burst 리스크 → MVP는 for...of.

export const dynamic = "force-dynamic";
// Vercel Pro 최대값 활용. 순차 emit × 3초 timeout × row 수 누적 대비.
// Pro 기본은 60s지만 cron 같은 일괄 처리는 300s까지 허용.
export const maxDuration = 300;

const MAX_PROJECT_NAME = 100;
const MAX_INVOICE_NUMBER = 50;
const MAX_EMAIL = 120;
const MAX_COMPANY = 100;
const MAX_BANK_NAME = 50;
const MAX_ACCOUNT_NUMBER = 30;

type Row = {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string | null;
  projectId: string;
  projectName: string;
  clientEmail: string | null;
  clientCompanyName: string | null;
  pmEmail: string | null;
  bankInfo: unknown;
};

function parseBank(raw: unknown): { bankName: string; accountNumber: string } {
  if (!raw || typeof raw !== "object") {
    return { bankName: "", accountNumber: "" };
  }
  const b = raw as Partial<BankInfo>;
  return {
    bankName: sanitizeHeader(b.bankName, MAX_BANK_NAME) ?? "",
    accountNumber: sanitizeHeader(b.accountNumber, MAX_ACCOUNT_NUMBER) ?? "",
  };
}

function daysBetween(dueDateIso: string): number {
  const due = new Date(`${dueDateIso}T00:00:00Z`);
  const now = new Date();
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

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

export async function GET(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error({ event: "cron_invoice_overdue_no_secret" });
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  if (!verifyCronAuth(request.headers.get("authorization"), cronSecret)) {
    console.warn({ event: "cron_invoice_overdue_unauthorized" });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = (await db
    .select({
      invoiceId: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      totalAmount: invoices.totalAmount,
      dueDate: invoices.dueDate,
      projectId: projects.id,
      projectName: projects.name,
      clientEmail: clients.email,
      clientCompanyName: clients.companyName,
      pmEmail: workspaceSettings.businessEmail,
      bankInfo: workspaceSettings.bankInfo,
    })
    .from(invoices)
    .innerJoin(projects, eq(projects.id, invoices.projectId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(
      workspaceSettings,
      eq(workspaceSettings.workspaceId, invoices.workspaceId),
    )
    .where(
      and(
        eq(invoices.status, "sent"),
        lt(invoices.dueDate, sql`CURRENT_DATE`),
        isNull(invoices.lastOverdueNotifiedAt),
      ),
    )) as Row[];

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.dueDate) {
      skipped++;
      continue;
    }
    const daysOverdue = daysBetween(row.dueDate);
    if (daysOverdue < 1) {
      skipped++;
      continue;
    }

    const { bankName, accountNumber } = parseBank(row.bankInfo);

    try {
      await emitN8nEvent("invoice_overdue", "invoice.overdue", {
        invoiceId: row.invoiceId,
        invoiceNumber: sanitizeHeader(row.invoiceNumber, MAX_INVOICE_NUMBER) ?? "",
        projectId: row.projectId,
        projectName: sanitizeHeader(row.projectName, MAX_PROJECT_NAME) ?? "",
        pmEmail: sanitizeHeader(row.pmEmail, MAX_EMAIL) ?? "",
        clientEmail: sanitizeHeader(row.clientEmail, MAX_EMAIL) ?? "",
        clientCompanyName:
          sanitizeHeader(row.clientCompanyName, MAX_COMPANY) ?? "",
        totalAmount: row.totalAmount,
        dueDate: row.dueDate,
        daysOverdue,
        bankName,
        accountNumber,
      });

      // 재무 상태 회귀 race 방어: SELECT → emit(3s) → UPDATE 사이에 사용자가
      // 대시보드에서 status를 'paid'로 변경 가능. WHERE에 status='sent' +
      // lastOverdueNotifiedAt IS NULL 조건을 추가해 race를 DB 레벨로 차단.
      // .returning()으로 실제 업데이트된 row를 확인 — 0 row면 race 발생.
      const updated = await db
        .update(invoices)
        .set({
          status: "overdue",
          lastOverdueNotifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(invoices.id, row.invoiceId),
            eq(invoices.status, "sent"),
            isNull(invoices.lastOverdueNotifiedAt),
          ),
        )
        .returning({ id: invoices.id });

      if (updated.length === 0) {
        // emit은 이미 n8n으로 발송됨 → 이메일은 n8n 측에서 이미 진행/완료.
        // 되돌릴 수 없으므로 로그만 남기고 계속. 상태 회귀(paid→overdue)는
        // 이 fix로 DB 레벨 차단됨. 고객이 결제 직후 메일 받는 edge case 존재.
        console.warn({
          event: "cron_invoice_overdue_race_detected",
          invoiceId: row.invoiceId,
          reason: "status_or_notifiedAt_changed_between_select_and_update",
        });
      }

      processed++;
    } catch (err) {
      failed++;
      const errName = err instanceof Error ? err.name : "unknown";
      console.error({
        event: "cron_invoice_overdue_row_failed",
        invoiceId: row.invoiceId,
        err_name: errName,
      });
    }
  }

  return NextResponse.json({
    total: rows.length,
    processed,
    failed,
    skipped,
  });
}
