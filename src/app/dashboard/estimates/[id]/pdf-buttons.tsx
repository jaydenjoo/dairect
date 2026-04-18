"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PDFDownloadLink as PDFDownloadLinkType } from "@react-pdf/renderer";
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
import {
  EstimatePdf,
  type EstimatePdfData,
  type EstimatePdfCompany,
} from "@/lib/pdf/estimate-pdf";

// PDFViewer는 브라우저 전용 (iframe + blob URL) → dynamic import
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

// PDFDownloadLink도 web-only (blob 생성) → dynamic + ssr:false.
// children render prop 시그니처 유지를 위해 타입 캐스트 (Task 3-3 패턴).
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false },
) as unknown as typeof PDFDownloadLinkType;

interface Props {
  estimate: EstimatePdfData;
  company: EstimatePdfCompany | null;
}

// 파일명 sanitize — 영문/숫자/하이픈/언더스코어만 허용
function sanitizeFileName(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9_\-]/g, "_");
  return cleaned.length > 0 ? cleaned : "estimate";
}

export function PdfButtons({ estimate, company }: Props) {
  const [open, setOpen] = useState(false);

  // estimate/company 변경 시에만 PDF React element 재생성 (재렌더 시 불필요한 재렌더링 방지)
  const pdfDocument = useMemo(
    () => <EstimatePdf estimate={estimate} company={company} />,
    [estimate, company],
  );

  const fileName = `${sanitizeFileName(estimate.estimateNumber)}.pdf`;

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
              견적서 미리보기 · {estimate.estimateNumber}
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

      {/* PDFDownloadLink는 <a> 태그 → Button 중첩 금지. buttonVariants로 스타일만 적용 */}
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
