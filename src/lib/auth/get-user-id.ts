import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// React cache()로 request 스코프 메모이제이션.
// Server Component + Action이 같은 request 안에서 여러 번 호출해도
// supabase.auth.getUser() 네트워크 왕복은 1회로 수렴.
export const getUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.error("[getUserId] auth error:", error.message);
  return user?.id ?? null;
});
