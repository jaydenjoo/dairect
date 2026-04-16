"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutList, LayoutGrid } from "lucide-react";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") ?? "list";

  type ViewMode = "list" | "kanban";

  function setView(view: ViewMode) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    router.push(`/dashboard/projects?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-lg bg-muted p-0.5">
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          currentView === "list"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutList className="h-3.5 w-3.5" />
        리스트
      </button>
      <button
        onClick={() => setView("kanban")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          currentView === "kanban"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        칸반
      </button>
    </div>
  );
}
