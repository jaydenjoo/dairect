// Phase 5.5 Task 5-5-4: rate limit (fixed window counter, Supabase 기반).
//
// 모델
//  - key당 1 row만 유지 (UPSERT). ON CONFLICT가 PG에서 자동 직렬화 → race 방어.
//  - window_start이 windowSec 이전이면 reset(count=1, window_start=NOW), 아니면 increment(count+=1).
//  - count가 limit을 초과하면 차단. 차단된 요청도 카운터 +1 → "abuse 시도가 많을수록 더 강하게 차단"
//    효과 (window 끝까지 강제). bonus 부작용으로 정상 요청도 1회 추가 카운트되지만,
//    fixed window에서는 자연스러운 trade-off.
//
// 호출 패턴
//   const result = await checkAndIncrementRateLimit("invite:user:abc:m", { windowSec: 60, limit: 5 });
//   if (!result.allowed) {
//     return { error: `잠시 후 다시 시도. ${result.retryAfterSec}초 후 가능` };
//   }
//
// key 컨벤션 (충돌 방지 위해 prefix 강제)
//  - "invite:user:{userId}:m" / ":h" — createInvitationAction 분/시간 한도
//  - "inquiry:ip:{ip}:m" / ":h" — submitInquiryAction(랜딩 contact form) IP 기반 한도
//  - 향후: "login:ip:{ip}:m", "signup:email:{email}:h" 등 prefix 패턴 확장.
//
// Phase 5.5+ ToDo
//  - stale key cleanup cron (window_start_idx 활용)
//  - Upstash Redis 전환 시 이 파일 인터페이스 동일 유지 → swap 가능

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// Task 5-5-4 rate-2 + Task 5-5-5 review HIGH-1 반영: env 문자열을 양의 정수로 안전 파싱.
// 빈 문자열/NaN/0/음수면 default fallback — limit=0이면 모든 요청 영구 차단 위험 방어.
// env.ts zod regex `^[1-9]\d*$`와 2중 방어 (defense-in-depth).
export function parseRateLimit(envVal: string | undefined, fallback: number): number {
  if (!envVal) return fallback;
  const n = Number(envVal);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

export type RateLimitResult = {
  allowed: boolean;
  used: number;
  limit: number;
  // 다음 요청까지 남은 초. allowed=true면 항상 windowSec(다음 reset까지).
  retryAfterSec: number;
};

export type RateLimitOptions = {
  // window 길이(초). 60=분, 3600=시간 등.
  windowSec: number;
  // 한도(이 값을 초과하면 차단).
  limit: number;
};

export async function checkAndIncrementRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { windowSec, limit } = options;

  // UPSERT: window 만료 시 reset, 아니면 increment.
  // RETURNING으로 갱신 후 count + window_start을 받아 retryAfterSec 산출.
  // make_interval로 windowSec(int)을 interval로 변환 — SQL injection 안전(파라미터 바인딩).
  // drizzle/postgres-js driver는 RowList<Row[]> 반환 — array처럼 접근.
  const rows = (await db.execute(sql`
    INSERT INTO rate_limit_counters (key, window_start, count, updated_at)
    VALUES (${key}, NOW(), 1, NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limit_counters.window_start < NOW() - make_interval(secs => ${windowSec})
          THEN 1
        ELSE rate_limit_counters.count + 1
      END,
      window_start = CASE
        WHEN rate_limit_counters.window_start < NOW() - make_interval(secs => ${windowSec})
          THEN NOW()
        ELSE rate_limit_counters.window_start
      END,
      updated_at = NOW()
    RETURNING count, window_start
  `)) as unknown as Array<{ count: number; window_start: Date | string }>;

  const first = rows[0];
  if (!first) {
    // 비정상 — UPSERT가 row를 반환 안 함. fail-closed로 차단(보수적).
    // retryAfterSec는 windowSec 대신 60초 캡 — windowSec=3600(시간 한도)이면
    // "1시간 후 다시 시도" 안내가 부정확하므로 보수적으로 60초로 표시 (security MEDIUM-2 반영).
    return { allowed: false, used: 0, limit, retryAfterSec: Math.min(windowSec, 60) };
  }

  const used = Number(first.count);
  const windowStartMs = new Date(first.window_start).getTime();
  // 비정상적으로 잘못된 timestamp(NaN) 방어 — postgres-js는 timestamptz를 Date로 반환하지만
  // driver upgrade 또는 type cast 변경 시 안전망 (LOW-2 reviewer 반영).
  if (Number.isNaN(windowStartMs)) {
    return { allowed: false, used, limit, retryAfterSec: Math.min(windowSec, 60) };
  }
  const elapsedSec = Math.floor((Date.now() - windowStartMs) / 1000);
  // window 종료까지 남은 초. 음수가 되지 않도록 max(0, ...).
  const retryAfterSec = Math.max(0, windowSec - elapsedSec);

  return {
    allowed: used <= limit,
    used,
    limit,
    retryAfterSec,
  };
}
