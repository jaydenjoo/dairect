import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils/safe-next";

// Phase 5 Task 5-2-5: POST /auth/signout — form action용 로그아웃 라우트.
//
// 사용처: /invite/[token] email 불일치 시 "로그아웃하고 다시 로그인" 폼.
// 일반 헤더 로그아웃은 client component에서 supabase.auth.signOut() 호출.
//
// 보안 가드:
//   1) CSRF 방어 — Origin 헤더가 self origin과 일치해야 처리.
//      외부 사이트의 `<form action="https://dairect.kr/auth/signout">` 강제 로그아웃 차단.
//   2) Open Redirect 방어 — next는 safeNext 유틸로 검증.
export async function POST(request: Request) {
  const { origin: selfOrigin } = new URL(request.url);

  // CSRF: modern 브라우저는 same-origin POST에도 Origin 헤더를 설정.
  // 누락되거나 다르면 외부 악성 사이트로부터의 요청으로 간주하고 거부.
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== selfOrigin) {
    return NextResponse.redirect(`${selfOrigin}/login`, { status: 303 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const formData = await request.formData().catch(() => null);
  const rawNext = formData?.get("next")?.toString() ?? null;
  const safe = safeNext(rawNext, "");

  const target = safe
    ? `/login?next=${encodeURIComponent(safe)}`
    : "/login";
  return NextResponse.redirect(`${selfOrigin}${target}`, { status: 303 });
}
