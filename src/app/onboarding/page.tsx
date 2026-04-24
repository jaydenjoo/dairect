import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// ─── Task-S2b (2026-04-24 末 v3.2): 1차 잠금 ───────────────────────────────
// Dairect v3.2는 Jayden 1인 사용 모드. 신규 회원 온보딩 플로우 차단 → 직접 접근 시 404.
// Jayden은 이미 default workspace + onboardedAt 존재 → 실질 접근 경로 없음.
//
// 2차(다른 프리랜서 서비스 제공) 진입 시 이 파일을 git history에서 복구:
//   `git log --all --full-history -- src/app/onboarding/page.tsx`
//   복구 대상 시점: 커밋 ee6d076 (Task-S2a 완료) 이전 버전.
// 관련 자산 보존: onboarding-form.tsx, ensureDefaultWorkspace 함수, users upsert 로직.
export default function OnboardingPage() {
  notFound();
}
