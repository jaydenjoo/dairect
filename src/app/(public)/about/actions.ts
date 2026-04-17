"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import {
  inquiryFormSchema,
  type InquiryFormData,
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

    await db.insert(inquiries).values({
      name: stripFormulaTriggers(v.name),
      contact: stripFormulaTriggers(v.contact),
      ideaSummary: v.ideaSummary ? stripFormulaTriggers(v.ideaSummary) : null,
      description: v.description ? stripFormulaTriggers(v.description) : null,
      budgetRange: v.budgetRange ?? null,
      schedule: v.schedule ?? null,
      package: v.package ?? null,
      status: "new",
      ipAddress,
      userAgent,
    });

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
