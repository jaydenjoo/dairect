import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로젝트 관리",
};

export default function DashboardProjectsPage() {
  return (
    <div className="px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
        프로젝트 관리
      </h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        고객 프로젝트를 단계별로 관리합니다
      </p>
      <div className="mt-12 rounded-xl bg-[#F9F9F7] p-12 text-center text-[#6B7280]">
        Phase 3에서 구현 예정
      </div>
    </div>
  );
}
