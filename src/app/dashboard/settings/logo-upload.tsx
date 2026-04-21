"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  uploadWorkspaceLogoAction,
  removeWorkspaceLogoAction,
} from "./logo-actions";
import {
  LOGO_ALLOWED_MIME_TYPES,
  LOGO_MAX_BYTES,
} from "@/lib/validation/workspace-logo";

interface LogoUploadProps {
  initialLogoUrl: string | null;
}

// Task 5-2-2c: workspace 로고 업로드 Client Component.
// - Server Action 2개(upload/remove)를 FormData로 호출
// - client 측 즉시 검증(Zod와 동일 규칙)으로 네트워크 호출 전에 거절 가능
// - Supabase public URL은 외부 도메인이라 next/image 대신 <img> 사용 (remotePatterns 설정 회피)
export function LogoUpload({ initialLogoUrl }: LogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > LOGO_MAX_BYTES) {
      toast.error("파일 크기가 5MB를 초과합니다");
      resetInput();
      return;
    }
    if (
      !LOGO_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof LOGO_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      toast.error("PNG, JPG, WEBP 이미지만 업로드 가능합니다");
      resetInput();
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadWorkspaceLogoAction(formData);
      if (result.success) {
        toast.success("로고가 업로드되었습니다");
        setLogoUrl(result.logoUrl ?? null);
      } else {
        toast.error(result.error ?? "업로드에 실패했습니다");
      }
      resetInput();
    });
  }

  function handleRemove() {
    if (!confirm("로고를 제거하시겠어요?")) return;
    startTransition(async () => {
      const result = await removeWorkspaceLogoAction();
      if (result.success) {
        toast.success("로고가 제거되었습니다");
        setLogoUrl(null);
      } else {
        toast.error(result.error ?? "제거에 실패했습니다");
      }
    });
  }

  return (
    <div className="flex items-start gap-6">
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md bg-muted/40 p-2">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="workspace logo"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs text-muted-foreground">로고 없음</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          disabled={isPending}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          PNG / JPG / WEBP, 최대 5MB. 정사각형 권장 (PDF 헤더/UI 일관성).
        </p>
        {logoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isPending}
            className="self-start"
          >
            {isPending ? "처리 중…" : "로고 제거"}
          </Button>
        )}
      </div>
    </div>
  );
}
