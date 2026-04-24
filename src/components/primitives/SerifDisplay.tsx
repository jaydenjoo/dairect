import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

export function SerifDisplay({ children, as: Tag = "h1", className }: Props) {
  return (
    <Tag
      className={cn(
        "font-serif font-medium tracking-tight-2 leading-[1.02] text-ink",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type EmphasisProps = {
  children: ReactNode;
  className?: string;
};

export function SerifItalicAmber({ children, className }: EmphasisProps) {
  return (
    <em className={cn("italic font-light text-signal", className)}>{children}</em>
  );
}

export function SerifItalic({ children, className }: EmphasisProps) {
  return (
    <em className={cn("italic font-light", className)}>{children}</em>
  );
}
