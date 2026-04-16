"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createMilestoneAction,
  toggleMilestoneAction,
  deleteMilestoneAction,
} from "./milestone-actions";
import { Plus, Loader2, Trash2, Check, Circle } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  completedAt: Date | null;
  sortOrder: number | null;
}

interface MilestoneListProps {
  projectId: string;
  initialMilestones: Milestone[];
}

export function MilestoneList({ projectId, initialMilestones }: MilestoneListProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const [optimisticMilestones, dispatch] = useOptimistic(
    initialMilestones,
    (
      state: Milestone[],
      action:
        | { type: "add"; milestone: Milestone }
        | { type: "toggle"; id: string; isCompleted: boolean }
        | { type: "delete"; id: string },
    ) => {
      if (action.type === "add") return [...state, action.milestone];
      if (action.type === "toggle")
        return state.map((m) =>
          m.id === action.id ? { ...m, isCompleted: action.isCompleted } : m,
        );
      return state.filter((m) => m.id !== action.id);
    },
  );

  const total = optimisticMilestones.length;
  const completed = optimisticMilestones.filter((m) => m.isCompleted).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const tempMilestone: Milestone = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      description: null,
      isCompleted: false,
      dueDate: dueDate || null,
      completedAt: null,
      sortOrder: total,
    };

    startTransition(async () => {
      dispatch({ type: "add", milestone: tempMilestone });
      const result = await createMilestoneAction(projectId, {
        title: title.trim(),
        description: "",
        dueDate,
      });
      if (result.success) {
        setTitle("");
        setDueDate("");
        setShowForm(false);
      } else {
        // 롤백: 실패 시 낙관적 추가 취소
        dispatch({ type: "delete", id: tempMilestone.id });
        toast.error(result.error ?? "생성 실패");
      }
    });
  }

  function handleToggle(milestoneId: string, current: boolean) {
    startTransition(async () => {
      dispatch({ type: "toggle", id: milestoneId, isCompleted: !current });
      const result = await toggleMilestoneAction(milestoneId, projectId, !current);
      if (!result.success) {
        // 롤백: 실패 시 원래 상태로 복원
        dispatch({ type: "toggle", id: milestoneId, isCompleted: current });
        toast.error(result.error ?? "변경 실패");
      }
    });
  }

  function handleDelete(milestoneId: string) {
    startTransition(async () => {
      // 삭제된 아이템 백업 (롤백용)
      const deleted = optimisticMilestones.find((m) => m.id === milestoneId);
      dispatch({ type: "delete", id: milestoneId });
      const result = await deleteMilestoneAction(milestoneId, projectId);
      if (!result.success) {
        if (deleted) dispatch({ type: "add", milestone: deleted });
        toast.error(result.error ?? "삭제 실패");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* 진행률 */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completed}/{total} 완료
            </span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 마일스톤 목록 */}
      {total === 0 && !showForm ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          아직 마일스톤이 없습니다
        </p>
      ) : (
        <ul className="space-y-1.5">
          {optimisticMilestones.map((m) => {
            const isTemp = m.id.startsWith("temp-");
            return (
              <li
                key={m.id}
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <button
                  onClick={() => !isTemp && handleToggle(m.id, !!m.isCompleted)}
                  disabled={isTemp}
                  className="mt-0.5 shrink-0"
                  aria-label={m.isCompleted ? `${m.title} 완료 취소` : `${m.title} 완료 처리`}
                >
                  {m.isCompleted ? (
                    <Check className="h-5 w-5 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      m.isCompleted
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {m.title}
                  </p>
                  {m.dueDate && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px] font-normal"
                    >
                      {m.dueDate}
                    </Badge>
                  )}
                </div>

                {!isTemp && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* 추가 폼 */}
      {showForm ? (
        <form onSubmit={handleAdd} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="마일스톤 제목"
              autoFocus
              required
            />
          </div>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-40"
          />
          <Button type="submit" size="sm" disabled={isPending || !title.trim()}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "추가"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowForm(false);
              setTitle("");
              setDueDate("");
            }}
          >
            취소
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          마일스톤 추가
        </Button>
      )}
    </div>
  );
}
