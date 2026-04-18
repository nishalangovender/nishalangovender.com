// src/components/sections/hero-loop/beats/BeatLift.tsx
"use client";

import type { BeatProps } from "../types";

export function BeatLift({ progress, active }: BeatProps) {
  if (!active) return null;
  // Progress is guaranteed [0,1] for this beat's window.
  void progress;
  return null;
}
