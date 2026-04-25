"use client";

import { useEffect, useRef } from "react";

/**
 * /projects 페이지의 4가지 vanilla JS 인터랙션 React 포팅.
 *
 * 번들 Projects.html `<script>` 블록의 다음 4개를 React 마운트 시점에 연결:
 * 1. Filter tabs ─ `.p-filter[data-filter]` 클릭 시 `.p-row[data-cat]` 토글 (`.p-row-hide`)
 * 2. Cursor-follow thumbnail ─ `.p-row` mouseenter/move/leave 시 `#cursor-thumb` 위치/내용 갱신
 * 3. Back to top ─ scrollY > 800 시 `.back-to-top.visible`, 클릭 시 smooth top
 * 4. (Magnetic CTA는 Nav 등에서 재사용 → 여기 미포함)
 *
 * 디자인 제약: DOM 마크업은 server component (ProjectsIndex.tsx)가 그대로 책임.
 * 본 client wrapper는 이벤트 리스너만 부착 → 시각/구조 변경 0.
 *
 * 접근성: prefers-reduced-motion 시 cursor-thumb 비활성화 (animation 의존).
 * filter/back-to-top 은 motion 무관 → 항상 동작.
 */
export function ProjectsInteractions() {
  // back-to-top 의 button click handler 가 unmount 시 leak 되지 않도록 ref 보존
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ── 1. Filter tabs ─────────────────────────────
    const tabs = document.querySelectorAll<HTMLElement>(".p-filter");
    const rows = document.querySelectorAll<HTMLElement>(".p-row");
    if (tabs.length > 0) {
      const onTabClick = (e: Event) => {
        const t = e.currentTarget as HTMLElement;
        tabs.forEach((x) => x.setAttribute("aria-pressed", "false"));
        t.setAttribute("aria-pressed", "true");
        const f = t.dataset.filter;
        rows.forEach((r) => {
          if (f === "all" || r.dataset.cat === f) {
            r.classList.remove("p-row-hide");
          } else {
            r.classList.add("p-row-hide");
          }
        });
      };
      tabs.forEach((t) => {
        // 초기 aria-pressed 정합성 (첫 번째만 pressed=true, 나머지 false)
        if (!t.getAttribute("aria-pressed")) {
          t.setAttribute(
            "aria-pressed",
            t.dataset.filter === "all" ? "true" : "false"
          );
        }
        t.addEventListener("click", onTabClick);
      });
      cleanups.push(() => {
        tabs.forEach((t) => t.removeEventListener("click", onTabClick));
      });
    }

    // ── 2. Cursor-follow thumbnail ─────────────────
    if (!reduceMotion) {
      const thumb = document.getElementById("cursor-thumb");
      const nameEl = document.getElementById("pct-name");
      const idEl = document.getElementById("pct-id");
      const catEl = document.getElementById("pct-cat");
      if (thumb && nameEl && idEl && catEl && rows.length > 0) {
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let raf: number | null = null;
        const loop = () => {
          cx += (tx - cx) * 0.18;
          cy += (ty - cy) * 0.18;
          thumb.style.left = cx + "px";
          thumb.style.top = cy + "px";
          raf = requestAnimationFrame(loop);
        };
        const onEnter = (e: Event) => {
          const r = e.currentTarget as HTMLElement;
          const en = r.querySelector(".pr-title .en")?.textContent ?? "";
          // 번들 동작: 이름을 절반으로 잘라 뒤쪽을 amber 처리.
          const half = Math.ceil(en.length / 2);
          nameEl.textContent = "";
          const head = document.createTextNode(en.substring(0, half));
          const tail = document.createElement("span");
          tail.className = "amber";
          tail.textContent = en.substring(half);
          nameEl.appendChild(head);
          nameEl.appendChild(tail);
          const numText = (
            r.querySelector(".pr-num")?.textContent ?? ""
          )
            .replace(/\s+/g, " ")
            .trim();
          idEl.textContent = numText.replace(
            " / 10",
            " / " + (r.dataset.year ?? "—")
          );
          catEl.textContent = r.dataset.meta ?? "—";
          thumb.classList.add("active");
          if (raf === null) raf = requestAnimationFrame(loop);
        };
        const onLeave = () => {
          thumb.classList.remove("active");
        };
        const onMove = (e: Event) => {
          const me = e as MouseEvent;
          tx = me.clientX + 40;
          ty = me.clientY;
        };
        rows.forEach((r) => {
          r.addEventListener("mouseenter", onEnter);
          r.addEventListener("mouseleave", onLeave);
          r.addEventListener("mousemove", onMove);
        });
        cleanups.push(() => {
          if (raf !== null) cancelAnimationFrame(raf);
          rows.forEach((r) => {
            r.removeEventListener("mouseenter", onEnter);
            r.removeEventListener("mouseleave", onLeave);
            r.removeEventListener("mousemove", onMove);
          });
        });
      }
    }

    // ── 3. Back to top ─────────────────────────────
    const btn = document.getElementById("back-to-top");
    if (btn) {
      const onScroll = () => {
        if (window.scrollY > 800) btn.classList.add("visible");
        else btn.classList.remove("visible");
      };
      const onClick = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      btn.addEventListener("click", onClick);
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        btn.removeEventListener("click", onClick);
      });
    }

    cleanupRef.current = () => cleanups.forEach((c) => c());
    return () => cleanupRef.current?.();
  }, []);

  return null;
}
