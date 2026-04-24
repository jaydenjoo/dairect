import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  amber?: boolean;
  className?: string;
  as?: "p" | "span" | "div";
};

export function Kicker({ children, amber, className, as: Tag = "p" }: Props) {
  return (
    <Tag
      className={cn(
        "font-mono text-[12px] leading-[1.4] tracking-mono-wide uppercase m-0",
        amber ? "text-signal" : "text-dust",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
