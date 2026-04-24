// components/chrome/WordmarkLogo.tsx
//
// Enforces the three logo rules from CLAUDE.md:
//   1. "default"    — dairect + amber dot (nav, body)
//   2. "emphasis"   — d + ai(amber) + rect + dot (hero, footer large)
//   3. "etymology"  — D . AI . RECT decomposed with labels (etymology block)

import clsx from "clsx";

type Variant = "default" | "emphasis" | "etymology";

interface Props {
  variant?: Variant;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClass = {
  sm: "text-[20px]",
  md: "text-[28px]",
  lg: "text-[48px]",
  xl: "text-[clamp(80px,14vw,200px)]",
};

export function WordmarkLogo({ variant = "default", className, size = "md" }: Props) {
  if (variant === "etymology") {
    return (
      <div className={clsx("etymology flex items-end gap-[0.3em]", className)}>
        <Part glyph="D" label="DIRECTOR" size={size} />
        <Separator />
        <Part glyph="AI" label="ARTIFICIAL INTELLIGENCE" amber size={size} />
        <Separator />
        <Part glyph="RECT" label="DIRECT" size={size} />
      </div>
    );
  }

  if (variant === "emphasis") {
    return (
      <span className={clsx("font-serif font-medium tracking-tight-2", sizeClass[size], className)}>
        <span>d</span>
        <span className="text-signal italic font-light">ai</span>
        <span>rect</span>
        <span className="text-signal">.</span>
      </span>
    );
  }

  // default
  return (
    <span className={clsx("font-serif font-medium tracking-tight-1", sizeClass[size], className)}>
      dairect<span className="text-signal">.</span>
    </span>
  );
}

function Part({
  glyph, label, amber, size,
}: { glyph: string; label: string; amber?: boolean; size: Props["size"] }) {
  return (
    <div className="flex flex-col items-start">
      <span
        className={clsx(
          "font-serif leading-none",
          sizeClass[size!],
          amber ? "text-signal font-medium italic" : "font-light",
        )}
      >
        {glyph}
      </span>
      <span className={clsx(
        "font-mono text-[10px] tracking-[0.18em] uppercase mt-3",
        amber ? "text-signal" : "text-dust"
      )}>
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="font-serif text-dust text-[0.4em] leading-none pb-[0.15em]">.</span>;
}
