"use server";

import Anthropic, { APIConnectionTimeoutError, RateLimitError } from "@anthropic-ai/sdk";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { briefings, userSettings } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { CLAUDE_MODEL, getClaudeClient } from "@/lib/ai/claude-client";
import { BRIEFING_SYSTEM_PROMPT, BRIEFING_TOOL } from "@/lib/ai/briefing-prompt";
import { getWeeklyBriefingData, getKstDateParts } from "@/lib/ai/briefing-data";
import {
  briefingContentSchema,
  briefingResponseSchema,
  isWeeklyDataEmpty,
  type BriefingContent,
} from "@/lib/validation/briefing";
import { AI_DAILY_LIMIT } from "@/lib/validation/ai-estimate";

// 쿨다운: 같은 주 재호출이 10초 내면 AI/DB write 생략하고 기존 row 반환.
// 더블클릭·빈 데이터 flooding 등으로 DB/Claude 비용 중복 발생 방어 (리뷰 H2 + M1).
const BRIEFING_COOLDOWN_MS = 10_000;

// 로컬 타입 — "use server" 파일에서는 export 금지 (Next.js 16 번들러 제약, 10패턴1)
type GenerationType = "ai" | "empty_fallback";

type CurrentBriefing = {
  content: BriefingContent;
  weekStartDate: string;
  aiGeneratedAt: string; // ISO string
  generationType: GenerationType;
};

type RegenerateResult =
  | {
      success: true;
      content: BriefingContent;
      weekStartDate: string;
      aiGeneratedAt: string;
      generationType: GenerationType;
      dailyCount: number;
      dailyLimit: number;
    }
  | {
      success: false;
      error: string;
      code: "AUTH" | "LIMIT_EXCEEDED" | "TIMEOUT" | "PARSE_ERROR" | "UNKNOWN";
      dailyCount?: number;
      dailyLimit?: number;
    };

// ─── 빈 주간 데이터 fallback 브리핑 ───

function buildEmptyBriefing(): BriefingContent {
  return {
    focusItems: [
      {
        title: "진행 중 프로젝트 상태 확인",
        reason: "이번 주 마감 마일스톤·수금 건이 없습니다. 진행 중 프로젝트의 상태를 점검할 좋은 타이밍입니다.",
        priority: 3,
      },
      {
        title: "리드 파이프라인 점검",
        reason: "신규 리드·상담 예정 건을 확인하고 제안 단계로 진행 가능한 건을 추려보세요.",
        priority: 3,
      },
      {
        title: "견적/계약 미마감 건 정리",
        reason: "발송했으나 회신 없는 견적·미서명 계약이 있는지 확인하고 필요 시 후속 연락하세요.",
        priority: 3,
      },
    ],
    summary:
      "이번 주는 즉시 처리할 수금 예정·미수금·완료 임박 프로젝트·마일스톤이 없습니다. 조용한 한 주를 활용해 파이프라인 점검과 미완 문서 정리에 집중하세요.",
  };
}

// ─── 현재 주 브리핑 조회 (읽기 전용) ───

