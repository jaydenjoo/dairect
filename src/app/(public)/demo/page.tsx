import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "데모 모드",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F7] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-xl bg-[#4F46E5]/10 px-6 py-4 text-sm font-medium text-[#4F46E5]">
          샘플 데이터입니다. 실제 사용 → 로그인
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#111827]">
          데모 모드
        </h1>
        <p className="mt-4 text-lg text-[#6B7280]">
          실제 기능을 미리 체험해보세요
        </p>
        <div className="mt-16 rounded-2xl bg-white p-12 text-center text-[#6B7280] shadow-sm">
          Phase 3에서 구현 예정
        </div>
      </div>
    </main>
  );
}
