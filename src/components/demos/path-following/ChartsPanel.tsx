// src/components/demos/path-following/ChartsPanel.tsx
"use client";

import type { SimFrame } from "@/lib/path-following/types";

import { StripChart } from "./StripChart";

interface Props {
  frames: SimFrame[];
}

export function ChartsPanel({ frames }: Props) {
  const errors = frames.map((f) => f.trackingError);
  const biases = frames.map((f) => f.estimate.gyroBias);
  const residuals = frames
    .filter((f) => f.lastGpsFix)
    .map((f) =>
      Math.hypot(
        f.lastGpsFix!.x - f.estimate.x,
        f.lastGpsFix!.y - f.estimate.y,
      ),
    );

  return (
    <aside className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="px-3 py-2 border-b border-border font-mono text-[10px] tracking-wider uppercase text-muted">
        Filter Diagnostics
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
        <StripChart
          values={errors}
          label="Tracking error"
          unit="m"
          yMin={0}
          color="var(--foreground)"
        />
        <StripChart
          values={biases}
          label="Gyro bias estimate"
          unit="rad/s"
          color="var(--accent)"
        />
        <StripChart
          values={residuals}
          label="GPS residual"
          unit="m"
          yMin={0}
          threshold={1.5}
          color="var(--accent-dark)"
        />
      </div>
    </aside>
  );
}
