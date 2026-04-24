"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useMagnetic } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function MagneticCTA({ children, className, strength = 0.25 }: Props) {
  const { bind, x, y } = useMagnetic(strength);

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ x, y }}
      {...bind}
    >
      {children}
    </motion.div>
  );
}
