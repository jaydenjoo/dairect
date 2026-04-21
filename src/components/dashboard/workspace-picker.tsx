"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { switchWorkspaceAction } from "@/app/dashboard/workspace-actions";
import type { UserWorkspace, WorkspaceRole } from "@/lib/auth/list-user-workspaces";

type Props = {
  workspaces: UserWorkspace[];
  currentWorkspaceId: string | null;
};

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
};

const ROLE_CLASS: Record<WorkspaceRole, string> = {
  owner: "bg-primary/10 text-primary",
  admin: "bg-amber-500/10 text-amber-700",
  member: "bg-foreground/5 text-foreground/70",
};

export function WorkspacePicker({ workspaces, currentWorkspaceId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  const current =
    workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0] ?? null;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!current) return null;

  const singleWorkspace = workspaces.length <= 1;

  function handleSelect(id: string) {
    if (!current || id === current.id) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const result = await switchWorkspaceAction({ workspaceId: id });
      if (result.ok) {
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (singleWorkspace) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <span className="font-medium text-foreground">{current.name}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            ROLE_CLASS[current.role],
          )}
        >
          {ROLE_LABEL[current.role]}
        </span>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium text-foreground">{current.name}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            ROLE_CLASS[current.role],
          )}
        >
          {ROLE_LABEL[current.role]}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground/50 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="listbox"
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-2 shadow-[0_-8px_24px_rgba(17,24,39,0.12)]",
              "md:absolute md:inset-auto md:left-0 md:top-full md:mt-2 md:w-72 md:rounded-xl md:p-1 md:shadow-[0_4px_12px_rgba(17,24,39,0.04),0_12px_32px_rgba(17,24,39,0.08)]",
            )}
          >
            <div className="mb-1 px-3 pt-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/50 md:hidden">
              워크스페이스 선택
            </div>
            {workspaces.map((w) => {
              const selected = w.id === current.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(w.id)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    "hover:bg-foreground/5 disabled:opacity-60",
                    selected && "bg-primary/5",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-foreground">
                      {w.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        ROLE_CLASS[w.role],
                      )}
                    >
                      {ROLE_LABEL[w.role]}
                    </span>
                  </div>
                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
