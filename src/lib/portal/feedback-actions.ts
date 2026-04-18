"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { portalFeedbacks } from "@/lib/db/schema";
import {
  FEEDBACK_MIN_SUBMIT_MS,
  portalFeedbackSchema,
} from "@/lib/validation/portal";
import { validatePortalToken } from "./token";

// 공개 엔드포인트 baseline — Task 2-7에서 확립된 IP/UA sanitize 정책.
// TODO(Task M6+): about/actions.ts와 중복 — src/lib/security/request-headers.ts로 공통화.
const MAX_UA = 500;
const MAX_IP = 64;

// 응답 시간 정규화 — timing oracle 방어. 성공/실패/드롭 모든 경로에서 NORMALIZE_MIN_MS 이상,
// NORMALIZE_MAX_MS 이하의 랜덤 지연으로 분산. DB insert가 빠를 때/느릴 때/실패 경로 모두
// 관측 가능한 시간 분포가 유사해지도록 함(2-tail timing oracle 방어).
const NORMALIZE_MIN_MS = 400;
const NORMALIZE_MAX_MS = 600;

// startedAt sanity 상한 — 폼을 30분 넘게 켜두는 정상 사용자는 드물고, 그보다 오래된
// 타임스탬프는 공격자가 임의 값 삽입한 경우가 대부분. 하한은 "현재 시각보다 미래"도 drop.
const STARTED_AT_MAX_AGE_MS = 30 * 60 * 1000;

function sanitizeHeader(raw: string | null | undefined, max: number): string | null {
  if (!raw) return null;
  // C0 제어문자 + DEL + NEL + LS/PS + BiDi override/embedding 전부 제거.
  // 저장된 UA/IP가 PM 대시보드/로그 뷰에서 렌더될 때 방향 역전/스푸핑 방지.
  const cleaned = raw.replace(
    /[\x00-\x1F\x7F\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/g,
    "",
  );
  const trimmed = cleaned.slice(0, max);
  return trimmed || null;
}

// CSV 자동 수식 실행 방어. 첫 줄만 막으면 `"OK\n=SUM()"` 같은 mid-body 트리거가 통과 →
// M6 export 단에서 라인별로 셀 재파싱 시 살아남음. 각 줄 leading char를 모두 strip.
function stripFormulaTriggers(s: string): string {
  return s
    .split(/\r?\n/)
    .map((line) => line.replace(/^[=+\-@\t\r]+/, ""))
    .join("\n");
}

async function normalizeTiming(t0: number): Promise<void> {
  const elapsed = Date.now() - t0;
  const target =
    NORMALIZE_MIN_MS + Math.floor(Math.random() * (NORMALIZE_MAX_MS - NORMALIZE_MIN_MS));
  if (elapsed < target) {
    await new Promise((resolve) => setTimeout(resolve, target - elapsed));
  }
}

// 성공/실패를 discriminated union으로 분리 — 호출측 narrowing 명확화.
export type PortalFeedbackActionResult =
  | { success: true }
  | { success: false; error: string };

// 클라이언트가 보내는 payload. token은 path param이라 여기엔 포함 금지.
export type PortalFeedbackSubmission = {
  message: string;
  website?: string;
  startedAt: number;
};

const GENERIC_ERROR = "잠시 후 다시 시도해주세요";

export async function submitPortalFeedbackAction(
  token: string,
  submission: PortalFeedbackSubmission,
): Promise<PortalFeedbackActionResult> {
  const t0 = Date.now();

  // 1. 토큰 재검증 — path param 기반. 실패도 success:true 위장으로 토큰 유효성 노출 차단.
  const payload = await validatePortalToken(token);
  if (!payload) {
    await normalizeTiming(t0);
    return { success: true };
  }

  // 2. honeypot — 값이 있으면 bot 추정.
  if (submission.website && submission.website.length > 0) {
    await normalizeTiming(t0);
    return { success: true };
  }

  // 3. timing guard — 공격자가 startedAt을 조작할 수 있으므로 음수/NaN/과거(상한 초과)/
  // 미래 모두 drop. `elapsed < FEEDBACK_MIN_SUBMIT_MS`만으로는 `startedAt: 0` 우회 가능.
  const elapsed = Date.now() - submission.startedAt;
  if (
    !Number.isFinite(elapsed) ||
    elapsed < FEEDBACK_MIN_SUBMIT_MS ||
    elapsed > STARTED_AT_MAX_AGE_MS
  ) {
    await normalizeTiming(t0);
    return { success: true };
  }

  // 4. Zod .strict() — message/honeypot/startedAt만 허용. 미정의 키는 warn, 진짜 validation
  // 실패는 error 로그로 추적 가능. `unrecognized_keys`만 있는 경우는 success 위장으로 drop.
  const parsed = portalFeedbackSchema.safeParse({
    message: submission.message,
    website: submission.website ?? "",
    startedAt: submission.startedAt,
  });
  if (!parsed.success) {
    const nonKeyIssues = parsed.error.issues.filter(
      (issue) => issue.code !== "unrecognized_keys",
    );
    if (nonKeyIssues.length === 0) {
      console.warn({
        event: "portal_feedback_unrecognized_keys",
        tokenId: payload.tokenId,
      });
      await normalizeTiming(t0);
      return { success: true };
    }
    console.error({
      event: "portal_feedback_validation_failed",
      tokenId: payload.tokenId,
      issueCodes: nonKeyIssues.map((issue) => issue.code),
    });
    await normalizeTiming(t0);
    return { success: false, error: GENERIC_ERROR };
  }

  // 5. 헤더 추출 + sanitize (IP 우측 파싱: Vercel XFF 스푸핑 방어)
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  const ipFromXff = xff?.split(",").at(-1)?.trim();
  const clientIp = sanitizeHeader(ipFromXff ?? h.get("x-real-ip"), MAX_IP);
  const userAgent = sanitizeHeader(h.get("user-agent"), MAX_UA);

  // 6. 본문 CSV 리딩 방어 (모든 줄의 leading char)
  const cleanMessage = stripFormulaTriggers(parsed.data.message);

  // 7. INSERT
  try {
    await db.insert(portalFeedbacks).values({
      projectId: payload.projectId,
      tokenId: payload.tokenId,
      message: cleanMessage,
      clientIp,
      userAgent,
    });
  } catch (err) {
    // err.message는 DB constraint/파라미터 노출 위험 → name만 기록.
    const errName = err instanceof Error ? err.name : "unknown";
    console.error({
      event: "portal_feedback_insert_failed",
      tokenId: payload.tokenId,
      errName,
    });
    await normalizeTiming(t0);
    return { success: false, error: GENERIC_ERROR };
  }

  await normalizeTiming(t0);
  return { success: true };
}
