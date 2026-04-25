"use client";

import { useEffect } from "react";

/**
 * Landing 페이지 (`/`) 의 vanilla JS 모션 효과 React 포팅 — 번들 1:1.
 *
 * 번들 Landing-A-Light.html `<script>` 블록 중 markup 의존성 없이 글로벌
 * data-* 속성으로 동작하는 7개 효과를 마운트 시점에 일괄 등록.
 *
 * 1. Word-level reveal (data-chars) — 단어별 fade, 한글 word-break 보존
 * 2. Fade reveal (data-reveal[+data-reveal-delay])
 * 3. Mask reveal (data-mask[+data-mask-delay]) + Hero failsafe
 * 4. Magnetic CTA (data-magnetic) — easing loop 적용
 * 5. Hero headline scale (.hero-headline) — scrollY 따라 미세 변환
 * 6. CountUp ([data-count-root] [data-count])
 * 7. Smooth anchor scroll (a[href^="#"])
 *
 * Nav scroll state 는 Nav.tsx 가 자체 처리 → 여기 미포함.
 *
 * 디자인 제약: 번들 동작 그대로 → DOM/마크업/CSS 변경 0. data-* 속성과
 * .in/.scrolled 등 CSS 셀렉터에만 의존.
 *
 * 접근성: prefers-reduced-motion=reduce 사용자에게는
 * - reveal/mask/chars: 즉시 .in 부여 (애니메이션 스킵, 콘텐츠 노출 보장)
 * - magnetic/scale/countup: skip 처리
 * - smooth anchor: behavior:auto 즉시 점프
 */
