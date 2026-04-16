import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name as string) ?? user?.email ?? "";

  return (
    <header className="flex h-16 items-center justify-between px-8">
      <div>{/* Page title rendered by each page */}</div>

      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm font-medium text-foreground/80 sm:block">
          {name}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
