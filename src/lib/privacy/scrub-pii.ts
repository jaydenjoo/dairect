// Task B (audit-4): PII 익명화(pseudonymize) 유틸.
//
// 정책 — docs/pii-lifecycle.md §2-3, §4
//  - 초대 이벤트가 최종 상태(accepted/revoked/expired)에 도달한 시점에만 수행.
//  - email 평문 → deterministic pseudonym (같은 email+workspace → 같은 pseudonym).
//  - audit_logs row 자체는 삭제 금지 (감사 증거 보존). metadata만 치환 + pii_scrubbed_at SET.
//  - 멱등: 이미 pii_scrubbed_at IS NOT NULL인 row는 재처리 skip.
//
// 설계 의도
//  - 상위 이벤트 commit 후 별도 transaction에서 수행 → scrub 실패가 상위를 rollback시키지 않음.
//  - workspace_id별 분리 → tenant 간 동일 email 교차 추적 방지.
//  - 호출부는 try/catch로 scrub 실패를 swallow + 구조화 로그 (상위 이벤트 응답은 유지).

import "server-only";

import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";

const DEV_FALLBACK_SALT = "dev-only-salt-do-not-use-in-prod";
// Task B review M7: dev fallback 사용 시 프로세스당 1회만 경고 — dev 데이터 덤프 시 "이거 진짜 익명화된 거 맞나?" 혼동 방지.
let warnedDevFallbackUse = false;

function getSalt(): string {
  const salt = process.env.PII_PSEUDONYM_SALT;
  if (salt && salt.length >= 32) return salt;
  if (process.env.NODE_ENV === "production") {
    // production에서는 env.ts validation이 부팅 시 차단하므로 여기 도달 불가.
    // 방어적으로 throw: 누군가 env 우회 접근 시 즉시 실패.
    throw new Error(
      "[scrub-pii] PII_PSEUDONYM_SALT 누락 — production 부팅이 env validation을 우회했을 가능성",
    );
  }
  if (!warnedDevFallbackUse) {
    console.warn("[scrub-pii] using dev fallback salt — deterministic but not for prod", {
      event: "pii_scrub.using_dev_fallback",
      nodeEnv: process.env.NODE_ENV ?? "(unset)",
    });
    warnedDevFallbackUse = true;
  }
  return DEV_FALLBACK_SALT;
}

/**
 * email을 workspace-scoped pseudonym으로 변환.
 * 형식: "pii:<16자 hex>" — docs/pii-lifecycle.md §2-3
 */
export function pseudonymizeEmail(email: string, workspaceId: string): string {
  const normalized = email.trim().toLowerCase();
  const salt = getSalt();
  const hash = createHash("sha256")
    .update(`${normalized}:${workspaceId}:${salt}`)
    .digest("hex");
  return `pii:${hash.slice(0, 16)}`;
}

/**
 * activity_logs.metadata 객체 내 PII 필드를 pseudonym으로 치환.
 *
 * ⚠️ SHALLOW ONLY — top-level key만 처리. 중첩 객체(`metadata.user = { email: ... }`)의
 * PII는 **처리되지 않음**. 향후 metadata 구조에 중첩이 추가되면 이 함수를 반드시 확장
 * (화이트리스트 재검토 + 재귀 처리 또는 top-level 강제 평탄화 규칙 도입).
 *
 * 현재 대상: `email`만. `inviterName`은 TBD (docs/pii-lifecycle.md §1-1 참조).
 * array/primitive 방어: object가 아니면 null 반환 (Array는 spread 시 index key object로 왜곡됨).
 */
export function scrubMetadataObject(
  metadata: Record<string, unknown> | null | undefined,
  workspaceId: string,
): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const copy: Record<string, unknown> = { ...metadata };
  if (
    typeof copy.email === "string" &&
    copy.email.length > 0 &&
    !copy.email.startsWith("pii:")
  ) {
    copy.email = pseudonymizeEmail(copy.email, workspaceId);
  }
  return copy;
}

/**
 * 특정 초대(invitationId) 관련 activity_logs 전부의 metadata PII를 익명화.
 *
 * - WHERE entityType='workspace_invitation' AND entityId=invitationId AND pii_scrubbed_at IS NULL
 * - 별도 transaction에서 실행 (상위 이벤트 이미 commit 후 호출 전제)
 * - 호출부는 이 함수 호출을 try/catch로 감싸 실패 시 로그만 남기고 상위 응답 유지
 *
 * @returns 익명화된 row 개수 (관찰성)
 */
export async function scrubInvitationActivityLogs(
  invitationId: string,
  workspaceId: string,
): Promise<{ scrubbedCount: number }> {
  return db.transaction(async (tx) => {
    const targets = await tx
      .select({ id: activityLogs.id, metadata: activityLogs.metadata })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.entityType, "workspace_invitation"),
          eq(activityLogs.entityId, invitationId),
          isNull(activityLogs.piiScrubbedAt),
        ),
      );

    if (targets.length === 0) return { scrubbedCount: 0 };

    const now = new Date();
    for (const row of targets) {
      const scrubbed = scrubMetadataObject(
        row.metadata as Record<string, unknown> | null,
        workspaceId,
      );
      await tx
        .update(activityLogs)
        .set({ metadata: scrubbed, piiScrubbedAt: now })
        .where(eq(activityLogs.id, row.id));
    }

    return { scrubbedCount: targets.length };
  });
}
