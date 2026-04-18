// 포털 공통 포매터 — SSR/Hydration 안전 (UTC 기준 고정, 로캘 의존 금지).
//
// ⚠️ Timezone 정책: 모든 timestamp는 **UTC 기준**으로 표시.
// 근거: server/client 렌더 일치(hydration mismatch 회피) + Intl.DateTimeFormat 제거로 번들 축소.
// 트레이드오프: KST 심야(00:00~08:59 KST = 전날 15:00~23:59 UTC) 이벤트는 "전날"로 표시됨.
// 예) 2026-04-18 00:30 KST 완료 → completedAt UTC 2026-04-17T15:30Z → "2026.04.17 완료"로 노출.
// 허용 가능한 오차로 판단(고객 관점 "날짜 수준 표시"). 시/분 노출 생기면 timezone 옵션 필수.
//
// 향후 과제: formatDateInTz(iso, "Asia/Seoul") 옵션 추가 (Intl 사용 필요 — hydration 주의).

export function formatKRW(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  // Intl 로캘 의존 제거 — 숫자 3자리 콤마만 수동 처리.
  const s = Math.trunc(value).toString();
  const parts: string[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    parts.unshift(s.slice(Math.max(0, i - 3), i));
  }
  return `${parts.join(",")}원`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  // ISO date("YYYY-MM-DD") 또는 ISO timestamp 둘 다 수용. UTC 고정.
  // date 타입(YYYY-MM-DD)은 JS가 UTC 00:00으로 파싱 → 의미 보존.
  // timestamp는 UTC 기준 "달력일"로 표시 (상기 timezone 정책 참조).
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function formatPeriod(
  start: string | null,
  end: string | null,
): string {
  if (!start && !end) return "미정";
  if (start && end) return `${formatDate(start)} — ${formatDate(end)}`;
  if (end) return `~ ${formatDate(end)}`;
  return `${formatDate(start)} ~`;
}

// ─── 상태 라벨 ───

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  lead: "리드",
  consulting: "상담 중",
  estimate: "견적 단계",
  contract: "계약 단계",
  in_progress: "진행 중",
  review: "검수 중",
  completed: "완료",
  warranty: "하자보수 중",
  closed: "종료",
  cancelled: "취소",
  failed: "실패",
};

export function projectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABEL[status] ?? status;
}

// ─── 상태 tone ───
//
// 진행 중(active) / 완료(completed) / 실패·취소(danger) / 그 외(muted)로 분류.
// 컴포넌트에서 각 tone에 해당하는 Tailwind 색상 조합을 매핑.
export type ProjectStatusTone = "active" | "completed" | "danger" | "muted";

const PROJECT_STATUS_TONE: Record<string, ProjectStatusTone> = {
  in_progress: "active",
  review: "active",
  warranty: "active",
  completed: "completed",
  closed: "completed",
  cancelled: "danger",
  failed: "danger",
};

export function projectStatusTone(status: string): ProjectStatusTone {
  return PROJECT_STATUS_TONE[status] ?? "muted";
}

export const ESTIMATE_STATUS_LABEL: Record<string, string> = {
  sent: "발송됨",
  accepted: "승인됨",
  rejected: "반려됨",
  expired: "만료됨",
};

export function estimateStatusLabel(status: string): string {
  return ESTIMATE_STATUS_LABEL[status] ?? status;
}

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  pending: "발행 전",
  sent: "발송됨",
  paid: "입금 완료",
  overdue: "연체",
};

export function invoiceStatusLabel(status: string): string {
  return INVOICE_STATUS_LABEL[status] ?? status;
}

export const INVOICE_TYPE_LABEL: Record<string, string> = {
  advance: "착수금",
  interim: "중도금",
  final: "잔금",
};

export function invoiceTypeLabel(type: string): string {
  return INVOICE_TYPE_LABEL[type] ?? type;
}

// ─── 진행률 ───
//
// 마일스톤 완료 개수 기반. 마일스톤이 없으면 프로젝트 status로 보정 (completed=100%, 나머지 0%).
export function computeProgress(
  milestoneCount: number,
  completedCount: number,
  projectStatus: string,
): number {
  if (milestoneCount === 0) {
    return projectStatus === "completed" || projectStatus === "closed" ? 100 : 0;
  }
  // 레이스(마일스톤 삭제 + 완료 카운트 캐시)로 completedCount > milestoneCount 가능성 방어.
  return Math.min(100, Math.round((completedCount / milestoneCount) * 100));
}