export function LandingMotion() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const cleanups: Array<() => void> = [];

    // ── 1. Word-level reveal (data-chars) ─────────────────────────
    let globalIdx = 0;
    document.querySelectorAll<HTMLElement>("[data-chars]").forEach((el) => {
      const text = el.textContent ?? "";
      const amberAttr = el.dataset.amber ?? "";
      const amberSet = new Set(amberAttr.split(/\s+/).filter(Boolean));
      el.textContent = "";
      const parts = text.split(/(\s+)/);
      parts.forEach((part) => {
        if (part.length === 0) return;
        if (/^\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
        } else {
          const w = document.createElement("span");
          w.className = "word";
          if (amberSet.has(part)) w.classList.add("amber");
          w.textContent = part;
          w.style.transitionDelay = globalIdx++ * 90 + "ms";
          el.appendChild(w);
        }
      });
    });
    const charsIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target
              .querySelectorAll<HTMLElement>(".word")
              .forEach((w) => w.classList.add("in"));
            charsIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll<HTMLElement>("[data-chars]").forEach((el) => {
      if (reduce) {
        el.querySelectorAll<HTMLElement>(".word").forEach((w) =>
          w.classList.add("in")
        );
      } else {
        charsIO.observe(el);
      }
    });
    cleanups.push(() => charsIO.disconnect());

    // ── 2. Fade reveal (data-reveal) ──────────────────────────────
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const t = e.target as HTMLElement;
            const d = parseInt(t.dataset.revealDelay ?? "0", 10);
            window.setTimeout(() => t.classList.add("in"), d);
            revealIO.unobserve(t);
          }
        });
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (reduce) el.classList.add("in");
      else revealIO.observe(el);
    });
    cleanups.push(() => revealIO.disconnect());

    // ── 3. Mask reveal (data-mask) ────────────────────────────────
    const maskIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const t = e.target as HTMLElement;
            const d = parseInt(t.dataset.maskDelay ?? "0", 10);
            window.setTimeout(() => t.classList.add("in"), d);
            maskIO.unobserve(t);
          }
        });
      },
      { threshold: 0.05 }
    );
    document.querySelectorAll<HTMLElement>("[data-mask]").forEach((el) => {
      if (reduce) el.classList.add("in");
      else maskIO.observe(el);
    });
    cleanups.push(() => maskIO.disconnect());

    // Hero failsafe — 첫 paint 시점 viewport 안에 있으면 강제 노출.
    const onLoad = () => {
      requestAnimationFrame(() => {
        document
          .querySelectorAll<HTMLElement>(".hero [data-mask]")
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && !el.classList.contains("in")) {
              el.classList.add("in");
            }
          });
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    cleanups.push(() => window.removeEventListener("load", onLoad));

    // ── 4. Magnetic CTA (data-magnetic) ───────────────────────────
    if (!reduce) {
      document
        .querySelectorAll<HTMLElement>("[data-magnetic]")
        .forEach((el) => {
          let rx = 0;
          let ry = 0;
          let tx = 0;
          let ty = 0;
          let raf: number | null = null;
          const loop = () => {
            tx += (rx - tx) * 0.18;
            ty += (ry - ty) * 0.18;
            el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
            if (Math.abs(rx - tx) > 0.1 || Math.abs(ry - ty) > 0.1) {
              raf = requestAnimationFrame(loop);
            } else {
              raf = null;
            }
          };
          const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const mx = e.clientX - (r.left + r.width / 2);
            const my = e.clientY - (r.top + r.height / 2);
            rx = mx * 0.22;
            ry = my * 0.22;
            if (raf === null) raf = requestAnimationFrame(loop);
          };
          const onLeave = () => {
            rx = 0;
            ry = 0;
            if (raf === null) raf = requestAnimationFrame(loop);
          };
          el.addEventListener("mousemove", onMove);
          el.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            if (raf !== null) cancelAnimationFrame(raf);
            el.style.transform = "";
          });
        });
    }

    // ── 5. Hero headline scale on scroll ──────────────────────────
    if (!reduce) {
      const h = document.querySelector<HTMLElement>(".hero-headline");
      if (h) {
        let ticking = false;
        const update = () => {
          const y = window.scrollY;
          const t = Math.max(0, Math.min(1, y / 500));
          h.style.transform = `translateY(${(t * 10).toFixed(1)}px)`;
          h.style.letterSpacing = `${(-0.025 - t * 0.005).toFixed(4)}em`;
          ticking = false;
        };
        const onScroll = () => {
          if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
          }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => {
          window.removeEventListener("scroll", onScroll);
          h.style.transform = "";
          h.style.letterSpacing = "";
        });
      }
    }

    // ── 6. CountUp (data-count-root → data-count) ─────────────────
    const countRoot = document.querySelector<HTMLElement>("[data-count-root]");
    if (countRoot) {
      const run = () => {
        countRoot
          .querySelectorAll<HTMLElement>("[data-count]")
          .forEach((el) => {
            const raw = el.dataset.count ?? "0";
            const target = parseFloat(raw);
            const suffix = el.dataset.suffix ?? "";
            const decimals = (raw.split(".")[1] ?? "").length;
            if (reduce) {
              el.textContent = target.toFixed(decimals) + suffix;
              return;
            }
            const dur = 1400;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              const v = target * eased;
              el.textContent = v.toFixed(decimals) + suffix;
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
      };
      const countIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              run();
              countIO.unobserve(countRoot);
            }
          });
        },
        { threshold: 0.35 }
      );
      countIO.observe(countRoot);
      cleanups.push(() => countIO.disconnect());
    }

    // ── 7. Smooth anchor scroll ────────────────────────────────────
    const anchorHandlers: Array<{ el: HTMLAnchorElement; fn: (e: Event) => void }> = [];
    document
      .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
      .forEach((a) => {
        const fn = (e: Event) => {
          const id = a.getAttribute("href");
          if (!id || id === "#") return;
          const t = document.querySelector(id);
          if (!t) return;
          e.preventDefault();
          (t as HTMLElement).scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        };
        a.addEventListener("click", fn);
        anchorHandlers.push({ el: a, fn });
      });
    cleanups.push(() => {
      anchorHandlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
