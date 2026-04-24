"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { maskReveal, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  threshold?: number;
};

export function MaskReveal({ children, className, threshold = 0.2 }: Props) {
  const { ref, inView } = useReveal<HTMLDivElement>(threshold);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={maskReveal}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}
