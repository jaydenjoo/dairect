import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getContract } from "../actions";
import { getUserCompanyInfo } from "../../estimates/actions";
import {
  contractStatusLabels,
  contractStatusColors,
  ipOwnershipLabels,
  ipOwnershipSchema,
  type ContractStatus,
  type IpOwnership,
} from "@/lib/validation/contracts";
import { ContractActions } from "./contract-actions";
import { ContractPdfButtons } from "./pdf-buttons";
import type { ContractPdfData } from "@/lib/pdf/contract-pdf";
import { ArrowLeft, Calendar, FileText, Shield, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "계약서 상세",
};

function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [contract, company] = await Promise.all([
    getContract(id),
    getUserCompanyInfo(),
  ]);

  if (!contract) notFound();

  const status = contract.status as ContractStatus;
  const ipParsed = ipOwnershipSchema.safeParse(contract.ipOwnership);
  const ipOwnership: IpOwnership = ipParsed.success ? ipParsed.data : "client";

  const pdfData: ContractPdfData = {
    contractNumber: contract.contractNumber,
    createdAt: contract.createdAt,
    warrantyMonths: contract.warrantyMonths ?? 3,
    ipOwnership,
    liabilityLimit: contract.liabilityLimit,
    specialTerms: contract.specialTerms,
    estimateNumber: contract.estimateNumber,
    estimateTitle: contract.estimateTitle,
    estimateTotalAmount: contract.estimateTotalAmount,
    estimateSupplyAmount: contract.estimateSupplyAmount,
    estimateTaxAmount: contract.estimateTaxAmount,
    estimatePaymentSplit: contract.estimatePaymentSplit,
    projectName: contract.projectName,
    projectStartDate: contract.projectStartDate,
    projectEndDate: contract.projectEndDate,
    clientName: contract.clientName,
    clientContactName: contract.clientContactName,
    clientBusinessNumber: contract.clientBusinessNumber,
    clientAddress: contract.clientAddress,
  };

  return (
    <div className="py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/contracts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            계약서 목록
          </Link>
          <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
            {contract.estimateTitle ?? "계약서"}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono">{contract.contractNumber}</span>
            <Badge
              variant="secondary"
              className={
                contractStatusColors[status] ?? "bg-gray-100 text-gray-700"
              }
            >
              {contractStatusLabels[status] ?? status}
            </Badge>
            {contract.estimateNumber && (
              <Link
                href={`/dashboard/estimates/${contract.estimateId}`}
                className="font-mono text-xs text-muted-foreground hover:text-primary"
              >
                ← {contract.estimateNumber}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ContractPdfButtons contract={pdfData} company={company} />
          <ContractActions id={contract.id} status={status} />
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">계약금액</p>
            <p className="font-medium tabular-nums text-foreground">
              {formatKRW(contract.estimateTotalAmount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">하자보증</p>
            <p className="font-medium text-foreground">
              {contract.warrantyMonths ?? 3}개월
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">지식재산권</p>
            <p className="font-medium text-foreground">
              {ipOwnershipLabels[ipOwnership] ?? ipOwnership}
            </p>
          </div>
        </div>
      </div>

      {/* 당사자 정보 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            갑 (발주자)
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">회사명</dt>
              <dd className="font-medium">{contract.clientName ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">대표자</dt>
              <dd className="font-medium">
                {contract.clientContactName ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">사업자번호</dt>
              <dd className="font-medium">
                {contract.clientBusinessNumber ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">주소</dt>
              <dd className="text-right font-medium">
                {contract.clientAddress ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            을 (공급자)
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">회사명</dt>
              <dd className="font-medium">{company?.companyName ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">대표자</dt>
              <dd className="font-medium">
                {company?.representativeName ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">사업자번호</dt>
              <dd className="font-medium">
                {company?.businessNumber ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">주소</dt>
              <dd className="text-right font-medium">
                {company?.businessAddress ?? "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* 계약 조건 */}
      <section className="mt-6 rounded-2xl bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">계약 조건</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">프로젝트명</dt>
            <dd className="mt-0.5 font-medium">
              {contract.projectName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">책임 한도</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {formatKRW(contract.liabilityLimit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">용역 시작일</dt>
            <dd className="mt-0.5 font-medium">
              {formatDate(contract.projectStartDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">용역 종료일</dt>
            <dd className="mt-0.5 font-medium">
              {formatDate(contract.projectEndDate)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">작성일</dt>
              <dd className="mt-0.5 font-medium">
                {formatDate(contract.createdAt)}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">서명일</dt>
              <dd className="mt-0.5 font-medium">
                {formatDate(contract.signedAt)}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      {/* 특약사항 */}
      {contract.specialTerms && (
        <section className="mt-6 rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">특약사항</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {contract.specialTerms}
          </p>
        </section>
      )}
    </div>
  );
}
