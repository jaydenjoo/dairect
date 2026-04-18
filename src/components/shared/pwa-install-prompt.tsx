"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type Platform =
  | "android-chromium"
  | "ios-safari"
  | "desktop-chromium"
  | "unsupported";

const DISMISS_KEY = "dairect.pwa.install.dismissed.v1";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unsupported";
  const ua = navigator.userAgent;
  const isIOS = /iP(hone|od|ad)/.test(ua);
  const isIOSChromiumOrFirefox = /CriOS|FxiOS|EdgiOS/.test(ua);
  if (isIOS) return isIOSChromiumOrFirefox ? "unsupported" : "ios-safari";
  if (/Android/.test(ua)) return "android-chromium";
  if (/(Chrome|Edg)\//.test(ua)) return "desktop-chromium";
  return "unsupported";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as { standalone?: boolean };
  return nav.standalone === true;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("unsupported");
  const [standalone, setStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setStandalone(isStandalone());
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [mounted]);

  const persistDismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage 비허용(시크릿 모드 등) — state만 유지 */
    }
    setDismissed(true);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        // appinstalled 이벤트가 발화되지 않는 구형 WebView 대비 즉시 standalone 간주.
        setStandalone(true);
      } else {
        persistDismiss();
      }
    } catch {
      /* prompt 이미 소비 또는 유저 취소 — 재시도 경로 없음 */
    } finally {
      setInstallEvent(null);
    }
  }, [installEvent, persistDismiss]);

  if (!mounted || standalone || dismissed) return null;

  if (platform === "ios-safari") {
    return (
      <InstallBanner onDismiss={persistDismiss}>
        <IconBadge>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </IconBadge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            홈 화면에 추가하기
          </p>
          <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
            Safari 하단 <KbdHint>공유</KbdHint> 버튼 →{" "}
            <KbdHint>홈 화면에 추가</KbdHint>
          </p>
        </div>
      </InstallBanner>
    );
  }

  if (
    installEvent &&
    (platform === "android-chromium" || platform === "desktop-chromium")
  ) {
    return (
      <InstallBanner onDismiss={persistDismiss}>
        <IconBadge>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </IconBadge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Dairect를 앱으로 설치
          </p>
          <p className="text-xs text-foreground/60 mt-0.5">
            빠른 접근 · 홈 화면 바로 실행
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          aria-label="Dairect 앱 설치 시작"
        >
          설치
        </Button>
      </InstallBanner>
    );
  }

  return null;
}

function InstallBanner({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="앱 설치 안내"
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50",
        "sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm",
        "surface-card rounded-2xl p-4 shadow-ambient-lg",
      )}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="설치 안내 닫기"
        className={cn(
          "absolute top-2 right-2",
          "inline-flex h-7 w-7 items-center justify-center",
          "rounded-md text-foreground/40 text-lg leading-none",
          "hover:text-foreground/70 hover:bg-foreground/[0.04]",
          "transition-colors",
        )}
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="pr-7 flex items-start gap-3">{children}</div>
    </div>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-10 w-10 shrink-0 rounded-xl",
        "bg-primary/10 text-primary",
        "flex items-center justify-center",
      )}
    >
      {children}
    </div>
  );
}

function KbdHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-block rounded px-1.5 py-0.5",
        "bg-foreground/[0.06] text-foreground/80",
        "text-[11px] font-medium font-sans",
      )}
    >
      {children}
    </kbd>
  );
}
