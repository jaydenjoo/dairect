"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateProjectStatusAction } from "./actions";
import { projectStatuses, projectStatusLabels, type ProjectStatus } from "@/lib/validation/projects";

interface ProjectStatusSelectProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export function ProjectStatusSelect({ projectId, currentStatus }: ProjectStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const result = await updateProjectStatusAction(projectId, value as ProjectStatus);
      if (result.success) {
        toast.success("상태가 변경되었습니다");
      } else {
        toast.error(result.error ?? "변경 실패");
      }
    });
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {projectStatuses.map((s) => (
          <SelectItem key={s} value={s}>
            {projectStatusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
