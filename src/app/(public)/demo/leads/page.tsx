import type { Metadata } from "next";
import { UnavailableSection } from "@/components/demo/unavailable-section";

export const metadata: Metadata = {
  title: "리드",
};

export default function DemoLeadsPage() {
  return (
    <UnavailableSection
      title="리드"
      description="랜딩 문의에서 자동 생성되는 리드를 파이프라인으로 관리하고, 계약으로 전환하거나 실패 사유를 기록합니다. 실제 계정으로 로그인하면 전체 흐름을 사용할 수 있어요."
    />
  );
}
