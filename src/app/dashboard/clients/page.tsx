import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "고객 관리",
};

export default function ClientsPage() {
  return (
    <div className="px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
        고객 관리
      </h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        고객 정보와 히스토리를 관리합니다
      </p>
      <div className="mt-12 rounded-xl bg-[#F9F9F7] p-12 text-center text-[#6B7280]">
        Phase 3에서 구현 예정
      </div>
    </div>
  );
}
