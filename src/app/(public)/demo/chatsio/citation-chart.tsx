"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Epic Demo-Chatsio (2026-04-25): Citation Score Before/After 미니 차트.
 *
 * 가공된 예시 데이터 — 실제 값 아님 ("예시" 라벨 명시).
 * 8주간 Chatsio 적용 전후 비교: 도입 전 0~5점 → 도입 후 30~85점 우상향.
 */

const DATA = [
  { week: "W-7", before: 2, after: null },
  { week: "W-6", before: 3, after: null },
  { week: "W-5", before: 5, after: null },
  { week: "W-4", before: 4, after: null },
  { week: "W-3", before: null, after: 32 }, // Chatsio 도입 시점
  { week: "W-2", before: null, after: 51 },
  { week: "W-1", before: null, after: 68 },
  { week: "W-0", before: null, after: 85 },
];

export function CitationChart() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#141414" strokeOpacity={0.08} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#8B8680" }}
            axisLine={{ stroke: "#141414", strokeOpacity: 0.16 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#8B8680" }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            contentStyle={{
              background: "#FAF7F0",
              border: "1px solid rgba(20,20,20,0.12)",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              boxShadow: "4px 4px 0 0 rgba(20,20,20,0.08)",
            }}
            cursor={{ fill: "rgba(255,184,0,0.08)" }}
            formatter={(value) =>
              value === null || value === undefined
                ? ["—", ""]
                : [`${value}점`, "Citation"]
            }
          />
          {/* 도입 전 — 진한 ink, 낮은 점수 */}
          <Bar dataKey="before" fill="#8B8680" radius={0} />
          {/* 도입 후 — amber, 우상향 */}
          <Bar dataKey="after" fill="#FFB800" radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
