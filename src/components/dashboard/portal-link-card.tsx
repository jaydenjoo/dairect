"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Link2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  issuePortalTokenAction,
  revokePortalTokenAction,
} from "@/app/dashboard/projects/[id]/portal-actions";
import type { ActivePortalTokenSummary } from "@/types/portal-token";

// "만료 임박" 기준 30일 — PRD v3.1 고객 포털 토큰 1년 TTL 전제.
const EXPIRING_SOON_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface Props {
  projectId: string;
  initial: ActivePortalTokenSummary | null;
}

// SSR/Hydration 안전 포맷 — 브라우저 로캘 의존 금지 (briefings 교훈 재활용).
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / MS_PER_DAY);
}

export function PortalLinkCard({ projectId, initial }: Props) {
  const [token, setToken] = useState<ActivePortalTokenSummary | null>(initial);
  const [isPending, startTransition] = useTransition();

  // SSR/CSR hydration 안전 — 초기값 null로 서버/클라 1차 렌더 일치, useEffect에서 origin 세팅.
  // NEXT_PUBLIC_APP_URL이 있으면 production 도메인 우선, 없으면 window.location.origin fallback.
  // 개발/프리뷰 환경 origin(`localhost:3700`, `*.vercel.app`)이 고객에게 전달되는 경로 방어.
  //
  // eslint 규칙 예외: 브라우저 외부 API(window.location)와 React state를 동기화하는 정당한 용례.
  // SSR에서는 window 접근 불가하므로 mount 후 1회 setState가 필요.
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const resolved =
      envUrl && envUrl.length > 0 ? envUrl.replace(/\/$/, "") : window.location.origin;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(resolved);
  }, []);

  const portalUrl = token
    ? origin
      ? `${origin}/portal/${token.token}`
      : `/portal/${token.token}`
    : null;

  const handleIssue = () => {
    if (
      token &&
      !window.confirm(
        "기존 링크가 무효화되고 새 링크가 발급됩니다. 계속할까요?",
      )
    ) {
      return;
    }
    const isReissue = token !== null;
    startTransition(async () => {
      const result = await issuePortalTokenAction(projectId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      // Server Action이 revalidatePath를 호출하지만 즉시 UI 반영을 위해 로컬 상태 업데이트.
      setToken({
        token: result.token,
        issuedAt: new Date().toISOString(),
        expiresAt: result.expiresAt,
        lastAccessedAt: null,
      });
      toast.success(isReissue ? "포털 링크를 재발급했어요" : "포털 링크를 발급했어요");
    });
  };

  const handleRevoke = () => {
    if (
      !window.confirm(
        "고객이 기존 링크로 접근할 수 없게 됩니다. 취소할까요?",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await revokePortalTokenAction(projectId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setToken(null);
      toast.success("포털 링크를 취소했어요");
    });
  };

  const handleCopy = async () => {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      toast.success("링크를 복사했어요");
    } catch {
      toast.error("복사에 실패했어요. 링크를 직접 선택해주세요");
    }
  };

  const daysLeft = token ? daysUntil(token.expiresAt) : null;
  const isExpiringSoon =
    daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS;

  return (
    <div className="rounded-xl bg-card p-6 shadow-ambient">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">
            고객 포털
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            고객이 로그인 없이 진행 상황과 마일스톤을 확인할 수 있는 전용 링크입니다.
          </p>
        </div>
        {token && isExpiringSoon && (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-xs font-medium text-amber-800"
          >
            {daysLeft}일 후 만료
          </Badge>
        )}
      </div>

      {!token ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            아직 발급된 포털 링크가 없습니다. 발급 후 고객에게 전달하세요.
          </p>
          <Button
            type="button"
            onClick={handleIssue}
            disabled={isPending}
            size="sm"
          >
            <Link2 className="mr-1.5 h-4 w-4" />
            {isPending ? "발급 중..." : "포털 링크 발급"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={portalUrl ?? ""}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="button"
              onClick={handleCopy}
              size="sm"
              variant="secondary"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              복사
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>발급: {formatDate(token.issuedAt)}</span>
            <span>만료: {formatDate(token.expiresAt)}</span>
            {token.lastAccessedAt && (
              <span>최근 열람: {formatDate(token.lastAccessedAt)}</span>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              onClick={handleIssue}
              disabled={isPending}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              재발급
            </Button>
            <Button
              type="button"
              onClick={handleRevoke}
              disabled={isPending}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
            >
              링크 취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
