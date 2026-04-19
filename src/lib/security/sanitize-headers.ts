/**
 * 공개 엔드포인트 IP/UA 헤더 sanitize baseline.
 *
 * 의도: 저장된 값이 PM 대시보드/로그 뷰에서 렌더될 때 방향 역전·스푸핑·헤더
 * injection을 차단. portal 피드백 + landing contact 폼 + 향후 모든 공개 폼이
 * 동일 정책으로 baseline 통일.
 *
 * 통합 출처:
 *   - src/lib/portal/feedback-actions.ts (BiDi/NEL 포함 강화 버전)
 *   - src/app/(public)/about/actions.ts (control char만 처리하던 약한 버전)
 * → 신규 통합본은 강화 버전 채택 (about도 자동 강화 효과).
 */

export const MAX_UA = 500;
export const MAX_IP = 64;

/**
 * raw header 값을 strip + 길이 제한.
 *
 * 차단 char:
 *   - C0 제어문자 `\x00-\x1F`, DEL `\x7F`
 *   - NEL `\u0085`
 *   - Line/Paragraph Separator `\u2028`, `\u2029`
 *   - BiDi override/embedding `\u202A-\u202E`, `\u2066-\u2069`
 *
 * 빈 문자열/null은 null 반환 (DB nullable 컬럼 호환).
 */
export function sanitizeHeader(
  raw: string | null | undefined,
  max: number,
): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(
    /[\x00-\x1F\x7F\u0085\u202A-\u202E\u2028\u2029\u2066-\u2069]/g,
    "",
  );
  const trimmed = cleaned.slice(0, max);
  return trimmed || null;
}

interface ReadOnlyHeaders {
  get(name: string): string | null;
}

/**
 * x-forwarded-for 우측 파싱 + sanitize 통합 헬퍼.
 *
 * Vercel/proxy XFF 스푸핑 방어: 좌측은 클라이언트 임의 조작 가능, 우측 마지막
 * 항목이 가장 신뢰할 수 있는 인접 hop. `x-real-ip` fallback.
 */
export function extractClientIp(headersList: ReadOnlyHeaders): string | null {
  const xff = headersList.get("x-forwarded-for");
  const ipFromXff = xff?.split(",").at(-1)?.trim();
  return sanitizeHeader(ipFromXff ?? headersList.get("x-real-ip"), MAX_IP);
}

/**
 * user-agent header 추출 + sanitize 통합 헬퍼.
 */
export function extractUserAgent(headersList: ReadOnlyHeaders): string | null {
  return sanitizeHeader(headersList.get("user-agent"), MAX_UA);
}
