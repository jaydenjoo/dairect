/**
 * AI 주간 보고서 — 데모 버전 (읽기 전용 안내 카드)
 *
 * 실제 `WeeklyReportCard`는 Claude API 호출 + PDF 다운로드를 포함하므로 데모에선 사용 불가.
 * 로그인 후 기능 안내 + CTA 버튼만 표시.
 */

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function WeeklyReportCta() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-ambient">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            AI 주간 보고서
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            프로젝트 진행 상황을 Claude가 고객 발송용 PDF로 자동 작성합니다.
            완료 항목 · 다음 주 계획 · 이슈/리스크 · 요약 섹션이 자동 생성됩니다.
          </p>
          <Link
            href="/login"
            className="mt-3 inline-flex items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            로그인하고 사용하기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
