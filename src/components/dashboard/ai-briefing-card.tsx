"use client";

import { useState, useTransition } from "react";
import { Sparkles, RefreshCw, AlertTriangle, Target } from "lucide-react";
import { regenerateBriefingAction } from "@/lib/ai/briefing-actions";
import type { BriefingContent, BriefingFocusItem } from "@/lib/validation/briefing";

type Props = {
  initialContent: BriefingContent | null;
  initialGeneratedAt: string | null; // ISO string
  initialWeekStartDate: string | null;
};

type PriorityStyle = {
  label: string;
  dotClass: string;
  labelClass: string;
};

const PRIORITY_STYLES: Record<1 | 2 | 3, PriorityStyle> = {
  1: {
    label: "긴급",
    dotClass: "bg-rose-500",
    labelClass: "text-rose-700",
  },
  2: {
    label: "높음",
    dotClass: "bg-amber-500",
    labelClass: "text-amber-700",
  },
  3: {
    label: "보통",
    dotClass: "bg-muted-foreground/40",
    labelClass: "text-muted-foreground",
  },
};

function formatGeneratedAt(iso: string): string {
  // KST(UTC+9) 고정 포맷 — 서버/클라이언트 ICU 차이(PM vs 오후)로 인한 hydration mismatch 방지
  const utcMs = new Date(iso).getTime();
  const kst = new Date(utcMs + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hour24 = kst.getUTCHours();
  const minute = kst.getUTCMinutes();
  const ampm = hour24 >= 12 ? "오후" : "오전";
  const hour12 = hour24 % 12 || 12;
  return `${month}월 ${day}일 ${ampm} ${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function sortByPriority(items: BriefingFocusItem[]): BriefingFocusItem[] {
  return [...items].sort((a, b) => a.priority - b.priority);
}

export function AiBriefingCard({
  initialContent,
  initialGeneratedAt,
  initialWeekStartDate,
}: Props) {
  const [content, setContent] = useState<BriefingContent | null>(initialContent);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [weekStartDate, setWeekStartDate] = useState<string | null>(initialWeekStartDate);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await regenerateBriefingAction();
      if (result.success) {
        setContent(result.content);
        setGeneratedAt(result.aiGeneratedAt);
        setWeekStartDate(result.weekStartDate);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <section className="mt-6 rounded-xl bg-card p-6 shadow-ambient" aria-label="AI 주간 브리핑">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">AI 주간 브리핑</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {generatedAt && weekStartDate ? (
                <>
                  {weekStartDate} 주차 · {formatGeneratedAt(generatedAt)} 생성
                </>
              ) : (
                <>이번 주 집중할 업무 3가지를 요약합니다</>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
          {content ? "새로고침" : "생성하기"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isPending && !content && (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          AI가 이번 주 브리핑을 작성하고 있습니다...
        </div>
      )}

      {!content && !isPending && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
            <Target className="h-6 w-6 text-primary/40" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">이번 주 브리핑이 아직 없습니다</p>
            <p className="mt-1 text-xs text-muted-foreground">
              [생성하기]를 눌러 AI에게 이번 주 집중할 업무를 요약받으세요
            </p>
          </div>
        </div>
      )}

      {content && (
        <div className="mt-5 space-y-5">
          <ul className="space-y-3">
            {sortByPriority(content.focusItems).map((item, index) => {
              const priorityKey = (item.priority as 1 | 2 | 3) ?? 3;
              const style = PRIORITY_STYLES[priorityKey] ?? PRIORITY_STYLES[3];
              return (
                <li
                  key={`${index}-${item.title.slice(0, 16)}`}
                  className="flex items-start gap-3 rounded-lg bg-muted/20 px-4 py-3"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dotClass}`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${style.labelClass}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.reason}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-lg bg-primary/[0.03] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">요약</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground whitespace-pre-line">
              {content.summary}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
