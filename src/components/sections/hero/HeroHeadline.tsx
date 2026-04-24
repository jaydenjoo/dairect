"use client";

import { motion } from "framer-motion";
import { letterContainer, letterChild, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

const line1Words = ["머릿속", "아이디어를"];
const line2Words = ["진짜로", "만들어드립니다."];

export function HeroHeadline() {
  const { ref, inView } = useReveal<HTMLHeadingElement>(0.15);

  return (
    <motion.h1
      ref={ref}
      className={cn(
        "font-ko font-black text-[clamp(36px,4.4vw,64px)] leading-[1.08] tracking-tight-3 text-ink m-0",
      )}
      variants={letterContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <span className="block">
        {line1Words.map((word, i) => (
          <motion.span key={`l1-${i}`} variants={letterChild} className="inline-block">
            {word}
            {i < line1Words.length - 1 && <span>&nbsp;</span>}
          </motion.span>
        ))}
      </span>
      <span className="block">
        {line2Words.map((word, i) => (
          <motion.span
            key={`l2-${i}`}
            variants={letterChild}
            className={cn(
              "inline-block",
              word === "진짜로" && "text-signal",
            )}
          >
            {word}
            {i < line2Words.length - 1 && <span>&nbsp;</span>}
          </motion.span>
        ))}
      </span>
    </motion.h1>
  );
}
