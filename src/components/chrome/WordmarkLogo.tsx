import { cn } from "@/lib/utils";

type Variant = "default" | "emphasis" | "etymology";
type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  variant?: Variant;
  className?: string;
  size?: Size;
};

const sizeClass: Record<Size, string> = {
  sm: "text-[20px]",
  md: "text-[28px]",
  lg: "text-[48px]",
  xl: "text-[clamp(80px,14vw,200px)]",
};

export function WordmarkLogo({
  variant = "default",
  className,
  size = "md",
}: Props) {
  if (variant === "etymology") {
    return (
      <div className={cn("flex items-end gap-[0.3em]", className)}>
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
      <span
        className={cn(
          "font-serif font-medium tracking-tight-2",
          sizeClass[size],
          className,
        )}
      >
        <span>d</span>
        <span className="text-signal italic font-light">ai</span>
        <span>rect</span>
        <span className="text-signal">.</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "font-serif font-medium tracking-tight-1",
        sizeClass[size],
        className,
      )}
    >
      dairect<span className="text-signal">.</span>
    </span>
  );
}

type PartProps = {
  glyph: string;
  label: string;
  amber?: boolean;
  size: Size;
};

function Part({ glyph, label, amber, size }: PartProps) {
  return (
    <div className="flex flex-col items-start">
      <span
        className={cn(
          "font-serif leading-none",
          sizeClass[size],
          amber ? "text-signal font-medium italic" : "font-light",
        )}
      >
        {glyph}
      </span>
      <span
        className={cn(
          "font-mono text-[10px] tracking-label-wide uppercase mt-3",
          amber ? "text-signal" : "text-dust",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="font-serif text-dust text-[0.4em] leading-none pb-[0.15em]">
      .
    </span>
  );
}
