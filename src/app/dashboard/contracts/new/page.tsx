import type { Metadata } from "next";
import Link from "next/link";
import { getAcceptedEstimatesForContract } from "../actions";
import { ContractForm } from "./contract-form";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "새 계약서",
};

interface PageProps {
  searchParams: Promise<{ estimateId?: string }>;
}

export default async function NewContractPage({ searchParams }: PageProps) {
  const { estimateId } = await searchParams;
  const estimateOptions = await getAcceptedEstimatesForContract();
  const initialEstimateId = estimateOptions.find((e) => e.id === estimateId)?.id;

  return (
    <div className="py-10">
      <Link
        href="/dashboard/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        계약서 목록
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
        새 계약서 작성
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        수락된 견적서를 선택하고 계약 조건을 입력하세요.
      </p>

      {estimateOptions.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            수락된 견적서가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            견적서를 발송하고 고객이 수락하면 계약서를 작성할 수 있습니다.
          </p>
          <Link
            href="/dashboard/estimates"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            견적서 관리로 이동
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <ContractForm
            estimateOptions={estimateOptions}
            initialEstimateId={initialEstimateId}
          />
        </div>
      )}
    </div>
  );
}
