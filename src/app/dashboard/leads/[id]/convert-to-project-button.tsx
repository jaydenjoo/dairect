"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { convertLeadToProjectAction } from "../actions";

interface Props {
  leadId: string;
}

export function ConvertToProjectButton({ leadId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("리드를 프로젝트로 전환하시겠습니까? 고객과 프로젝트가 새로 생성됩니다.")) {
      return;
    }
    startTransition(async () => {
      const result = await convertLeadToProjectAction(leadId);
      if (result.success && result.id) {
        toast.success("프로젝트로 전환되었습니다");
        router.push(`/dashboard/projects/${result.id}`);
      } else {
        toast.error(result.error ?? "전환에 실패했습니다");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} size="sm" className="w-full">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="mr-2 h-4 w-4" />
      )}
      프로젝트로 전환
    </Button>
  );
}
