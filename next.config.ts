import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // 민감 경로 HTML이 precache 매니페스트에 주입되지 않도록 원천 제외.
  // 현재는 dynamic 라우트라 자동 제외되나, 향후 누군가 force-static/ISR로 바꾸면
  // cross-tenant 응답이 SW 캐시에 박힐 수 있음 — 예방적 방어.
  exclude: [
    /\/dashboard\//,
    /\/portal\//,
    // Phase 5 Task 5-2-5: /invite/[token] — URL path에 토큰 포함. precache 주입 차단.
    /\/invite\//,
    /\/api\//,
    /\/auth\//,
  ],
});

const nextConfig: NextConfig = {
  transpilePackages: ["@react-pdf/renderer"],
  // dev/build 번들러 비대칭(dev=Turbopack, build=webpack) silence.
  // 빈 turbopack config로 dev 시 Turbopack을 명시 — withSerwistInit의 webpack config는
  // build(`next build --webpack`)에서만 사용됨을 Next.js에 알림.
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
