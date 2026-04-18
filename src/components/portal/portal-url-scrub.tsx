"use client";

import { useEffect } from "react";

// URL path의 토큰을 브라우저 history/주소창에서 즉시 마스킹.
//
// 이유: 토큰이 주소창에 노출되면 (1) 어깨너머 열람(shoulder surfing), (2) 화면 공유/스크린샷,
// (3) 브라우저 히스토리/북마크 동기화, (4) 탭 제목 복사 시 URL 포함 경로로 유출 가능.
//
// 동작: mount 직후 `history.replaceState`로 path를 `/portal/active`로 바꿈.
// - 서버는 이미 `validatePortalToken` 통과 + 렌더 완료된 상태라 뒤로가기/새로고침 전까지 영향 없음.
// - 새로고침 시 /portal/active → validate 실패 → /portal/invalid로 안내.
//   (원본 토큰 링크를 다시 사용해야 하지만, 고객이 원래 링크는 별도 채널로 전달받은 전제)
// - Phase 5 SaaS 전환 시 lookup-id + POST exchange 방식으로 교체 권장.
export function PortalUrlScrub() {
  useEffect(() => {
    // 이미 /portal/active면 중복 치환 방지.
    if (window.location.pathname === "/portal/active") return;
    try {
      window.history.replaceState(null, "", "/portal/active");
    } catch {
      // replaceState는 same-origin에서 거의 실패하지 않지만, iframe/권한 제한 환경 대비 무해화.
    }
  }, []);

  return null;
}
