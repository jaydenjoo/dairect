import { notFound } from "next/navigation";

// ─── Task-S2b (2026-04-24 末 v3.2): 1차 잠금 ─────────────────────────────
// Dairect v3.2는 Jayden 1인 사용 모드. 회원가입 공개 차단 → /signup 직접 접근 시 404.
// Jayden 본인은 Supabase Studio에서 계정 직접 생성으로 우회.
//
// 2차(다른 프리랜서 서비스 제공) 진입 시 이 파일을 git history에서 복구:
//   `git log --all --full-history -- src/app/\(public\)/signup/page.tsx`
//   복구 대상 시점: 커밋 ee6d076 (Task-S2a 완료) 이전 버전.
// 관련 자산 보존: src/app/(public)/signup/signup-form.tsx, proxy.ts 리다이렉트 로직.
export default function SignupPage() {
  notFound();
}
