"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createContractAction } from "../actions";
import {
  contractFormSchema,
  ipOwnerships,
  ipOwnershipLabels,
  type ContractFormData,
  type IpOwnership,
} from "@/lib/validation/contracts";
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

interface EstimateOption {
  id: string;
  estimateNumber: string;
  title: string;
  totalAmount: number | null;
  clientName: string | null;
}

interface Props {
  estimateOptions: EstimateOption[];
  initialEstimateId?: string;
}

function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function ContractForm({
  estimateOptions,
  initialEstimateId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initial = initialEstimateId
    ? estimateOptions.find((e) => e.id === initialEstimateId)
    : undefined;

  const [estimateId, setEstimateId] = useState(initial?.id ?? "");
  const [warrantyMonths, setWarrantyMonths] = useState<number | "">(3);
  const [ipOwnership, setIpOwnership] = useState<IpOwnership>("client");
  const [liabilityLimit, setLiabilityLimit] = useState<number | "">(
    initial?.totalAmount ?? "",
  );
  const [specialTerms, setSpecialTerms] = useState("");

  const selectedEstimate = useMemo(
    () => estimateOptions.find((e) => e.id === estimateId),
    [estimateOptions, estimateId],
  );

  function handleEstimateChange(id: string) {
    setEstimateId(id);
    // 책임 한도 기본값: 계약금액과 동일
    const est = estimateOptions.find((e) => e.id === id);
    if (est?.totalAmount) setLiabilityLimit(est.totalAmount);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 빈 입력 → 기본값 (warranty=3, liability=견적금액)
    const finalWarranty = warrantyMonths === "" ? 3 : warrantyMonths;
    const finalLiability =
      liabilityLimit === ""
        ? (selectedEstimate?.totalAmount ?? 0)
        : liabilityLimit;

    const data: ContractFormData = {
      estimateId,
      warrantyMonths: finalWarranty,
      ipOwnership,
      liabilityLimit: finalLiability,
      specialTerms,
    };

    const parsed = contractFormSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
      return;
    }

    startTransition(async () => {
      const result = await createContractAction(parsed.data);
      if (result.success && result.id) {
        toast.success("계약서가 생성되었습니다");
        router.push(`/dashboard/contracts/${result.id}`);
      } else {
        toast.error(result.error ?? "생성 중 오류가 발생했습니다");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 견적서 선택 */}
      <section className="rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">견적서 선택</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          수락 상태의 견적서만 선택 가능합니다
        </p>

        <div className="mt-4 space-y-2">
          <Label htmlFor="estimate">견적서 *</Label>
          <Select
            value={estimateId}
            onValueChange={(v) => handleEstimateChange(v ?? "")}
          >
            <SelectTrigger id="estimate">
              <SelectValue placeholder="견적서를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {estimateOptions.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.estimateNumber} · {e.title}
                  {e.clientName && ` · ${e.clientName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEstimate && (
          <div className="mt-4 rounded-xl bg-muted/40 p-4 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">고객사</dt>
                <dd className="mt-0.5 font-medium">
                  {selectedEstimate.clientName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">계약금액</dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {formatKRW(selectedEstimate.totalAmount)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      {/* 계약 조건 */}
      <section className="rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">계약 조건</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          표준 조항은 자동 생성되며, 아래 항목만 입력하세요.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="warranty">하자보증 기간 (개월) *</Label>
            <Input
              id="warranty"
              type="number"
              min={0}
              max={60}
              value={warrantyMonths}
              onChange={(e) => {
                const v = e.target.value;
                setWarrantyMonths(v === "" ? "" : Number(v));
              }}
              placeholder="3"
            />
            <p className="text-xs text-muted-foreground">기본 3개월</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip">지식재산권 귀속 *</Label>
            <Select
              value={ipOwnership}
              onValueChange={(v) => v && setIpOwnership(v as IpOwnership)}
            >
              <SelectTrigger id="ip">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ipOwnerships.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {ipOwnershipLabels[opt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="liability">책임 한도 금액 (원) *</Label>
            <Input
              id="liability"
              type="number"
              min={0}
              value={liabilityLimit}
              onChange={(e) => {
                const v = e.target.value;
                setLiabilityLimit(v === "" ? "" : Number(v));
              }}
              placeholder={
                selectedEstimate?.totalAmount
                  ? selectedEstimate.totalAmount.toLocaleString("ko-KR")
                  : "계약금액과 동일"
              }
            />
            <p className="text-xs text-muted-foreground">
              손해배상 한도. 비워두면 계약금액과 동일하게 적용됩니다.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="terms">특약사항</Label>
            <Textarea
              id="terms"
              rows={4}
              maxLength={5000}
              value={specialTerms}
              onChange={(e) => setSpecialTerms(e.target.value)}
              placeholder="표준 조항 외 추가할 내용을 입력하세요 (선택)"
            />
            <p className="text-xs text-muted-foreground">
              {specialTerms.length} / 5000
            </p>
          </div>
        </div>
      </section>

      {/* 제출 버튼 */}
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
          disabled={isPending || !estimateId}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "생성 중..." : "계약서 생성"}
        </button>
      </div>
    </form>
  );
}
