"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toSlug } from "@/lib/utils/slug";
import { saveOnboardingAction, skipOnboardingAction } from "./actions";

type Props = {
  workspaceId: string;
  initialName: string;
  initialSlug: string;
};

export function OnboardingForm({
  workspaceId,
  initialName,
  initialSlug,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  // 사용자가 slug 필드를 한 번이라도 직접 편집했으면 이름 변경과 독립적으로 유지.
  const [slugEdited, setSlugEdited] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugEdited) {
      const auto = toSlug(v);
      setSlug(auto || initialSlug);
    }
  };

  const handleSlugChange = (v: string) => {
    setSlug(v.toLowerCase());
    setSlugEdited(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveOnboardingAction({
        workspaceId,
        name: name.trim(),
        slug: slug.trim(),
      });
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      const result = await skipOnboardingAction();
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const canSubmit = name.trim().length >= 2 && slug.trim().length >= 2;

  return (
    <div className="w-full max-w-md rounded-2xl bg-background p-8 shadow-[0_4px_12px_rgba(17,24,39,0.03),0_12px_32px_rgba(17,24,39,0.08)]">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          환영합니다
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          워크스페이스 이름을 설정해주세요. 나중에 변경할 수 있습니다.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="ws-name" className="mb-1.5 block text-sm font-medium">
            워크스페이스 이름
          </Label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="예: 디자인 스튜디오"
            maxLength={60}
            disabled={isPending}
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="ws-slug" className="mb-1.5 block text-sm font-medium">
            워크스페이스 주소
          </Label>
          <div className="flex items-stretch overflow-hidden rounded-md bg-foreground/[0.04]">
            <span className="flex items-center px-3 text-sm text-foreground/50">
              dairect.kr/
            </span>
            <Input
              id="ws-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-team"
              maxLength={40}
              disabled={isPending}
              className="rounded-none border-0 bg-background"
            />
          </div>
          <p className="mt-1.5 text-xs text-foreground/50">
            영문 소문자, 숫자, 하이픈만 가능합니다. (2~40자)
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button
          onClick={handleSave}
          disabled={isPending || !canSubmit}
          className="w-full"
        >
          {isPending ? "저장 중…" : "다음 →"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isPending}
          className="w-full"
        >
          이대로 시작할게요
        </Button>
      </div>
    </div>
  );
}
