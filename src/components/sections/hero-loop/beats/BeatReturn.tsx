// src/components/sections/hero-loop/beats/BeatReturn.tsx
"use client";

import type { BeatProps } from "../types";

export function BeatReturn({ progress, active }: BeatProps) {
  if (!active) return null;
  // Progress is guaranteed [0,1] for this beat's window.
  void progress;
  return null;
}
