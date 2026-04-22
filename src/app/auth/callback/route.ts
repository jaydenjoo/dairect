import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils/safe-next";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Open Redirect 방지: 공통 safeNext 유틸로 통일.
  // backslash bypass(`/\evil.com`)와 protocol-relative(`//evil.com`) 모두 차단.
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 인증 실패 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
