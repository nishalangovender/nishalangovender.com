// src/components/demos/path-following/ControlPanel.tsx
"use client";

import type { ReactNode } from "react";

import type { PathKind, SimConfig } from "@/lib/path-following/types";

export interface Layers {
  reference: boolean;
  truth: boolean;
  estimate: boolean;
  gps: boolean;
  outliers: boolean;
}

interface Props {
  config: SimConfig;
  layers: Layers;
  isPlaying: boolean;
  isComplete: boolean;
  onConfig: (patch: Partial<SimConfig>) => void;
  onLayers: (patch: Partial<Layers>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onOpenCharts: () => void;
}

const PATH_OPTIONS: { value: PathKind; label: string }[] = [
  { value: "lemniscate", label: "Lemniscate" },
  { value: "circle", label: "Circle" },
  { value: "stadium", label: "Stadium" },
];

export function ControlPanel({
  config,
  layers,
  isPlaying,
  isComplete,
  onConfig,
  onLayers,
  onPlayPause,
  onReset,
  onOpenCharts,
}: Props) {
  const playLabel = isComplete ? "Restart" : isPlaying ? "Pause" : "Play";
  return (
    <aside className="h-full rounded-lg border border-border bg-surface text-sm overflow-hidden flex flex-col">
      <Section label="Simulation">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPlayPause}
            className="flex-1 rounded border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
          >
            {playLabel}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
          >
            Reset
          </button>
        </div>
      </Section>

      <Section label="Path">
        <div className="flex flex-col gap-1">
          {PATH_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="path"
                value={opt.value}
                checked={config.path === opt.value}
                onChange={() => onConfig({ path: opt.value })}
                className="accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Section>

      <Section label="Sensors">
        <Slider
          label="GPS σ"
          value={config.gpsNoiseSigma}
          min={0}
          max={2}
          step={0.05}
          unit="m"
          onChange={(v) => onConfig({ gpsNoiseSigma: v })}
        />
        <Slider
          label="IMU σ"
          value={config.imuNoiseSigma}
          min={0}
          max={0.05}
          step={0.001}
          unit="rad/s"
          onChange={(v) => onConfig({ imuNoiseSigma: v })}
        />
      </Section>

      <Section label="Filter">
        <Toggle
          label="κ-adaptive EKF"
          checked={config.useCurvatureAdaptiveEkf}
          onChange={(v) => onConfig({ useCurvatureAdaptiveEkf: v })}
        />
        <Toggle
          label="Outlier rejection"
          checked={config.useMahalanobisRejection}
          onChange={(v) => onConfig({ useMahalanobisRejection: v })}
        />
      </Section>

      <Section label="Layers" last>
        <Toggle label="Reference" checked={layers.reference} onChange={(v) => onLayers({ reference: v })} />
        <Toggle label="Truth" checked={layers.truth} onChange={(v) => onLayers({ truth: v })} />
        <Toggle label="Estimate" checked={layers.estimate} onChange={(v) => onLayers({ estimate: v })} />
        <Toggle label="GPS fixes" checked={layers.gps} onChange={(v) => onLayers({ gps: v })} />
        <Toggle label="Outliers" checked={layers.outliers} onChange={(v) => onLayers({ outliers: v })} />
        <button
          type="button"
          onClick={onOpenCharts}
          className="w-full mt-2 rounded border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
        >
          Open Charts ↗
        </button>
      </Section>
    </aside>
  );
}

function Section({
  label,
  last,
  children,
}: {
  label: string;
  last?: boolean;
  children: ReactNode;
}) {
  // On mobile/short viewports, shrink to content. On tall viewports, each
  // section gets an equal vertical slice so the panel fills the column.
  const base = "px-3 py-2 lg:flex-1 lg:flex lg:flex-col lg:justify-center";
  return (
    <section className={last ? base : `${base} border-b border-border`}>
      <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1.5">
        {label}
      </div>
      {children}
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5 py-0.5">
      <div className="flex justify-between font-mono text-xs text-muted">
        <span>{label}</span>
        <span>
          {value.toFixed(step < 0.01 ? 3 : 2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-accent"
        aria-label={label}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}
