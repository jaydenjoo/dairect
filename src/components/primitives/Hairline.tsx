import { cn } from "@/lib/utils";

type Props = {
  variant?: "canvas" | "ink" | "canvas-strong" | "ink-strong";
  className?: string;
};

const colorClass: Record<NonNullable<Props["variant"]>, string> = {
  canvas: "bg-hairline-canvas",
  ink: "bg-hairline-ink",
  "canvas-strong": "bg-hairline-canvas-strong",
  "ink-strong": "bg-hairline-ink-strong",
};

export function Hairline({ variant = "canvas", className }: Props) {
  return <div className={cn("h-px w-full", colorClass[variant], className)} />;
}
