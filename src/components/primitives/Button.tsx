import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "cta-mini";

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary:
    "inline-flex items-center gap-[10px] px-7 py-[18px] bg-ink text-canvas rounded-[2px] font-sans font-medium text-[15px] leading-none transition-[box-shadow,transform] duration-[180ms] ease-[var(--ease-spring-soft)] hover:shadow-[var(--shadow-amber-md)] hover:-translate-x-[2px] hover:-translate-y-[2px]",
  ghost:
    "inline-flex items-center gap-[10px] px-7 py-[18px] bg-transparent text-ink border border-hairline-canvas-strong rounded-[2px] font-sans font-medium text-[15px] leading-none transition-colors duration-[180ms] hover:bg-ink hover:text-canvas",
  "cta-mini":
    "inline-flex items-center gap-2 px-5 py-3 bg-ink text-canvas rounded-[2px] font-sans font-medium text-[14px] leading-none transition-[box-shadow,transform] duration-[180ms] ease-[var(--ease-spring-soft)] hover:shadow-[3px_3px_0_0_var(--color-signal)] hover:-translate-x-[2px] hover:-translate-y-[2px]",
};

type LinkProps = BaseProps & ComponentProps<typeof Link> & { href: string };
type ButtonElementProps = BaseProps &
  Omit<ComponentProps<"button">, "children"> & { href?: undefined };

type Props = LinkProps | ButtonElementProps;

export function Button({ variant = "primary", className, children, ...rest }: Props) {
  const classes = cn(variantClass[variant], className);

  if ("href" in rest && rest.href) {
    return (
      <Link {...rest} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...(rest as ButtonElementProps)} className={classes}>
      {children}
    </button>
  );
}
