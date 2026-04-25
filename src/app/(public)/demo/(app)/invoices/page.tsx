import type { Metadata } from "next";
import { UnavailableSection } from "@/components/demo/unavailable-section";

export const metadata: Metadata = {
  title: "정산",
};

export default function DemoInvoicesPage() {
  return (
    <UnavailableSection
      title="정산"
      description="견적서 기반 3분할 청구서 자동 생성, 입금 확인, 세금계산서 발행 체크까지 한 곳에서 관리합니다. 실제 계정으로 로그인하면 전체 정산 흐름을 사용할 수 있어요."
    />
  );
}
