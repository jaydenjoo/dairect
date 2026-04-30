"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/auth/get-user-id";
import { checkAndIncrementRateLimit } from "@/lib/rate-limit";
import {
  commitJournalPost,
  JournalPublishError,
} from "@/lib/journal/publisher";
import { SLUG_REGEX, SLUG_MAX_LENGTH } from "@/lib/journal/slug";

/**
 * Journal 빠른 작성 폼 — Server Action.
 *
 * 흐름: auth 재검증 → rate limit → Zod 입력 검증 → KST 오늘 날짜 →
 *      GitHub commit (draft도 commit, status로 사이트 노출 분기) →
 *      revalidatePath(/dashboard/journal) → 결과 반환.
 *
 * 보안 방어 (🟡):
 *  - 미들웨어 + getUserId() 2중 인증 검증 (defense-in-depth)
 *  - 분당 10회 rate limit (1인 운영이라 자기 보호용)
 *  - Zod로 모든 필드 길이/형식 검증 (XSS · 크기 폭주 방어)
 *  - GitHub PAT 노출 0 (publisher.ts가 server-only)
 *
 * 비유: "글쓰기 우체통" — 폼이 들어오면 검사·인증·한도 확인 후 GitHub로 발송.
 */

const inputSchema = z.object({
  title: z
    .string()
    .min(1, "제목은 필수입니다")
    .max(100, "제목은 100자 이하여야 합니다"),
  slug: z
    .string()
    .min(1, "slug는 필수입니다")
    .max(SLUG_MAX_LENGTH, `slug는 ${SLUG_MAX_LENGTH}자 이하여야 합니다`)
    .regex(
      SLUG_REGEX,
      "slug는 영문 소문자·숫자·하이픈만 가능합니다 (한글·공백·대문자 금지)",
    ),
  tags: z
    .array(z.string().min(1, "태그는 비어있을 수 없음").max(30, "태그는 30자 이하"))
    .max(5, "태그는 최대 5개까지 가능"),
  body: z
    .string()
    .min(1, "본문은 필수입니다")
    .max(10000, "본문은 10000자 이하여야 합니다"),
  status: z.enum(["draft", "published"]),
});

export type CreateJournalPostInput = z.infer<typeof inputSchema>;

export type CreateJournalPostState =
  | { status: "idle" }
  | {
      status: "success";
      slug: string;
      htmlUrl: string;
      postStatus: "draft" | "published";
      filePath: string;
    }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
    };

/**
 * KST(Asia/Seoul) 기준 오늘 날짜 — YYYY-MM-DD.
 *
 * 비유: "한국 시각 기준 오늘 날짜 도장". UTC와 9시간 차이로 인한
 * "어제 글이 내일 폴더로" 같은 사고 방지.
 */
function getKstTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function createJournalPostAction(
  input: CreateJournalPostInput,
): Promise<CreateJournalPostState> {
  // 1) 인증 재검증 (미들웨어 외 2중 방어)
  const userId = await getUserId();
  if (!userId) {
    return {
      status: "error",
      message: "로그인이 필요합니다. 다시 로그인 후 시도해주세요.",
    };
  }

  // 2) Rate limit — 분당 10회 (1인 운영 자기 보호용)
  const rl = await checkAndIncrementRateLimit(`journal:user:${userId}:m`, {
    windowSec: 60,
    limit: 10,
  });
  if (!rl.allowed) {
    return {
      status: "error",
      message: `분당 작성 한도(${rl.limit}회) 초과 — ${rl.retryAfterSec}초 후 다시 시도하세요.`,
    };
  }

  // 3) 입력 검증 (client가 보낸 객체 그대로 Zod로 재검증 — defense-in-depth)
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "(root)";
      // 같은 필드에 여러 issue면 첫 번째만 표시 (UI 단순화)
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "입력값을 확인해주세요.",
      fieldErrors,
    };
  }

  // 4) GitHub commit
  const dateISO = getKstTodayISO();

  try {
    const result = await commitJournalPost({
      slug: parsed.data.slug,
      title: parsed.data.title,
      dateISO,
      body: parsed.data.body,
      tags: parsed.data.tags,
      status: parsed.data.status,
    });

    // dashboard 측 캐시 무효화 (사이트 측은 Vercel 빌드가 자동 갱신).
    revalidatePath("/dashboard/journal");

    return {
      status: "success",
      slug: parsed.data.slug,
      htmlUrl: result.htmlUrl,
      postStatus: parsed.data.status,
      filePath: result.filePath,
    };
  } catch (err) {
    if (err instanceof JournalPublishError) {
      return { status: "error", message: err.message };
    }
    // 예상 못한 에러 — 메시지 노출 최소화 (스택트레이스/PAT 누설 방지)
    console.error("[createJournalPostAction] unexpected error:", err);
    return {
      status: "error",
      message:
        "글 발행 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도하거나 운영자에게 문의하세요.",
    };
  }
}
