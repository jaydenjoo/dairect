import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "dairect — 머릿속 아이디어를 진짜로 만들어드립니다";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CANVAS = "#F5F1E8";
const INK = "#141414";
const AMBER = "#FFB800";
const DUST = "#5C5648";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: CANVAS,
          padding: "80px 80px 64px 104px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 24,
            height: "100%",
            background: AMBER,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: DUST,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 56,
          }}
        >
          dairect · Director of AI, working Direct
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 800,
            color: INK,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginBottom: 36,
          }}
        >
          <span>머릿속 아이디어를</span>
          <span>진짜로 만들어드립니다.</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: DUST,
            lineHeight: 1.4,
            marginBottom: "auto",
            maxWidth: 880,
          }}
        >
          개발을 모르셔도, AI를 못 다루셔도 괜찮습니다.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 26,
            color: INK,
          }}
        >
          <div
            style={{
              display: "flex",
              background: AMBER,
              color: INK,
              padding: "10px 22px",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            3주
          </div>
          <div style={{ display: "flex" }}>
            일반 개발사 3개월 → dairect 3주
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
