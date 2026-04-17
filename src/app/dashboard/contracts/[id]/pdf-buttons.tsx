"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Eye, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ContractPdf, type ContractPdfData } from "@/lib/pdf/contract-pdf";
import type { EstimatePdfCompany } from "@/lib/pdf/estimate-pdf";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        PDF 로딩 중...
      </div>
    ),
  },
);

interface Props {
  contract: ContractPdfData;
  company: EstimatePdfCompany | null;
}

function sanitizeFileName(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9_\-]/g, "_");
  return cleaned.length > 0 ? cleaned : "contract";
}

export function ContractPdfButtons({ contract, company }: Props) {
  const [open, setOpen] = useState(false);

  const pdfDocument = useMemo(
    () => <ContractPdf contract={contract} company={company} />,
    [contract, company],
  );

  const fileName = `${sanitizeFileName(contract.contractNumber)}.pdf`;

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
              PDF 미리보기
            </Button>
          }
        />
        <DialogContent
          className="flex h-[90vh] w-[95vw] max-w-5xl flex-col gap-0 p-0"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-3">
            <DialogTitle className="text-sm">
              계약서 미리보기 · {contract.contractNumber}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setOpen(false)}
            >
              닫기
            </Button>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden bg-muted">
            {open && (
              <PDFViewer
                style={{ width: "100%", height: "100%", border: "none" }}
                showToolbar={false}
              >
                {pdfDocument}
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PDFDownloadLink
        document={pdfDocument}
        fileName={fileName}
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        {({ loading, error }) => (
          <>
            <FileDown className="h-4 w-4" />
            <span className="ml-1">
              {loading
                ? "생성 중..."
                : error
                  ? "생성 실패"
                  : "PDF 다운로드"}
            </span>
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
