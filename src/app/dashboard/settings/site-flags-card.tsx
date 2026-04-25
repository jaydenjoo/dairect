"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { setPwaInstallPromptEnabledAction } from "./site-flags-actions";

/**
 * Epic Site-Flags (2026-04-25): /dashboard/settings 의 사이트 노출 토글 카드.
 *
 * 현재 1개 플래그: pwaInstallPromptEnabled.
 * 향후 다른 site-flag 추가 시 같은 카드 안에 토글 row 추가.
 */

export function SiteFlagsCard({
  initialPwaEnabled,
}: {
  initialPwaEnabled: boolean;
}) {
  const [pwaEnabled, setPwaEnabled] = useState(initialPwaEnabled);
  const [pending, startTransition] = useTransition();

  function handleTogglePwa(next: boolean) {
    // 낙관적 업데이트 — 서버 실패 시 롤백
    const previous = pwaEnabled;
    setPwaEnabled(next);
    startTransition(async () => {
      const result = await setPwaInstallPromptEnabledAction(next);
      if (result.success) {
        toast.success(
          next ? "앱 설치 안내를 노출합니다" : "앱 설치 안내를 숨겼습니다",
        );
      } else {
        setPwaEnabled(previous);
        toast.error(result.error ?? "저장에 실패했습니다");
      }
    });
  }

  return (
    <section className="rounded-xl border border-border/60 bg-background p-6">
      <div className="mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          사이트 노출
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          공개 영역(/, /projects 등) 에 어떤 안내를 보여줄지 토글합니다. 변경
          후 1분 이내 반영됩니다.
        </p>
      </div>

      <div className="divide-y divide-border/60">
        {/* PWA Install Prompt */}
        <div className="flex items-start justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50">
              {pwaEnabled ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                Dairect를 앱으로 설치 안내
                {pending && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Safari/Chrome 방문자에게 PWA 설치 배너를 우하단에 표시합니다.
                기본값: <span className="font-mono">숨김</span>
              </p>
              {pwaEnabled && (
                <p className="mt-1 text-xs text-amber-700">
                  💡 노출 중 — 모바일 Safari + Chrome/Edge 데스크톱에서 자동
                  표시됩니다.
                </p>
              )}
            </div>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center pt-1">
            <input
              type="checkbox"
              checked={pwaEnabled}
              onChange={(e) => handleTogglePwa(e.target.checked)}
              disabled={pending}
              className="peer sr-only"
              aria-label="앱 설치 안내 노출 여부"
            />
            <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2" />
            <span className="pointer-events-none absolute left-0.5 top-1.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
      </div>
    </section>
  );
}
