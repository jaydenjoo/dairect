"use server";

import Anthropic, { APIConnectionTimeoutError, RateLimitError } from "@anthropic-ai/sdk";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSettings, weeklyReports } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { CLAUDE_MODEL, getClaudeClient } from "@/lib/ai/claude-client";
import { REPORT_SYSTEM_PROMPT, REPORT_TOOL } from "@/lib/ai/report-prompt";
import { getKstDateParts } from "@/lib/ai/briefing-data";
import { getWeeklyReportData } from "@/lib/ai/report-data";
import {
  reportContentSchema,
  reportResponseSchema,
  isReportInputEmpty,
  type ReportContent,
} from "@/lib/validation/report";
import { AI_DAILY_LIMIT } from "@/lib/validation/ai-estimate";

// 쿨다운: 같은 주 재호출이 10초 내면 AI/DB write 생략 (Task 3-2 패턴).
const REPORT_COOLDOWN_MS = 10_000;

const projectIdSchema = z.string().uuid({ message: "유효하지 않은 프로젝트 ID입니다" });

// 로컬 타입 — "use server" 파일에서 export 금지 (10패턴1)
type GenerationType = "ai" | "empty_fallback";

type CurrentReport = {
  content: ReportContent;
  weekStartDate: string;
  aiGeneratedAt: string;
  generationType: GenerationType;
};

type RegenerateResult =
  | {
      success: true;
      content: ReportContent;
      weekStartDate: string;
      aiGeneratedAt: string;
      generationType: GenerationType;
      dailyCount: number;
      dailyLimit: number;
    }
  | {
      success: false;
      error: string;
      code:
        | "AUTH"
        | "INVALID_INPUT"
        | "NOT_FOUND"
        | "LIMIT_EXCEEDED"
        | "TIMEOUT"
        | "PARSE_ERROR"
        | "UNKNOWN";
      dailyCount?: number;
      dailyLimit?: number;
    };

// ─── 빈 데이터 fallback ───

function buildEmptyReport(projectName: string): ReportContent {
  return {
    completedThisWeek: [],
    plannedNextWeek: [],
    issuesRisks: [],
    summary: `이번 주 ${projectName} 프로젝트에서 완료된 마일스톤·활동 기록이 없습니다. 프로젝트 진행 상황에 따라 다음 주 계획을 구체화한 뒤 다시 생성해주세요.`,
  };
}

// ─── 현재 주 보고서 조회 (읽기 전용) ───

export async function getCurrentWeeklyReport(
  projectId: string,
): Promise<CurrentReport | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const idCheck = projectIdSchema.safeParse(projectId);
  if (!idCheck.success) return null;

  const { weekStart } = getKstDateParts();

  const rows = await db
    .select({
      contentJson: weeklyReports.contentJson,
      weekStartDate: weeklyReports.weekStartDate,
      aiGeneratedAt: weeklyReports.aiGeneratedAt,
      generationType: weeklyReports.generationType,
    })
    .from(weeklyReports)
    .where(
      and(
        eq(weeklyReports.userId, userId),
        eq(weeklyReports.projectId, idCheck.data),
        eq(weeklyReports.weekStartDate, weekStart),
      ),
    )
    .orderBy(desc(weeklyReports.aiGeneratedAt))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  const parsed = reportContentSchema.safeParse(row.contentJson);
  if (!parsed.success) {
    console.error("[getCurrentWeeklyReport] content drift", {
      issues: parsed.error.issues.map((i) => ({ path: i.path, code: i.code })),
    });
    return null;
  }

  return {
    content: parsed.data,
    weekStartDate: row.weekStartDate,
    aiGeneratedAt: row.aiGeneratedAt.toISOString(),
    generationType: row.generationType,
  };
}

// ─── 보고서 재생성 (AI 호출 or 빈 데이터 fallback) ───

