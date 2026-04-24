"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { updateProjectPublicFieldsAction } from "../actions";
import {
  parsePortfolioMeta,
  type PortfolioCategory,
  type PortfolioStatusType,
} from "@/lib/validation/portfolio";

interface Initial {
  isPublic: boolean;
  publicAlias: string | null;
  publicDescription: string | null;
  publicLiveUrl: string | null;
  publicTags: string[] | null;
  portfolioMeta: unknown; // jsonb raw → parsePortfolioMeta 로 안전 복원
}

interface Props {
  projectId: string;
  initial: Initial;
}

const CATEGORY_OPTIONS: Array<{ value: PortfolioCategory; label: string }> = [
  { value: "saas", label: "SaaS" },
  { value: "automation", label: "Automation" },
  { value: "editorial", label: "Editorial" },
  { value: "tools", label: "Tools" },
];

const STATUS_TYPE_OPTIONS: Array<{ value: PortfolioStatusType; label: string }> = [
  { value: "live", label: "Live (녹색)" },
  { value: "wip", label: "WIP (먼지색)" },
];

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

  // Task 6-ext (2026-04-25): 번들 포트폴리오 메타 10필드 로컬 state
  const initialMeta = parsePortfolioMeta(initial.portfolioMeta);
  const [nameAmber, setNameAmber] = useState<string>(initialMeta.nameAmber);
  const [cat, setCat] = useState<PortfolioCategory>(initialMeta.cat);
  const [year, setYear] = useState<string>(initialMeta.year);
  const [dur, setDur] = useState<string>(initialMeta.dur);
  const [stack, setStack] = useState<string>(initialMeta.stack);
  const [status, setStatus] = useState<string>(initialMeta.status);
  const [statusType, setStatusType] = useState<PortfolioStatusType>(initialMeta.statusType);
  const [badge, setBadge] = useState<string>(initialMeta.badge);
  const [metaHint, setMetaHint] = useState<string>(initialMeta.meta);
  const [order, setOrder] = useState<string>(String(initialMeta.order));

  const [pending, startTransition] = useTransition();

  const aliasRequired = isPublic && alias.trim().length === 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const orderNum = Number.parseInt(order, 10);
      const result = await updateProjectPublicFieldsAction(projectId, {
        isPublic,
        publicAlias: alias,
        publicDescription: description,
        publicLiveUrl: liveUrl,
        publicTagsRaw: tagsRaw,
        portfolioMeta: {
          nameAmber: nameAmber.trim(),
          cat,
          year: year.trim(),
          dur: dur.trim(),
          stack: stack.trim(),
          status: status.trim(),
          statusType,
          badge: badge.trim(),
          meta: metaHint.trim(),
          order: Number.isFinite(orderNum) ? orderNum : 0,
        },
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

      {/* 번들 포트폴리오 메타 (Task 6-ext) — /projects 페이지 표시용 10 필드 */}
      <div className="space-y-4 rounded-xl border border-border/60 bg-background/50 p-4">
        <div className="space-y-1">
          <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            /projects 번들 메타
          </h3>
          <p className="text-xs text-muted-foreground">
            공개 시 <span className="font-mono text-foreground/80">/projects</span> 페이지에 표시되는
            보조 정보입니다. 비어 있어도 공개는 가능합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* nameAmber — 제목 끝 amber 분리 */}
          <div className="space-y-2">
            <Label htmlFor="meta-nameAmber" className="text-sm font-medium text-foreground">
              제목 amber 부분
            </Label>
            <Input
              id="meta-nameAmber"
              value={nameAmber}
              onChange={(e) => setNameAmber(e.target.value)}
              placeholder='예: "sio" → "Chat" + "sio"(강조)'
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground">
              별칭 뒤에 붙여 amber 컬러로 강조할 글자. (없으면 빈 칸)
            </p>
          </div>

          {/* cat */}
          <div className="space-y-2">
            <Label htmlFor="meta-cat" className="text-sm font-medium text-foreground">
              카테고리
            </Label>
            <select
              id="meta-cat"
              value={cat}
              onChange={(e) => setCat(e.target.value as PortfolioCategory)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* year */}
          <div className="space-y-2">
            <Label htmlFor="meta-year" className="text-sm font-medium text-foreground">
              Year
            </Label>
            <Input
              id="meta-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025"
              maxLength={10}
            />
          </div>

          {/* dur */}
          <div className="space-y-2">
            <Label htmlFor="meta-dur" className="text-sm font-medium text-foreground">
              Duration
            </Label>
            <Input
              id="meta-dur"
              value={dur}
              onChange={(e) => setDur(e.target.value)}
              placeholder="2w"
              maxLength={20}
            />
          </div>

          {/* stack */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="meta-stack" className="text-sm font-medium text-foreground">
              Stack
            </Label>
            <Input
              id="meta-stack"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="Next.js · Supabase · Claude"
              maxLength={200}
            />
          </div>

          {/* status */}
          <div className="space-y-2">
            <Label htmlFor="meta-status" className="text-sm font-medium text-foreground">
              Status 텍스트
            </Label>
            <Input
              id="meta-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Live · 12 clients"
              maxLength={100}
            />
          </div>

          {/* statusType */}
          <div className="space-y-2">
            <Label htmlFor="meta-statusType" className="text-sm font-medium text-foreground">
              Status 색상
            </Label>
            <select
              id="meta-statusType"
              value={statusType}
              onChange={(e) => setStatusType(e.target.value as PortfolioStatusType)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* badge */}
          <div className="space-y-2">
            <Label htmlFor="meta-badge" className="text-sm font-medium text-foreground">
              Badge
            </Label>
            <Input
              id="meta-badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="★ Featured · SaaS"
              maxLength={60}
            />
          </div>

          {/* meta (cursor-thumb hint) */}
          <div className="space-y-2">
            <Label htmlFor="meta-metaHint" className="text-sm font-medium text-foreground">
              Meta hint
            </Label>
            <Input
              id="meta-metaHint"
              value={metaHint}
              onChange={(e) => setMetaHint(e.target.value)}
              placeholder="AI CHAT · N°01"
              maxLength={60}
            />
          </div>

          {/* order */}
          <div className="space-y-2">
            <Label htmlFor="meta-order" className="text-sm font-medium text-foreground">
              정렬 순서
            </Label>
            <Input
              id="meta-order"
              type="number"
              inputMode="numeric"
              min={0}
              max={9999}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground">낮은 숫자가 먼저 표시됩니다.</p>
          </div>
        </div>
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
