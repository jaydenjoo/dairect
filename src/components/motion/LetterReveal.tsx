"use client";

import { motion } from "framer-motion";
import { letterContainer, letterChild, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  mode?: "word" | "char";
  threshold?: number;
};

export function LetterReveal({ text, className, mode = "word", threshold = 0.2 }: Props) {
  const { ref, inView } = useReveal<HTMLSpanElement>(threshold);
  const tokens = mode === "char" ? Array.from(text) : text.split(/(\s+)/);

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      variants={letterContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          <span key={i}>{token}</span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            variants={letterChild}
            style={{ willChange: "transform, opacity" }}
          >
            {token}
          </motion.span>
        ),
      )}
    </motion.span>
  );
}
