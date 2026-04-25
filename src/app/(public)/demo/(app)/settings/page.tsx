import type { Metadata } from "next";
import { UnavailableSection } from "@/components/demo/unavailable-section";

export const metadata: Metadata = {
  title: "설정",
};

export default function DemoSettingsPage() {
  return (
    <UnavailableSection
      title="설정"
      description="사업자 정보, 견적서 기본값, 수금 비율, AI 호출 한도 등 프로젝트 전반의 기본값을 설정합니다. 실제 계정으로 로그인하면 모든 설정을 사용할 수 있어요."
    />
  );
}
