import { z } from "zod";

// Phase 5 Task 5-2-4: workspace 초대 입력 검증 + role 라벨.
//
// role 집합:
//   - owner 초대 불가 (PRD 섹션 10 C2: owner는 workspace 생성자 1명 고정, 초대 경로 없음)
//   - 허용 role: 'admin' | 'member'
//   - DB CHECK는 workspace_invitations_role_check로 ('owner'|'admin'|'member') 3종 허용하지만
//     애플리케이션 레이어에서 owner 초대 경로를 막아 정책 충돌 방지.
//
// email 정규화: trim + toLowerCase로 중복 초대 idx 매칭 정확도 ↑ (DB는 case-sensitive).

export const inviteRoleSchema = z.enum(["admin", "member"]);
export type InviteRole = z.infer<typeof inviteRoleSchema>;

export const inviteRoleLabels: Record<InviteRole, string> = {
  admin: "관리자",
  member: "멤버",
};

export const createInvitationInputSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("올바른 이메일 형식이 아닙니다")
      .max(254, "이메일이 너무 깁니다"),
    role: inviteRoleSchema,
  })
  .strict();

export type CreateInvitationInput = z.infer<typeof createInvitationInputSchema>;

export const invitationIdSchema = z.string().uuid("잘못된 초대 ID입니다");
