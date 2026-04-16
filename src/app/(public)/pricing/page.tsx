import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "요금제",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F7] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-[#111827]">
          합리적인 비용, 확실한 결과
        </h1>
        <p className="mt-4 text-lg text-[#6B7280]">
          아이디어의 크기에 맞는 최적의 플랜을 제안합니다
        </p>
        <div className="mt-16 rounded-2xl bg-white p-12 text-center text-[#6B7280] shadow-sm">
          Phase 2에서 구현 예정
        </div>
      </div>
    </main>
  );
}
