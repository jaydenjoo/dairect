"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";
import {
  SLOT_PACKAGES,
  SLOT_STATUSES,
  type Slot,
  type SlotPackage,
  type SlotStatus,
} from "@/lib/scheduling-slots";
import { updateSchedulingSlotsAction } from "./scheduling-slots-actions";

/**
 * Epic Scheduling-Slots (2026-04-26): /dashboard/settings 의 슬롯 편집 카드.
 *
 * 공개 영역 Pricing "REAL-TIME SCHEDULING" 박스의 3개 row(Sprint/Build/Scale)
 * 데이터 편집. 토글이 아닌 form 패턴 — copy textarea 입력 중간 자동 저장 X.
 */

const STATUS_LABELS: Record<SlotStatus, string> = {
  available: "신규 의뢰 가능",
  "next-week": "다음 주 시작",
  waiting: "대기열",
};

const PACKAGE_DESCRIPTIONS: Record<SlotPackage, string> = {
  Sprint: "180만원~ · 3주 단발 프로젝트",
  Build: "MVP 빌드 · 6~10주",
  Scale: "장기 파트너십 · 90일 동행",
};

function slotsEqual(a: readonly Slot[], b: readonly Slot[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((s, i) => {
    const t = b[i];
    return t && s.pkg === t.pkg && s.status === t.status && s.copy === t.copy;
  });
}

export function SchedulingSlotsCard({
  initialSlots,
}: {
  initialSlots: readonly Slot[];
}) {
  const [slots, setSlots] = useState<readonly Slot[]>(initialSlots);
  const [savedSlots, setSavedSlots] = useState<readonly Slot[]>(initialSlots);
  const [pending, startTransition] = useTransition();

  const dirty = !slotsEqual(slots, savedSlots);

  function updateSlot(pkg: SlotPackage, patch: Partial<Pick<Slot, "status" | "copy">>) {
    setSlots((prev) =>
      prev.map((s) => (s.pkg === pkg ? { ...s, ...patch } : s)),
    );
  }

  function handleSave() {
    const previous = savedSlots;
    const next = slots;
    startTransition(async () => {
      const result = await updateSchedulingSlotsAction(next);
      if (result.success) {
        setSavedSlots(next);
        toast.success("스케줄링 슬롯을 저장했습니다 (1분 이내 사이트에 반영)");
      } else {
        setSlots(previous);
        toast.error(result.error ?? "저장에 실패했습니다");
      }
    });
  }

  function handleReset() {
    setSlots(savedSlots);
  }

  return (
    <section className="rounded-xl border border-border/60 bg-background p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50">
          <CalendarClock className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            스케줄링 슬롯
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            공개 영역 Pricing 의 &ldquo;REAL-TIME SCHEDULING&rdquo; 박스 3개
            row 입니다. 변경 후 저장하면 1분 이내 사이트에 반영됩니다.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {SLOT_PACKAGES.map((pkg) => {
          const slot = slots.find((s) => s.pkg === pkg);
          if (!slot) return null;
          return (
            <div
              key={pkg}
              className="rounded-lg border border-border/60 bg-muted/20 p-4"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <span className="font-mono text-sm font-semibold uppercase text-foreground">
                    {pkg}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {PACKAGE_DESCRIPTIONS[pkg]}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">
                    상태
                  </span>
                  <select
                    value={slot.status}
                    onChange={(e) =>
                      updateSlot(pkg, { status: e.target.value as SlotStatus })
                    }
                    disabled={pending}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                  >
                    {SLOT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">
                    안내 문구{" "}
                    <span className="text-muted-foreground">
                      ({slot.copy.length}/120)
                    </span>
                  </span>
                  <textarea
                    value={slot.copy}
                    onChange={(e) => updateSlot(pkg, { copy: e.target.value })}
                    disabled={pending}
                    maxLength={120}
                    rows={2}
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    placeholder="예: 1자리 가능 — 24시간 안에 회신"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {dirty && !pending && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            되돌리기
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          저장
        </button>
      </div>
    </section>
  );
}
