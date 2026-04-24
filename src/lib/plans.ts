// Dairect v3.2 (2026-04-24 末 Task-S2a): 단일 고정 한도 — 남용 방어용 하드 리밋.
//
// 역사적 맥락:
//   - 원래 Phase 5.5 billing에서 Free/Pro/Team 플랜별 차등 한도(3/5/∞) 운영 예정
//   - 2026-04-24 Jayden 결정으로 SaaS 구독 모델 취소 → 플랜 차등 개념 폐기
//   - 이 파일은 "전원 동일 규칙" 단일 상수로 축소됨
//
// 현재 의미:
//   - MAX_MEMBERS = workspace 1개당 멤버 수 상한
//   - 1차(Jayden 1인 사용)에서는 실질 닿지 않는 값 (본인 + 하청 몇 명)
//   - 2차(다른 프리랜서 서비스 제공) 진입 시 이 값 그대로 적용 or 재검토
//
// 게이트 적용 시점 (INSERT-time + ACCEPT-time enforcement):
//   - createInvitationAction: members + pending + 1 > limit이면 거부 (발송 게이트)
//   - acceptInvitationAction: members + 1 > limit이면 거부 (수락 게이트)
//   - 두 게이트 모두 advisory lock 패턴 유지 (race 방어).

export const MAX_MEMBERS = 10;
