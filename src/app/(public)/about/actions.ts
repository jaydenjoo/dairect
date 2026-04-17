"use server";

import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiries, leads, users } from "@/lib/db/schema";
import {
  inquiryFormSchema,
  type InquiryFormData,
  budgetLabel,
} from "@/lib/validation/inquiry";

export type InquiryActionResult = { success: boolean; error?: string };

const MAX_UA = 500;
const MAX_IP = 64;
const MIN_SUBMIT_MS = 3000;

function sanitizeHeader(raw: string | null | undefined, max: number): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\x00-\x1F\x7F]/g, "");
  const trimmed = cleaned.slice(0, max);
  return trimmed || null;
}

function stripFormulaTriggers(s: string): string {
  return s.replace(/^[=+\-@\t\r]+/, "");
}

export type InquirySubmission = InquiryFormData & {
  website?: string;
  startedAt?: number;
};

export async function submitInquiryAction(
  payload: InquirySubmission,
): Promise<InquiryActionResult> {
  if (payload.website && payload.website.length > 0) {
    return { success: true };
  }

  if (
    typeof payload.startedAt === "number" &&
    Date.now() - payload.startedAt < MIN_SUBMIT_MS
  ) {
    return { success: true };
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
    const h = await headers();
    const xff = h.get("x-forwarded-for");
    const ipFromXff = xff?.split(",").at(-1)?.trim();
    const ipAddress = sanitizeHeader(ipFromXff ?? h.get("x-real-ip"), MAX_IP);
    const userAgent = sanitizeHeader(h.get("user-agent"), MAX_UA);

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
      const ownerRows = await db
        .select({ id: users.id })
        .from(users)
        .orderBy(asc(users.createdAt))
        .limit(1);
      const ownerId = ownerRows[0]?.id;
      if (ownerId && inquiry) {
        const isEmail = cleanContact.includes("@");
        await db.transaction(async (tx) => {
          const [lead] = await tx
            .insert(leads)
            .values({
              userId: ownerId,
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
