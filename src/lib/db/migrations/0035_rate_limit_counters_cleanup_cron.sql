-- Phase 5.5 Task 5-5-4 rate-1: rate_limit_counters 자동 정리 cron.
--
-- 배경: rate-limit.ts의 fixed window counter는 key당 1 row. window 만료 후에도 row 잔존.
-- 새 요청이 해당 key로 오면 ON CONFLICT DO UPDATE로 자연 reset되지만, 재방문 없는 user의
-- row는 영구 잔존 → 장기 DB 비대화. cron으로 주기적 삭제.
--
-- 설계:
--  - pg_cron extension(Supabase available) 설치
--  - 매시 정각 실행(`0 * * * *`) — 베타 row 수 적어 비용 무시, 잔존 시간 < 1h 유지
--  - 임계: `window_start < NOW() - INTERVAL '2 hours'`
--    (rate-limit.ts 가장 긴 window 3600s + 1h buffer — 활성 row 실수 삭제 방지)
--  - postgres superuser 권한으로 실행되므로 RLS RESTRICTIVE deny 정책 우회
--
-- 재실행 멱등성: 기존 같은 이름 job 있으면 먼저 unschedule.
-- EXCEPTION 처리(sec M2 반영): unschedule 실패해도 후속 schedule이 진행되도록 fail-soft.
--   production migration rerun이 중간 실패로 차단되는 경로(incident 대응 지연) 차단.
--   schedule 단계 실패는 fail-fast 유지 — 실제 문제 노출이 맞음.

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'rate_limit_counters_cleanup') THEN
    BEGIN
      PERFORM cron.unschedule('rate_limit_counters_cleanup');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'unschedule 실패 (job: rate_limit_counters_cleanup, SQLSTATE: %) — schedule 단계로 진행', SQLSTATE;
    END;
  END IF;
END;
$$;

SELECT cron.schedule(
  'rate_limit_counters_cleanup',
  '0 * * * *',
  $$DELETE FROM rate_limit_counters WHERE window_start < NOW() - INTERVAL '2 hours'$$
);

-- 롤백 순서 (중요 — 순서 바뀌면 cron이 missing table로 매시 실패 로그 누적):
--   1) SELECT cron.unschedule('rate_limit_counters_cleanup');  -- 이 migration 먼저 해제
--   2) 필요 시 0034_rate_limit_counters.sql 롤백 실행 (DROP TABLE rate_limit_counters)
--
-- ⚠️ DROP EXTENSION pg_cron 절대 금지:
--   - Supabase Cloud plan extension — 다른 tenant/향후 cron job 파괴 가능
--   - pg_cron 정리가 필요하면 Supabase Support 경유
