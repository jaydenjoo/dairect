"use client";

import { useEffect } from "react";

/**
 * About 페이지 [02 Timeline] 섹션의 드래그/휠/키보드 가로 스크롤 효과.
 *
 * 번들 About.html `<script>` 의 "Timeline drag to scroll" 블록 React 포팅.
 * #tl-scroll 엘리먼트에 마운트 시점에 이벤트 리스너만 연결하고, 마크업/CSS는
 * AboutSections.tsx 가 그대로 책임 (server component → client interactivity 분리).
 *
 * 작동:
 * - 마우스 드래그: mousedown → mousemove (계수 1.4) → mouseup/mouseleave 종료
 * - 트랙패드/휠: 세로 스크롤 보다 큰 deltaY → scrollLeft += deltaY (가로 변환)
 * - 키보드: ArrowLeft/Right → 300px smooth 스크롤
 *
 * 접근성: prefers-reduced-motion 사용자도 드래그 자체는 가능 (motion 효과 아닌
 * 직접 조작). smooth behavior 만 키보드 화살표에 한정.
 */
export function TimelineInteractions() {
  useEffect(() => {
    const tl = document.getElementById("tl-scroll");
    if (!tl) return;

    let isDown = false;
    let startX = 0;
    let scrollL = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      tl.classList.add("dragging");
      startX = e.pageX - tl.offsetLeft;
      scrollL = tl.scrollLeft;
    };

    const onUp = () => {
      isDown = false;
      tl.classList.remove("dragging");
    };

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - tl.offsetLeft;
      tl.scrollLeft = scrollL - (x - startX) * 1.4;
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        tl.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") tl.scrollBy({ left: 300, behavior: "smooth" });
      if (e.key === "ArrowLeft") tl.scrollBy({ left: -300, behavior: "smooth" });
    };

    tl.addEventListener("mousedown", onDown);
    tl.addEventListener("mouseup", onUp);
    tl.addEventListener("mouseleave", onUp);
    tl.addEventListener("mousemove", onMove);
    tl.addEventListener("wheel", onWheel, { passive: false });
    tl.addEventListener("keydown", onKey);

    return () => {
      tl.removeEventListener("mousedown", onDown);
      tl.removeEventListener("mouseup", onUp);
      tl.removeEventListener("mouseleave", onUp);
      tl.removeEventListener("mousemove", onMove);
      tl.removeEventListener("wheel", onWheel);
      tl.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
