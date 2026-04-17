import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Check your environment variables.");
}

// prepare: false — Supabase Pooler(Transaction mode)에서 필수
// max: 1 — Next.js 빌드 워커(9개)가 Supabase Session pool(15 슬롯)을 고갈시키지 않도록 제한
// idle_timeout: 20 — 유휴 연결 빠르게 회수하여 풀 경합 완화
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
