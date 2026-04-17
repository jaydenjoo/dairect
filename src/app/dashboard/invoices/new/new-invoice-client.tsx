"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createInvoiceAction,
  generateInvoicesFromEstimateAction,
} from "../actions";
import {
  invoiceManualFormSchema,
  invoiceFromEstimateSchema,
  invoiceTypes,
  invoiceTypeLabels,
  type InvoiceManualFormData,
  type InvoiceFromEstimateData,
  type InvoiceType,
} from "@/lib/validation/invoices";
import { paymentSplitItemSchema } from "@/lib/validation/settings";
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
import { z } from "zod";

interface ProjectOption {
  id: string;
  name: string | null;
  clientName: string | null;
}

interface EstimateOption {
  id: string;
  estimateNumber: string;
  title: string;
  supplyAmount: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  paymentSplit: unknown;
  projectId: string | null;
  projectName: string | null;
  clientName: string | null;
}

interface Props {
  projects: ProjectOption[];
  estimates: EstimateOption[];
  initialEstimateId?: string;
  initialProjectId?: string;
}

type Mode = "auto" | "manual";

function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function splitByRatio(total: number, percentages: number[]): number[] {
  const raws = percentages.map((p) => Math.floor((total * p) / 100));
  const diff = total - raws.reduce((a, b) => a + b, 0);
  if (raws.length > 0) raws[raws.length - 1] += diff;
  return raws;
}

