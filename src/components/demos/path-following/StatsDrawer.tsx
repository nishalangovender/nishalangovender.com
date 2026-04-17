// src/components/demos/path-following/StatsDrawer.tsx
"use client";

import type { SimFrame } from "@/lib/path-following/types";

import { StripChart } from "./StripChart";

interface Props {
  frames: SimFrame[];
  open: boolean;
  onClose: () => void;
}

export function StatsDrawer({ frames, open, onClose }: Props) {
  if (!open) return null;

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
    <div
      role="dialog"
      aria-label="Filter diagnostics"
      className="fixed inset-0 z-40 flex items-stretch justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full bg-background border-l border-border p-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
            Filter Diagnostics
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs uppercase text-muted hover:text-accent"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <StripChart
            values={errors}
            label="Tracking error"
            unit="m"
            yMin={0}
            color="#FAFAFA"
          />
          <StripChart
            values={biases}
            label="Gyro bias estimate"
            unit="rad/s"
            color="#3B82F6"
          />
          <StripChart
            values={residuals}
            label="GPS residual"
            unit="m"
            yMin={0}
            threshold={1.5}
            color="#60a5fa"
          />
        </div>
      </div>
    </div>
  );
}
