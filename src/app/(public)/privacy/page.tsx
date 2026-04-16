import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F7] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
          개인정보처리방침
        </h1>
        <p className="mt-4 text-sm text-[#6B7280]">
          최종 수정일: 2026년 4월 16일
        </p>
        <div className="mt-12 rounded-2xl bg-white p-12 text-center text-[#6B7280] shadow-sm">
          개인정보처리방침은 Phase 1 완료 후 추가 예정입니다
        </div>
      </div>
    </main>
  );
}