export async function getCurrentBriefing(): Promise<CurrentBriefing | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { weekStart } = getKstDateParts();

  // UNIQUE (userId, weekStartDate)로 최대 1건 보장 — desc/limit은 방어적 표기
  const rows = await db
    .select({
      contentJson: briefings.contentJson,
      weekStartDate: briefings.weekStartDate,
      aiGeneratedAt: briefings.aiGeneratedAt,
      generationType: briefings.generationType,
    })
    .from(briefings)
    .where(and(eq(briefings.userId, userId), eq(briefings.weekStartDate, weekStart)))
    .orderBy(desc(briefings.aiGeneratedAt))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  const parsed = briefingContentSchema.safeParse(row.contentJson);
  if (!parsed.success) {
    console.error("[getCurrentBriefing] content drift", {
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

// ─── 브리핑 재생성 (AI 호출 or 빈 데이터 fallback) ───

export async function regenerateBriefingAction(): Promise<RegenerateResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다", code: "AUTH" };
  }

  const { weekStart } = getKstDateParts();

  // 1) 쿨다운: 10초 내 생성된 row 있으면 그대로 반환 (DB/Claude write 생략)
  const cooldownHit = await tryCooldownReturn(userId, weekStart);
  if (cooldownHit) return cooldownHit;

  // 2) 주간 데이터 집계 (카운터 차감 전 — 빈 데이터면 AI 생략)
  const weeklyData = await getWeeklyBriefingData(userId);

  // 3) 빈 데이터 short-circuit: AI 호출 없이 fallback 저장. 카운터 차감 안 함.
  if (isWeeklyDataEmpty(weeklyData)) {
    const empty = buildEmptyBriefing();
    const saved = await upsertBriefing(userId, weeklyData.weekStartDate, empty, "empty_fallback");
    const dailyCount = await readDailyCount(userId);
    return {
      success: true,
      content: empty,
      weekStartDate: weeklyData.weekStartDate,
      aiGeneratedAt: saved.aiGeneratedAt.toISOString(),
      generationType: "empty_fallback",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  // 4) 한도 체크 + race-safe 카운터 pre-increment (ai-actions.ts와 동일 패턴, 카운터 공유)
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
    console.error("[regenerateBriefingAction] counter error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "AI 호출 한도 확인 중 오류가 발생했습니다",
      code: "UNKNOWN",
    };
  }

  // 5) Claude API 호출 — tool_choice JSON 강제 + <weekly_data> XML 래핑 + null 필드 제거(토큰 절약)
  let message: Anthropic.Messages.Message;
  try {
    const client = getClaudeClient();
    const weeklyJson = JSON.stringify(weeklyData, (_k, v) => (v === null ? undefined : v), 2);
    message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: BRIEFING_SYSTEM_PROMPT,
      tools: [BRIEFING_TOOL],
      tool_choice: { type: "tool", name: BRIEFING_TOOL.name },
      messages: [
        {
          role: "user",
          content: `<weekly_data>\n${weeklyJson}\n</weekly_data>`,
        },
      ],
    });
  } catch (err) {
    console.error("[regenerateBriefingAction] claude error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    // timeout/rate_limit은 Anthropic 과금이 발생했을 수 있어 카운터 유지 (ai-actions.ts 정책 일관)
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

  // 6) 응답 수신은 성공했으나 사용 불가한 경우 — 카운터 rollback 후 에러 반환 (리뷰 M3)
  if (message.stop_reason === "max_tokens") {
    console.error("[regenerateBriefingAction] max_tokens reached", {
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
    console.error("[regenerateBriefingAction] no tool_use block", {
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

  const responseParsed = briefingResponseSchema.safeParse(toolBlock.input);
  if (!responseParsed.success) {
    console.error("[regenerateBriefingAction] invalid ai response", {
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

  // 7) DB 저장 실패 대비 try-catch — 카운터 이미 차감됐으므로 사용자에게 한도 소모 안내
  try {
    const saved = await upsertBriefing(userId, weeklyData.weekStartDate, responseParsed.data, "ai");
    return {
      success: true,
      content: responseParsed.data,
      weekStartDate: weeklyData.weekStartDate,
      aiGeneratedAt: saved.aiGeneratedAt.toISOString(),
      generationType: "ai",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  } catch (err) {
    console.error("[regenerateBriefingAction] upsert error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "브리핑 저장 중 오류가 발생했습니다. 한도가 1회 소모되었습니다.",
      code: "UNKNOWN",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }
}

// ─── 내부 헬퍼 ───

// 쿨다운 체크: 10초 내 생성된 기존 row 있으면 그대로 반환.
// 없거나 content drift면 null → 본 흐름 진입.
async function tryCooldownReturn(
  userId: string,
  weekStart: string,
): Promise<RegenerateResult | null> {
  const rows = await db
    .select({
      contentJson: briefings.contentJson,
      weekStartDate: briefings.weekStartDate,
      aiGeneratedAt: briefings.aiGeneratedAt,
      generationType: briefings.generationType,
    })
    .from(briefings)
    .where(and(eq(briefings.userId, userId), eq(briefings.weekStartDate, weekStart)))
    .limit(1);

  if (rows.length === 0) return null;

  const ageMs = Date.now() - rows[0].aiGeneratedAt.getTime();
  if (ageMs >= BRIEFING_COOLDOWN_MS) return null;

  const parsed = briefingContentSchema.safeParse(rows[0].contentJson);
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

// 실패 경로 전용 카운터 롤백 (GREATEST로 음수 방지). 갱신 후 카운터 값 반환.
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

async function upsertBriefing(
  userId: string,
  weekStartDate: string,
  content: BriefingContent,
  generationType: GenerationType,
): Promise<{ aiGeneratedAt: Date }> {
  const [row] = await db
    .insert(briefings)
    .values({
      userId,
      weekStartDate,
      contentJson: content,
      generationType,
    })
    .onConflictDoUpdate({
      target: [briefings.userId, briefings.weekStartDate],
      set: {
        contentJson: content,
        generationType,
        aiGeneratedAt: sql`NOW()`,
      },
    })
    .returning({ aiGeneratedAt: briefings.aiGeneratedAt });

  return { aiGeneratedAt: row.aiGeneratedAt };
}
