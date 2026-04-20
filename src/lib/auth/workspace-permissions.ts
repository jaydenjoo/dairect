import type { WorkspaceRole } from "@/lib/auth/get-workspace-role";

// Phase 5 Task 5-1-7: 역할 기반 권한 체크 순수 함수 집합.
//
// PRD 섹션 10 C2 결정 (2026-04-20):
//   owner  → 결제 + 멤버관리 + 전체 write
//   admin  → 멤버관리 + 전체 write
//   member → 자기 생성 프로젝트 + 하위 엔티티(milestones/estimates/estimate_items/
//            contracts/invoices/activity_logs)만 write, 다른 멤버 데이터는 read only.
//            client_notes는 자기 작성만 write.
//
// 적용 방식 (Task 5-1-7 vs Epic 5-2):
//   - 현재 Task 5-1-7: helper 함수만 정의. 실 enforcement는 안 함.
//     single-user 시점은 모든 user가 default workspace의 owner → 실 차이 없음.
//   - Epic 5-2 완료 후: Server Action guard에서 각 write 경로에 call 추가.
//     예: canWriteProject(role, project.userId, currentUserId) 체크 실패 → 403 반환.
//
// 왜 별도 파일:
//   DB 조회 없는 순수 함수. 테스트 용이, import 경량.
//   role 조회(get-workspace-role.ts)와 권한 판단(이 파일)을 분리 → 단위 테스트 독립성.

/** 워크스페이스 결제 관리 권한 (Billing, Stripe customer) */
export function canManageBilling(role: WorkspaceRole | null): boolean {
  return role === "owner";
}

/** 멤버 초대/제거/역할 변경 권한 */
export function canManageMembers(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin";
}

/** 워크스페이스 내 모든 엔티티 write 권한 (owner/admin 전용) */
export function canWriteAnyEntity(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin";
}

/**
 * "자기 소유" 엔티티 write 권한.
 * member는 자기가 생성한 엔티티만, owner/admin은 모든 엔티티.
 *
 * @param entityCreatorUserId 엔티티의 userId 컬럼 값 (생성자)
 * @param currentUserId 현재 요청자 ID
 */
export function canWriteOwnedEntity(
  role: WorkspaceRole | null,
  entityCreatorUserId: string,
  currentUserId: string,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") return entityCreatorUserId === currentUserId;
  return false;
}

/**
 * member가 프로젝트에 write 가능한지 — "자기 생성 project"만 허용.
 * 하위 엔티티(milestones/estimates/contracts 등)도 동일 기준 (프로젝트 생성자만).
 * owner/admin은 항상 true.
 */
export function canWriteProject(
  role: WorkspaceRole | null,
  projectCreatorUserId: string,
  currentUserId: string,
): boolean {
  return canWriteOwnedEntity(role, projectCreatorUserId, currentUserId);
}

/**
 * client_notes 작성 권한 — "자기 작성 메모"만 member 허용.
 * owner/admin은 항상 true.
 */
export function canWriteClientNote(
  role: WorkspaceRole | null,
  noteCreatorUserId: string,
  currentUserId: string,
): boolean {
  return canWriteOwnedEntity(role, noteCreatorUserId, currentUserId);
}
