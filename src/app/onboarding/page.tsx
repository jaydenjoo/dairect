import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";
import { ensureDefaultWorkspace } from "@/lib/auth/ensure-default-workspace";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  // users 테이블 upsert + default workspace 멱등 보장 — dashboard layout과 동일 로직.
  // /signup → /onboarding 직접 진입 케이스를 위해 여기서도 실행 (멱등하므로 중복 호출 안전).
  const metadata = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const resolvedName = metadata.full_name ?? metadata.name ?? null;

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      name: resolvedName,
      avatarUrl: metadata.avatar_url ?? metadata.picture ?? null,
    })
    .onConflictDoNothing({ target: users.id });

  await ensureDefaultWorkspace(user.id, resolvedName, user.email);

  // 이미 온보딩 완료 → /dashboard 리다이렉트 (루프 방지)
  const [userRow] = await db
    .select({ onboardedAt: users.onboardedAt })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (userRow?.onboardedAt) redirect("/dashboard");

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect("/dashboard"); // defensive — ensureDefaultWorkspace 이후엔 항상 값이 있어야 함

  const [ws] = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
    })
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), isNull(workspaces.deletedAt)))
    .limit(1);

  if (!ws) redirect("/dashboard");

  return (
    <OnboardingForm
      workspaceId={ws.id}
      initialName={ws.name}
      initialSlug={ws.slug}
    />
  );
}
