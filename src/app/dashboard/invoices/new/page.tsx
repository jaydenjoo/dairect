import type { Metadata } from "next";
import Link from "next/link";
import { getInvoiceFormOptions } from "../actions";
import { NewInvoiceClient } from "./new-invoice-client";
import { ArrowLeft, FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "새 청구서",
};

interface PageProps {
  searchParams: Promise<{ estimateId?: string; projectId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const { estimateId, projectId } = await searchParams;
  const options = await getInvoiceFormOptions();

  return (
    <div className="py-10">
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        청구서 목록
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
        새 청구서 작성
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        수락된 견적서를 착수금/중도금/잔금 3분할로 자동 생성하거나 단건으로 직접 입력하세요.
      </p>

      {options.projects.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            프로젝트가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            청구서를 발행하려면 먼저 프로젝트를 만드세요.
          </p>
          <Link
            href="/dashboard/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            프로젝트로 이동
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <NewInvoiceClient
            projects={options.projects}
            estimates={options.estimates}
            initialEstimateId={estimateId}
            initialProjectId={projectId}
          />
        </div>
      )}
    </div>
  );
}
