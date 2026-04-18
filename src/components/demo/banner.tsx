import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * /demo 전용 상단 배너. "샘플 데이터" 안내 + 로그인 CTA.
 *
 * DemoHeader 위, 메인 컨텐츠 위에 배치. 전체 폭 점유 + primary/10 배경으로
 * 시각적으로 명확하게 "여기는 데모다" 시그널.
 */
export function DemoBanner() {
  return (
    <div className="bg-primary/10 px-6 py-3 text-sm md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-semibold">데모 모드</span>
          <span className="text-primary/40" aria-hidden="true">
            ·
          </span>
          <span className="text-primary/80">
            샘플 데이터를 사용한 체험용 화면입니다
          </span>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          실제 계정으로 로그인
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
