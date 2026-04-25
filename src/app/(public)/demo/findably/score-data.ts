/**
 * Epic Demo-Findably (2026-04-25): 4 dimension 점수 예시 데이터.
 *
 * server + client 양쪽에서 import. score-radar.tsx ("use client") 에 두면
 * minification 후 reduce 등 array 메서드 손실 → 별도 plain TS 모듈로 분리.
 */

export type ScoreDimension = {
  dim: string;
  score: number;
  fullMark: number;
};

export const SCORE_DATA: ReadonlyArray<ScoreDimension> = [
  { dim: "SEO", score: 67, fullMark: 100 },
  { dim: "GEO", score: 42, fullMark: 100 },
  { dim: "콘텐츠", score: 81, fullMark: 100 },
  { dim: "기술", score: 73, fullMark: 100 },
];
