import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Must call getUser() immediately — session refresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /dashboard/* 보호 — 미인증 시 /login 리다이렉트
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인 상태에서 /login 접근 시 → /dashboard 리다이렉트
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // portal/* 제외 — 비로그인 토큰 기반 경로라 Supabase auth 세션 조회 불요.
  // 공격 표면 분리(비로그인 라우트에 auth 쿠키 동행 금지) + 불필요한 DB 호출 제거.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|portal|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
