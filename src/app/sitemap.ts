import type { MetadataRoute } from "next";

const SITE_URL = "https://dairect.kr";

type PublicRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

// /demo 는 mock sub-app (clients, leads, estimates...) 까지 포함되어 시연용
// — 인덱싱 가치 낮고 Jayden 판단 영역이라 별도 Task 로 미룸.
const PUBLIC_ROUTES: PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/process", changeFrequency: "monthly", priority: 0.7 },
  // Task 1 (2026-04-29): Journal·Build 인덱스만 추가. 동적 라우트(/journal/[slug] 등)는 Task 2에서.
  { path: "/journal", changeFrequency: "weekly", priority: 0.7 },
  { path: "/build", changeFrequency: "weekly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
