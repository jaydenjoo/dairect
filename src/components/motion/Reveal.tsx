"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
};

export function Reveal({ children, className, delay = 0, threshold = 0.15 }: Props) {
  const { ref, inView } = useReveal<HTMLDivElement>(threshold);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
