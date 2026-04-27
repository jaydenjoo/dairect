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
  // Phase 5.5 보안 강화: URL path/query에 비밀 토큰이 포함된 경로에 Referrer-Policy: no-referrer.
  // 사용자가 해당 페이지 내 외부 링크(footer/임베드 이미지 등)로 이동 시 Referer 헤더에
  // token URL이 실려 외부 서버 로그에 잔류하는 leak 경로 차단.
  // 응답 헤더 방식 채택(메타 태그 대비 HTML 변조에 강건).
  //
  // 대상:
  //  - /invite/[token]  : 멤버 초대 수락 (URL path token)
  //  - /portal/[token]  : 고객 포털 공유 링크 (URL path token)
  //  - /auth/...        : OAuth callback의 ?code=... query 잠시 노출 — 5xx 경로에서 사용자가
  //                       머무르면 외부 자원 클릭으로 code leak 위험 (MEDIUM-1 리뷰 반영).
  //
  // 2026-04-27 Findably 진단 대응: 글로벌 보안 헤더 4종 추가 (Mozilla Observatory C→A 등급 목표).
  // CSP(Content-Security-Policy)는 Next.js inline script + GA + dari widget 호환성 검증 필요해
  // Phase 1.5 별도 Task로 분리 (Report-Only로 시작 권장).
  async headers() {
    // 2026-04-27 Phase 1.5: CSP Report-Only 모드 도입.
    //   - "Report-Only" → 위반을 콘솔/리포트에만 기록, 실제 차단 X (사이트 안 깨짐)
    //   - 1~2주 모니터링 후 실 위반 0이면 enforced로 전환 (헤더 키 → "Content-Security-Policy")
    //   - report-uri/report-to는 별도 인프라(Sentry/Datadog) 필요해 일단 콘솔만
    //
    // 'unsafe-inline' + 'unsafe-eval': Next.js RSC payload + GA inline script 호환.
    // 추후 nonce 기반 strict-CSP 전환은 별도 Task (script-src에 'nonce-XXX' 주입).
    //
    // 외부 도메인 매핑:
    //   - googletagmanager.com (GA gtag.js)         → script-src
    //   - google-analytics.com (GA pixel/collect)    → connect-src
    //   - *.vercel.app (dari-theta.vercel.app widget) → script-src + connect-src
    //   - *.supabase.co (REST + Realtime)            → connect-src + wss:
    //   - vercel.live (preview comments)             → script-src + connect-src
    //   - vitals.vercel-insights.com (Speed Insights) → connect-src
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.vercel.app https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.supabase.co wss://*.supabase.co https://*.vercel.app wss://*.vercel.app https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    const globalSecurityHeaders = [
      // Clickjacking 방지: 외부 사이트가 dairect.kr를 iframe으로 임베드 차단.
      { key: "X-Frame-Options", value: "DENY" },
      // MIME-sniffing 방지: 응답 Content-Type 강제, XSS via mismatched type 차단.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Referrer 정책: same-origin은 full URL, cross-origin은 origin만 송신.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Permissions Policy: 사용 안 하는 강력 권한 사전 차단 (camera/microphone/geolocation/payment).
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
      },
      // CSP Report-Only — 위반 발견하되 차단 안 함. enforced 전환은 Phase 1.5 모니터링 후.
      { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
    ];

    return [
      // 글로벌 — 모든 라우트에 4종 보안 헤더 적용.
      {
        source: "/:path*",
        headers: globalSecurityHeaders,
      },
      // 토큰 leak 방어 — 글로벌 strict-origin-when-cross-origin을 no-referrer로 더 엄격하게 override.
      {
        source: "/invite/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/portal/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/auth/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default withSerwist(nextConfig);
