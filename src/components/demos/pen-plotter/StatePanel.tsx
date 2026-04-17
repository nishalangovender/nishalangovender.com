// src/components/demos/pen-plotter/StatePanel.tsx
"use client";

import type { SimFrame } from "@/lib/pen-plotter/types";

interface Props {
  latest: SimFrame | null;
}

export function StatePanel({ latest }: Props) {
  const fw = latest?.firmware;
  return (
    <div className="flex flex-col border border-border rounded bg-surface h-full min-h-0">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted px-3 py-2 border-b border-border">
        Firmware State
      </div>
      <div className="flex-1 p-3 font-mono text-[11px] text-foreground grid grid-cols-[6rem_1fr] gap-y-1">
        <Row label="θ_steps" value={fw ? String(fw.thetaSteps) : "—"} />
        <Row label="target" value={fw ? String(fw.thetaTargetSteps) : "—"} />
        <Row label="adc" value={fw ? `${Math.round(fw.adc)} / 834` : "—"} />
        <Row label="adc_tgt" value={fw ? String(fw.adcTarget) : "—"} />
        <Row label="pen" value={fw ? fw.pen : "—"} />
        <Row label="status" value={fw ? fw.status : "—"} />
        <div className="col-span-2 mt-2 text-[10px] uppercase tracking-widest text-muted">
          Derived
        </div>
        <Row label="θ" value={latest ? `${((latest.theta * 180) / Math.PI).toFixed(1)}°` : "—"} />
        <Row label="r" value={latest ? `${latest.r.toFixed(1)} mm` : "—"} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="text-muted">{label}</div>
      <div className="text-foreground">{value}</div>
    </>
  );
}
