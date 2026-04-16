"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { saveSettings } from "./actions";
import type { SettingsFormData, PaymentSplitItem } from "@/lib/validation/settings";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialData: SettingsFormData;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [formData, setFormData] = useState<SettingsFormData>(initialData);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updateBankField(key: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [key]: value },
    }));
  }

  function updatePaymentSplit(index: number, field: keyof PaymentSplitItem, value: string | number) {
    setFormData((prev) => {
      const updated = prev.defaultPaymentSplit.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, defaultPaymentSplit: updated };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(formData);
      if (result.success) {
        toast.success("설정이 저장되었습니다");
      } else {
        toast.error(result.error ?? "저장에 실패했습니다");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* 회사 정보 */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          사업자 정보
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          견적서, 계약서, 인보이스에 자동으로 반영됩니다
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FieldGroup label="상호 (회사명)">
            <Input
              value={formData.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="다이렉트"
            />
          </FieldGroup>
          <FieldGroup label="대표자명">
            <Input
              value={formData.representativeName}
              onChange={(e) => updateField("representativeName", e.target.value)}
              placeholder="홍길동"
            />
          </FieldGroup>
          <FieldGroup label="사업자등록번호">
            <Input
              value={formData.businessNumber}
              onChange={(e) => updateField("businessNumber", e.target.value)}
              placeholder="000-00-00000"
            />
          </FieldGroup>
          <FieldGroup label="이메일">
            <Input
              type="email"
              value={formData.businessEmail}
              onChange={(e) => updateField("businessEmail", e.target.value)}
              placeholder="contact@dairect.kr"
            />
          </FieldGroup>
          <FieldGroup label="전화번호">
            <Input
              value={formData.businessPhone}
              onChange={(e) => updateField("businessPhone", e.target.value)}
              placeholder="010-0000-0000"
            />
          </FieldGroup>
          <FieldGroup label="주소" className="sm:col-span-2">
            <Input
              value={formData.businessAddress}
              onChange={(e) => updateField("businessAddress", e.target.value)}
              placeholder="서울시 강남구..."
            />
          </FieldGroup>
        </div>
      </section>

      {/* 계좌 정보 */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          계좌 정보
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          인보이스에 입금 계좌로 표시됩니다
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <FieldGroup label="은행명">
            <Input
              value={formData.bankInfo?.bankName ?? ""}
              onChange={(e) => updateBankField("bankName", e.target.value)}
              placeholder="신한은행"
            />
          </FieldGroup>
          <FieldGroup label="계좌번호">
            <Input
              value={formData.bankInfo?.accountNumber ?? ""}
              onChange={(e) => updateBankField("accountNumber", e.target.value)}
              placeholder="110-000-000000"
            />
          </FieldGroup>
          <FieldGroup label="예금주">
            <Input
              value={formData.bankInfo?.accountHolder ?? ""}
              onChange={(e) => updateBankField("accountHolder", e.target.value)}
              placeholder="홍길동"
            />
          </FieldGroup>
        </div>
      </section>

      {/* 견적서 기본값 */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          견적서 기본값
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          새 견적서 생성 시 기본값으로 적용됩니다
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FieldGroup label="일 단가 (원)">
            <Input
              type="number"
              value={formData.dailyRate}
              onChange={(e) => updateField("dailyRate", Number(e.target.value))}
              min={0}
              step={10000}
            />
          </FieldGroup>
          <div /> {/* spacer */}
          <FieldGroup label="견적서 접두사">
            <Input
              value={formData.estimateNumberPrefix}
              onChange={(e) => updateField("estimateNumberPrefix", e.target.value)}
              placeholder="EST"
              maxLength={10}
            />
          </FieldGroup>
          <FieldGroup label="계약서 접두사">
            <Input
              value={formData.contractNumberPrefix}
              onChange={(e) => updateField("contractNumberPrefix", e.target.value)}
              placeholder="CON"
              maxLength={10}
            />
          </FieldGroup>
          <FieldGroup label="인보이스 접두사">
            <Input
              value={formData.invoiceNumberPrefix}
              onChange={(e) => updateField("invoiceNumberPrefix", e.target.value)}
              placeholder="INV"
              maxLength={10}
            />
          </FieldGroup>
        </div>
      </section>

      {/* 수금 비율 */}
      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          기본 수금 비율
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          착수금/중도금/잔금 비율 (합계 100%)
        </p>
        <div className="mt-6 space-y-3">
          {formData.defaultPaymentSplit.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={item.label}
                onChange={(e) => updatePaymentSplit(i, "label", e.target.value)}
                className="w-32"
                placeholder="항목명"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={item.percentage}
                  onChange={(e) =>
                    updatePaymentSplit(i, "percentage", Number(e.target.value))
                  }
                  className="w-20"
                  min={0}
                  max={100}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            합계:{" "}
            <span
              className={
                formData.defaultPaymentSplit.reduce((s, i) => s + i.percentage, 0) === 100
                  ? "text-green-600"
                  : "text-destructive"
              }
            >
              {formData.defaultPaymentSplit.reduce((s, i) => s + i.percentage, 0)}%
            </span>
          </p>
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

function FieldGroup({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium text-foreground/80">
        {label}
      </Label>
      {children}
    </div>
  );
}
