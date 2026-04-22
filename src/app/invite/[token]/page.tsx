import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";
import { AlertCircle, CheckCircle2, Clock, LogIn, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  workspaceInvitations,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import { AcceptButton } from "./accept-button";

export const metadata: Metadata = {
  title: "초대 수락",
  // Phase 5 Task 5-2-5: 토큰이 URL에 노출되므로 외부 referrer 유출 방지.
  // 이메일 클라이언트 → 브라우저 → 초대 페이지 → 외부 링크 클릭 시 referrer로 토큰 전달 차단.
  other: {
    referrer: "no-referrer",
  },
};

// token uuid 포맷 체크 (page 진입 시 1차 검증 — 서버 조회 부하 경감)
function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

type PageProps = {
  params: Promise<{ token: string }>;
};

// Next.js redirect()/notFound()는 digest가 "NEXT_REDIRECT"/"NEXT_NOT_FOUND"인
// special error를 throw. try/catch 내부에서 잡으면 Next.js가 처리하지 못함.
// catch 시 이 helper로 감지하고 re-throw 해야 함.
function isNextInternalError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_")
  );
}

// Phase 5 Task 5-2-5: `/invite/[token]` 서버 컴포넌트.
//
// 상태 분기 (우선순위 순):
//   1) token 포맷 불량 → INVALID_TOKEN
//   2) DB에 없음 → INVALID_TOKEN
//   3) role='owner' → INVALID_TOKEN (defense-in-depth, 정상 경로에서는 생성 불가)
//   4) revoked → REVOKED
//   5) accepted → ALREADY_ACCEPTED
//   6) expired → EXPIRED
//   7) 미로그인 → /login?next=/invite/<token> 리다이렉트
//   8) 로그인했지만 email 불일치 → EMAIL_MISMATCH (로그아웃 버튼 노출)
//   9) 이미 해당 workspace 멤버 → ALREADY_MEMBER
//   10) 모든 체크 통과 → VALID (AcceptButton 렌더)
//
// 예외 처리:
//   DB/supabase 에러 발생 시 generic ErrorCard 렌더. 에러 로깅에서 token 완전 제외
//   (Vercel 로그 유출 시 무자격 수락 위험).
export default async function InvitePage(props: PageProps) {
  try {
    return await renderInvitePage(props);
  } catch (err) {
    // redirect() / notFound()의 NEXT_REDIRECT/NEXT_NOT_FOUND는 re-throw
    if (isNextInternalError(err)) throw err;

    // token은 로그에 기록 금지 — message/name만.
    console.error("[invite/page] error", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 200) : "",
    });
    return (
      <ErrorCard
        icon={<XCircle className="h-10 w-10 text-destructive" />}
        title="초대 링크를 확인할 수 없습니다"
        description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      />
    );
  }
}

