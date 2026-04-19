import crypto from "node:crypto";

// n8n 이벤트 송신 클라이언트 (fire-and-forget).
//
// 원칙:
//  - 절대 throw 하지 않음 — 호출자 Server Action 흐름(DB 업데이트 등)에 영향 X
//  - 3초 timeout (AbortController) — n8n hang 방지
//  - URL/Secret 미설정 시 no-op + 구조화 경고 로그
//  - HMAC sha256(`${timestamp}.${nonce}.${body}`) 서명 + ±5분 타임스탬프 윈도우
//  - 재시도 없음 (at-most-once) — Slack/Gmail 중복 발송 방지
//
// 보안:
//  - H4: 프로덕션에서 사설/링크로컬/루프백 호스트로의 송신 차단 (SSRF 방어)
//  - H5: 프로덕션에서 secret 미설정 시 fetch 자체를 차단 (unsigned 전송 금지)
//  - H6: 요청별 UUID nonce를 HMAC 입력에 포함 → replay 공격 방어
//         (n8n 측에서 5분 윈도우 내 nonce dedupe)

const EMIT_TIMEOUT_MS = 3000;
export const N8N_TIMESTAMP_SKEW_MS = 5 * 60 * 1000;

export type N8nWorkflow =
  | "project_status_changed"
  | "project_completed"
  | "portal_feedback_received"
  | "invoice_overdue";

const ENV_KEY_BY_WORKFLOW: Record<N8nWorkflow, string> = {
  project_status_changed: "N8N_WEBHOOK_URL_PROJECT_STATUS_CHANGED",
  project_completed: "N8N_WEBHOOK_URL_PROJECT_COMPLETED",
  portal_feedback_received: "N8N_WEBHOOK_URL_PORTAL_FEEDBACK_RECEIVED",
  invoice_overdue: "N8N_WEBHOOK_URL_INVOICE_OVERDUE",
};

// 사설/링크로컬/루프백 호스트 — 프로덕션에서만 차단.
// 로컬 개발(NODE_ENV=development)은 localhost n8n 허용 필요.
const PRIVATE_HOSTNAME_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,                  // AWS/GCP/Azure metadata
  /^172\.(1[6-9]|2\d|3[01])\./,   // 172.16.0.0/12
  /^0\./,                          // 0.0.0.0/8
  /^::1$/,
  /^\[::1\]$/,
  /^fc[0-9a-f]{2}:/i,             // IPv6 ULA
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,                      // IPv6 link-local
];

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  return PRIVATE_HOSTNAME_PATTERNS.some((p) => p.test(h));
}

// urlCache: 유효한 URL만 캐싱 (M1).
// null 상태를 캐싱하면 env 주입 순서 이슈/hot reload 시 영구 no-op이 될 수 있음.
const urlCache = new Map<N8nWorkflow, string>();

function getWorkflowUrl(workflow: N8nWorkflow): string | null {
  const cached = urlCache.get(workflow);
  if (cached) return cached;

  const key = ENV_KEY_BY_WORKFLOW[workflow];
  const raw = process.env[key];

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      console.warn({
        event: "n8n_emit_env_missing",
        workflow,
        env_key: key,
      });
    }
    return null;
  }

  let u: URL;
  try {
    u = new URL(raw);
  } catch (err) {
    console.error({
      event: "n8n_emit_url_parse_failed",
      workflow,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }

  if (process.env.NODE_ENV === "production") {
    if (u.protocol !== "https:") {
      console.error({
        event: "n8n_emit_url_invalid_protocol",
        workflow,
        protocol: u.protocol,
      });
      return null;
    }
    if (isPrivateHost(u.hostname)) {
      console.error({
        event: "n8n_emit_url_private_blocked",
        workflow,
        hostname: u.hostname,
      });
      return null;
    }
  } else if (u.protocol !== "https:" && u.protocol !== "http:") {
    return null;
  }

  urlCache.set(workflow, raw);
  return raw;
}

function signCanonical(canonical: string): string | null {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(canonical).digest("hex");
}

export type EmitEnvelope<T> = {
  event: string;
  version: "1";
  emitted_at: string;
  data: T;
};

export async function emitN8nEvent<T>(
  workflow: N8nWorkflow,
  event: string,
  data: T,
): Promise<void> {
  const url = getWorkflowUrl(workflow);
  if (!url) return;

  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const envelope: EmitEnvelope<T> = {
    event,
    version: "1",
    emitted_at: new Date().toISOString(),
    data,
  };

  let body: string;
  try {
    body = JSON.stringify(envelope);
  } catch (err) {
    // err.message에는 토큰만 노출되고 envelope 자체는 실리지 않음 (Node 표준 동작).
    console.error({
      event: "n8n_emit_serialize_failed",
      workflow,
      event_name: event,
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  const signature = signCanonical(`${timestamp}.${nonce}.${body}`);

  // H5: secret 미설정 상태로 production에 PII 송신 금지.
  if (!signature) {
    if (process.env.NODE_ENV === "production") {
      console.error({
        event: "n8n_emit_blocked_unsigned",
        workflow,
        event_name: event,
        reason: "N8N_WEBHOOK_SECRET_missing_in_production",
      });
      return;
    }
    console.warn({
      event: "n8n_emit_unsigned_dev",
      workflow,
      event_name: event,
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMIT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dairect-Event": event,
        "X-Dairect-Timestamp": timestamp,
        "X-Dairect-Nonce": nonce,
        "X-Dairect-Signature": signature ? `sha256=${signature}` : "unsigned",
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error({
        event: "n8n_emit_non_2xx",
        workflow,
        event_name: event,
        status: res.status,
      });
    }
  } catch (err) {
    const name = err instanceof Error ? err.name : "unknown";
    console.error({
      event: "n8n_emit_failed",
      workflow,
      event_name: event,
      err_name: name,
      message: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timer);
  }
}
