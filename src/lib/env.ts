// Phase 5.5 보안 강화: 환경변수 startup 검증 (fail-fast).
//
// 목적
//  - 필수 env 누락을 "첫 요청에서 500"이 아닌 "부팅 시점"에 잡는다.
//  - 모든 환경변수를 한 곳에 모아 정의 → drift 방지 + 누락 가시화.
//  - production에서는 RESEND 2종도 필수로 강제 (Phase 5 멤버 초대).
//
// 적용 경로
//  - src/instrumentation.ts → register()에서 이 모듈 import → top-level validateEnv() 실행.
//  - client 번들이 실수로 import해도 process.env.DATABASE_URL 등이 undefined → zod fail로
//    빌드/런타임 에러가 즉시 노출됨 (자연스러운 server-only 강제).
//
// 누락 시 동작
//  - 한국어 에러 메시지 + 해결법(.env.local 또는 Vercel 환경변수) 안내.
//  - server start 차단 → 결함 상태 배포 방지.

// server-only: client component가 실수로 import 시 빌드 타임 즉시 차단.
// (이전엔 zod fail에 간접 의존 → MEDIUM-3 리뷰로 명시적 차단으로 격상.)
import "server-only";
import { z } from "zod";

const envSchema = z
  .object({
    // 항상 필수 (dev/test/prod 모두)
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("Supabase 프로젝트 URL — 올바른 URL 형식 필요"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key — 비어있을 수 없음"),
    DATABASE_URL: z.string().min(1, "Postgres 연결 문자열 — Drizzle/Supabase pooler URL"),
    NEXT_PUBLIC_APP_URL: z.string().url("앱 베이스 URL — 초대/포털 링크 생성에 사용"),

    // production에서만 필수 (superRefine에서 강제)
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),

    // 항상 선택 (기능 활성 시에만 필요)
    // RESEND_REPLY_TO: 이전 버전은 .email()로 강제했으나, "Name <email>" 표기를 입력하는
    // 운영 사고가 발생하면 production 부팅이 막히는 회귀 위험 → 단순 비공백 검증만 수행.
    // 실제 형식 검증은 Resend SDK가 발송 시점에 처리 (HIGH-1 리뷰 반영).
    RESEND_REPLY_TO: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    N8N_WEBHOOK_SECRET: z.string().optional(),
    // n8n webhook URL 5종 (Task 5-5-1 MEDIUM-2 반영, drift 방지).
    // 형식 검증(.url())은 의도적으로 빼서 부가 시스템 1개 오설정으로 전체 앱 부팅 차단되는
    // 운영 risk 회피 (Task 5-5-5 review MED-1 반영). client.ts에 이미 new URL() try/catch
    // graceful 처리 있어 잘못된 형식이면 해당 워크플로만 no-op + console.warn 로그.
    N8N_WEBHOOK_URL_PROJECT_STATUS_CHANGED: z.string().optional(),
    N8N_WEBHOOK_URL_PROJECT_COMPLETED: z.string().optional(),
    N8N_WEBHOOK_URL_PORTAL_FEEDBACK_RECEIVED: z.string().optional(),
    N8N_WEBHOOK_URL_INVOICE_OVERDUE: z.string().optional(),
    N8N_WEBHOOK_URL_WEEKLY_SUMMARY: z.string().optional(),
    // Phase 5.5 Task 5-5-4 후속 (rate-2 반영): 한도값 운영 중 조정용 옵션.
    // 미설정 시 actions.ts default(분 5 / 시간 20) 사용. 형식: 1 이상 양의 정수.
    // regex가 "0" 거부 (Task 5-5-5 review HIGH-1 반영) — limit=0이면 모든 admin 초대 영구 차단 위험.
    INVITE_RATE_LIMIT_PER_MINUTE: z
      .string()
      .regex(/^[1-9]\d*$/, "1 이상 양의 정수 문자열이어야 함")
      .optional(),
    INVITE_RATE_LIMIT_PER_HOUR: z
      .string()
      .regex(/^[1-9]\d*$/, "1 이상 양의 정수 문자열이어야 함")
      .optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;

    // Phase 5 이메일 기능: production에서는 멤버 초대 발송이 핵심 경로 → 둘 다 필수.
    if (!env.RESEND_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["RESEND_API_KEY"],
        message: "production 필수 — Resend Sending Access key (멤버 초대 이메일 발송)",
      });
    }
    if (!env.RESEND_FROM_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["RESEND_FROM_EMAIL"],
        message: "production 필수 — Resend가 verified한 발신 주소 (예: invite@send.dairect.kr)",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    const nodeEnv = process.env.NODE_ENV ?? "(not set)";
    const message =
      `\n[env] 환경변수 검증 실패 (NODE_ENV=${nodeEnv}):\n` +
      issues +
      `\n\n해결: .env.local(개발) 또는 Vercel Project Settings → Environment Variables(배포)에 ` +
      `누락된 값을 추가하고 dev 서버 재시작 또는 Vercel Redeploy를 실행하세요.\n`;

    throw new Error(message);
  }

  return result.data;
}

// 모듈 로드 시점 즉시 검증.
// instrumentation.ts → register()에서 이 모듈을 import하면 server start 시 1회 실행되어
// 누락된 env가 있으면 부팅 차단 + 명확한 메시지.
// 다른 server 모듈에서 type-safe access를 원하면 `import { env } from '@/lib/env'`로 사용 가능
// (기존 `process.env.X` 접근과 공존).
export const env = validateEnv();
