"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
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
};

export function Sidebar({ basePath = "/dashboard" }: Props) {
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings (bottom) */}
        <div className="px-3 py-4">
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
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-sidebar md:hidden">
        <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const href = resolveHref(basePath, item.path);
            const active = isActive(pathname, href, basePath);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  active ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