export function NewInvoiceClient({
  projects,
  estimates,
  initialEstimateId,
  initialProjectId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultMode: Mode = initialProjectId && !initialEstimateId ? "manual" : "auto";
  const [mode, setMode] = useState<Mode>(defaultMode);

  // ─── 자동 모드 state ───
  const [autoEstimateId, setAutoEstimateId] = useState(initialEstimateId ?? "");
  const [autoIssuedDate, setAutoIssuedDate] = useState(today());
  const [autoIntervalDays, setAutoIntervalDays] = useState<number | "">(30);

  const selectedEstimate = useMemo(
    () => estimates.find((e) => e.id === autoEstimateId),
    [estimates, autoEstimateId],
  );

  const splitPreview = useMemo(() => {
    if (!selectedEstimate) return [];
    const splitParsed = z
      .array(paymentSplitItemSchema)
      .safeParse(selectedEstimate.paymentSplit);
    const splitItems = splitParsed.success ? splitParsed.data : [];
    if (splitItems.length === 0 || selectedEstimate.supplyAmount === null)
      return [];

    const supplySplits = splitByRatio(
      selectedEstimate.supplyAmount,
      splitItems.map((s) => s.percentage),
    );
    const taxSplits = splitByRatio(
      selectedEstimate.taxAmount ?? 0,
      splitItems.map((s) => s.percentage),
    );

    return splitItems.map((s, i) => ({
      label: s.label,
      percentage: s.percentage,
      supply: supplySplits[i],
      tax: taxSplits[i],
      total: supplySplits[i] + taxSplits[i],
    }));
  }, [selectedEstimate]);

  // ─── 수동 모드 state ───
  const [manualProjectId, setManualProjectId] = useState(
    initialProjectId ?? "",
  );
  const [manualEstimateId, setManualEstimateId] = useState("");
  const [manualType, setManualType] = useState<InvoiceType>("advance");
  const [manualAmount, setManualAmount] = useState<number | "">("");
  const [manualTaxAmount, setManualTaxAmount] = useState<number | "">("");
  const [manualIssuedDate, setManualIssuedDate] = useState(today());
  const [manualDueDate, setManualDueDate] = useState(addDays(today(), 30));
  const [manualMemo, setManualMemo] = useState("");

  const manualTotal =
    (typeof manualAmount === "number" ? manualAmount : 0) +
    (typeof manualTaxAmount === "number" ? manualTaxAmount : 0);

  function handleAmountChange(v: string) {
    if (v === "") {
      setManualAmount("");
      return;
    }
    const n = Number(v);
    setManualAmount(n);
    // 부가세 자동 계산 (10%)
    setManualTaxAmount(Math.round(n * 0.1));
  }

  const manualEstimateOptions = useMemo(
    () => estimates.filter((e) => !manualProjectId || e.projectId === manualProjectId),
    [estimates, manualProjectId],
  );

  function handleAutoSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: InvoiceFromEstimateData = {
      estimateId: autoEstimateId,
      issuedDate: autoIssuedDate,
      dueDateIntervalDays:
        autoIntervalDays === "" ? 30 : autoIntervalDays,
    };
    const parsed = invoiceFromEstimateSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
      return;
    }

    startTransition(async () => {
      const result = await generateInvoicesFromEstimateAction(parsed.data);
      if (result.success) {
        toast.success(
          `청구서 ${result.ids?.length ?? 0}건이 자동 생성되었습니다`,
        );
        router.push("/dashboard/invoices");
      } else {
        toast.error(result.error ?? "생성 중 오류가 발생했습니다");
      }
    });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (manualAmount === "" || manualTaxAmount === "") {
      toast.error("공급가액과 부가세를 입력해주세요");
      return;
    }

    const data: InvoiceManualFormData = {
      projectId: manualProjectId,
      estimateId: manualEstimateId || undefined,
      type: manualType,
      amount: manualAmount,
      taxAmount: manualTaxAmount,
      issuedDate: manualIssuedDate,
      dueDate: manualDueDate,
      memo: manualMemo,
    };
    const parsed = invoiceManualFormSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
      return;
    }

    startTransition(async () => {
      const result = await createInvoiceAction(parsed.data);
      if (result.success && result.id) {
        toast.success("청구서가 생성되었습니다");
        router.push(`/dashboard/invoices/${result.id}`);
      } else {
        toast.error(result.error ?? "생성 중 오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* 모드 탭 */}
      <div className="inline-flex rounded-xl bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "auto"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          견적서 기반 자동 생성
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          직접 입력
        </button>
      </div>

      {mode === "auto" ? (
        <form onSubmit={handleAutoSubmit} className="space-y-6">
          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">
              견적서 선택
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              수락된 견적서의 수금 비율대로 청구서 여러 건이 한 번에 생성됩니다
            </p>

            {estimates.length === 0 ? (
              <p className="mt-4 rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                수락된 견적서가 없습니다. 직접 입력 탭을 사용하세요.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <Label htmlFor="estimate">견적서 *</Label>
                <Select
                  value={autoEstimateId}
                  onValueChange={(v) => setAutoEstimateId(v ?? "")}
                >
                  <SelectTrigger id="estimate">
                    <SelectValue placeholder="견적서를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {estimates.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.estimateNumber} · {e.title}
                        {e.clientName && ` · ${e.clientName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedEstimate && splitPreview.length > 0 && (
              <div className="mt-4 rounded-xl bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  생성될 청구서 미리보기
                </p>
                <ul className="mt-3 divide-y divide-border/40">
                  {splitPreview.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">{s.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {s.percentage}% ·{" "}
                          {invoiceTypeLabels[
                            (["advance", "interim", "final"][i] ??
                              "final") as InvoiceType
                          ]}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">
                          {formatKRW(s.total)}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          공급가액 {formatKRW(s.supply)} · 부가세{" "}
                          {formatKRW(s.tax)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">
              발행 정보
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="autoIssued">발행일 *</Label>
                <Input
                  id="autoIssued"
                  type="date"
                  value={autoIssuedDate}
                  onChange={(e) => setAutoIssuedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoInterval">지급기한 (일수) *</Label>
                <Input
                  id="autoInterval"
                  type="number"
                  min={1}
                  max={365}
                  value={autoIntervalDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAutoIntervalDays(v === "" ? "" : Number(v));
                  }}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                  발행일로부터 며칠 뒤까지 지급 요청
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                isPending || !autoEstimateId || splitPreview.length === 0
              }
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending
                ? "생성 중..."
                : `청구서 ${splitPreview.length}건 생성`}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">
              청구 대상
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project">프로젝트 *</Label>
                <Select
                  value={manualProjectId}
                  onValueChange={(v) => {
                    setManualProjectId(v ?? "");
                    setManualEstimateId("");
                  }}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="프로젝트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name ?? "—"}
                        {p.clientName && ` · ${p.clientName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualEstimate">연결 견적서</Label>
                <Select
                  value={manualEstimateId}
                  onValueChange={(v) => setManualEstimateId(v ?? "")}
                  disabled={manualEstimateOptions.length === 0}
                >
                  <SelectTrigger id="manualEstimate">
                    <SelectValue placeholder="선택 (옵션)" />
                  </SelectTrigger>
                  <SelectContent>
                    {manualEstimateOptions.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.estimateNumber} · {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">구분 *</Label>
                <Select
                  value={manualType}
                  onValueChange={(v) => v && setManualType(v as InvoiceType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {invoiceTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {invoiceTypeLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">금액</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">공급가액 (원) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={manualAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">부가세 (원) *</Label>
                <Input
                  id="tax"
                  type="number"
                  min={0}
                  value={manualTaxAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setManualTaxAmount(v === "" ? "" : Number(v));
                  }}
                  placeholder="자동 계산 (10%)"
                />
              </div>

              <div className="rounded-lg bg-muted/40 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">합계</p>
                <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-foreground">
                  {formatKRW(manualTotal)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">
              발행 정보
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issuedDate">발행일 *</Label>
                <Input
                  id="issuedDate"
                  type="date"
                  value={manualIssuedDate}
                  onChange={(e) => setManualIssuedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">지급기한 *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="memo">메모</Label>
                <Textarea
                  id="memo"
                  rows={3}
                  maxLength={1000}
                  value={manualMemo}
                  onChange={(e) => setManualMemo(e.target.value)}
                  placeholder="청구 관련 메모 (선택)"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                !manualProjectId ||
                manualAmount === "" ||
                manualTaxAmount === ""
              }
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "생성 중..." : "청구서 생성"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
