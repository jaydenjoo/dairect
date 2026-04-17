import { z } from "zod";
import { guardSingleLine, guardMultiLine } from "./shared-text";

export const projectStatuses = [
  "lead", "consulting", "estimate", "contract",
  "in_progress", "review", "completed", "warranty", "closed",
  "cancelled", "failed",
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export const projectStatusSchema = z.enum(projectStatuses);

export const projectStatusLabels: Record<ProjectStatus, string> = {
  lead: "리드",
  consulting: "상담",
  estimate: "견적",
  contract: "계약",
  in_progress: "진행",
  review: "검수",
  completed: "완료",
  warranty: "하자보수",
  closed: "종료",
  cancelled: "취소",
  failed: "실패",
};

// 칸반 뷰용 4개 그룹
export const kanbanColumns = [
  { key: "waiting", label: "대기", statuses: ["lead", "consulting", "estimate", "contract"] },
  { key: "active", label: "진행", statuses: ["in_progress", "review"] },
  { key: "done", label: "완료", statuses: ["completed", "warranty", "closed"] },
  { key: "settled", label: "정산완료", statuses: ["cancelled", "failed"] },
] as const;

// 날짜: 빈 문자열 또는 YYYY-MM-DD
const dateOrEmpty = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
]);

export const projectFormSchema = z.object({
  name: guardSingleLine(z.string().min(1, "프로젝트명을 입력해주세요").max(100), "프로젝트명"),
  clientId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  description: guardMultiLine(z.string().max(2000), "설명").optional().default(""),
  status: projectStatusSchema.optional().default("lead"),
  expectedAmount: z.number().int().min(0).max(10_000_000_000).optional(),
  startDate: dateOrEmpty.optional().default(""),
  endDate: dateOrEmpty.optional().default(""),
  memo: guardMultiLine(z.string().max(2000), "메모").optional().default(""),
}).refine(
  (d) => !d.startDate || !d.endDate || d.startDate <= d.endDate,
  { message: "종료일이 시작일보다 빠를 수 없습니다", path: ["endDate"] },
);

export type ProjectFormData = z.infer<typeof projectFormSchema>;

// ─── 공개 포트폴리오 필드 ───

// 한 줄 텍스트: 개행·탭·꺾쇠 차단 (헤더 injection 방어)
const oneLineText = z.string().regex(/^[^\r\n\t<>]+$/, "특수문자(<, >, 줄바꿈)는 사용할 수 없습니다");

// 태그: 영숫자/한글/공백/일부 구두점만. XSS/formula injection 차단.
const tagPattern = /^[a-zA-Z0-9가-힣 .\-+#/]+$/;

// 설명용: 개행(\x0A)·탭(\x09)만 허용, 그 외 제어문자 + BiDi override 차단
const safeMultilineText = /^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069]*$/;

// 내부망/메타데이터 호스트 차단 (SSRF·내부망 유도 방어)
function isInternalHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1" || h === "[::1]") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // AWS/GCP metadata, link-local
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

export const publicFieldsSchema = z
  .object({
    isPublic: z.boolean(),
    publicAlias: z
      .union([z.literal(""), oneLineText.min(1).max(80)])
      .default(""),
    publicDescription: z
      .string()
      .max(300)
      .regex(safeMultilineText, "제어문자는 사용할 수 없습니다")
      .default(""),
    publicLiveUrl: z
      .union([
        z.literal(""),
        z
          .string()
          .max(500)
          .refine(isSafePublicUrl, "외부에서 접근 가능한 http(s) URL만 입력할 수 있습니다"),
      ])
      .default(""),
    publicTags: z
      .array(z.string().min(1).max(24).regex(tagPattern, "태그에 허용되지 않는 문자가 있습니다"))
      .max(8, "태그는 최대 8개까지 가능합니다")
      .default([]),
  })
  .strict()
  .refine(
    (d) => !d.isPublic || (d.publicAlias && d.publicAlias.length > 0),
    { message: "공개하려면 공개용 프로젝트 별칭이 필요합니다", path: ["publicAlias"] },
  );

export type PublicFieldsInput = z.infer<typeof publicFieldsSchema>;
