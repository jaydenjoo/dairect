import type { MetadataRoute } from "next";

const SITE_URL = "https://dairect.kr";

const PRIVATE_PATHS = [
  "/dashboard/",
  "/portal/",
  "/invite/",
  "/api/",
  "/auth/",
  "/onboarding/",
  "/login",
  "/signup",
  // /demo/(app)/* — mock 데이터 시연용 sub-app. 검색 인덱싱 차단.
  "/demo/clients/",
  "/demo/leads/",
  "/demo/projects/",
  "/demo/estimates/",
  "/demo/contracts/",
  "/demo/invoices/",
  "/demo/settings/",
];

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Yeti",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
