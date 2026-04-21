// Task 5-2-2e: "use server" 파일에서 export type 금지 규칙(10패턴 1) 준수를 위해
// feedback-actions.ts에서 분리 이관. client(project-feedback-section.tsx) + server component
// (projects/[id]/page.tsx)에서 동시 import.

export type ProjectFeedbackItem = {
  id: string;
  message: string;
  clientIp: string | null;
  userAgent: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type ProjectFeedbackSummary = {
  items: ProjectFeedbackItem[];
  total: number;
  unread: number;
};
