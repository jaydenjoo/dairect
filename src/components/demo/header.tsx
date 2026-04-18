/**
 * /demo 전용 헤더. 대시보드 `Header`와 레이아웃은 동일하지만 Supabase 호출 없이
 * "샘플 사용자" 고정 표시. LogoutButton 자리에는 아무것도 렌더하지 않음 (로그인 CTA는
 * `DemoBanner`에서 제공).
 */
export function DemoHeader() {
  return (
    <header className="flex h-16 items-center justify-between px-8">
      <div>{/* Page title rendered by each page */}</div>

      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          aria-hidden="true"
        >
          샘
        </div>
        <span className="hidden text-sm font-medium text-foreground/80 sm:block">
          샘플 사용자
        </span>
      </div>
    </header>
  );
}
