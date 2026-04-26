/**
 * SchedulingStatus 슬롯 — server-only DB 접근 함수.
 *
 * 별도 파일 이유: client component 가 `scheduling-slots.ts` 의 type/DEFAULT 를
 * import 할 때 db(postgres) 가 client bundle 로 끌려가지 않도록 분리.
 * (postgres 패키지는 net/tls/perf_hooks 같은 Node 전용 모듈 사용)
 *
 * 캐싱 정책:
 *   - 페이지 revalidate 60s 와 일치
 *   - 즉시 반영 필요 시 settings 저장 후 revalidatePath("/") 호출
 */
import "server-only";
import { db } from "@/lib/db";
import { workspaceSettings } from "@/lib/db/schema";
import {
  DEFAULT_SLOTS,
  slotsSchema,
  type Slot,
} from "@/lib/scheduling-slots";

/**
 * 공개 영역 SSR용. single-user 가정 — workspace_settings 첫 row 사용.
 * DB 장애 / 0 row / 검증 실패 시 DEFAULT_SLOTS fallback 으로 사이트 안전 유지.
 */
export async function getSchedulingSlots(): Promise<readonly Slot[]> {
  try {
    const rows = await db
      .select({ schedulingSlots: workspaceSettings.schedulingSlots })
      .from(workspaceSettings)
      .limit(1);
    const row = rows[0];
    if (!row?.schedulingSlots) return DEFAULT_SLOTS;
    const parsed = slotsSchema.safeParse(row.schedulingSlots);
    if (!parsed.success) {
      console.error({
        event: "scheduling_slots_invalid_db_row",
        issues: parsed.error.issues,
      });
      return DEFAULT_SLOTS;
    }
    return parsed.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error({ event: "scheduling_slots_fetch_failed", message });
    return DEFAULT_SLOTS;
  }
}
