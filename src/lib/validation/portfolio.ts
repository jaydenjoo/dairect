/**
 * /projects 포트폴리오 번들 전용 메타 필드 검증.
 *
 * Task 6-ext (2026-04-25): 공개 포트폴리오 관리 기능. /projects 페이지는 번들
 * Landing.html [P-02] 스타일을 정적 10개 프로젝트로 렌더하던 것을 projects 테이블
 * 기반 동적 렌더로 전환. 편집은 /dashboard/projects/[id]의 공개 포트폴리오 섹션.
 *
 * 디자인 제약: /projects 시각 렌더 결과 1픽셀도 변경 없음. 번들 classname + CSS
 * (.p-row, .etym-*)는 그대로, 데이터 소스만 하드코딩 배열 → DB jsonb로 교체.
 */
import { z } from "zod";

export const portfolioCategorySchema = z.enum([
  "saas",
  "automation",
  "editorial",
  "tools",
]);

export type PortfolioCategory = z.infer<typeof portfolioCategorySchema>;

export const portfolioStatusTypeSchema = z.enum(["live", "wip"]);
export type PortfolioStatusType = z.infer<typeof portfolioStatusTypeSchema>;

/**
 * 번들 Landing.html [P-02]의 각 프로젝트 row에 필요한 디스플레이 필드.
 *
 * 예시 (Chatsio):
 * ```
 * {
 *   "nameAmber": "sio",                    // "Chat" + amber("sio")로 분리 렌더
 *   "cat": "saas",                         // 5-filter 탭 분류
 *   "year": "2025",                        // 오른쪽 meta grid "Year" 값
 *   "dur": "2w",                           //                   "Dur." 값
 *   "stack": "Next.js · Supabase · Claude", //                  "Stack" 값
 *   "status": "Live · 12 clients",         //                   "Status" 값
 *   "statusType": "live",                  // v.live (green) / v.wip (dust) 분기
 *   "badge": "★ Featured · SaaS",          // .pr-title .cat 배지
 *   "meta": "AI CHAT · N°01",              // cursor-follow thumb용 (hover 시 표시)
 *   "order": 1                             // /projects 페이지 내 정렬 순서
 * }
 * ```
 */
export const portfolioMetaSchema = z.object({
  nameAmber: z.string().max(40).default(""),
  cat: portfolioCategorySchema.default("saas"),
  year: z.string().max(10).default(""),
  dur: z.string().max(20).default(""),
  stack: z.string().max(200).default(""),
  status: z.string().max(100).default(""),
  statusType: portfolioStatusTypeSchema.default("live"),
  badge: z.string().max(60).default(""),
  meta: z.string().max(60).default(""),
  order: z.number().int().min(0).max(9999).default(0),
});

export type PortfolioMeta = z.infer<typeof portfolioMetaSchema>;

/**
 * DB에서 읽은 raw jsonb를 PortfolioMeta로 안전 파싱.
 * null/undefined/빈 객체 모두 defaults로 처리.
 */
export function parsePortfolioMeta(raw: unknown): PortfolioMeta {
  if (!raw || typeof raw !== "object") {
    return portfolioMetaSchema.parse({});
  }
  const result = portfolioMetaSchema.safeParse(raw);
  return result.success ? result.data : portfolioMetaSchema.parse({});
}
