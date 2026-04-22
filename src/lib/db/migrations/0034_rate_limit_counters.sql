-- Phase 5.5 Task 5-5-4: rate limit counter (fixed window)
--
-- 모델:
--   - key당 1 row만 유지 (UPSERT 패턴, ON CONFLICT가 자동 직렬화 → race 방어).
--   - rate-limit.ts의 lib에서 호출 시:
--     INSERT ... ON CONFLICT (key) DO UPDATE SET
--       count = CASE WHEN window_start < NOW() - $window THEN 1 ELSE count + 1 END,
--       window_start = CASE WHEN window_start < NOW() - $window THEN NOW() ELSE window_start END
--     RETURNING count, window_start
--   - count > limit이면 차단. 차단된 요청도 카운트 +1 → "abuse 시도가 많을수록 더 강하게 차단"
--     (window 끝까지 강제 — bonus 효과).
--
-- 식별자(key) 컨벤션 (충돌 방지 위해 prefix 강제):
--   - "invite:user:{userId}:m" / "invite:user:{userId}:h" — createInvitationAction 분/시간 한도
--   - 향후: "login:ip:{ip}:m" / "signup:email:{email}:h" 등 동일 prefix 패턴 확장
--
-- 보안:
--   - RLS enable + anon/authenticated 모두 RESTRICTIVE deny → client 직접 접근 불가.
--   - server는 DATABASE_URL의 postgres role로 직접 connection (RLS bypass).
--   - 카운터 데이터는 PII 아님 (key는 hash 가능, count는 단순 정수).
--
-- 운영:
--   - cleanup cron 미포함 (key당 1 row만 유지 — UPSERT라 누적 안 됨).
--   - 다만 stale key(오래 사용 안 한 user의 분/시간 카운터)는 영구 잔존 → window_start_idx로 추후 cleanup 가능.
--   - 트래픽 증가 시 Upstash Redis 전환 (lib/rate-limit.ts 인터페이스 동일하게 유지).
--
-- 롤백 SQL:
--   BEGIN;
--   DROP POLICY IF EXISTS rate_limit_counters_no_client ON rate_limit_counters;
--   ALTER TABLE rate_limit_counters DISABLE ROW LEVEL SECURITY;
--   DROP INDEX IF EXISTS rate_limit_counters_window_start_idx;
--   DROP TABLE IF EXISTS rate_limit_counters;
--   COMMIT;

BEGIN;--> statement-breakpoint

CREATE TABLE rate_limit_counters (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT NOW(),
  count integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT NOW()
);--> statement-breakpoint

CREATE INDEX rate_limit_counters_window_start_idx
  ON rate_limit_counters(window_start);--> statement-breakpoint

ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- anon/authenticated 모두 차단 (server postgres role만 RLS bypass로 접근).
CREATE POLICY rate_limit_counters_no_client ON rate_limit_counters
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);--> statement-breakpoint

COMMIT;
