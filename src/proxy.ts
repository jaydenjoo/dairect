import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Task 5-2-2f: Next.js 16 proxy 컨벤션 — 기존 middleware.ts는 deprecated.
// 파일명(middleware.ts → proxy.ts) + export 함수명(middleware → proxy)만 변경.
// config.matcher는 동일 유지. 기능/로직 차이 없음.
// 공식 codemod: `npx @next/codemod@latest middleware-to-proxy .` 와 동등한 수동 반영.
export async function proxy(request: NextRequest) {
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

  // 로그인 상태에서 /login 또는 /signup 접근 시 → /dashboard 리다이렉트
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
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
