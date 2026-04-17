"use server";

import Anthropic, { APIConnectionTimeoutError, RateLimitError } from "@anthropic-ai/sdk";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/get-user-id";
import { CLAUDE_MODEL, getClaudeClient } from "@/lib/ai/claude-client";
import {
  ESTIMATE_DRAFT_SYSTEM_PROMPT,
  ESTIMATE_DRAFT_TOOL,
} from "@/lib/ai/estimate-prompt";
import {
  AI_DAILY_LIMIT,
  aiEstimateInputSchema,
  aiEstimateResponseSchema,
  type AiEstimateItem,
} from "@/lib/validation/ai-estimate";

// 로컬 타입 — "use server" 파일에서는 export 금지 (Next.js 16 번들러 제약)
type GenerateDraftResult =
  | {
      success: true;
      items: AiEstimateItem[];
      dailyCount: number;
      dailyLimit: number;
    }
  | {
      success: false;
      error: string;
      code: "AUTH" | "INVALID_INPUT" | "LIMIT_EXCEEDED" | "TIMEOUT" | "PARSE_ERROR" | "UNKNOWN";
      dailyCount?: number;
      dailyLimit?: number;
    };

// ─── AI 견적 초안 생성 ───
//
// 10패턴 준수:
//  1) "use server" 지시어 + async function만 export
//  2) getUserId 인증
//  3) Zod .strict() 입력 검증 + unrecognized_keys 필터
//  4) user_settings row 존재 보장 (onConflictDoNothing)
//  5) race-safe 카운터 증가 (UPDATE WHERE 조건에 현재 상태 포함)
//  6) Claude API 호출 (트랜잭션 밖, 커넥션 점유 방지)
//  7) tool_use 블록 강제 — tool_choice로 포맷 보장
//  8) 응답 Zod .strict() 검증
//  9) catch 블록에서 console.error + 일반화 메시지 반환
// 10) 일일 한도는 pre-increment (실패도 비용 처리)
export async function generateEstimateDraftAction(
  requirements: string,
): Promise<GenerateDraftResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "인증 정보를 확인할 수 없습니다", code: "AUTH" };
  }

  const parsed = aiEstimateInputSchema.safeParse({ requirements });
  if (!parsed.success) {
    const userIssue = parsed.error.issues.find((i) => i.code !== "unrecognized_keys");
    if (!userIssue) console.error("[generateEstimateDraftAction] unrecognized_keys", parsed.error.issues);
    return {
      success: false,
      error: userIssue?.message ?? "요구사항이 올바르지 않습니다",
      code: "INVALID_INPUT",
    };
  }

  // 한도 체크 + race-safe 증가 (하나의 조건부 UPDATE로 직렬화)
  let dailyCount: number;
  try {
    dailyCount = await db.transaction(async (tx) => {
      await tx
        .insert(userSettings)
        .values({ userId, aiDailyCallCount: 0 })
        .onConflictDoNothing({ target: userSettings.userId });

      // COALESCE 방어 2중화: schema notNull + default 적용 이후에도, 혹시 NULL이 섞일 경우
      // `NULL < CURRENT_DATE`가 NULL(false)로 판정되어 한도 영구 잠김 되는 상황 원천 차단.
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
        // 리셋 기준은 UTC 자정이므로 "내일"이 한국 사용자 기대와 최대 9시간 어긋남 → 문구 순화
        error: `일일 AI 호출 한도(${AI_DAILY_LIMIT}회)를 초과했습니다. 약 24시간 후 다시 시도해주세요.`,
        code: "LIMIT_EXCEEDED",
        dailyCount: AI_DAILY_LIMIT,
        dailyLimit: AI_DAILY_LIMIT,
      };
    }
    console.error("[generateEstimateDraftAction] counter error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return {
      success: false,
      error: "AI 호출 한도 확인 중 오류가 발생했습니다",
      code: "UNKNOWN",
    };
  }

  // Claude API 호출 — tool_choice로 JSON 포맷 강제
  // 프롬프트 인젝션 방어: 사용자 입력을 <user_requirement> 태그로 감싸 "지시"가 아닌 "데이터"임을 명시.
  // 시스템 프롬프트의 "보안 규칙" 섹션과 짝을 이룸.
  let message: Anthropic.Messages.Message;
  try {
    const client = getClaudeClient();
    message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: ESTIMATE_DRAFT_SYSTEM_PROMPT,
      tools: [ESTIMATE_DRAFT_TOOL],
      tool_choice: { type: "tool", name: ESTIMATE_DRAFT_TOOL.name },
      messages: [
        {
          role: "user",
          content: `<user_requirement>\n${parsed.data.requirements}\n</user_requirement>`,
        },
      ],
    });
  } catch (err) {
    // 로그에는 에러 타입/메시지만 (요구사항 원문·API 키·응답 본문 저장 금지)
    console.error("[generateEstimateDraftAction] claude error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });

    if (err instanceof APIConnectionTimeoutError) {
      return {
        success: false,
        error: "AI 응답이 지연됩니다. 잠시 후 다시 시도하거나 수동 입력을 이용해주세요.",
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

  // max_tokens 한도 도달 → tool_use.input이 잘린 JSON일 가능성
  if (message.stop_reason === "max_tokens") {
    console.error("[generateEstimateDraftAction] max_tokens reached", {
      stopReason: message.stop_reason,
      contentBlocks: message.content.length,
    });
    return {
      success: false,
      error: "AI 응답이 너무 길어 완성되지 못했습니다. 요구사항을 더 간결하게 작성해주세요.",
      code: "PARSE_ERROR",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  const toolBlock = message.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    // 원문 content 덤프 금지 — 구조 요약만
    console.error("[generateEstimateDraftAction] no tool_use block", {
      stopReason: message.stop_reason,
      blockTypes: message.content.map((b) => b.type),
    });
    return {
      success: false,
      error: "AI 응답 형식 오류. 다시 시도해주세요.",
      code: "PARSE_ERROR",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  const responseParsed = aiEstimateResponseSchema.safeParse(toolBlock.input);
  if (!responseParsed.success) {
    // tool_use.input 원문에 고객 요구사항 파생 텍스트가 포함될 수 있어 덤프 금지.
    // 로그에는 Zod 에러 path/code만 남김 (구조 진단용).
    console.error("[generateEstimateDraftAction] invalid ai response", {
      issues: responseParsed.error.issues.map((i) => ({ path: i.path, code: i.code })),
    });
    return {
      success: false,
      error: "AI 응답 형식 오류. 다시 시도해주세요.",
      code: "PARSE_ERROR",
      dailyCount,
      dailyLimit: AI_DAILY_LIMIT,
    };
  }

  return {
    success: true,
    items: responseParsed.data.items,
    dailyCount,
    dailyLimit: AI_DAILY_LIMIT,
  };
}
