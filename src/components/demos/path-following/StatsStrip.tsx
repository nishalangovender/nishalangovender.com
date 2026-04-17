// src/components/demos/path-following/StatsStrip.tsx
"use client";

import type { SimFrame, SimStats } from "@/lib/path-following/types";

interface Props {
  latest: SimFrame | null;
  stats: SimStats;
}

export function StatsStrip({ latest, stats }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded border border-border bg-surface px-4 py-2 font-mono text-xs"
    >
      <Metric label="t" value={latest ? `${latest.t.toFixed(1)}s` : "—"} />
      <Metric label="μ error" value={`${stats.meanError.toFixed(2)} m`} />
      <Metric label="max" value={`${stats.maxError.toFixed(2)} m`} />
      <Metric label="rejected" value={`${stats.outliersRejected}`} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-muted uppercase tracking-widest mr-2">{label}</span>
      <span>{value}</span>
    </span>
  );
}
