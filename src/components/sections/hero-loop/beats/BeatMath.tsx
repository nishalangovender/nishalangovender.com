// src/components/sections/hero-loop/beats/BeatMath.tsx
"use client";

import type { BeatProps } from "../types";

export function BeatMath({ progress, active }: BeatProps) {
  if (!active) return null;
  // Progress is guaranteed [0,1] for this beat's window.
  void progress;
  return null;
}
