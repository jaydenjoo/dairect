// Phase 5.5 Task 5-5-2: 멤버 수 상한 게이트 + 향후 plan 단일 소스 후보.
//
// 베타 한도 (PRD-phase5.md:154-162 "지인 베타 피드백 후 Phase 5.5 착수 직전 재확정"):
//   - 베타 중에는 협업 사용성 피드백 확보 위해 PRD의 1/1/무제한보다 완화된 3/5/무제한 적용.
//   - Phase 5.5 빌링 진입 시 PRD 정의(1/1/무제한)로 회귀 — 이 파일 한 줄 변경으로 충분.
//
// 게이트 적용 시점 (INSERT-time + ACCEPT-time enforcement):
//   - createInvitationAction: members + pending + 1 > limit이면 거부 (발송 게이트)
//   - acceptInvitationAction: members + 1 > limit이면 거부 (수락 게이트, plan downgrade 시 우회 방어)
//   - 두 게이트 모두 advisory lock + workspace_settings.plan SELECT 패턴 일치.
//
// 처리 안 함 (Phase 5.5 후속 ToDo):
//   - "Existing-over-limit" 정책: 이미 한도 초과 상태인 워크스페이스의 자동 정리/강제 다운그레이드.
//     예) plan을 pro(5명)에서 free(3명)으로 downgrade했을 때 기존 5명을 어떻게 줄일지.
//     billing webhook에서 다룰 정책 결정 사항 — 이번 게이트는 신규 진입만 차단.
//
// 카운트 정의 (createInvitationAction과 일치):
//   - 사용 중 멤버 수 = workspace_members 전체 (Owner 포함)
//   - pending 초대 수 = workspace_invitations WHERE acceptedAt IS NULL AND revokedAt IS NULL AND expiresAt > NOW()
//   - 합산이 한도와 같거나 크면 (used >= limit) 신규 초대 INSERT 거부.
//
// 무제한 표현:
//   - Number.POSITIVE_INFINITY. JS 비교에서 자연스럽게 통과 (`5 >= Infinity` → false).
//   - JSON 직렬화 시 null이 되므로 client prop 전달 시 별도 처리 필요 (page.tsx에서 isFinite 체크 후 number|null로 변환).
//
// Phase 5.5 후속 (별도 Task):
//   - PLAN_AI_DAILY_LIMITS도 이 파일로 이관 → ai-estimate.ts는 검증 스키마만 담당
//   - workspace_usage 테이블 (프로젝트/고객/견적 count) 도입 시 동일 패턴으로 PLAN_MAX_PROJECTS 등 추가

import { workspacePlans, type WorkspacePlan } from "@/lib/validation/ai-estimate";

export { workspacePlans };
export type { WorkspacePlan };

export const PLAN_MAX_MEMBERS: Record<WorkspacePlan, number> = {
  free: 3,
  pro: 5,
  team: Number.POSITIVE_INFINITY,
};

// DB row의 plan 값이 null/undefined/미지정이면 free로 귀속 (방어적 fallback).
// workspace_settings는 default 'free' NOT NULL이라 정상 경로에서 null 불가 — 타입 안전 fallback.
export function getMaxMembers(plan: string | null | undefined): number {
  if (plan && (workspacePlans as readonly string[]).includes(plan)) {
    return PLAN_MAX_MEMBERS[plan as WorkspacePlan];
  }
  return PLAN_MAX_MEMBERS.free;
}

// UI 표시용 라벨.
export const planLabels: Record<WorkspacePlan, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

export function getPlanLabel(plan: string | null | undefined): string {
  if (plan && (workspacePlans as readonly string[]).includes(plan)) {
    return planLabels[plan as WorkspacePlan];
  }
  return planLabels.free;
}

// 한도 도달 시 안내할 다음 단계 plan 추천. server/client 모두 사용.
//   - free → Pro (가장 가까운 단계)
//   - pro → Team (멀티 멤버 본격 활성화)
//   - team → Team (이미 무제한, fallback)
export function suggestUpgradeTarget(plan: string | null | undefined): string {
  if (plan === "free") return planLabels.pro;
  if (plan === "pro") return planLabels.team;
  return planLabels.team;
}
