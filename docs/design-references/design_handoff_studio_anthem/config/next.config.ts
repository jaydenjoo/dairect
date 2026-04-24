// next.config.ts
// Next.js 16.2 — optimized for The Studio Anthem's imagery & fonts.

import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,

  // Modern image pipeline: AVIF primary, WebP fallback.
  images: {
    formats: ["image/avif", "image/webp"],
    // Tune to the sizes actually rendered on the landing:
    //   hero frames ≤ 640w @2x, case cards ≤ 1200w @2x
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes:  [96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30d
  },

  // Faster prod builds, smaller chunks.
  experimental: {
    optimizePackageImports: ["framer-motion", "geist"],
  },

  // Prevent indexing of variant routes (B/C/D are design spikes, not canonical).
  async headers() {
    return [
      {
        source: "/(dark|rhythm|auto)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },

  // Optional: redirect Korean audience to /ko if you add i18n later.
  // async redirects() { return []; },
};

export default config;
