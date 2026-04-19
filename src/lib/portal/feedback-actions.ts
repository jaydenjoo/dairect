"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  portalFeedbacks,
  projects,
  userSettings,
} from "@/lib/db/schema";
import { emitN8nEvent } from "@/lib/n8n/client";
import { portalFeedbackSchema } from "@/lib/validation/portal";
import {
  extractClientIp,
  extractUserAgent,
} from "@/lib/security/sanitize-headers";
import { stripFormulaTriggers } from "@/lib/security/csv-protection";
import { isValidElapsed, normalizeTiming } from "@/lib/security/timing-oracle";
import { validatePortalToken } from "./token";

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
  // isValidElapsed가 finite + 하한(3s) + 상한(30min) sanity 통합 검증.
  if (!isValidElapsed(Date.now() - submission.startedAt)) {
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
  const clientIp = extractClientIp(h);
  const userAgent = extractUserAgent(h);

  // 6. 본문 CSV 리딩 방어 (모든 줄의 leading char)
  const cleanMessage = stripFormulaTriggers(parsed.data.message);

  // 7. INSERT
  let insertedId: string;
  try {
    const [inserted] = await db
      .insert(portalFeedbacks)
      .values({
        projectId: payload.projectId,
        tokenId: payload.tokenId,
        message: cleanMessage,
        clientIp,
        userAgent,
      })
      .returning({ id: portalFeedbacks.id });
    insertedId = inserted.id;
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

  // 8. n8n 이벤트 발송 (fire-and-forget) — Gmail/Slack 포워드는 n8n 워크플로 몫.
  // 본 응답에 영향 없도록 await 하지 않음. 실패해도 DB INSERT는 이미 확정.
  // 페이로드 정책: 토큰 원본/tokenId/clientIp/userAgent 제외. messagePreview 140자 제한.
  //
  // ⚠️ Vercel serverless: 응답 return 후 container freeze/종료로 IIFE 안의 emit이 조용히
  // 누락될 수 있음(Next 15+ `after()` / Vercel `waitUntil` 권장). self-hosted Node에선 안전.
  // 배포 환경 확정 후 Phase 5에서 `after()` 도입 검토.
  void (async () => {
    try {
      const [proj] = await db
        .select({
          projectName: projects.name,
          recipientEmail: userSettings.businessEmail,
        })
        .from(projects)
        .leftJoin(userSettings, eq(userSettings.userId, projects.userId))
        .where(eq(projects.id, payload.projectId))
        .limit(1);

      if (!proj?.recipientEmail) {
        // 수신자 PM의 businessEmail 미설정 시 이메일 발송 불가 — 스킵.
        console.warn({
          event: "portal_feedback_emit_skipped_no_recipient",
          projectId: payload.projectId,
        });
        return;
      }

      // projectName 헤더 injection 방어 — DB 오염/직접 편집으로 `\r\n`이 포함되면 Gmail
      // Subject에 그대로 실려 Bcc 추가 등 SMTP 헤더 조작 가능. emit 직전 한 번 더 sanitize.
      const safeProjectName = proj.projectName
        .replace(/[\r\n\t\x00-\x1F\x7F]/g, " ")
        .slice(0, 100);

      await emitN8nEvent(
        "portal_feedback_received",
        "portal_feedback.received",
        {
          feedbackId: insertedId,
          projectId: payload.projectId,
          projectName: safeProjectName,
          recipientEmail: proj.recipientEmail,
          messagePreview: cleanMessage.slice(0, 140),
          receivedAt: new Date().toISOString(),
        },
      );
    } catch (err) {
      const name = err instanceof Error ? err.name : "unknown";
      console.error({
        event: "portal_feedback_emit_failed",
        feedbackId: insertedId,
        name,
      });
    }
  })();

  await normalizeTiming(t0);
  return { success: true };
}
