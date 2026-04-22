import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ensureDefaultWorkspace } from "@/lib/auth/ensure-default-workspace";
import { getCurrentWorkspaceId } from "@/lib/auth/get-workspace-id";
import { getCurrentWorkspaceRole } from "@/lib/auth/get-workspace-role";
import { getTotalUnreadFeedbackForUser } from "./projects/[id]/feedback-actions";

export const metadata: Metadata = {
  title: {
    default: "대시보드",
    template: "%s | dairect",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  // auth.users ↔ public.users 동기화
  // Supabase Auth는 auth.users에만 저장하므로 앱 스키마의 public.users에 최초 진입 시 INSERT.
  // onConflictDoNothing으로 중복 방지, 이후 진입은 no-op.
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

  // Phase 5 Task 5-2-7: 소속 workspace 없으면 default 자동 생성.
  // 내부에서 "이미 소속 있으면 early return"이라 매 진입 비용은 SELECT 1회.
  // /signup 직후 진입 / Google OAuth 신규 가입 / 기존 유저 재진입 모두 같은 경로.
  await ensureDefaultWorkspace(user.id, resolvedName, user.email);

  // Phase 5 Task 5-2-1: 온보딩 미완료 시 /onboarding으로 리다이렉트.
  // 마이그레이션 0024 백필로 기존 사용자는 이미 NOT NULL — 신규 가입자만 진입.
  const [userRow] = await db
    .select({ onboardedAt: users.onboardedAt })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!userRow?.onboardedAt) redirect("/onboarding");

  // 사이드바 "프로젝트" 메뉴 뱃지 — 사용자 전체 미확인 피드백 합계.
  // layout 레벨에서 1회만 계산, 자식 페이지에 prop으로 전파.
  const unreadFeedbackTotal = await getTotalUnreadFeedbackForUser();

  // Phase 5 Task 5-2-2: owner/admin만 사이드바에 "설정" 메뉴 노출.
  // Phase 5 Task 5-2-4: "팀 멤버" 메뉴도 동일 조건 (초대/관리 권한 canManageMembers와 정합).
  const workspaceId = await getCurrentWorkspaceId();
  const role = workspaceId
    ? await getCurrentWorkspaceRole(user.id, workspaceId)
    : null;
  const isManager = role === "owner" || role === "admin";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        unreadProjectCount={unreadFeedbackTotal}
        canSeeSettings={isManager}
        canSeeMembers={isManager}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:ml-60">
        <Header />
        <main className="flex-1 px-6 pb-20 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
