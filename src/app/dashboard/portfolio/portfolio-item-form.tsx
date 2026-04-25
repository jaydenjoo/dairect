"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
  createPortfolioItemAction,
  updatePortfolioItemAction,
  deletePortfolioItemAction,
} from "./actions";
import type {
  PortfolioCategory,
  PortfolioStatusType,
} from "@/lib/validation/portfolio-item";

type Initial = {
  id?: string;
  slug: string | null;
  name: string;
  nameAmber: string | null;
  description: string | null;
  cat: PortfolioCategory;
  year: string | null;
  duration: string | null;
  stack: string | null;
  statusText: string | null;
  statusType: PortfolioStatusType;
  badge: string | null;
  metaHint: string | null;
  liveUrl: string | null;
  demoUrl: string | null;
  isPublic: boolean;
  displayOrder: number;
};

const CATEGORY_OPTIONS: Array<{ value: PortfolioCategory; label: string }> = [
  { value: "saas", label: "SaaS" },
  { value: "automation", label: "Automation" },
  { value: "editorial", label: "Editorial" },
  { value: "tools", label: "Tools" },
];

const STATUS_TYPE_OPTIONS: Array<{
  value: PortfolioStatusType;
  label: string;
}> = [
  { value: "live", label: "Live (녹색)" },
  { value: "wip", label: "WIP (먼지색)" },
];

