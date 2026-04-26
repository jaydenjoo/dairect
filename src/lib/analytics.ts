// GA4 이벤트 트래킹 헬퍼.
// NEXT_PUBLIC_GA_MEASUREMENT_ID 미설정 시 window.gtag 도 없으므로 no-op (graceful degrade).
// 사용 예: track("persona_card_click", "ai-barrier")

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export function track(event: string, label?: string): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const params: Record<string, unknown> = {};
  if (label) params.label = label;

  window.gtag("event", event, params);
}
