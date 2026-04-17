import Link from "next/link";

export type NavActiveId =
  | "service"
  | "portfolio"
  | "pricing"
  | "about";

type NavItem = {
  id: NavActiveId;
  label: string;
  href: string;
};

const items: NavItem[] = [
  { id: "service", label: "서비스", href: "/about#service" },
  { id: "portfolio", label: "포트폴리오", href: "/projects" },
  { id: "pricing", label: "가격", href: "/pricing" },
  { id: "about", label: "소개", href: "/about" },
];

interface Props {
  active?: NavActiveId;
}

export function LandingNav({ active }: Props) {
  return (
    <nav className="glass fixed inset-x-0 top-0 z-50 shadow-ambient">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-foreground"
        >
          dairect
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/about#contact"
          className="soul-gradient rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          문의하기 →
        </Link>
      </div>
    </nav>
  );
}
