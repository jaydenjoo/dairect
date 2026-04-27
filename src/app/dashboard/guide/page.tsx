import type { Metadata } from "next";
import { GuideContent } from "@/components/dashboard/guide/guide-content";

export const metadata: Metadata = {
  title: "도움말",
  description: "대시보드 사용 설명서 — 워크플로우, 팁, 문제 해결",
};

export default function DashboardGuidePage() {
  return <GuideContent />;
}
