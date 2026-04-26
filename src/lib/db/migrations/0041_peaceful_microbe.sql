ALTER TABLE "workspace_settings" ADD COLUMN "scheduling_slots" jsonb DEFAULT '[
      {"pkg":"Sprint","status":"available","copy":"1자리 가능 — 24시간 안에 회신"},
      {"pkg":"Build","status":"available","copy":"2자리 가능 — 다음 주 시작"},
      {"pkg":"Scale","status":"waiting","copy":"2주 대기 — 화이트리스트 적합도 먼저 회신"}
    ]'::jsonb NOT NULL;