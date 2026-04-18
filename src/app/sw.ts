/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

// 인증/민감 라우트는 전부 NetworkOnly — SW 캐시에 응답 절대 저장 금지.
// matcher의 method 기본값은 "GET". POST/PUT/DELETE는 SW 자체 우회되므로 추가 매처 불필요.
// destination 조건 없이 매칭 (HTML document + RSC payload + prefetch 모두 포함).
// Phase 4 portal 보안 + dashboard cross-tenant 노출 방지 일관 유지.
const customRuntimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/portal/"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/auth/"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/dashboard"),
    handler: new NetworkOnly(),
  },
  ...defaultCache,
];

// Offline fallback: navigation 요청이 실패하면 프리캐시된 /offline 페이지를 반환.
// /offline은 Next.js 라우트라 __SW_MANIFEST에 자동 포함됨.
// 민감 경로(/dashboard, /portal, /api, /auth)는 fallback 대상에서 제외 —
// 세션 만료·403 같은 인증 실패가 오프라인인 것처럼 보이면 사용자 혼란 + 주소창 잔류로
// 민감 경로(특히 /portal/[token])가 히스토리에 박힐 수 있음. 이 경로들은 브라우저
// 기본 에러로 돌리거나 서버 측 리다이렉트에 의존.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // skipWaiting + clientsClaim 조합: 업데이트 즉시 활성화 + 기존 탭도 새 SW가 제어.
  // 업데이트 직후 오프라인 전환 시에도 새 fallback 로직이 일관되게 동작하도록.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customRuntimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          if (request.mode !== "navigate") return false;
          const url = new URL(request.url);
          if (url.pathname.startsWith("/dashboard")) return false;
          if (url.pathname.startsWith("/portal/")) return false;
          if (url.pathname.startsWith("/api/")) return false;
          if (url.pathname.startsWith("/auth/")) return false;
          return true;
        },
      },
    ],
  },
});

serwist.addEventListeners();
