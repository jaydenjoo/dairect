/**
 * 마일스톤 리스트 — 데모 버전 (체크리스트 표시 + 가드)
 *
 * 실제 `MilestoneList`는 `createMilestoneAction`/`toggleMilestoneAction`/`deleteMilestoneAction`
 * 3종을 `useOptimistic`/`useTransition`으로 호출. 데모에선 CRUD 전부 `DemoSafeButton`/`DemoSafeForm`으로
 * 래핑해 토스트 안내 → 로그인 CTA.
 *
 * UX 포인트: 체크박스/입력란은 **렌더만** 하고 상호작용 시 전체가 가드 → 상태는 샘플 그대로.
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DemoSafeButton, DemoSafeForm } from "@/lib/demo/guard";
import { Plus, Trash2, Check, Circle } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  completedAt: Date | null;
  sortOrder: number | null;
}

export function MilestoneListDemo({ initialMilestones }: { initialMilestones: Milestone[] }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const total = initialMilestones.length;
  const completed = initialMilestones.filter((m) => m.isCompleted).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 진행률 */}
      {total > 0 && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {completed} / {total} 완료
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
      )}

      {/* 체크리스트 */}
      {initialMilestones.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          아직 마일스톤이 없습니다
        </p>
      ) : (
        <ul className="space-y-2">
          {initialMilestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-lg border-0 bg-muted/20 px-3 py-2.5"
            >
              <DemoSafeButton
                intent={m.isCompleted ? "마일스톤 해제" : "마일스톤 완료"}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors"
                aria-label={m.isCompleted ? "완료 해제" : "완료 처리"}
              >
                {m.isCompleted ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </DemoSafeButton>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    m.isCompleted
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {m.title}
                </p>
                {m.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    마감 {m.dueDate}
                  </p>
                )}
              </div>
              {m.isCompleted && m.completedAt && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  완료
                </Badge>
              )}
              <DemoSafeButton
                intent="마일스톤 삭제"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
                aria-label="마일스톤 삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </DemoSafeButton>
            </li>
          ))}
        </ul>
      )}

      {/* 추가 폼 */}
      {showForm ? (
        <DemoSafeForm
          intent="마일스톤 생성"
          className="space-y-2 rounded-lg bg-muted/20 p-3"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="마일스톤 제목"
            className="bg-background"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 bg-background"
            />
            <DemoSafeButton
              type="submit"
              intent="마일스톤 생성"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              추가
            </DemoSafeButton>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setDueDate("");
              }}
              className="rounded-md border-0 bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              취소
            </button>
          </div>
        </DemoSafeForm>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
        >
          <Plus className="h-3.5 w-3.5" />
          마일스톤 추가
        </button>
      )}
    </div>
  );
}
