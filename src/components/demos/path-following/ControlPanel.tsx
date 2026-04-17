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
  chartsOpen: boolean;
  onConfig: (patch: Partial<SimConfig>) => void;
  onLayers: (patch: Partial<Layers>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onToggleCharts: () => void;
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
  chartsOpen,
  onConfig,
  onLayers,
  onPlayPause,
  onReset,
  onToggleCharts,
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
        <div role="radiogroup" aria-label="Path" className="flex flex-col gap-1.5 items-start">
          {PATH_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              active={config.path === opt.value}
              role="radio"
              ariaChecked={config.path === opt.value}
              onClick={() => onConfig({ path: opt.value })}
            >
              {opt.label}
            </Pill>
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
        <div className="flex flex-wrap gap-1.5">
          <Pill
            active={config.useCurvatureAdaptiveEkf}
            ariaPressed={config.useCurvatureAdaptiveEkf}
            onClick={() =>
              onConfig({
                useCurvatureAdaptiveEkf: !config.useCurvatureAdaptiveEkf,
              })
            }
          >
            κ-adaptive EKF
          </Pill>
          <Pill
            active={config.useMahalanobisRejection}
            ariaPressed={config.useMahalanobisRejection}
            onClick={() =>
              onConfig({
                useMahalanobisRejection: !config.useMahalanobisRejection,
              })
            }
          >
            Outlier rejection
          </Pill>
        </div>
      </Section>

      <Section label="Layers" last>
        <div className="flex flex-wrap gap-1.5">
          <Pill
            active={layers.reference}
            ariaPressed={layers.reference}
            onClick={() => onLayers({ reference: !layers.reference })}
          >
            Reference
          </Pill>
          <Pill
            active={layers.truth}
            ariaPressed={layers.truth}
            onClick={() => onLayers({ truth: !layers.truth })}
          >
            Truth
          </Pill>
          <Pill
            active={layers.estimate}
            ariaPressed={layers.estimate}
            onClick={() => onLayers({ estimate: !layers.estimate })}
          >
            Estimate
          </Pill>
          <Pill
            active={layers.gps}
            ariaPressed={layers.gps}
            onClick={() => onLayers({ gps: !layers.gps })}
          >
            GPS fixes
          </Pill>
          <Pill
            active={layers.outliers}
            ariaPressed={layers.outliers}
            onClick={() => onLayers({ outliers: !layers.outliers })}
          >
            Outliers
          </Pill>
        </div>
        <button
          type="button"
          onClick={onToggleCharts}
          aria-pressed={chartsOpen}
          className="w-full mt-3 rounded border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
        >
          {chartsOpen ? "Hide Charts" : "Show Charts"}
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
  // Content sits at the top of each slice so the section label + its pills
  // stay anchored together — empty stretch happens below the content.
  const base = "px-3 py-3 lg:flex-1";
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

function Pill({
  active,
  onClick,
  role = "button",
  ariaPressed,
  ariaChecked,
  children,
}: {
  active: boolean;
  onClick: () => void;
  role?: "button" | "radio";
  ariaPressed?: boolean;
  ariaChecked?: boolean;
  children: ReactNode;
}) {
  const base =
    "font-mono text-[10px] tracking-wider uppercase rounded-full border px-2.5 py-1 transition-colors cursor-pointer";
  const state = active
    ? "border-accent bg-accent-light text-accent"
    : "border-border bg-background text-muted hover:border-accent/60 hover:text-foreground";
  return (
    <button
      type="button"
      role={role}
      aria-pressed={ariaPressed}
      aria-checked={ariaChecked}
      onClick={onClick}
      className={`${base} ${state}`}
    >
      {children}
    </button>
  );
}
