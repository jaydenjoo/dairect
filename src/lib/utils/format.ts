/**
 * 금액 포맷 유틸 — Dairect 공통
 *
 * KPI 카드·프로젝트 테이블·차트 축 3종에서 로컬 formatKRW가 제각각이라 Task 4-1 M4 리뷰에서
 * 통합 권고됨. 호출처는 목적에 맞는 variant를 선택.
 */

/**
 * KPI 카드/대시보드 홈 스타일: "₩0" · "₩1,200만" · "₩1.2억".
 * null/undefined는 "—"로 fallback.
 */
export function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  if (amount === 0) return "₩0";
  if (Math.abs(amount) >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
  return `₩${(amount / 10000).toLocaleString("ko-KR")}만`;
}

/**
 * 테이블 셀용: "0원" · "1,200만원" · "1.2억원". 통화 기호 없음.
 * null/undefined는 "—"로 fallback.
 */
export function formatKRWLong(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  if (amount === 0) return "0원";
  if (Math.abs(amount) >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  return `${(amount / 10000).toLocaleString("ko-KR")}만원`;
}

/**
 * 차트 축 레이블용: "0" · "1,200만" · "1.2억". 기호/단위 최소화.
 */
export function formatKRWShort(amount: number): string {
  if (amount === 0) return "0";
  if (Math.abs(amount) >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억`;
  return `${(amount / 10000).toLocaleString("ko-KR")}만`;
}
