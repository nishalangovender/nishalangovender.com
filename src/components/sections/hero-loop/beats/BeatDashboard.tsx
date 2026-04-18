// src/components/sections/hero-loop/beats/BeatDashboard.tsx
"use client";

import type { BeatProps } from "../types";

export function BeatDashboard({ progress, active }: BeatProps) {
  if (!active) return null;
  // Progress is guaranteed [0,1] for this beat's window.
  void progress;
  return null;
}
