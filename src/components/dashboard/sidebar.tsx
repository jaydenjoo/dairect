"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Users2,
  UserPlus,
  FileText,
  FileSignature,
  Receipt,
  Settings,
} from "lucide-react";

// basePath로 `/dashboard` 또는 `/demo` 선택. 링크는 `${basePath}${path}` 조합.
// 로직(active 판정)은 basePath와 무관하게 동일하게 동작.
type BasePath = "/dashboard" | "/demo";

// path는 basePath 뒤에 붙이는 suffix. "" = basePath 자체 (홈).
const NAV_ITEMS = [
  { label: "대시보드", path: "", icon: LayoutDashboard },
  { label: "리드", path: "/leads", icon: UserPlus },
  { label: "고객", path: "/clients", icon: Users },
  { label: "프로젝트", path: "/projects", icon: FolderKanban },
  { label: "견적서", path: "/estimates", icon: FileText },
  { label: "계약서", path: "/contracts", icon: FileSignature },
  { label: "정산", path: "/invoices", icon: Receipt },
] as const;

// 모바일 하단 탭: 공간 제약으로 5개. 리드는 데스크톱 전용(사이드바에서만 노출)
const MOBILE_NAV_ITEMS = [
  { label: "대시보드", path: "", icon: LayoutDashboard },
  { label: "프로젝트", path: "/projects", icon: FolderKanban },
  { label: "고객", path: "/clients", icon: Users },
  { label: "견적서", path: "/estimates", icon: FileText },
  { label: "계약서", path: "/contracts", icon: FileSignature },
] as const;

function resolveHref(basePath: BasePath, path: string): string {
  return path ? `${basePath}${path}` : basePath;
}

function isActive(pathname: string, href: string, basePath: BasePath): boolean {
  if (href === basePath) return pathname === basePath;
  return pathname.startsWith(href);
}

type Props = {
  basePath?: BasePath;
  // 프로젝트 메뉴에 표시할 "전체 미확인 피드백 합계". /demo 등 layout은 미지정 → 뱃지 숨김.
  unreadProjectCount?: number;
  // Phase 5 Task 5-2-2: owner/admin만 설정 메뉴 노출 (민감정보 방어).
  // /demo 등 workspace 맥락 없는 layout에선 true로 기본 허용.
  canSeeSettings?: boolean;
  // Phase 5 Task 5-2-4: owner/admin만 팀 멤버 메뉴 노출 (초대 권한 동일 조건).
  canSeeMembers?: boolean;
};

// 사이드바 뱃지가 "99+"로 잘리도록 상한 숫자 렌더 (UI 레이아웃 안정성).
// NaN/Infinity/음수 방어 — 타입 경계(Server Component prop)에서 오염된 값이 들어와도 안전.
function formatBadgeCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const normalized = Math.floor(n);
  return normalized > 99 ? "99+" : String(normalized);
}

export function Sidebar({
  basePath = "/dashboard",
  unreadProjectCount = 0,
  canSeeSettings = true,
  canSeeMembers = true,
}: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <Link
            href={basePath}
            className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground"
          >
            dairect
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const href = resolveHref(basePath, item.path);
              const active = isActive(pathname, href, basePath);
              const showBadge =
                item.path === "/projects" && unreadProjectCount > 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {item.label}
                    {showBadge && (
                      <span
                        aria-label={`읽지 않은 피드백 ${formatBadgeCount(unreadProjectCount)}건`}
                        className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
                      >
                        {formatBadgeCount(unreadProjectCount)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 관리 섹션 (팀/설정) — owner/admin만 노출 */}
        {(canSeeMembers || canSeeSettings) && (
          <div className="space-y-1 px-3 py-4">
            {canSeeMembers && (
              <Link
                href={`${basePath}/members`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(pathname, `${basePath}/members`, basePath)
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                }`}
              >
                <Users2 className="h-[18px] w-[18px] shrink-0" />
                팀 멤버
              </Link>
            )}
            {canSeeSettings && (
              <Link
                href={`${basePath}/settings`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(pathname, `${basePath}/settings`, basePath)
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                }`}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                설정
              </Link>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-sidebar md:hidden">
        <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const href = resolveHref(basePath, item.path);
            const active = isActive(pathname, href, basePath);
            const showBadge =
              item.path === "/projects" && unreadProjectCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  active ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                }`}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {showBadge && (
                    <span
                      aria-label={`읽지 않은 피드백 ${formatBadgeCount(unreadProjectCount)}건`}
                      className="absolute -right-2 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground"
                    >
                      {formatBadgeCount(unreadProjectCount)}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
