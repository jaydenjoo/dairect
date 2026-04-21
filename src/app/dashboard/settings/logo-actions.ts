"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth/get-user-id";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import {
  logoFileSchema,
  LOGO_MIME_EXTENSION,
  type LogoMimeType,
} from "@/lib/validation/workspace-logo";

const BUCKET = "workspace-logos";

// Task 5-2-2c: "use server" 파일 export 규칙(10패턴 1) 준수 — 로컬 type.
type LogoActionResult = {
  success: boolean;
  logoUrl?: string | null;
  error?: string;
};

// ─── 업로드 ───
//
// 흐름: 권한 가드 → Zod 검증 → Storage 업로드 → DB UPDATE → 기존 파일 orphan 제거 (best-effort).
// DB UPDATE 실패 시 방금 업로드한 Storage 파일을 롤백해 orphan 방지.
// 기존 파일 제거 실패는 경고 로그만 — 새 파일은 정상 저장된 상태 유지.
export async function uploadWorkspaceLogoAction(
  formData: FormData,
): Promise<LogoActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (role !== "owner" && role !== "admin") {
    return { success: false, error: "로고를 업로드할 권한이 없습니다" };
  }

  const file = formData.get("file");
  const parsed = logoFileSchema.safeParse(file);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "파일이 올바르지 않습니다";
    return { success: false, error: msg };
  }

  const validFile = parsed.data;
  const ext = LOGO_MIME_EXTENSION[validFile.type as LogoMimeType];
  const storagePath = `${workspaceId}/${Date.now()}.${ext}`;

  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, validFile, {
    contentType: validFile.type,
    upsert: false,
  });
  if (uploadError) {
    console.error("[uploadWorkspaceLogo] upload error", {
      name: uploadError.name,
      message: uploadError.message.slice(0, 200),
    });
    return { success: false, error: "로고 업로드에 실패했습니다" };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // 기존 경로 조회 — DB UPDATE 성공 후 orphan 제거용
  const [prev] = await db
    .select({ path: workspaces.logoStoragePath })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  try {
    await db
      .update(workspaces)
      .set({
        logoUrl: publicUrl,
        logoStoragePath: storagePath,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));
  } catch (err) {
    console.error("[uploadWorkspaceLogo] db update error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    // DB 실패 시 방금 업로드한 파일을 제거해 orphan 방지
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { success: false, error: "로고 정보 저장에 실패했습니다" };
  }

  // 기존 파일 제거 (best-effort) — 실패해도 신규 로고는 유효
  if (prev?.path && prev.path !== storagePath) {
    const { error: rmError } = await supabase.storage.from(BUCKET).remove([prev.path]);
    if (rmError) {
      console.error("[uploadWorkspaceLogo] old file remove warning", {
        name: rmError.name,
        message: rmError.message.slice(0, 200),
      });
    }
  }

  revalidatePath("/dashboard/settings");
  return { success: true, logoUrl: publicUrl };
}

// ─── 제거 ───
//
// 흐름: 권한 가드 → 기존 경로 조회 → Storage 삭제 (best-effort) → DB UPDATE null.
// Storage 삭제 실패 시 DB 갱신은 계속 진행 — orphan 파일은 별도 cleanup 작업으로 처리.
// DB 상태가 진실 공급원이므로 UI 일관성이 우선.
export async function removeWorkspaceLogoAction(): Promise<LogoActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "인증 정보를 확인할 수 없습니다" };

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return { success: false, error: "워크스페이스를 확인할 수 없습니다" };

  const role = await getCurrentWorkspaceRole(userId, workspaceId);
  if (role !== "owner" && role !== "admin") {
    return { success: false, error: "로고를 삭제할 권한이 없습니다" };
  }

  const [prev] = await db
    .select({ path: workspaces.logoStoragePath })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (prev?.path) {
    const supabase = await createClient();
    const { error: rmError } = await supabase.storage.from(BUCKET).remove([prev.path]);
    if (rmError) {
      console.error("[removeWorkspaceLogo] storage remove error", {
        name: rmError.name,
        message: rmError.message.slice(0, 200),
      });
    }
  }

  await db
    .update(workspaces)
    .set({
      logoUrl: null,
      logoStoragePath: null,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId));

  revalidatePath("/dashboard/settings");
  return { success: true, logoUrl: null };
}
