// Task 5-2-2e: "use server" 파일에서 export type 금지 규칙(10패턴 1) 준수를 위해
// portal-actions.ts에서 분리 이관. client(portal-link-card.tsx)에서 import.
// IssuePortalTokenResult / RevokePortalTokenResult는 actions 내부에서만 반환되고
// client가 타입 import 하지 않으므로 각 actions 파일의 로컬 type으로 남겨둠.

export type ActivePortalTokenSummary = {
  token: string;
  issuedAt: string;
  expiresAt: string;
  lastAccessedAt: string | null;
};
