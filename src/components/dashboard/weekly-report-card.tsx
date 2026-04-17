"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import type { PDFDownloadLink as PDFDownloadLinkType } from "@react-pdf/renderer";
import { Sparkles, RefreshCw, FileDown, AlertTriangle, Target, AlertCircle } from "lucide-react";

// PDFDownloadLink는 web-only API. SSR에서 실행되면 "react-pdf web build" 에러.
// dynamic + ssr:false로 클라이언트 마운트 후에만 로드. children render prop 시그니처 유지를 위해 타입 캐스트.
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false },
) as unknown as typeof PDFDownloadLinkType;
import { regenerateWeeklyReportAction } from "@/lib/ai/report-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WeeklyReportPdf,
  type ReportPdfCompany,
  type ReportPdfData,
} from "@/lib/pdf/weekly-report-pdf";
import type { ReportContent } from "@/lib/validation/report";

type MilestoneProgress = {
  completed: number;
  total: number;
  percent: number | null;
};

type Props = {
  projectId: string;
  projectName: string;
  clientName: string | null;
  milestoneProgress: MilestoneProgress;
  company: ReportPdfCompany | null;
  initialContent: ReportContent | null;
  initialGeneratedAt: string | null; // ISO
  initialWeekStartDate: string | null;
  initialWeekEndDate: string | null;
};

// 파일명 sanitize — 기존 estimate/contract/invoice PDF 버튼과 동일 정책
function sanitizeFileName(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9_\-]/g, "_");
  return cleaned.length > 0 ? cleaned : "report";
}

function formatGeneratedAt(iso: string): string {
  // KST 고정 수동 포맷 (Task 3-2 Hydration 교훈 — Intl 금지)
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hour24 = kst.getUTCHours();
  const minute = kst.getUTCMinutes();
  const ampm = hour24 >= 12 ? "오후" : "오전";
  const hour12 = hour24 % 12 || 12;
  return `${month}월 ${day}일 ${ampm} ${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// KST 이번 주 일요일 date 계산 (렌더시 PDF 헤더에 표시). weekStartDate(월요일) + 6일.
function computeWeekEnd(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function WeeklyReportCard({
  projectId,
  projectName,
  clientName,
  milestoneProgress,
  company,
  initialContent,
  initialGeneratedAt,
  initialWeekStartDate,
  initialWeekEndDate,
}: Props) {
  const [content, setContent] = useState<ReportContent | null>(initialContent);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [weekStartDate, setWeekStartDate] = useState<string | null>(initialWeekStartDate);
  const [weekEndDate, setWeekEndDate] = useState<string | null>(initialWeekEndDate);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await regenerateWeeklyReportAction(projectId);
      if (result.success) {
        setContent(result.content);
        setGeneratedAt(result.aiGeneratedAt);
        setWeekStartDate(result.weekStartDate);
        setWeekEndDate(computeWeekEnd(result.weekStartDate));
      } else {
        setError(result.error);
      }
    });
  };

  // PDF React element reference 안정화.
  // milestoneProgress는 부모 서버 컴포넌트에서 매 렌더 새 객체로 전달될 수 있어
  // dep 배열은 primitive로 분해 (리뷰 H1) — 불필요한 PDF/blob 재생성 방지.
  const progressCompleted = milestoneProgress.completed;
  const progressTotal = milestoneProgress.total;
  const progressPercent = milestoneProgress.percent;
  const pdfDocument = useMemo(() => {
    if (!content || !generatedAt || !weekStartDate || !weekEndDate) return null;
    const data: ReportPdfData = {
      projectName,
      clientName,
      weekStartDate,
      weekEndDate,
      milestoneProgress: {
        completed: progressCompleted,
        total: progressTotal,
        percent: progressPercent,
      },
      generatedAt,
      content,
    };
    return <WeeklyReportPdf report={data} company={company} />;
  }, [
    content,
    generatedAt,
    weekStartDate,
    weekEndDate,
    projectName,
    clientName,
    progressCompleted,
    progressTotal,
    progressPercent,
    company,
  ]);

  const fileName =
    content && weekStartDate
      ? `weekly-report_${sanitizeFileName(projectName)}_${weekStartDate}.pdf`
      : "weekly-report.pdf";

  return (
    <section
      className="rounded-xl bg-card p-6 shadow-ambient"
      aria-label="AI 주간 보고서"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">AI 주간 보고서</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {generatedAt && weekStartDate ? (
                <>
                  {weekStartDate} 주차 · {formatGeneratedAt(generatedAt)} 생성
                </>
              ) : (
                <>고객 발송용 주간 진행 보고서 초안을 AI로 생성합니다</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pdfDocument && (
            <PDFDownloadLink
              document={pdfDocument}
              fileName={fileName}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              {({ loading }) => (
                <>
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="ml-1">{loading ? "생성 중..." : "PDF 다운로드"}</span>
                </>
              )}
            </PDFDownloadLink>
          )}
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
            {content ? "새로고침" : "생성하기"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isPending && !content && (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          AI가 이번 주 진행 사항을 정리하고 있습니다...
        </div>
      )}

      {!content && !isPending && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
            <Target className="h-6 w-6 text-primary/40" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">이번 주 보고서가 아직 없습니다</p>
            <p className="mt-1 text-xs text-muted-foreground">
              [생성하기]를 눌러 이번 주 완료·다음 주 계획·이슈를 AI가 정리하도록 하세요
            </p>
          </div>
        </div>
      )}

      {content && (
        <div className="mt-5 space-y-5">
          {/* 이번 주 완료 */}
          <ReportSection title="이번 주 완료">
            {content.completedThisWeek.length === 0 ? (
              <EmptyLine text="이번 주 완료된 항목이 없습니다" />
            ) : (
              <ul className="space-y-2">
                {content.completedThisWeek.map((item, idx) => (
                  <BulletItem
                    key={`c-${idx}`}
                    title={item.title}
                    description={item.description}
                    tone="primary"
                  />
                ))}
              </ul>
            )}
          </ReportSection>

          {/* 다음 주 계획 */}
          <ReportSection title="다음 주 계획">
            {content.plannedNextWeek.length === 0 ? (
              <EmptyLine text="다음 주 예정된 항목이 없습니다" />
            ) : (
              <ul className="space-y-2">
                {content.plannedNextWeek.map((item, idx) => (
                  <BulletItem
                    key={`p-${idx}`}
                    title={item.title}
                    description={item.description}
                    tone="primary"
                  />
                ))}
              </ul>
            )}
          </ReportSection>

          {/* 이슈/리스크 (있을 때만) */}
          {content.issuesRisks.length > 0 && (
            <ReportSection title="이슈 및 리스크">
              <ul className="space-y-2">
                {content.issuesRisks.map((item, idx) => (
                  <li
                    key={`i-${idx}`}
                    className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}

          {/* 요약 */}
          <div className="rounded-lg bg-primary/[0.03] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">요약</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground whitespace-pre-line">
              {content.summary}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── 내부 서브 컴포넌트 ───

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function BulletItem({
  title,
  description,
  tone,
}: {
  title: string;
  description?: string;
  tone: "primary" | "muted";
}) {
  const dotClass = tone === "primary" ? "bg-primary/70" : "bg-muted-foreground/40";
  return (
    <li className="flex items-start gap-3 rounded-lg bg-muted/20 px-4 py-3">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
    </li>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg bg-muted/10 px-4 py-3 text-xs italic text-muted-foreground">
      {text}
    </p>
  );
}
