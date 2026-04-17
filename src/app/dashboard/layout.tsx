import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

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
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      name: metadata.full_name ?? metadata.name ?? null,
      avatarUrl: metadata.avatar_url ?? metadata.picture ?? null,
    })
    .onConflictDoNothing({ target: users.id });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

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
