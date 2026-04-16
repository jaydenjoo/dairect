import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "대시보드",
    template: "%s | dairect",
  },
};

const navItems = [
  { label: "대시보드", href: "/dashboard" },
  { label: "프로젝트", href: "/dashboard/projects" },
  { label: "고객", href: "/dashboard/clients" },
  { label: "견적서", href: "/dashboard/estimates" },
  { label: "계약서", href: "/dashboard/contracts" },
  { label: "정산", href: "/dashboard/invoices" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-[#111827]">
        <div className="flex h-16 items-center px-6">
          <span className="text-lg font-bold tracking-tight text-white">
            dairect
          </span>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <Link
            href="/dashboard/settings"
            className="text-sm text-white/50 transition hover:text-white/80"
          >
            설정
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 bg-white">{children}</main>
    </div>
  );
}
