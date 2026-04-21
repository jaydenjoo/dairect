"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/auth/get-user-id";
import { db } from "@/lib/db";
import { users, workspaceMembers, workspaces } from "@/lib/db/schema";
import { guardSingleLine } from "@/lib/validation/shared-text";
import { isValidSlug } from "@/lib/utils/slug";

// Phase 5 Task 5-2-1: 온보딩 저장 + 건너뛰기 Server Actions.
//
// 정책:
//   - 저장: workspace 이름/slug 갱신 + users.onboarded_at = now() 트랜잭션
//   - 건너뛰기: 이름 변경 없이 onboarded_at만 세팅 — 기본 이름 "{userName}의 워크스페이스" 유지
//   - slug UNIQUE 충돌 시 auto-suffix 대신 명시적 에러 반환 (사용자 의도 보존)
//   - 권한: owner/admin만 이름/slug 변경 가능 (member는 skip만 가능)

const SaveSchema = z.object({
  workspaceId: z.string().uuid(),
  name: guardSingleLine(z.string().min(2).max(60), "워크스페이스 이름"),
  slug: z
    .string()
    .min(2)
    .max(40)
    .refine(isValidSlug, "영문 소문자, 숫자, 하이픈만 허용됩니다"),
});

export type OnboardingResult = { ok: true } | { ok: false; error: string };

export async function saveOnboardingAction(
  input: z.infer<typeof SaveSchema>,
): Promise<OnboardingResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  const parsed = SaveSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "입력이 올바르지 않습니다.";
    return { ok: false, error: first };
  }

  const { workspaceId, name, slug } = parsed.data;

  const [member] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .limit(1);

  if (!member) {
    return { ok: false, error: "해당 워크스페이스에 소속되어 있지 않습니다." };
  }
  if (member.role !== "owner" && member.role !== "admin") {
    return {
      ok: false,
      error: "워크스페이스 이름을 변경할 권한이 없습니다. 건너뛰기로 진행해주세요.",
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(workspaces)
        .set({ name, slug, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId));
      await tx
        .update(users)
        .set({ onboardedAt: new Date() })
        .where(eq(users.id, userId));
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // workspaces.slug UNIQUE 충돌 — 사용자에게 인라인 에러로 돌려준다.
    if (msg.toLowerCase().includes("unique") && msg.toLowerCase().includes("slug")) {
      return {
        ok: false,
        error: "이 주소는 이미 사용 중입니다. 다른 주소를 입력해주세요.",
      };
    }
    console.error("[saveOnboardingAction]", { userId, workspaceId, error: msg });
    return { ok: false, error: "저장 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function skipOnboardingAction(): Promise<OnboardingResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  try {
    await db
      .update(users)
      .set({ onboardedAt: new Date() })
      .where(eq(users.id, userId));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[skipOnboardingAction]", { userId, error: msg });
    return { ok: false, error: "저장 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