async function renderInvitePage({ params }: PageProps) {
  const { token } = await params;

  if (!isUuid(token)) {
    return (
      <ErrorCard
        icon={<XCircle className="h-10 w-10 text-destructive" />}
        title="초대 링크가 유효하지 않습니다"
        description="링크를 다시 확인해주세요. 문제가 지속되면 초대자에게 문의해주세요."
      />
    );
  }

  // ── 초대 조회 ──
  // isExpired를 DB에서 계산 — React Server Component purity 규칙상 Date.now()/new Date() 호출 금지.
  const [invitation] = await db
    .select({
      id: workspaceInvitations.id,
      workspaceId: workspaceInvitations.workspaceId,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      acceptedAt: workspaceInvitations.acceptedAt,
      revokedAt: workspaceInvitations.revokedAt,
      isExpired: sql<boolean>`${workspaceInvitations.expiresAt} <= NOW()`,
    })
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, token))
    .limit(1);

  if (!invitation) {
    return (
      <ErrorCard
        icon={<XCircle className="h-10 w-10 text-destructive" />}
        title="초대 링크가 유효하지 않습니다"
        description="이 링크는 존재하지 않거나 이미 만료되었을 수 있습니다."
      />
    );
  }

  // role='owner'는 UI 경로에서 생성 불가 — DB 직접 INSERT 등 비정상 경로 차단 (defense-in-depth).
  if (invitation.role === "owner") {
    return (
      <ErrorCard
        icon={<XCircle className="h-10 w-10 text-destructive" />}
        title="초대 링크가 유효하지 않습니다"
        description="이 링크는 존재하지 않거나 이미 만료되었을 수 있습니다."
      />
    );
  }

  if (invitation.revokedAt) {
    return (
      <ErrorCard
        icon={<XCircle className="h-10 w-10 text-destructive" />}
        title="취소된 초대입니다"
        description="초대자가 이 초대를 취소했습니다. 다시 초대를 요청해주세요."
      />
    );
  }

  if (invitation.acceptedAt) {
    return (
      <ErrorCard
        icon={<CheckCircle2 className="h-10 w-10 text-emerald-600" />}
        title="이미 수락된 초대입니다"
        description="이 초대는 이미 처리되었습니다."
        action={
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            대시보드로 이동
          </Link>
        }
      />
    );
  }

  if (invitation.isExpired) {
    return (
      <ErrorCard
        icon={<Clock className="h-10 w-10 text-amber-600" />}
        title="초대 링크가 만료되었습니다"
        description="초대 링크는 7일간 유효합니다. 초대자에게 다시 요청해주세요."
      />
    );
  }

  // workspace 이름 조회 (모든 VALID 이후 분기에서 공통 사용)
  const [ws] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, invitation.workspaceId))
    .limit(1);
  const workspaceName = ws?.name ?? "워크스페이스";

  // ── 로그인 상태 확인 ──
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user?.email) {
    // 미로그인 → 로그인 페이지로 리다이렉트. 토큰을 next에 실어 로그인 완료 후 복귀.
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  // ── email 매칭 (대소문자 무시) ──
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    return (
      <ErrorCard
        icon={<AlertCircle className="h-10 w-10 text-amber-600" />}
        title="초대 이메일이 일치하지 않습니다"
        description={
          <>
            이 초대는 <strong>{invitation.email}</strong>로 발송되었습니다.
            <br />
            현재 로그인된 계정 <strong>{user.email}</strong>과 일치하지 않습니다.
            <br />
            로그아웃 후 초대받은 이메일로 다시 로그인해주세요.
          </>
        }
        action={
          <form action="/auth/signout" method="post">
            <input type="hidden" name="next" value={`/invite/${token}`} />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg surface-high px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#E7E7E5]"
            >
              <LogIn className="h-4 w-4" />
              로그아웃하고 다시 로그인
            </button>
          </form>
        }
      />
    );
  }

  // ── 이미 해당 workspace 멤버인지 확인 ──
  const [existingMembership] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, invitation.workspaceId),
        eq(workspaceMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (existingMembership) {
    return (
      <ErrorCard
        icon={<CheckCircle2 className="h-10 w-10 text-emerald-600" />}
        title={`이미 ${workspaceName} 워크스페이스 멤버입니다`}
        description="바로 대시보드로 이동할 수 있습니다."
        action={
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            대시보드로 이동
          </Link>
        }
      />
    );
  }

  // ── 유효한 초대 → 수락 UI ──
  const roleLabel =
    invitation.role === "owner"
      ? "소유자"
      : invitation.role === "admin"
        ? "관리자"
        : "멤버";

  return (
    <div className="flex min-h-screen items-center justify-center surface-base px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-primary">dairect</h1>
        </div>

        <div className="surface-card space-y-6 rounded-xl p-8 shadow-ambient">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {workspaceName} 워크스페이스 초대
            </h2>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{user.email}</strong>(으)로 초대되었습니다.
              <br />
              역할: <strong className="text-foreground">{roleLabel}</strong>
            </p>
          </div>

          <AcceptButton token={token} workspaceName={workspaceName} />

          <p className="text-center text-xs text-muted-foreground">
            수락하면 {workspaceName}의 프로젝트·고객·견적 등을 역할 권한 범위에서 이용할 수 있습니다.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ← dairect.kr 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── 공통 에러 카드 ───

type ErrorCardProps = {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
};

function ErrorCard({ icon, title, description, action }: ErrorCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center surface-base px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-primary">dairect</h1>
        </div>

        <div className="surface-card space-y-6 rounded-xl p-8 shadow-ambient">
          <div className="flex flex-col items-center gap-3 text-center">
            {icon}
            <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {action}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ← dairect.kr 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
