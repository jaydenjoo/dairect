"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { SCORE_DATA } from "./score-data";

/**
 * Epic Demo-Findably (2026-04-25): 4 dimension 점수 RadarChart.
 *
 * 가공된 예시 — "예시" 라벨 명시. SEO/GEO/콘텐츠/기술 4축 0-100 점수.
 * Studio Anthem 토큰: ink/amber/dust 만 사용. SCORE_DATA 는 별도 plain TS
 * 모듈에서 import — server/client 양쪽 호환.
 */

export function ScoreRadar() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={SCORE_DATA as Array<{dim: string; score: number; fullMark: number}>} margin={{ top: 8, right: 32, bottom: 8, left: 32 }}>
          <PolarGrid stroke="#141414" strokeOpacity={0.16} />
          <PolarAngleAxis
            dataKey="dim"
            tick={{
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fill: "#141414",
              letterSpacing: "0.08em",
            }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#FFB800"
            strokeWidth={2}
            fill="#FFB800"
            fillOpacity={0.18}
            dot={{ r: 4, fill: "#141414", strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
