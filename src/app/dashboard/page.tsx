import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
};

const kpiCards = [
  { label: "진행 중 프로젝트", value: "—" },
  { label: "이번 달 견적", value: "—" },
  { label: "미서명 계약서", value: "—" },
  { label: "미수금", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="px-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
        대시보드
      </h1>

      <div className="mt-8 grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-[#F9F9F7] p-6"
          >
            <p className="text-sm text-[#6B7280]">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#111827]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-[#F9F9F7] p-12 text-center text-[#6B7280]">
        Phase 4에서 구현 예정
      </div>
    </div>
  );
}
