"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { updateProjectPublicFieldsAction } from "../actions";

interface Initial {
  isPublic: boolean;
  publicAlias: string | null;
  publicDescription: string | null;
  publicLiveUrl: string | null;
  publicTags: string[] | null;
}

interface Props {
  projectId: string;
  initial: Initial;
}

const TAGS_RAW_MAX = 500;

function normalizeTagsRaw(raw: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(",")) {
    const tag = piece.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out.join(", ");
}

export function PublicProfileForm({ projectId, initial }: Props) {
  const [isPublic, setIsPublic] = useState<boolean>(initial.isPublic);
  const [alias, setAlias] = useState<string>(initial.publicAlias ?? "");
  const [description, setDescription] = useState<string>(initial.publicDescription ?? "");
  const [liveUrl, setLiveUrl] = useState<string>(initial.publicLiveUrl ?? "");
  const [tagsRaw, setTagsRaw] = useState<string>(
    (initial.publicTags ?? []).join(", "),
  );
  const [pending, startTransition] = useTransition();

  const aliasRequired = isPublic && alias.trim().length === 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProjectPublicFieldsAction(projectId, {
        isPublic,
        publicAlias: alias,
        publicDescription: description,
        publicLiveUrl: liveUrl,
        publicTagsRaw: tagsRaw,
      });
      if (result.success) {
        // 서버가 trim/dedupe/cap 정규화했으므로 로컬도 맞춘다
        setAlias((prev) => prev.trim());
        setLiveUrl((prev) => prev.trim());
        setTagsRaw((prev) => normalizeTagsRaw(prev));
        toast.success("공개 프로필을 저장했습니다");
      } else {
        toast.error(result.error ?? "저장에 실패했습니다");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 공개 토글 */}
      <div className="flex items-start justify-between gap-4 rounded-xl bg-muted/40 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {isPublic ? (
              <Eye className="h-4 w-4 text-primary" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            {isPublic ? "공개 중" : "비공개"}
          </div>
          <p className="text-xs text-muted-foreground">
            공개 시 <span className="font-mono text-foreground/80">/projects</span> 페이지에
            1분 이내 노출됩니다.
          </p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="peer sr-only"
            aria-label="프로젝트 공개 여부"
          />
          <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* 별칭 */}
      <div className="space-y-2">
        <Label htmlFor="publicAlias" className="text-sm font-medium text-foreground">
          공개용 프로젝트 별칭
          {isPublic && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <Input
          id="publicAlias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="예: Chatsio AI 상담 대시보드"
          maxLength={80}
          aria-invalid={aliasRequired}
          aria-describedby={aliasRequired ? "publicAlias-error" : "publicAlias-help"}
        />
        <p id="publicAlias-help" className="text-xs text-muted-foreground">
          실제 고객사명을 그대로 쓰지 말고 공개해도 좋은 표현으로 바꿔주세요.
        </p>
        {aliasRequired && (
          <p id="publicAlias-error" className="text-xs font-medium text-destructive">
            공개하려면 별칭이 필요합니다.
          </p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="publicDescription" className="text-sm font-medium text-foreground">
          공개용 한 줄 설명
        </Label>
        <Textarea
          id="publicDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: AI로 고객 상담을 자동화하는 B2B SaaS"
          rows={3}
          maxLength={300}
          aria-describedby="publicDescription-help"
        />
        <p id="publicDescription-help" className="text-xs text-muted-foreground">
          {description.length} / 300
        </p>
      </div>

      {/* 태그 */}
      <div className="space-y-2">
        <Label htmlFor="publicTags" className="text-sm font-medium text-foreground">
          기술 스택 태그
        </Label>
        <Input
          id="publicTags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="Next.js, Supabase, Claude API"
          maxLength={TAGS_RAW_MAX}
          aria-describedby="publicTags-help"
        />
        <p id="publicTags-help" className="text-xs text-muted-foreground">
          쉼표(,)로 구분하세요. 최대 8개. 영문/한글/숫자/공백만 허용.
        </p>
      </div>

      {/* 라이브 URL */}
      <div className="space-y-2">
        <Label htmlFor="publicLiveUrl" className="text-sm font-medium text-foreground">
          라이브 URL (선택)
        </Label>
        <div className="relative">
          <Input
            id="publicLiveUrl"
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://example.com"
            maxLength={500}
            inputMode="url"
            autoComplete="url"
          />
          {liveUrl && /^https?:\/\//i.test(liveUrl) && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              aria-label="새 창에서 열기"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          실제 배포된 URL이 있으면 입력하세요. 상세 페이지에 &quot;라이브 보기&quot; 버튼이 나타납니다.
        </p>
      </div>

      {/* 저장 */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </form>
  );
}
