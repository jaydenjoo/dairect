"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLeadAction } from "../actions";

interface Props {
  leadId: string;
  disabled?: boolean;
}

export function DeleteLeadButton({ leadId, disabled }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (disabled) return;
    if (!window.confirm("이 리드를 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      const result = await deleteLeadAction(leadId);
      if (result.success) {
        toast.success("리드가 삭제되었습니다");
        router.push("/dashboard/leads");
      } else {
        toast.error(result.error ?? "삭제에 실패했습니다");
      }
    });
  }

  if (disabled) {
    return (
      <span className="text-xs text-muted-foreground">
        전환된 리드는 삭제할 수 없습니다
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="text-muted-foreground hover:text-red-600"
    >
      {isPending ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-1.5 h-4 w-4" />
      )}
      삭제
    </Button>
  );
}
