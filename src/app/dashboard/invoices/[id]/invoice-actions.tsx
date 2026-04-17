"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateInvoiceStatusAction,
  deleteInvoiceAction,
  markPaidAction,
} from "../actions";
import {
  markPaidSchema,
  type InvoiceStatus,
  type MarkPaidData,
} from "@/lib/validation/invoices";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  id: string;
  status: InvoiceStatus;
  defaultPaidAmount: number | null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function InvoiceActions({ id, status, defaultPaidAmount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [paidOpen, setPaidOpen] = useState(false);
  const [paidDate, setPaidDate] = useState(today());
  const [paidAmount, setPaidAmount] = useState<number | "">(
    defaultPaidAmount ?? "",
  );

  function handleStatusChange(newStatus: InvoiceStatus) {
    startTransition(async () => {
      const result = await updateInvoiceStatusAction(id, newStatus);
      if (result.success) {
        toast.success("상태가 변경되었습니다");
        router.refresh();
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  function handleMarkPaid(e: React.FormEvent) {
    e.preventDefault();
    if (paidAmount === "") {
      toast.error("입금 금액을 입력해주세요");
      return;
    }
    const data: MarkPaidData = { paidDate, paidAmount };
    const parsed = markPaidSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
      return;
    }
    startTransition(async () => {
      const result = await markPaidAction(id, parsed.data);
      if (result.success) {
        toast.success("입금이 확인되었습니다");
        setPaidOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 청구서를 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const result = await deleteInvoiceAction(id);
      if (result.success) {
        toast.success("청구서가 삭제되었습니다");
        router.push("/dashboard/invoices");
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "pending" && (
        <button
          type="button"
          onClick={() => handleStatusChange("sent")}
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "처리 중..." : "청구 발행"}
        </button>
      )}

      {(status === "sent" || status === "overdue") && (
        <Dialog open={paidOpen} onOpenChange={setPaidOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                입금 확인
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>입금 확인</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paidDate">입금일 *</Label>
                <Input
                  id="paidDate"
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidAmount">입금 금액 (원) *</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPaidAmount(v === "" ? "" : Number(v));
                  }}
                  placeholder={
                    defaultPaidAmount
                      ? defaultPaidAmount.toLocaleString("ko-KR")
                      : "0"
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  합의된 실입금액을 기록합니다. 부분 입금이 발생한 경우 별도
                  청구서를 추가 생성하세요.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPaidOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || paidAmount === ""}
                >
                  {isPending ? "처리 중..." : "입금 완료"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {(status === "pending" || status === "sent") && (
        <button
          type="button"
          onClick={() => handleStatusChange("cancelled")}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          취소
        </button>
      )}

      {(status === "pending" || status === "cancelled") && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          삭제
        </button>
      )}
    </div>
  );
}
