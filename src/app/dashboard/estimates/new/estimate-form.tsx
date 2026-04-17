"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEstimateAction } from "../actions";
import { generateEstimateDraftAction } from "../ai-actions";
import type { EstimateFormData, EstimateItemFormData } from "@/lib/validation/estimates";
import {
  AI_DAILY_LIMIT,
  AI_REQUIREMENTS_MAX,
  AI_REQUIREMENTS_MIN,
  aiCategoryLabels,
  aiDifficultyCoefficient,
  type AiEstimateItem,
} from "@/lib/validation/ai-estimate";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Plus, Sparkles, Trash2 } from "lucide-react";

interface PaymentSplitItem {
  label: string;
  percentage: number;
}

interface ItemWithId extends EstimateItemFormData {
  _id: string;
}

interface Props {
  clientOptions: { id: string; companyName: string }[];
  projectOptions: { id: string; name: string }[];
  defaults: {
    dailyRate: number;
    paymentSplit: PaymentSplitItem[];
  };
}

function defaultItem(dailyRate: number): ItemWithId {
  return {
    _id: crypto.randomUUID(),
    name: "",
    description: "",
    category: "",
    manDays: 1,
    difficulty: 1.0,
    unitPrice: dailyRate,
    quantity: 1,
  };
}

function calcSubtotal(item: EstimateItemFormData): number {
  return Math.round(
    item.manDays * (item.difficulty ?? 1) * item.unitPrice * (item.quantity ?? 1),
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function defaultValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function aiItemToFormItem(item: AiEstimateItem, dailyRate: number): ItemWithId {
  return {
    _id: crypto.randomUUID(),
    name: item.name,
    description: "",
    category: aiCategoryLabels[item.category],
    manDays: item.manDays,
    difficulty: aiDifficultyCoefficient[item.difficulty],
    unitPrice: dailyRate,
    quantity: 1,
  };
}

export function EstimateForm({ clientOptions, projectOptions, defaults }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [notes, setNotes] = useState("");
  const [paymentSplit, setPaymentSplit] = useState<PaymentSplitItem[]>(
    defaults.paymentSplit,
  );
  const [items, setItems] = useState<ItemWithId[]>([
    defaultItem(defaults.dailyRate),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── AI 초안 state ───
  const [aiRequirements, setAiRequirements] = useState("");
  const [aiWasGenerated, setAiWasGenerated] = useState(false);
  const [aiDailyCount, setAiDailyCount] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // ─── 항목 CRUD ───

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, defaultItem(defaults.dailyRate)]);
  }, [defaults.dailyRate]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof ItemWithId, value: string | number) => {
      setItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      );
    },
    [],
  );

  // ─── 수금 비율 수정 ───

  const updateSplitPercentage = useCallback(
    (index: number, value: number) => {
      setPaymentSplit((prev) =>
        prev.map((s, i) => (i === index ? { ...s, percentage: value } : s)),
      );
    },
    [],
  );

  // ─── 금액 계산 ───

  const supplyAmount = items.reduce((sum, item) => sum + calcSubtotal(item), 0);
  const taxAmount = Math.round(supplyAmount * 0.1);
  const totalAmount = supplyAmount + taxAmount;
  const totalDays = items.reduce(
    (sum, item) => sum + item.manDays * (item.quantity ?? 1),
    0,
  );
  const splitTotal = paymentSplit.reduce((s, i) => s + i.percentage, 0);

  // ─── AI 초안 생성 ───

  function handleGenerate() {
    setAiError(null);

    if (aiRequirements.length < AI_REQUIREMENTS_MIN) {
      setAiError(
        `요구사항을 ${AI_REQUIREMENTS_MIN}자 이상 입력해주세요 (현재 ${aiRequirements.length}자)`,
      );
      return;
    }
    if (aiRequirements.length > AI_REQUIREMENTS_MAX) {
      setAiError(`요구사항은 ${AI_REQUIREMENTS_MAX}자 이내로 입력해주세요`);
      return;
    }

    // 기존에 수동으로 입력한 항목이 있으면 덮어쓰기 확인 (실수 방지)
    const hasManualItems = items.some((it) => it.name.trim().length > 0);
    if (hasManualItems) {
      const ok = window.confirm(
        "현재 입력한 견적 항목이 모두 AI 초안으로 대체됩니다. 계속하시겠습니까?",
      );
      if (!ok) return;
    }

    startAiTransition(async () => {
      const result = await generateEstimateDraftAction(aiRequirements);
      if (result.success) {
        const aiItems = result.items.map((item) =>
          aiItemToFormItem(item, defaults.dailyRate),
        );
        setItems(aiItems);
        setAiWasGenerated(true);
        setAiDailyCount(result.dailyCount);
        setAiError(null);
        if (!title.trim()) setTitle("AI 견적 초안");
        toast.success(`AI가 ${result.items.length}개 항목을 생성했습니다`);
      } else {
        setAiError(result.error);
        if (typeof result.dailyCount === "number") setAiDailyCount(result.dailyCount);
        toast.error(result.error);
      }
    });
  }

  // ─── 제출 ───

  function handleSubmit() {
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "견적서 제목을 입력해주세요";
    if (!clientId) newErrors.clientId = "고객을 선택해주세요";
    if (!validUntil) newErrors.validUntil = "유효기한을 입력해주세요";
    if (items.some((item) => !item.name.trim()))
      newErrors.items = "모든 항목에 이름을 입력해주세요";
    if (splitTotal !== 100)
      newErrors.split = `수금 비율 합계가 ${splitTotal}%입니다 (100% 필요)`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: EstimateFormData = {
      title: title.trim(),
      clientId,
      projectId: projectId || undefined,
      validUntil,
      notes: notes.trim(),
      paymentSplit,
      items: items.map(({ _id, ...rest }) => rest),
    };

    startTransition(async () => {
      const result = await createEstimateAction(data, aiWasGenerated ? "ai" : "manual");
      if (result.success && result.id) {
        toast.success("견적서가 생성되었습니다");
        router.push(`/dashboard/estimates/${result.id}`);
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* AI 초안 생성 (선택) */}
      <section className="rounded-2xl bg-primary/[0.04] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">AI 견적 초안 (선택)</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              요구사항 텍스트를 입력하면 Claude AI가 견적 항목을 자동으로 분해합니다. 생성된 초안은 반드시 검토·수정 후 저장하세요.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Textarea
            value={aiRequirements}
            onChange={(e) => setAiRequirements(e.target.value)}
            placeholder="예: 쇼핑몰을 만들고 싶어요. 회원가입, 상품 목록, 장바구니, 결제(토스페이먼츠), 관리자 대시보드가 필요합니다. 모바일 반응형 필수."
            rows={5}
            maxLength={AI_REQUIREMENTS_MAX}
            disabled={aiPending}
            aria-describedby="ai-req-help"
          />
          {aiError && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {aiError}
            </p>
          )}
          <div
            id="ai-req-help"
            className="mt-2 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"
          >
            <span
              className={`tabular-nums ${
                aiRequirements.length > 0 && aiRequirements.length < AI_REQUIREMENTS_MIN
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {aiRequirements.length} / {AI_REQUIREMENTS_MAX}자
              {aiRequirements.length > 0 &&
                aiRequirements.length < AI_REQUIREMENTS_MIN &&
                ` (최소 ${AI_REQUIREMENTS_MIN}자)`}
            </span>
            <div className="flex items-center gap-3">
              {aiDailyCount !== null && (
                <span className="text-muted-foreground">
                  오늘 사용:{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {aiDailyCount}
                  </span>
                  /{AI_DAILY_LIMIT}
                </span>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={
                  aiPending || aiRequirements.length < AI_REQUIREMENTS_MIN
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiPending ? "AI 생성 중..." : "AI 초안 생성"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 기본 정보 */}
      <section className="rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">기본 정보</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">견적서 제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 홈페이지 리뉴얼 견적"
              className="mt-1.5"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="client">고객</Label>
            <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
              <SelectTrigger id="client" className="mt-1.5">
                <SelectValue placeholder="고객 선택" />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="mt-1 text-xs text-destructive">{errors.clientId}</p>
            )}
          </div>

          <div>
            <Label htmlFor="project">프로젝트 (선택)</Label>
            <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
              <SelectTrigger id="project" className="mt-1.5">
                <SelectValue placeholder="프로젝트 선택" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="validUntil">유효기한</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1.5"
            />
            {errors.validUntil && (
              <p className="mt-1 text-xs text-destructive">{errors.validUntil}</p>
            )}
          </div>
        </div>
      </section>

      {/* AI 생성 경고 배너 — 정적 주의 안내이므로 role="note" + polite live region */}
      {aiWasGenerated && (
        <div
          className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-500/10"
          role="note"
          aria-live="polite"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              주의: AI 생성 초안입니다 — 반드시 검토하세요
            </p>
            <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-100/80">
              AI가 생성한 공수·난이도·카테고리를 확인하고, 요구사항에서 누락된 항목이 없는지 점검한 뒤 수정 후 저장해주세요. 저장된 견적서에는 AI 생성 태그가 기록됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 견적 항목 */}
      <section className="rounded-2xl bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">견적 항목</h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-3.5 w-3.5" />
            항목 추가
          </button>
        </div>
        {errors.items && (
          <p className="mt-2 text-xs text-destructive">{errors.items}</p>
        )}

        <div className="mt-4 space-y-4">
          {items.map((item, idx) => (
            <div
              key={item._id}
              className="rounded-xl bg-muted/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2">
                  <Label className="text-xs">항목명</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    placeholder="예: 로그인 기능 개발"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">설명</Label>
                  <Input
                    value={item.description ?? ""}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    placeholder="선택사항"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">M/D (공수)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={item.manDays}
                    onChange={(e) =>
                      updateItem(idx, "manDays", parseFloat(e.target.value) || 0)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">난이도 배수</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={item.difficulty ?? 1}
                    onChange={(e) =>
                      updateItem(idx, "difficulty", parseFloat(e.target.value) || 1)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">단가 (원)</Label>
                  <Input
                    type="number"
                    step="10000"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, "unitPrice", parseInt(e.target.value, 10) || 0)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">수량</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity ?? 1}
                    onChange={(e) =>
                      updateItem(idx, "quantity", parseInt(e.target.value, 10) || 1)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-3 text-right text-sm">
                <span className="text-muted-foreground">소계: </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {formatNumber(calcSubtotal(item))}원
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 금액 요약 + 수금 비율 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 금액 요약 */}
        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">금액 요약</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">총 공수</dt>
              <dd className="font-medium tabular-nums">{totalDays} M/D</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">공급가액</dt>
              <dd className="font-medium tabular-nums">
                {formatNumber(supplyAmount)}원
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">부가세 (10%)</dt>
              <dd className="font-medium tabular-nums">
                {formatNumber(taxAmount)}원
              </dd>
            </div>
            <div className="flex justify-between border-t border-border/50 pt-3">
              <dt className="font-semibold text-foreground">합계</dt>
              <dd className="text-lg font-bold tabular-nums text-primary">
                {formatNumber(totalAmount)}원
              </dd>
            </div>
          </dl>
        </section>

        {/* 수금 비율 */}
        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">수금 비율</h2>
          {errors.split && (
            <p className="mt-2 text-xs text-destructive">{errors.split}</p>
          )}
          <div className="mt-4 space-y-3">
            {paymentSplit.map((split, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="min-w-[60px] text-sm text-muted-foreground">
                  {split.label}
                </span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={split.percentage}
                  onChange={(e) =>
                    updateSplitPercentage(idx, parseInt(e.target.value, 10) || 0)
                  }
                  className="w-20 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="ml-auto text-sm font-medium tabular-nums">
                  {formatNumber(Math.round(totalAmount * split.percentage / 100))}원
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border/50 pt-3 text-sm">
              <span className="text-muted-foreground">합계</span>
              <span
                className={`font-semibold ${splitTotal === 100 ? "text-green-600" : "text-destructive"}`}
              >
                {splitTotal}%
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* 비고 */}
      <section className="rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">비고</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="고객에게 전달할 참고 사항 (선택)"
          rows={3}
          className="mt-3"
        />
      </section>

      {/* 제출 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "견적서 저장"}
        </button>
      </div>
    </div>
  );
}
