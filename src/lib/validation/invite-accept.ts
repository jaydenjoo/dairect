import { z } from "zod";

// Phase 5 Task 5-2-5: 초대 수락 Server Action 입력 검증.
// token은 crypto.randomUUID()로 생성된 UUID (5-2-4 createInvitationAction).

export const acceptInvitationInputSchema = z
  .object({
    token: z.string().uuid("잘못된 초대 링크입니다"),
  })
  .strict();

export type AcceptInvitationInput = z.infer<typeof acceptInvitationInputSchema>;
