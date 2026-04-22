/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

// 인증/민감 라우트는 NetworkOnly + handlerDidError plugin 조합.
//
// 매처 등록을 유지하는 이유 = @serwist/next/worker defaultCache의 catch-all
// NetworkFirst 3종 (RSC payload / HTML page / "others") 차단. 매처를 빼면
// dashboard·portal 응답이 SW 캐시에 저장돼 cross-tenant 누출 위험.
//
// handlerDidError plugin 추가 이유 = NetworkOnly는 abort/redirect로 응답을
// 못 받으면 "no-response" throw → 브라우저가 native fetch로 재시도 → 이중
// 요청 + 콘솔 에러 spam + 매 navigation 추가 latency. silent 504 Response
// 반환으로 throw 차단 → 단일 요청으로 끝남 (보안 의도 0% 변경 없음).
//
// matcher의 method 기본값은 "GET". POST/PUT/DELETE는 SW 자체 우회.
// destination 조건 없이 매칭 (HTML document + RSC payload + prefetch 모두 포함).
const safeNetworkOnly = () =>
  new NetworkOnly({
    plugins: [
      {
        handlerDidError: async () =>
          new Response(null, { status: 504, statusText: "SW passthrough" }),
      },
    ],
  });

const customRuntimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/portal/"),
    handler: safeNetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/api/"),
    handler: safeNetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/auth/"),
    handler: safeNetworkOnly(),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/dashboard"),
    handler: safeNetworkOnly(),
  },
  // Phase 5 Task 5-2-5: /invite/[token] — URL path에 122-bit 랜덤 토큰 포함.
  // SW 캐시에 저장 시 동일 기기의 다른 방문자에게 노출될 위험.
  // Task 4-4 M1+M2에서 /portal/[token]으로 동일 패턴 차단한 것과 동일 이유.
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/invite/"),
    handler: safeNetworkOnly(),
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
          if (url.pathname.startsWith("/invite/")) return false;
          if (url.pathname.startsWith("/api/")) return false;
          if (url.pathname.startsWith("/auth/")) return false;
          return true;
        },
      },
    ],
  },
});

serwist.addEventListeners();
