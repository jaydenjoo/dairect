"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  createJournalPostAction,
  type CreateJournalPostState,
} from "../../actions";
import {
  SLUG_MAX_LENGTH,
  suggestSlugFromTitle,
  validateSlug,
} from "@/lib/journal/slug";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/journal/MarkdownContent";

const TITLE_MAX = 100;
const BODY_MAX = 10000;
const TAGS_MAX_COUNT = 5;

type SuccessResult = Extract<CreateJournalPostState, { status: "success" }>;

export function JournalNewForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lastSuccess, setLastSuccess] = useState<SuccessResult | null>(null);

  // 사용자가 slug를 직접 수정하지 않은 동안에는 title 변경 시 자동 제안.
  // 한글 제목이면 빈 문자열 → 사용자가 영문 직접 입력 유도.
  const handleTitleChange = (next: string) => {
    setTitle(next);
    if (!slugTouched) setSlug(suggestSlugFromTitle(next));
  };

  const handleSlugChange = (next: string) => {
    setSlug(next);
    setSlugTouched(true);
  };

  const slugError = useMemo(() => {
    if (slug.length === 0) return null; // 빈 상태는 에러 표시 안 함 (입력 전)
    const r = validateSlug(slug);
    return r.ok ? null : r.message;
  }, [slug]);

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    [tagsInput],
  );

  const tagsError =
    tags.length > TAGS_MAX_COUNT
      ? `태그는 최대 ${TAGS_MAX_COUNT}개까지 가능 (현재 ${tags.length}개)`
      : tags.find((t) => t.length > 30)
        ? "각 태그는 30자 이하여야 합니다"
        : null;

  const canSubmit =
    title.trim().length > 0 &&
    title.length <= TITLE_MAX &&
    slug.length > 0 &&
    slugError === null &&
    body.trim().length > 0 &&
    body.length <= BODY_MAX &&
    tagsError === null &&
    !isPending;

  const submit = (status: "draft" | "published") => {
    if (!canSubmit) return;

    startTransition(async () => {
      const result = await createJournalPostAction({
        title: title.trim(),
        slug,
        tags,
        body,
        status,
      });

      if (result.status === "success") {
        setLastSuccess(result);
        if (status === "published") {
          toast.success("발행 commit 완료 — 1~2분 후 dairect.kr/journal에 반영");
        } else {
          toast.success("Draft commit 완료 — 사이트에는 노출되지 않습니다");
        }
        // 폼 reset (다음 글 바로 작성 가능)
        setTitle("");
        setSlug("");
        setSlugTouched(false);
        setTagsInput("");
        setBody("");
        setShowPreview(false);
      } else if (result.status === "error") {
        const fieldMsg = result.fieldErrors
          ? Object.values(result.fieldErrors).join(" / ")
          : null;
        toast.error(fieldMsg ?? result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {lastSuccess && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">
            마지막 commit:{" "}
            <span className="font-mono">{lastSuccess.filePath}</span>
          </p>
          <p className="mt-1 text-muted-foreground">
            {lastSuccess.postStatus === "published" ? (
              <>
                발행 — 1~2분 후{" "}
                <Link
                  href={`/journal/${lastSuccess.slug}`}
                  target="_blank"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  dairect.kr/journal/{lastSuccess.slug}
                </Link>
              </>
            ) : (
              "Draft — 사이트에는 노출되지 않습니다 (옵시디언에서 status: published로 변경 후 push)"
            )}
          </p>
          {lastSuccess.htmlUrl && (
            <p className="mt-1">
              <a
                href={lastSuccess.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                GitHub commit 보기 →
              </a>
            </p>
          )}
        </div>
      )}

      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="예: 옵시디언 v1.12에서 발견한 작은 마찰"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {title.length}/{TITLE_MAX}자
        </p>
      </div>

      {/* slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">
          slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          maxLength={SLUG_MAX_LENGTH}
          placeholder="obsidian-v1-12-friction"
          className="font-mono text-sm"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          영문 소문자·숫자·하이픈만. 한글 제목이면 영문으로 직접 입력하세요. 파일명은{" "}
          <span className="font-mono">YYYY-MM-DD-{slug || "slug"}.md</span>로
          저장됩니다.
        </p>
        {slugError && (
          <p className="text-xs text-destructive">{slugError}</p>
        )}
      </div>

      {/* tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">태그</Label>
        <Input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="tool, insight, build (쉼표 구분, 최대 5개)"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {tags.length}/{TAGS_MAX_COUNT}개 · 쉼표(,)로 구분
        </p>
        {tagsError && <p className="text-xs text-destructive">{tagsError}</p>}
      </div>

      {/* body + 미리보기 토글 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="body">
            본문 (마크다운) <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
            disabled={body.length === 0}
          >
            {showPreview ? (
              <>
                <FileText className="h-4 w-4" />
                편집
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                미리보기
              </>
            )}
          </Button>
        </div>

        {showPreview ? (
          <div className="min-h-[320px] rounded-md border border-input bg-muted/20 p-4">
            {body.trim().length === 0 ? (
              <p className="text-sm text-muted-foreground">본문이 비어있습니다.</p>
            ) : (
              <MarkdownContent>{body}</MarkdownContent>
            )}
          </div>
        ) : (
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX}
            rows={16}
            placeholder={"## 한 일\n\n- ...\n\n## 배운 점\n\n- ..."}
            className="font-mono text-sm leading-relaxed"
            disabled={isPending}
          />
        )}
        <p className="text-xs text-muted-foreground">
          {body.length}/{BODY_MAX}자 · GFM(표·체크박스·자동링크) 지원
        </p>
      </div>

      {/* 제출 버튼 — Draft / 발행 분리 */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => submit("draft")}
          disabled={!canSubmit}
        >
          {isPending ? "저장 중..." : "Draft로 저장"}
        </Button>
        <Button
          type="button"
          onClick={() => submit("published")}
          disabled={!canSubmit}
        >
          {isPending ? "발행 중..." : "발행"}
        </Button>
        <p className="text-xs text-muted-foreground">
          발행 시 GitHub commit → Vercel 빌드 → 1~2분 후 사이트 반영
        </p>
      </div>
    </div>
  );
}
