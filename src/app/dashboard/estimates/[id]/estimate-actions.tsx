"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateEstimateStatusAction,
  deleteEstimateAction,
} from "../actions";
import type { EstimateStatus } from "@/lib/validation/estimates";
import { toast } from "sonner";

interface Props {
  id: string;
  status: EstimateStatus;
}

const nextStatusMap: Partial<Record<EstimateStatus, { label: string; value: EstimateStatus }>> = {
  draft: { label: "발송 처리", value: "sent" },
  sent: { label: "수락 처리", value: "accepted" },
};

export function EstimateActions({ id, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next = nextStatusMap[status];

  function handleStatusChange(newStatus: EstimateStatus) {
    startTransition(async () => {
      const result = await updateEstimateStatusAction(id, newStatus);
      if (result.success) {
        toast.success("상태가 변경되었습니다");
        router.refresh();
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 견적서를 삭제하시겠습니까?")) return;

    startTransition(async () => {
      const result = await deleteEstimateAction(id);
      if (result.success) {
        toast.success("견적서가 삭제되었습니다");
        router.push("/dashboard/estimates");
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "sent" && (
        <button
          type="button"
          onClick={() => handleStatusChange("rejected")}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          거절 처리
        </button>
      )}

      {next && (
        <button
          type="button"
          onClick={() => handleStatusChange(next.value)}
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "처리 중..." : next.label}
        </button>
      )}

      {status === "draft" && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          삭제
        </button>
      )}
    </div>
  );
}
