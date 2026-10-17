"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Wipes a large media block into view (clip + slight scale) the first time it enters the viewport. */
export function CinematicReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(8% 6% 8% 6%)", scale: 0.97, opacity: 0.4 }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
