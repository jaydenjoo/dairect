/**
 * 공개 프로필 — 데모 버전 (읽기 전용 표시)
 *
 * 실제 `PublicProfileForm`은 `isPublic` 토글 + 별칭/설명/URL/태그 편집 Server Action 포함.
 * 데모에선 현재 설정값을 카드 형태로 표시만. "실 계정에서 편집" CTA 버튼 첨부.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { DemoSafeButton } from "@/lib/demo/guard";
import { Globe, EyeOff } from "lucide-react";

type PublicProfileInitial = {
  isPublic: boolean;
  publicAlias: string | null;
  publicDescription: string | null;
  publicLiveUrl: string | null;
  publicTags: string[] | null;
};

export function PublicProfileDemo({ initial }: { initial: PublicProfileInitial }) {
  return (
    <div className="space-y-5">
      {/* 공개 여부 */}
      <div className="flex items-center justify-between rounded-lg bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          {initial.isPublic ? (
            <Globe className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            포트폴리오 노출
          </span>
        </div>
        <Badge variant={initial.isPublic ? "default" : "secondary"}>
          {initial.isPublic ? "공개 중" : "비공개"}
        </Badge>
      </div>

      {/* 별칭 */}
      <ReadonlyField
        label="공개용 프로젝트명 (별칭)"
        value={initial.publicAlias}
        placeholder="설정되지 않음"
      />

      {/* 설명 */}
      <ReadonlyField
        label="공개 설명"
        value={initial.publicDescription}
        placeholder="설정되지 않음"
        multiline
      />

      {/* URL */}
      <ReadonlyField
        label="라이브 URL"
        value={initial.publicLiveUrl}
        placeholder="설정되지 않음"
      />

      {/* 태그 */}
      <div>
        <p className="text-xs font-medium text-muted-foreground">태그</p>
        {initial.publicTags && initial.publicTags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {initial.publicTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground/60">설정되지 않음</p>
        )}
      </div>

      {/* 편집 CTA — 데모에선 토스트만 */}
      <DemoSafeButton
        intent="공개 프로필 편집"
        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        편집하기
      </DemoSafeButton>
    </div>
  );
}

function ReadonlyField({
  label,
  value,
  placeholder,
  multiline,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {value ? (
        <p
          className={`mt-2 text-sm text-foreground ${
            multiline ? "whitespace-pre-wrap" : ""
          }`}
        >
          {value}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground/60">{placeholder}</p>
      )}
    </div>
  );
}
