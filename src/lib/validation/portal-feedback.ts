// Task 5-2-2e: "use server" 파일에서 export type 금지 규칙(10패턴 1) 준수를 위해
// lib/portal/feedback-actions.ts에서 분리 이관. client(portal-feedback-form.tsx)가 import.
// PortalFeedbackSubmission은 actions 내부 payload 타입으로만 쓰이므로 로컬 type으로 남겨둠.

export type PortalFeedbackActionResult =
  | { success: true }
  | { success: false; error: string };
