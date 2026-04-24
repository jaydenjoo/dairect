-- Task B (audit-4): activity_logs.pii_scrubbed_at 컬럼 추가
-- 목적: metadata PII가 pseudonym으로 익명화된 시점 기록. NULL = 평문 상태.
-- 정책: docs/pii-lifecycle.md §3 (즉시 이벤트 기반 scrub 시 SET NOW())
-- 안전: nullable + 기본값 없음 → 기존 row는 NULL 유지, schema migrate 자체 risk 최소

ALTER TABLE "activity_logs" ADD COLUMN "pii_scrubbed_at" timestamp with time zone;