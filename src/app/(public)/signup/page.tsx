import { Suspense } from "react";
import { SignupForm } from "./signup-form";

// Phase 5 Epic 5-2 Task 5-2-0: 회원가입 페이지.
//
// Supabase email+password 회원가입 + email confirmation(enable_confirmations=true인 production)
// 또는 즉시 세션 활성(enable_confirmations=false인 local). 양쪽 모두 대응.
//
// 가입 성공 → /dashboard redirect → dashboard/layout.tsx가 default workspace 자동 생성(Task 5-2-7).
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
