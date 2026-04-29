/**
 * 진행률 게이지.
 *
 * Studio Anthem 톤:
 * - 1px hairline 배경 + Ink 채움 (sharp, no rounded — pills 금지)
 * - 우측 % 텍스트는 Geist Mono
 * - 0~100 자동 clamp
 *
 * 비유: "프로젝트의 두께 게이지" — 얼마나 차올랐는지.
 */

type Props = {
  progress: number;
  size?: "sm" | "md";
};

export function ProgressGauge({ progress, size = "md" }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const widthClass = size === "sm" ? "w-20" : "w-32";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`relative inline-block h-1 ${widthClass} bg-border overflow-hidden`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`진행률 ${clamped}%`}
      >
        <span
          className="absolute inset-y-0 left-0 bg-foreground transition-all"
          style={{ width: `${clamped}%` }}
        />
      </span>
      <span className="font-mono text-[11px] tracking-wider text-foreground">
        {clamped}%
      </span>
    </span>
  );
}
