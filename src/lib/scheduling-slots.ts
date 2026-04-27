/**
 * SchedulingStatus 슬롯 — 공개 영역 Pricing 섹션 "REAL-TIME SCHEDULING" 박스 데이터.
 *
 * Epic Scheduling-Slots (2026-04-26): site-flags 패턴 확장.
 * 3개 패키지(Sprint/Build/Scale) 고정. status + copy 만 동적.
 * Jayden이 dashboard/settings 에서 편집 → revalidatePath("/") 즉시 반영.
 *
 * **이 파일은 client-safe** — types, constants, Zod schema 만 export.
 * DB 접근은 `scheduling-slots-server.ts` (server-only) 참조.
 */
import { z } from "zod";

export const SLOT_STATUSES = ["available", "next-week", "waiting"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const SLOT_PACKAGES = ["Sprint", "Build", "Scale"] as const;
export type SlotPackage = (typeof SLOT_PACKAGES)[number];

// 패키지 영문명 → 한국어 라벨 매핑.
// SchedulingStatus 박스에서 "Sprint · 검증" 식으로 병기 표시.
// 의미 변경 이력: Sprint(긴급 → 검증, 2026-04-27).
export const SLOT_KO_NAMES: Record<SlotPackage, string> = {
  Sprint: "검증",
  Build: "MVP",
  Scale: "확장",
};

export type Slot = {
  pkg: SlotPackage;
  status: SlotStatus;
  copy: string;
};

export const slotSchema = z.object({
  pkg: z.enum(SLOT_PACKAGES),
  status: z.enum(SLOT_STATUSES),
  copy: z.string().min(1, "내용을 입력해주세요").max(120, "120자 이내로 입력해주세요"),
});

export const slotsSchema = z
  .array(slotSchema)
  .length(3, "Sprint/Build/Scale 3개 슬롯이 모두 필요합니다")
  .refine(
    (arr) => {
      const pkgs = arr.map((s) => s.pkg);
      return SLOT_PACKAGES.every((p) => pkgs.includes(p));
    },
    { message: "Sprint/Build/Scale 패키지가 모두 포함되어야 합니다" },
  );

export const DEFAULT_SLOTS: readonly Slot[] = [
  { pkg: "Sprint", status: "available", copy: "1자리 가능 — 24시간 안에 회신" },
  { pkg: "Build", status: "available", copy: "2자리 가능 — 다음 주 시작" },
  {
    pkg: "Scale",
    status: "waiting",
    copy: "2주 대기 — 화이트리스트 적합도 먼저 회신",
  },
];
