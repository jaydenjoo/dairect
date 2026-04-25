"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Epic Demo-Dari (2026-04-25): dairect 사이트 우하단 floating chat bubble.
 *
 * 한 줄 임베드: <script src="https://dari-theta.vercel.app/widget.js"
 *                       data-bot-id="dairect" async></script>
 *
 * 통합 특징:
 *   - Shadow DOM 사용 → Studio Anthem CSS 와 충돌 0
 *   - CORS Access-Control-Allow-Origin: * → 모든 도메인 허용
 *   - 색상·폰트·이름 등은 dari 서버의 봇 config 에서 관리 (Jayden 콘솔)
 *
 * 구현 메모:
 *   - Next.js <Script> 대신 useEffect 로 직접 DOM 주입 — widget.js 내부의
 *     `document.currentScript.dataset` 접근이 Next.js Script wrapper 와 호환성
 *     이슈 → 일반 script 태그로 head 에 직접 추가
 *
 * 숨김 경로 (운영·인증·고객포털 영역):
 *   - /dashboard/** : 운영자 자기 데이터 보는 중 — 챗봇 어색
 *   - /portal/**    : 고객 포털 — 다른 고객 챗봇과 혼동 방지
 *   - /login, /signup, /onboarding, /invite : 인증 화면 — 정보 수집 우려
 *   - /offline                : 네트워크 끊김 화면
 */

const HIDE_PATHS = [
  "/dashboard",
  "/portal",
  "/login",
  "/signup",
  "/onboarding",
  "/invite",
  "/offline",
] as const;

function shouldHide(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const SCRIPT_ID = "dari-widget-script";
const SCRIPT_SRC = "https://dari-theta.vercel.app/widget.js";
const BOT_ID = "dairect";
const POSITION = "bottom-right";

export function DariWidget() {
  const pathname = usePathname();
  const hidden = shouldHide(pathname);

  useEffect(() => {
    if (hidden) {
      // 숨김 경로 → 기존 마운트되어 있다면 제거
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) existing.remove();
      // Shadow DOM 호스트 (.dari-root 컨테이너) 도 정리 — widget.js 가 body 끝에 부착
      document.querySelectorAll("[data-dari-host]").forEach((el) => el.remove());
      return;
    }
    // 이미 로드되어 있으면 중복 추가 X
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.botId = BOT_ID;
    script.dataset.position = POSITION;
    document.body.appendChild(script);

    // cleanup: route 전환 시는 script 그대로 두고 (멱등성), unmount 만 처리
    return () => {
      // SPA navigation 에서는 widget 유지가 자연스러움 — 명시적 제거 X
    };
  }, [hidden]);

  return null;
}
