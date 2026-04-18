import type { Metadata } from "next";
import { UnavailableSection } from "@/components/demo/unavailable-section";

export const metadata: Metadata = {
  title: "계약서",
};

export default function DemoContractsPage() {
  return (
    <UnavailableSection
      title="계약서"
      description="견적서에서 계약서를 자동 생성하고, 하자보수 기간 · IP 귀속 · 특약 · 책임 한도를 포함한 PDF를 발송합니다. 실제 계정으로 로그인하면 계약 전체 사이클을 사용할 수 있어요."
    />
  );
}
