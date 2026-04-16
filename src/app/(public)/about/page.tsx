import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F7] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-[#111827]">
          Jayden
        </h1>
        <p className="mt-4 text-lg text-[#6B7280]">
          Vibe Architect · dairect 대표
        </p>
        <div className="mt-16 rounded-2xl bg-white p-12 text-center text-[#6B7280] shadow-sm">
          Phase 2에서 구현 예정
        </div>
      </div>
    </main>
  );
}
