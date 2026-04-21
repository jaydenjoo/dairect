import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  userSettings,
  workspaceMembers,
  workspaceSettings,
  workspaces,
} from "@/lib/db/schema";

// Phase 5 Epic 5-2 Task 5-2-7: 사용자의 default workspace 멱등 보장.
//
// 호출 시점:
//   - /dashboard/layout.tsx의 user INSERT 직후. 매 대시보드 진입마다 호출되나
//     내부 transaction에서 "이미 소속 있으면 skip"이라 실질 비용은 첫 진입 1회.
//
// 멱등성 보장:
//   1. workspace_members 조회 → 소속 있으면 early return
//   2. 없을 때만 transaction: workspaces INSERT + members INSERT + user_settings upsert
//   3. slug 충돌 시 retry (email prefix + random hex)
//
// 왜 layout.tsx에 배치:
//   /signup 페이지에서 supabase.auth.signUp 성공 후 자동 redirect → /dashboard.
//   이 지점에서 멱등 호출이면 enable_confirmations=false(local) / true(prod) 양쪽 모두
//   자동으로 default workspace 확보. Google OAuth 신규 가입도 동일 경로.
//
// 왜 새 helper 파일:
//   get-workspace-id.ts는 read-only cache 함수. 생성은 write 경로라 분리.
//   향후 /onboarding(Task 5-2-1)에서 첫 workspace 생성 UI 시 이 함수 재사용 가능.

const SLUG_RETRY_LIMIT = 5;

/**
 * email 로컬 파트 + 랜덤 hex 접미사로 slug 생성.
 *
 * 예: "jayden-a3f9b2" ← "jayden@dairect.kr"
 * 충돌 시 retry (최대 5회).
 */
function generateSlug(email: string): string {
  const localPart = email.split("@")[0] ?? "user";
  // 영숫자 + 하이픈만 허용, lowercase
  const clean = localPart
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const suffix = Math.random().toString(16).slice(2, 8);
  return `${clean || "user"}-${suffix}`;
}

function defaultWorkspaceName(name: string | null | undefined, email: string): string {
  const fallback = email.split("@")[0] ?? "내";
  const base = (name?.trim() || fallback).slice(0, 40);
  return `${base}의 워크스페이스`;
}

/**
 * 사용자가 어떤 workspace에도 소속되지 않은 경우 default workspace 생성.
 * 이미 소속 1개 이상이면 no-op.
 *
 * @returns 소속 workspace ID (신규 또는 기존)
 */
export async function ensureDefaultWorkspace(
  userId: string,
  userName: string | null,
  userEmail: string,
): Promise<string> {
  // Fast path: 이미 소속 있으면 조회만.
  const existing = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0].workspaceId;
  }

  // Slow path: 신규 workspace + member + user_settings 트랜잭션.
  // slug 충돌(다른 user가 동시에 같은 email prefix 사용) 방어 retry.
  return db.transaction(async (tx) => {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < SLUG_RETRY_LIMIT; attempt++) {
      const slug = generateSlug(userEmail);
      try {
        const [ws] = await tx
          .insert(workspaces)
          .values({
            name: defaultWorkspaceName(userName, userEmail),
            slug,
          })
          .returning({ id: workspaces.id });

        if (!ws) throw new Error("workspace INSERT returned no row");

        await tx.insert(workspaceMembers).values({
          workspaceId: ws.id,
          userId,
          role: "owner",
        });

        // user_settings는 onConflictDoNothing — 이전 단계에서 생성됐을 수 있음
        // (Phase 4 이전 유저가 workspace만 없는 케이스).
        await tx
          .insert(userSettings)
          .values({ userId })
          .onConflictDoNothing({ target: userSettings.userId });

        // Phase 5 Task 5-2-2: workspace_settings 빈 row 자동 생성 — 기본 prefix/dailyRate/split 채움.
        // 신규 가입자가 /dashboard/settings 처음 저장 전에도 getSettings()가 기본값 반환 가능.
        await tx
          .insert(workspaceSettings)
          .values({ workspaceId: ws.id })
          .onConflictDoNothing({ target: workspaceSettings.workspaceId });

        return ws.id;
      } catch (err) {
        lastError = err;
        // slug UNIQUE 충돌 추정 — retry로 다른 suffix 생성. 다른 에러면 재시도도 같은 결과.
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.toLowerCase().includes("unique") && !msg.toLowerCase().includes("slug")) {
          throw err;
        }
      }
    }
    throw new Error(
      `ensureDefaultWorkspace: slug 생성 ${SLUG_RETRY_LIMIT}회 연속 충돌. lastError=${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
    );
  });
}

/**
 * 특정 userId가 workspace_members에 소속되어 있는지 조회 (layout.tsx early check 용).
 * 별도 export: transaction 바깥에서 가벼운 확인만 할 때 사용.
 */
export async function hasAnyWorkspace(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .limit(1);
  return rows.length > 0;
}
