import { z } from "zod";

// Task 5-2-2c: workspace 로고 업로드 Zod 검증.
// 버킷 레벨 제약(0029 마이그레이션)과 2중 방어 — 앱 레이어가 먼저 거절해 불필요한 네트워크 호출 방지.

export const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const LOGO_ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export type LogoMimeType = (typeof LOGO_ALLOWED_MIME_TYPES)[number];

// MIME → 확장자 매핑 (파일명 {ts}.{ext} 생성용).
// Content-Type 헤더가 항상 파일명 확장자를 반영하진 않아 MIME 기반이 더 안전.
export const LOGO_MIME_EXTENSION: Record<LogoMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const logoFileSchema = z
  .instanceof(File, { message: "파일을 선택해주세요" })
  .refine((file) => file.size > 0, { message: "빈 파일은 업로드할 수 없습니다" })
  .refine((file) => file.size <= LOGO_MAX_BYTES, {
    message: "파일 크기가 5MB를 초과합니다",
  })
  .refine(
    (file) => LOGO_ALLOWED_MIME_TYPES.includes(file.type as LogoMimeType),
    { message: "PNG, JPG, WEBP 이미지만 업로드 가능합니다" },
  );
