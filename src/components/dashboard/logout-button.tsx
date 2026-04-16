"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-muted hover:text-foreground/70"
      aria-label="로그아웃"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
