"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { acceptInvitationAction } from "./accept-actions";

// Phase 5 Task 5-2-5: 초대 수락 버튼.
// 서버 컴포넌트(page.tsx)가 상태 분기 → 유효한 초대일 때만 렌더.
// 수락 성공 → /dashboard로 이동 (last_workspace_id 업데이트로 자동 workspace 스위치 반영).

type Props = {
  token: string;
  workspaceName: string;
};

export function AcceptButton({ token, workspaceName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitationAction(token);
      if (result.success) {
        toast.success(`${workspaceName} 워크스페이스에 합류했습니다`);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleAccept}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      {pending ? "수락 중..." : "초대 수락하기"}
    </button>
  );
}
