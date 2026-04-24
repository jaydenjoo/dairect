// 일회성 검증 스크립트 — Phase 5.5 env.ts startup 검증 동작 확인.
// 사용법: cd /Users/jayden/project/dairect && node scripts/test-env-validation.mjs
// 종료 후 삭제 권장. CI 통합 원하면 별도 vitest 케이스로 이관.

import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    if (!env.RESEND_API_KEY) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["RESEND_API_KEY"], message: "production 필수" });
    }
    if (!env.RESEND_FROM_EMAIL) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["RESEND_FROM_EMAIL"], message: "production 필수" });
    }
  });

const baseValid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "k",
  DATABASE_URL: "postgresql://localhost/db",
  NEXT_PUBLIC_APP_URL: "https://dairect.kr",
};

const cases = [
  { name: "dev + RESEND 누락 → PASS", input: { ...baseValid, NODE_ENV: "development" }, expectPass: true },
  { name: "prod + RESEND 누락 → FAIL (superRefine)", input: { ...baseValid, NODE_ENV: "production" }, expectPass: false },
  {
    name: "prod + RESEND 모두 set → PASS",
    input: { ...baseValid, NODE_ENV: "production", RESEND_API_KEY: "re_x", RESEND_FROM_EMAIL: "a@b.com" },
    expectPass: true,
  },
  { name: "잘못된 URL 형식 → FAIL", input: { ...baseValid, NODE_ENV: "development", NEXT_PUBLIC_SUPABASE_URL: "not-url" }, expectPass: false },
  { name: "DATABASE_URL 빈값 → FAIL", input: { ...baseValid, NODE_ENV: "development", DATABASE_URL: "" }, expectPass: false },
];

let allPassed = true;
for (const c of cases) {
  const r = envSchema.safeParse(c.input);
  const ok = r.success === c.expectPass;
  console.log(`${ok ? "✓" : "✗"} ${c.name}`);
  if (!ok) {
    allPassed = false;
    if (r.success) console.log("    UNEXPECTED PASS");
    else console.log("    issues:", r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  } else if (!r.success && c.name.startsWith("prod")) {
    console.log("    error preview:", r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
}

process.exit(allPassed ? 0 : 1);
