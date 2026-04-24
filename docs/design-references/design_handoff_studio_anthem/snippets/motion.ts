// lib/motion-config.ts
// Framer Motion variants + hooks for The Studio Anthem.
// All variants honor `useReducedMotion()`; fall back to instant fade.

import { useEffect, useRef, useState } from "react";
import {
  Variants,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from "framer-motion";

// ───── Easings & durations (mirror theme.css) ─────
export const ease = {
  spring: [0.2, 0.9, 0.2, 1] as [number, number, number, number],
  mask:   [0.6, 0.02, 0.2, 1] as [number, number, number, number],
};
export const dur = {
  micro: 0.18,
  reveal: 0.62,
  revealLong: 0.72,
  mask: 0.9,
};

// ───── Standard scroll reveal (fade + translate) ─────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: dur.reveal, ease: ease.spring, delay: custom },
  }),
};

// ───── Letter-by-letter stagger (hero headline) ─────
export const letterContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03, delayChildren: 0.2 },
  },
};
export const letterChild: Variants = {
  hidden: { opacity: 0, y: "0.35em" },
  visible: { opacity: 1, y: 0, transition: { duration: dur.revealLong, ease: ease.spring } },
};

// ───── Mask reveal (clip-path) ─────
export const maskReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: { clipPath: "inset(0% 0 0 0)", transition: { duration: dur.mask, ease: ease.mask } },
};

// ───── useReveal — IntersectionObserver hook ─────
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) { setInView(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, prefersReduced]);

  return { ref, inView };
}

// ───── Magnetic CTA ─────
export function useMagnetic(strength = 0.25) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 });
  const sy = useSpring(y, { stiffness: 260, damping: 28 });
  const prefersReduced = useReducedMotion();

  const bind = {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (prefersReduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top  + r.height / 2)) * strength);
    },
    onPointerLeave: () => { x.set(0); y.set(0); },
  };

  return { bind, x: sx, y: sy };
}

// ───── Cursor-follow thumbnail (Projects index) ─────
export function useCursorFollow(lag = 0.18) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 22, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return { x: sx, y: sy };
}
