"use server";

import { headers } from "next/headers";
import { eq, asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries, leads, users, workspaceMembers, workspaces } from "@/lib/db/schema";
import {
  inquiryFormSchema,
  budgetLabel,
  type InquirySubmission,
} from "@/lib/validation/inquiry";
import {
  extractClientIp,
  extractUserAgent,
} from "@/lib/security/sanitize-headers";
import { stripFormulaTriggers } from "@/lib/security/csv-protection";
import { isValidElapsed } from "@/lib/security/timing-oracle";
import { checkAndIncrementRateLimit, parseRateLimit } from "@/lib/rate-limit";

// Task 5-2-2e: "use server" 파일 export 규칙(10패턴 1) 준수 — InquirySubmission은
// lib/validation/inquiry.ts로 이관(client contact-form.tsx가 import). InquiryActionResult는 로컬 type.
type InquiryActionResult = { success: boolean; error?: string };

// Phase 5.5 Task 5-5-4 rate-4: 랜딩 contact form IP 기반 rate limit.
// honeypot/timing 통과 후 volumetric abuse 방어용 추가 레이어 (기존 4종과 별개).
//   분당 3회: 정상 사용자 오타 재전송 포함 충분한 여유
//   시간당 20회: 단일 IP가 정상 운영 충분 + 누적 abuse 차단
// env override: INQUIRY_RATE_LIMIT_PER_MINUTE / INQUIRY_RATE_LIMIT_PER_HOUR
const INQUIRY_RATE_LIMITS = {
  perMinute: {
    windowSec: 60,
    limit: parseRateLimit(process.env.INQUIRY_RATE_LIMIT_PER_MINUTE, 3),
  },
  perHour: {
    windowSec: 3600,
    limit: parseRateLimit(process.env.INQUIRY_RATE_LIMIT_PER_HOUR, 20),
  },
};

export async function submitInquiryAction(
  payload: InquirySubmission,
): Promise<InquiryActionResult> {
  if (payload.website && payload.website.length > 0) {
    return { success: true };
  }

  // timing guard — startedAt이 없으면 통과(기존 동작 보존), 있으면 isValidElapsed로 강화 검증.
  // isValidElapsed는 finite + 3초 하한 + 30분 상한 sanity 통합 (NaN/음수/0 우회 차단).
  if (
    typeof payload.startedAt === "number" &&
    !isValidElapsed(Date.now() - payload.startedAt)
  ) {
    return { success: true };
  }

  // Task 5-5-4 rate-4: IP 기반 분/시간 한도. honeypot/timing 통과한 human-like 요청만 카운트.
  // Task rate-4 review MED-1 반영: IP null(XFF 미설정 모바일/비표준 proxy)은 rate limit skip —
  // 공유 "unknown" 버킷 false positive(정상 사용자 묶여 차단) 방어. 봇 방어는 honeypot/timing 위임.
  const h = await headers();
  const ipAddress = extractClientIp(h);

  if (ipAddress) {
    const minuteCheck = await checkAndIncrementRateLimit(
      `inquiry:ip:${ipAddress}:m`,
      INQUIRY_RATE_LIMITS.perMinute,
    );
    if (!minuteCheck.allowed) {
      return {
        success: false,
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      };
    }
    // short-circuit: 분 차단 시 시간 카운트 skip (Task 5-5-4 HIGH-1 동일 패턴).
    const hourCheck = await checkAndIncrementRateLimit(
      `inquiry:ip:${ipAddress}:h`,
      INQUIRY_RATE_LIMITS.perHour,
    );
    if (!hourCheck.allowed) {
      return {
        success: false,
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      };
    }
  }

  const parsed = inquiryFormSchema.safeParse({
    name: payload.name,
    contact: payload.contact,
    ideaSummary: payload.ideaSummary,
    description: payload.description,
    budgetRange: payload.budgetRange,
    schedule: payload.schedule,
    package: payload.package,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const v = parsed.data;

  try {
    const userAgent = extractUserAgent(h);

    const cleanName = stripFormulaTriggers(v.name);
    const cleanContact = stripFormulaTriggers(v.contact);
    const cleanIdea = v.ideaSummary ? stripFormulaTriggers(v.ideaSummary) : null;
    const cleanDescription = v.description ? stripFormulaTriggers(v.description) : null;

    const [inquiry] = await db
      .insert(inquiries)
      .values({
        name: cleanName,
        contact: cleanContact,
        ideaSummary: cleanIdea,
        description: cleanDescription,
        budgetRange: v.budgetRange ?? null,
        schedule: v.schedule ?? null,
        package: v.package ?? null,
        status: "new",
        ipAddress,
        userAgent,
      })
      .returning({ id: inquiries.id });

    // 리드 자동 생성 (single-tenant 전제: 최초 가입 운영자에게 할당)
    // SaaS 전환 시 도메인/서브도메인 기반 라우팅으로 교체 필요
    // 트랜잭션: leads insert + inquiries.convertedToLeadId 업데이트 원자성 보장
    // inquiries insert는 트랜잭션 밖 — 리드 생성 실패해도 고객 문의는 보존
    try {
      // 공개 landing form: 인증된 사용자 없음 → 최초 가입 운영자(single-tenant 전제)의
      // 첫 번째 workspace에 lead 귀속. Phase 5.5 SaaS 전환 시 도메인/서브도메인 기반으로 교체.
      const ownerRows = await db
        .select({
          userId: users.id,
          workspaceId: workspaceMembers.workspaceId,
        })
        .from(users)
        .innerJoin(workspaceMembers, eq(workspaceMembers.userId, users.id))
        .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
        .where(isNull(workspaces.deletedAt))
        .orderBy(asc(users.createdAt), asc(workspaceMembers.joinedAt), asc(workspaceMembers.id))
        .limit(1);
      const ownerId = ownerRows[0]?.userId;
      const ownerWorkspaceId = ownerRows[0]?.workspaceId;
      if (ownerId && ownerWorkspaceId && inquiry) {
        const isEmail = cleanContact.includes("@");
        await db.transaction(async (tx) => {
          const [lead] = await tx
            .insert(leads)
            .values({
              userId: ownerId,
              workspaceId: ownerWorkspaceId,
              source: "landing_form",
              name: cleanName,
              email: isEmail ? cleanContact : null,
              phone: isEmail ? null : cleanContact,
              projectType: cleanIdea,
              budgetRange: v.budgetRange ? budgetLabel[v.budgetRange] : null,
              description: cleanDescription,
              status: "new",
            })
            .returning({ id: leads.id });

          if (lead) {
            await tx
              .update(inquiries)
              .set({ convertedToLeadId: lead.id })
              .where(eq(inquiries.id, inquiry.id));
          }
        });
      } else if (!ownerId) {
        console.warn("[submitInquiryAction] lead auto-create skipped: no owner user");
      }
    } catch (leadErr) {
      console.error("[submitInquiryAction] lead creation failed", {
        name: leadErr instanceof Error ? leadErr.name : "unknown",
        message: leadErr instanceof Error ? leadErr.message : String(leadErr),
      });
    }

    return { success: true };
  } catch (err) {
    console.error("[submitInquiryAction]", {
      name: err instanceof Error ? err.name : "unknown",
      message: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      error: "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }
}