export async function regenerateWeeklyReportAction(
  projectId: string,
): Promise<RegenerateResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다", code: "AUTH" };
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return { success: false, error: "워크스페이스를 확인할 수 없습니다", code: "AUTH" };
  }

  const idCheck = projectIdSchema.safeParse(projectId);
  if (!idCheck.success) {
    return {
      success: false,
      error: idCheck.error.issues[0]?.message ?? "유효하지 않은 프로젝트 ID입니다",
      code: "INVALID_INPUT",
    };
  }

  const { weekStart } = getKstDateParts();

  // 1) 쿨다운: 같은 주 재생성이 10초 내면 기존 row 그대로 반환
  const cooldownHit = await tryCooldownReturn(userId, idCheck.data, weekStart);
  if (cooldownHit) return cooldownHit;

  // 2) 주간 데이터 집계 (userId 필터로 소유권 자동 검증). null이면 NOT_FOUND.
  const reportInput = await getWeeklyReportData(userId, idCheck.data);
  if (!reportInput) {
    return {
      success: false,
      error: "프로젝트를 찾을 수 없거나 접근 권한이 없습니다",
      code: "NOT_FOUND",
    };
  }

  // 3) 빈 데이터 short-circuit: AI 호출 없이 fallback 저장. 카운터 차감 안 함.
  //    projectName이 내부 validation 강화 이전에 저장됐거나 버그로 위험 문자를 포함할 수 있으므로
  //    저장 직전 Zod 재검증 — 실패 시 schema drift 루프 DoS 방어 (리뷰 H4).
  if (isReportInputEmpty(reportInput)) {
    const empty = buildEmptyReport(reportInput.projectName);
    const emptyParsed = reportContentSchema.safeParse(empty);
    if (!emptyParsed.success) {
      console.error("[regenerateWeeklyReportAction] empty fallback schema fail", {
        issues: emptyParsed.error.issues.map((i) => ({ path: i.path, code: i.code })),
      });
      return {
        success: false,
        error: "빈 데이터 보고서 생성 중 오류가 발생했습니다. 프로젝트 이름을 확인해주세요.",
        code: "PARSE_ERROR",
      };
    }
    const saved = await upsertReport(
      userId,
      workspaceId,
      idCheck.data,
      reportInput.weekStartDate,
      emptyParsed.data,
      "empty_fallback",
    );
    const dailyCount = await readDailyCount(userId);
    return {
      success: true,
      content: emptyParsed.data,
      weekStartDate: reportInput.weekStartDate,
      aiGeneratedAt: saved.aiGeneratedAt.toISOString(),
      generationType: "empty_fallback",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  // 4) 한도 체크 + race-safe 카운터 pre-increment (Task 3-1/3-2와 동일 패턴)
  let dailyCount: number;
  try {
    dailyCount = await db.transaction(async (tx) => {
      await tx
        .insert(userSettings)
        .values({ userId, aiDailyCallCount: 0 })
        .onConflictDoNothing({ target: userSettings.userId });

      const result = await tx
        .update(userSettings)
        .set({
          aiDailyCallCount: sql`CASE
            WHEN COALESCE(${userSettings.aiLastResetAt}, '-infinity'::timestamptz) < CURRENT_DATE THEN 1
            ELSE COALESCE(${userSettings.aiDailyCallCount}, 0) + 1
          END`,
          aiLastResetAt: sql`CASE
            WHEN COALESCE(${userSettings.aiLastResetAt}, '-infinity'::timestamptz) < CURRENT_DATE THEN NOW()
            ELSE ${userSettings.aiLastResetAt}
          END`,
          updatedAt: sql`NOW()`,
        })
        .where(
          and(
            eq(userSettings.userId, userId),
            sql`(COALESCE(${userSettings.aiLastResetAt}, '-infinity'::timestamptz) < CURRENT_DATE OR COALESCE(${userSettings.aiDailyCallCount}, 0) < ${AI_DAILY_LIMIT})`,
          ),
        )
        .returning({ count: userSettings.aiDailyCallCount });

      if (result.length === 0) throw new Error("DAILY_LIMIT_EXCEEDED");
      return result[0].count ?? 0;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "DAILY_LIMIT_EXCEEDED") {
      return {
        success: false,
        error: `일일 AI 호출 한도(${AI_DAILY_LIMIT}회)를 초과했습니다. 약 24시간 후 다시 시도해주세요.`,
        code: "LIMIT_EXCEEDED",
        dailyCount: AI_DAILY_LIMIT,
        dailyLimit: AI_DAILY_LIMIT,
      };
    }
    console.error("[regenerateWeeklyReportAction] counter error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "AI 호출 한도 확인 중 오류가 발생했습니다",
      code: "UNKNOWN",
    };
  }

  // 5) Claude API 호출 — tool_choice JSON 강제 + XML 래핑 + null 필드 제거
  let message: Anthropic.Messages.Message;
  try {
    const client = getClaudeClient();
    const inputJson = JSON.stringify(reportInput, (_k, v) => (v === null ? undefined : v), 2);
    message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3072,
      system: REPORT_SYSTEM_PROMPT,
      tools: [REPORT_TOOL],
      tool_choice: { type: "tool", name: REPORT_TOOL.name },
      messages: [
        {
          role: "user",
          content: `<project_weekly_data>\n${inputJson}\n</project_weekly_data>`,
        },
      ],
    });
  } catch (err) {
    console.error("[regenerateWeeklyReportAction] claude error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    if (err instanceof APIConnectionTimeoutError) {
      return {
        success: false,
        error: "AI 응답이 지연됩니다. 잠시 후 다시 시도해주세요.",
        code: "TIMEOUT",
        dailyCount,
        dailyLimit: AI_DAILY_LIMIT,
      };
    }
    if (err instanceof RateLimitError) {
      return {
        success: false,
        error: "AI 서비스가 일시적으로 혼잡합니다. 잠시 후 다시 시도해주세요.",
        code: "UNKNOWN",
        dailyCount,
        dailyLimit: AI_DAILY_LIMIT,
      };
    }
    return {
      success: false,
      error: "AI 서비스 호출 중 오류가 발생했습니다",
      code: "UNKNOWN",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  // 6) 응답은 받았으나 사용 불가 → 카운터 rollback
  if (message.stop_reason === "max_tokens") {
    console.error("[regenerateWeeklyReportAction] max_tokens reached", {
      stopReason: message.stop_reason,
      contentBlocks: message.content.length,
    });
    const rolled = await rollbackCounter(userId);
    return {
      success: false,
      error: "AI 응답이 너무 길어 완성되지 못했습니다. 잠시 후 다시 시도해주세요.",
      code: "PARSE_ERROR",
      dailyCount: rolled,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  const toolBlock = message.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    console.error("[regenerateWeeklyReportAction] no tool_use block", {
      stopReason: message.stop_reason,
      blockTypes: message.content.map((b) => b.type),
    });
    const rolled = await rollbackCounter(userId);
    return {
      success: false,
      error: "AI 응답 형식 오류. 다시 시도해주세요.",
      code: "PARSE_ERROR",
      dailyCount: rolled,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  const responseParsed = reportResponseSchema.safeParse(toolBlock.input);
  if (!responseParsed.success) {
    console.error("[regenerateWeeklyReportAction] invalid ai response", {
      issues: responseParsed.error.issues.map((i) => ({ path: i.path, code: i.code })),
    });
    const rolled = await rollbackCounter(userId);
    return {
      success: false,
      error: "AI 응답 형식 오류. 다시 시도해주세요.",
      code: "PARSE_ERROR",
      dailyCount: rolled,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  // 7) DB 저장
  try {
    const saved = await upsertReport(
      userId,
      workspaceId,
      idCheck.data,
      reportInput.weekStartDate,
      responseParsed.data,
      "ai",
    );
    return {
      success: true,
      content: responseParsed.data,
      weekStartDate: reportInput.weekStartDate,
      aiGeneratedAt: saved.aiGeneratedAt.toISOString(),
      generationType: "ai",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  } catch (err) {
    console.error("[regenerateWeeklyReportAction] upsert error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "보고서 저장 중 오류가 발생했습니다. 한도가 1회 소모되었습니다.",
      code: "UNKNOWN",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }
}

// ─── 내부 헬퍼 ───

async function tryCooldownReturn(
  userId: string,
  projectId: string,
  weekStart: string,
): Promise<RegenerateResult | null> {
  const rows = await db
    .select({
      contentJson: weeklyReports.contentJson,
      weekStartDate: weeklyReports.weekStartDate,
      aiGeneratedAt: weeklyReports.aiGeneratedAt,
      generationType: weeklyReports.generationType,
    })
    .from(weeklyReports)
    .where(
      and(
        eq(weeklyReports.userId, userId),
        eq(weeklyReports.projectId, projectId),
        eq(weeklyReports.weekStartDate, weekStart),
      ),
    )
    .limit(1);

  if (rows.length === 0) return null;

  const ageMs = Date.now() - rows[0].aiGeneratedAt.getTime();
  if (ageMs >= REPORT_COOLDOWN_MS) return null;

  const parsed = reportContentSchema.safeParse(rows[0].contentJson);
  if (!parsed.success) return null;

  const dailyCount = await readDailyCount(userId);
  return {
    success: true,
    content: parsed.data,
    weekStartDate: rows[0].weekStartDate,
    aiGeneratedAt: rows[0].aiGeneratedAt.toISOString(),
    generationType: rows[0].generationType,
    dailyCount,
    dailyLimit: AI_DAILY_LIMIT,
  };
}

async function readDailyCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: userSettings.aiDailyCallCount })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return row?.count ?? 0;
}

async function rollbackCounter(userId: string): Promise<number> {
  const [row] = await db
    .update(userSettings)
    .set({
      aiDailyCallCount: sql`GREATEST(${userSettings.aiDailyCallCount} - 1, 0)`,
      updatedAt: sql`NOW()`,
    })
    .where(eq(userSettings.userId, userId))
    .returning({ count: userSettings.aiDailyCallCount });
  return row?.count ?? 0;
}

async function upsertReport(
  userId: string,
  workspaceId: string,
  projectId: string,
  weekStartDate: string,
  content: ReportContent,
  generationType: GenerationType,
): Promise<{ aiGeneratedAt: Date }> {
  const [row] = await db
    .insert(weeklyReports)
    .values({
      userId,
      workspaceId,
      projectId,
      weekStartDate,
      contentJson: content,
      generationType,
    })
    .onConflictDoUpdate({
      target: [weeklyReports.userId, weeklyReports.projectId, weeklyReports.weekStartDate],
      set: {
        contentJson: content,
        generationType,
        aiGeneratedAt: sql`NOW()`,
      },
    })
    .returning({ aiGeneratedAt: weeklyReports.aiGeneratedAt });

  return { aiGeneratedAt: row.aiGeneratedAt };
}
