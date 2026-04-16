import { createClient } from "@/lib/supabase/server";

/** 현재 인증된 사용자 ID를 반환. 미인증 또는 에러 시 null */
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.error("[getUserId] auth error:", error.message);
  return user?.id ?? null;
}
