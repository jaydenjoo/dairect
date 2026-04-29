import Link from "next/link";
import { PhaseTag } from "./PhaseTag";
import { ProgressGauge } from "./ProgressGauge";
import type { BuildProjectGroup } from "@/lib/content/build";

/**
 * Build 인덱스 카드.
 *
 * Studio Anthem 톤 (JournalCard와 동일 베이스):
 * - Paper 배경 + 1px Ink hairline
 * - 호버: translate(-2,-2) + 4px hard amber shadow
 *
 * Build 고유 정보:
 * - PhaseTag (idea / building / shipped)
 * - 진행률 게이지 (building 단계만)
 * - LOG 카운트 (이 프로젝트의 누적 빌드 로그 수)
 *
 * 비유: "잡지 표지 + 진행 안내판"의 결합.
 */

type Props = {
  group: BuildProjectGroup;
};

export function BuildCard({ group }: Props) {
  return (
    <Link
      href={`/build/${group.project}`}
      className="group block bg-card border border-border p-6 md:p-7 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-amber-md"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <PhaseTag phase={group.latestPhase} />
        <time
          dateTime={group.latestDate}
          className="kicker text-muted-foreground"
        >
          {group.latestDate}
        </time>
      </div>

      <h2 className="mt-4 font-heading text-2xl md:text-[26px] font-semibold tracking-tight ko-keep transition-colors group-hover:text-foreground">
        {group.latestTitle}
      </h2>

      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {group.project}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 hairline-t pt-4">
        {group.latestPhase === "building" && (
          <ProgressGauge progress={group.latestProgress} size="sm" />
        )}
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {group.totalLogs} LOG{group.totalLogs !== 1 ? "S" : ""}
        </span>
      </div>
    </Link>
  );
}
