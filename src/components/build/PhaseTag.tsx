import type { BuildFrontmatter } from "@/lib/content/types";

/**
 * Build phase 라벨.
 *
 * Studio Anthem 톤: emoji + Mono uppercase + 색 구분.
 * - idea: dust (조용한 신호)
 * - building: accent amber (현재 활성)
 * - shipped: ink (완성된 무게감)
 *
 * 비유: "공사장 안내판" — 어느 단계인지 한눈에.
 */

const phaseConfig: Record<
  BuildFrontmatter["phase"],
  { label: string; emoji: string; colorClass: string }
> = {
  idea: {
    label: "아이디어",
    emoji: "💡",
    colorClass: "text-muted-foreground",
  },
  building: {
    label: "개발 중",
    emoji: "🛠️",
    colorClass: "text-accent",
  },
  shipped: {
    label: "출시",
    emoji: "✅",
    colorClass: "text-foreground",
  },
};

type Props = {
  phase: BuildFrontmatter["phase"];
};

export function PhaseTag({ phase }: Props) {
  const config = phaseConfig[phase];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${config.colorClass}`}
    >
      <span aria-hidden>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
