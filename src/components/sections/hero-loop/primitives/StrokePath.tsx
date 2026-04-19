"use client";

import { motion } from "framer-motion";

interface StrokePathProps {
  /** The SVG path d-attribute. */
  d: string;
  /** Progress in [0,1] for this path's reveal. */
  progress: number;
  /** Stroke colour — defaults to currentColor. */
  stroke?: string;
  strokeWidth?: number;
}

/** Reveals a <path> by animating its pathLength from 0 → 1. */
export function StrokePath({ d, progress, stroke = "currentColor", strokeWidth = 1.75 }: StrokePathProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      pathLength={clamped}
      style={{ pathLength: clamped }}
      initial={false}
      animate={{ pathLength: clamped }}
      transition={{ duration: 0 }}
    />
  );
}