export function PortfolioItemForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const isEdit = !!initial.id;

  const [slug, setSlug] = useState(initial.slug ?? "");
  const [name, setName] = useState(initial.name);
  const [nameAmber, setNameAmber] = useState(initial.nameAmber ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [cat, setCat] = useState<PortfolioCategory>(initial.cat);
  const [year, setYear] = useState(initial.year ?? "");
  const [duration, setDuration] = useState(initial.duration ?? "");
  const [stack, setStack] = useState(initial.stack ?? "");
  const [statusText, setStatusText] = useState(initial.statusText ?? "");
  const [statusType, setStatusType] = useState<PortfolioStatusType>(
    initial.statusType,
  );
  const [badge, setBadge] = useState(initial.badge ?? "");
  const [metaHint, setMetaHint] = useState(initial.metaHint ?? "");
  const [liveUrl, setLiveUrl] = useState(initial.liveUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(initial.demoUrl ?? "");
  const [isPublic, setIsPublic] = useState(initial.isPublic);
  const [displayOrder, setDisplayOrder] = useState(String(initial.displayOrder));

  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const orderNum = Number.parseInt(displayOrder, 10);
      const formData = {
        slug,
        name,
        nameAmber,
        description,
        cat,
        year,
        duration,
        stack,
        statusText,
        statusType,
        badge,
        metaHint,
        liveUrl,
        demoUrl,
        isPublic,
        displayOrder: Number.isFinite(orderNum) ? orderNum : 0,
      };
      const result = isEdit
        ? await updatePortfolioItemAction(initial.id!, formData)
        : await createPortfolioItemAction(formData);
      if (result.success) {
        toast.success(isEdit ? "포트폴리오를 저장했습니다" : "포트폴리오를 등록했습니다");
        if (!isEdit && "id" in result && result.id) {
          router.push(`/dashboard/portfolio/${result.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error ?? "저장에 실패했습니다");
      }
    });
  }

  function handleDelete() {
    if (!initial.id) return;
    if (!confirm("정말 삭제하시겠습니까? /projects 노출이 즉시 중단됩니다.")) return;
    startDelete(async () => {
      const result = await deletePortfolioItemAction(initial.id!);
      if (result.success) {
        toast.success("포트폴리오를 삭제했습니다");
        router.push("/dashboard/portfolio");
      } else {
        toast.error(result.error ?? "삭제에 실패했습니다");
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
            1분 이내 노출됩니다. 최대 10개까지 표시 (정렬 순서 낮은 순).
          </p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="peer sr-only"
            aria-label="포트폴리오 공개 여부"
          />
          <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* name */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pi-name" className="text-sm font-medium">
            이름 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pi-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chat"
            maxLength={80}
            required
          />
          <p className="text-xs text-muted-foreground">
            예: <code className="font-mono">Chat</code> + amber{" "}
            <code className="font-mono">sio</code> = &quot;Chatsio&quot;
          </p>
        </div>

        {/* nameAmber */}
        <div className="space-y-2">
          <Label htmlFor="pi-nameAmber" className="text-sm font-medium">
            amber 부분
          </Label>
          <Input
            id="pi-nameAmber"
            value={nameAmber}
            onChange={(e) => setNameAmber(e.target.value)}
            placeholder="sio"
            maxLength={40}
          />
        </div>

        {/* slug */}
        <div className="space-y-2">
          <Label htmlFor="pi-slug" className="text-sm font-medium">
            Slug
          </Label>
          <Input
            id="pi-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="chatsio"
            maxLength={62}
          />
          <p className="text-xs text-muted-foreground">영문 소문자/숫자/하이픈</p>
        </div>

        {/* description */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pi-description" className="text-sm font-medium">
            한 줄 설명
          </Label>
          <Textarea
            id="pi-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="AI로 고객 상담을 자동화하는 *B2B SaaS*"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">
            <code className="font-mono">*텍스트*</code>로 amber 강조 가능. {description.length}/300
          </p>
        </div>

        {/* cat */}
        <div className="space-y-2">
          <Label htmlFor="pi-cat" className="text-sm font-medium">
            카테고리
          </Label>
          <select
            id="pi-cat"
            value={cat}
            onChange={(e) => setCat(e.target.value as PortfolioCategory)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* displayOrder */}
        <div className="space-y-2">
          <Label htmlFor="pi-order" className="text-sm font-medium">
            정렬 순서
          </Label>
          <Input
            id="pi-order"
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="1"
          />
          <p className="text-xs text-muted-foreground">낮은 숫자가 먼저 표시</p>
        </div>

        {/* year, duration */}
        <div className="space-y-2">
          <Label htmlFor="pi-year" className="text-sm font-medium">
            Year
          </Label>
          <Input
            id="pi-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025"
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pi-dur" className="text-sm font-medium">
            Duration
          </Label>
          <Input
            id="pi-dur"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="2w"
            maxLength={20}
          />
        </div>

        {/* stack */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pi-stack" className="text-sm font-medium">
            Stack
          </Label>
          <Input
            id="pi-stack"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="Next.js · Supabase · Claude"
            maxLength={200}
          />
        </div>

        {/* status */}
        <div className="space-y-2">
          <Label htmlFor="pi-status" className="text-sm font-medium">
            Status 텍스트
          </Label>
          <Input
            id="pi-status"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            placeholder="Live · 12 clients"
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pi-statusType" className="text-sm font-medium">
            Status 색상
          </Label>
          <select
            id="pi-statusType"
            value={statusType}
            onChange={(e) => setStatusType(e.target.value as PortfolioStatusType)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {STATUS_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* badge, meta */}
        <div className="space-y-2">
          <Label htmlFor="pi-badge" className="text-sm font-medium">
            Badge
          </Label>
          <Input
            id="pi-badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="★ Featured · SaaS"
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pi-meta" className="text-sm font-medium">
            Meta hint
          </Label>
          <Input
            id="pi-meta"
            value={metaHint}
            onChange={(e) => setMetaHint(e.target.value)}
            placeholder="AI CHAT · N°01"
            maxLength={60}
          />
        </div>

        {/* liveUrl */}
        <div className="space-y-2">
          <Label htmlFor="pi-liveUrl" className="text-sm font-medium">
            Live URL
          </Label>
          <Input
            id="pi-liveUrl"
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://chatsio.kr"
            maxLength={500}
            inputMode="url"
          />
        </div>

        {/* demoUrl */}
        <div className="space-y-2">
          <Label htmlFor="pi-demoUrl" className="text-sm font-medium">
            Demo URL ⭐
          </Label>
          <Input
            id="pi-demoUrl"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://chatsio.kr/demo 또는 /demo/chatsio"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            외부 URL 또는 내부 경로. /projects 카드 클릭 시 새 탭으로 이동.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {isEdit ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={handleDelete}
            disabled={deleting || pending}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              "삭제"
            )}
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending || deleting}>
          {pending ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : isEdit ? (
            "저장"
          ) : (
            "등록"
          )}
        </Button>
      </div>
    </form>
  );
}
