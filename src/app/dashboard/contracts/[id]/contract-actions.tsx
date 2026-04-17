"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateContractStatusAction,
  deleteContractAction,
} from "../actions";
import type { ContractStatus } from "@/lib/validation/contracts";
import { toast } from "sonner";

interface Props {
  id: string;
  status: ContractStatus;
}

const nextStatusMap: Partial<Record<ContractStatus, { label: string; value: ContractStatus }>> = {
  draft: { label: "발송 처리", value: "sent" },
  sent: { label: "서명 완료 처리", value: "signed" },
  signed: { label: "보관 처리", value: "archived" },
};

export function ContractActions({ id, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const next = nextStatusMap[status];

  function handleStatusChange(newStatus: ContractStatus) {
    startTransition(async () => {
      const result = await updateContractStatusAction(id, newStatus);
      if (result.success) {
        toast.success("상태가 변경되었습니다");
        router.refresh();
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 계약서를 삭제하시겠습니까?")) return;

    startTransition(async () => {
      const result = await deleteContractAction(id);
      if (result.success) {
        toast.success("계약서가 삭제되었습니다");
        router.push("/dashboard/contracts");
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
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
