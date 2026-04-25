/**
 * portfolio_items 테이블 입력 검증 — Epic Portfolio v2 (2026-04-25).
 *
 * /dashboard/portfolio 등록·편집 폼과 server action 양쪽에서 사용.
 * 기존 src/lib/validation/portfolio.ts 의 portfolioMetaSchema (jsonb 시절) 는
 * deprecated — 직접 import 금지. 새 코드에서는 이 파일의 schema 를 사용한다.
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

// 한 줄 텍스트: 개행·탭·꺾쇠 차단 (헤더 injection / XSS 1차 방어)
const oneLineText = z
  .string()
  .regex(/^[^\r\n\t<>]*$/, "특수문자(<, >, 줄바꿈, 탭)는 사용할 수 없습니다");

// 설명용 multiline: 개행·탭만 허용, 그 외 제어문자 + BiDi override 차단
const safeMultilineText =
  /^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069]*$/;

// slug: URL 친화 식별자 (영숫자 + - + _)
const slugPattern = /^[a-z0-9][a-z0-9-_]{0,60}[a-z0-9]$|^[a-z0-9]$/;

// SSRF/내부망 차단 — projects.ts 와 동일 정책
function isInternalHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1" || h === "[::1]")
    return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isSafePublicUrl(v: string): boolean {
  if (/[\x00-\x20\x7F<>]/.test(v)) return false;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (isInternalHost(u.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

// 내부 라우트(/demo/chatsio 등)도 demoUrl 에 허용 — protocol 없는 path-only.
function isInternalRoute(v: string): boolean {
  return /^\/[a-zA-Z0-9/_-]+$/.test(v) && !v.startsWith("//");
}

const optionalUrlOrPath = z
  .union([
    z.literal(""),
    z
      .string()
      .max(500)
      .refine(
        (v) => isSafePublicUrl(v) || isInternalRoute(v),
        "외부 http(s) URL 또는 내부 경로(/demo/...) 만 허용됩니다",
      ),
  ])
  .default("");

export const portfolioItemFormSchema = z
  .object({
    slug: z
      .union([
        z.literal(""),
        z.string().regex(slugPattern, "영문 소문자/숫자/하이픈만 (예: chatsio)"),
      ])
      .default(""),
    name: oneLineText.min(1, "이름을 입력해주세요").max(80),
    nameAmber: oneLineText.max(40).default(""),
    description: z
      .string()
      .max(300)
      .regex(safeMultilineText, "제어문자는 사용할 수 없습니다")
      .default(""),
    cat: portfolioCategorySchema.default("saas"),
    year: oneLineText.max(10).default(""),
    duration: oneLineText.max(20).default(""),
    stack: oneLineText.max(200).default(""),
    statusText: oneLineText.max(100).default(""),
    statusType: portfolioStatusTypeSchema.default("live"),
    badge: oneLineText.max(60).default(""),
    metaHint: oneLineText.max(60).default(""),
    liveUrl: optionalUrlOrPath,
    demoUrl: optionalUrlOrPath,
    isPublic: z.boolean().default(false),
    displayOrder: z.coerce
      .number()
      .int()
      .min(0)
      .max(9999)
      .default(0),
  })
  .strict();

export type PortfolioItemFormInput = z.infer<typeof portfolioItemFormSchema>;
