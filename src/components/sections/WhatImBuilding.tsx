import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BuildCard } from "@/components/build/BuildCard";
import { getAllBuildProjects } from "@/lib/content/build";

/**
 * 홈 임베드 섹션 — "What I'm Building".
 *
 * 현재 진행 중인 프로젝트 1~2개를 BuildCard로 노출.
 * 케이스 스터디(Work) 다음 위치 — "끝난 작업 → 지금 작업" 시간축 자연스러움.
 *
 * 빈 상태일 땐 섹션 자체 표시 안 함 (홈 흐름 끊김 방지).
 *
 * 비유: "작업실 창문 너머로 보이는 현장" — 라이브 신호.
 */

const HOME_LIMIT = 2;

export async function WhatImBuilding() {
  const projects = await getAllBuildProjects();
  const latest = projects.slice(0, HOME_LIMIT);

  if (latest.length === 0) return null;

  return (
    <section className="bg-canvas py-20 md:py-28 hairline-t">
      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-10 md:mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-muted-foreground">
              — § Build / Currently
            </p>
            <h2 className="mt-3 serif-display text-3xl md:text-5xl font-semibold tracking-tight ko-keep">
              What I&apos;m{" "}
              <em className="font-heading italic text-foreground">
                building.
              </em>
            </h2>
          </div>
          <Link
            href="/build"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </header>

        <ul className="space-y-4">
          {latest.map((group) => (
            <li key={group.project}>
              <BuildCard group={group} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
