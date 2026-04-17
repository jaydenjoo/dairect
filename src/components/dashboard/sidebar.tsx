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

const navItems = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "리드", href: "/dashboard/leads", icon: UserPlus },
  { label: "고객", href: "/dashboard/clients", icon: Users },
  { label: "프로젝트", href: "/dashboard/projects", icon: FolderKanban },
  { label: "견적서", href: "/dashboard/estimates", icon: FileText },
  { label: "계약서", href: "/dashboard/contracts", icon: FileSignature },
  { label: "정산", href: "/dashboard/invoices", icon: Receipt },
];

// 모바일 하단 탭: 공간 제약으로 5개. 리드는 데스크톱 전용(사이드바에서만 노출)
const mobileNavItems = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "프로젝트", href: "/dashboard/projects", icon: FolderKanban },
  { label: "고객", href: "/dashboard/clients", icon: Users },
  { label: "견적서", href: "/dashboard/estimates", icon: FileText },
  { label: "계약서", href: "/dashboard/contracts", icon: FileSignature },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground">
            dairect
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(pathname, "/dashboard/settings")
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
          {mobileNavItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50"
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
