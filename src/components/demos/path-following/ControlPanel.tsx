// src/components/demos/path-following/ControlPanel.tsx
"use client";

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
  onConfig: (patch: Partial<SimConfig>) => void;
  onLayers: (patch: Partial<Layers>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onOpenCharts: () => void;
}

const PATH_OPTIONS: { value: PathKind; label: string }[] = [
  { value: "lemniscate", label: "Lemniscate" },
  { value: "circle", label: "Circle" },
  { value: "figure-eight", label: "Figure-8" },
];

export function ControlPanel({
  config,
  layers,
  isPlaying,
  onConfig,
  onLayers,
  onPlayPause,
  onReset,
  onOpenCharts,
}: Props) {
  return (
    <aside className="flex flex-col gap-6 text-sm">
      <section>
        <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
          Simulation
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPlayPause}
            className="flex-1 rounded border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
          >
            Reset
          </button>
        </div>
      </section>

      <section>
        <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
          Path
        </div>
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
      </section>

      <section>
        <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
          Sensors
        </div>
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
      </section>

      <section>
        <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
          Filter
        </div>
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
      </section>

      <section>
        <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">
          Layers
        </div>
        <Toggle label="Reference" checked={layers.reference} onChange={(v) => onLayers({ reference: v })} />
        <Toggle label="Truth" checked={layers.truth} onChange={(v) => onLayers({ truth: v })} />
        <Toggle label="Estimate" checked={layers.estimate} onChange={(v) => onLayers({ estimate: v })} />
        <Toggle label="GPS fixes" checked={layers.gps} onChange={(v) => onLayers({ gps: v })} />
        <Toggle label="Outliers" checked={layers.outliers} onChange={(v) => onLayers({ outliers: v })} />
      </section>

      <button
        type="button"
        onClick={onOpenCharts}
        className="rounded border border-border bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
      >
        Open Charts ↗
      </button>
    </aside>
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
    <label className="flex flex-col gap-1 py-1">
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
    <label className="flex items-center gap-2 py-1 cursor-pointer">
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
