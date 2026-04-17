"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleTaxInvoiceAction } from "../actions";
import { ExternalLink, Check, Copy, FileText } from "lucide-react";
import { toast } from "sonner";

interface Props {
  invoiceId: string;
  issued: boolean;
  clientName: string | null;
  clientBusinessNumber: string | null;
  supplyAmount: number;
  taxAmount: number;
}

const HOMETAX_URL =
  "https://www.hometax.go.kr/websquare/websquare.wq?w2xPath=/ui/pp/index_pp.xml";

export function TaxInvoiceHelper({
  invoiceId,
  issued,
  clientName,
  clientBusinessNumber,
  supplyAmount,
  taxAmount,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleTaxInvoiceAction(invoiceId, !issued);
      if (result.success) {
        toast.success(
          !issued ? "세금계산서 발행 완료로 표시됨" : "발행 상태가 해제됨",
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "오류가 발생했습니다");
      }
    });
  }

  async function copyToClipboard(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  }

  const rows: { key: string; label: string; value: string }[] = [
    { key: "client", label: "공급받는자", value: clientName ?? "" },
    {
      key: "businessNumber",
      label: "사업자번호",
      value: clientBusinessNumber ?? "",
    },
    {
      key: "supply",
      label: "공급가액",
      value: supplyAmount.toLocaleString("ko-KR"),
    },
    {
      key: "tax",
      label: "부가세",
      value: taxAmount.toLocaleString("ko-KR"),
    },
    {
      key: "total",
      label: "합계",
      value: (supplyAmount + taxAmount).toLocaleString("ko-KR"),
    },
  ];

  return (
    <section className="mt-6 rounded-2xl bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              세금계산서 발행 도우미
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              홈택스에서 전자세금계산서를 직접 발행하세요. 아래 정보를 복사해서
              사용합니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            issued
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {issued ? "✓ 발행 완료" : "미발행"}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-muted/30">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between border-b border-border/30 px-4 py-2.5 text-sm last:border-0"
          >
            <span className="text-muted-foreground">{r.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tabular-nums">
                {r.value || "—"}
              </span>
              {r.value && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(r.key, r.value)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  title="복사"
                >
                  {copiedKey === r.key ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <a
        href={HOMETAX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        홈택스 바로가기
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </section>
  );
}
