// src/components/demos/pen-plotter/AdcStripChart.tsx
"use client";

import { HW, type SimFrame } from "@/lib/pen-plotter/types";

interface Props {
  latest: SimFrame | null;
}

const W = 280;
const H = 110;
const PAD = 8;

export function AdcStripChart({ latest }: Props) {
  const history = latest?.adcHistory ?? [];
  const target = latest?.firmware.adcTarget ?? 0;

  const t0 = history.length > 0 ? history[0].t : 0;
  const t1 = history.length > 0 ? history[history.length - 1].t : 1;
  const tSpan = Math.max(t1 - t0, 0.001);

  const adcMin = 0;
  const adcMax = HW.ADC_RANGE;
  const x = (t: number) => PAD + ((t - t0) / tSpan) * (W - 2 * PAD);
  const y = (adc: number) => PAD + (1 - (adc - adcMin) / (adcMax - adcMin)) * (H - 2 * PAD);

  const tracePath = history.length
    ? history
        .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.t).toFixed(1)} ${y(p.adc).toFixed(1)}`)
        .join(" ")
    : "";
  const targetY = y(target);
  const bandTop = y(target + HW.ADC_TOLERANCE);
  const bandBot = y(target - HW.ADC_TOLERANCE);

  return (
    <div className="flex flex-col border border-border rounded bg-surface h-full min-h-0">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted px-3 py-2 border-b border-border">
        ADC Feedback — target ± {HW.ADC_TOLERANCE}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[160px]">
          <rect
            x={PAD}
            y={PAD}
            width={W - 2 * PAD}
            height={H - 2 * PAD}
            fill="transparent"
            className="text-border"
            stroke="currentColor"
          />
          {/* tolerance band — dashed red, matches path-following threshold convention */}
          <rect
            x={PAD}
            y={bandTop}
            width={W - 2 * PAD}
            height={Math.max(0, bandBot - bandTop)}
            fill="rgba(239, 68, 68, 0.12)"
          />
          <line
            x1={PAD}
            y1={targetY}
            x2={W - PAD}
            y2={targetY}
            stroke="rgba(239, 68, 68, 0.6)"
            strokeDasharray="3 2"
            strokeWidth={1}
          />
          {tracePath && (
            <path
              d={tracePath}
              fill="none"
              className="text-accent"
              stroke="currentColor"
              strokeWidth={1.3}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
