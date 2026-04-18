// src/components/demos/pen-plotter/ControlPanel.tsx
"use client";

import type { ReactNode } from "react";

import type { PresetId, SimConfig } from "@/lib/pen-plotter/types";

interface Props {
  config: SimConfig;
  isPlaying: boolean;
  isComplete: boolean;
  drawerOpen: boolean;
  onConfig: (patch: Partial<SimConfig>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onToggleDrawer: () => void;
  onClearDrawn: () => void;
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "star", label: "Star" },
  { id: "spiral", label: "Spiral" },
  { id: "rose", label: "Rose" },
  { id: "rounded-rect", label: "Rounded Rect" },
];

export function ControlPanel({
  config,
  isPlaying,
  isComplete,
  drawerOpen,
  onConfig,
  onPlayPause,
  onReset,
  onToggleDrawer,
  onClearDrawn,
}: Props) {
  const inactive =
    "border-border bg-background text-foreground hover:border-accent hover:text-accent";
  const active = "border-accent bg-accent-light text-accent";

  return (
    <aside className="h-full rounded-lg border border-border bg-surface text-foreground overflow-hidden flex flex-col">
      <Section label="Simulation">
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${inactive}`}
            onClick={onPlayPause}
          >
            {isComplete ? "Restart" : isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${inactive}`}
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </Section>

      <Section label="Source">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${
                config.source === "preset" ? active : inactive
              }`}
              onClick={() => onConfig({ source: "preset" })}
            >
              Preset
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${
                config.source === "draw" ? active : inactive
              }`}
              onClick={() => onConfig({ source: "draw" })}
            >
              Draw
            </button>
          </div>

          {config.source === "preset" && (
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onConfig({ preset: p.id })}
                  className={`px-2 py-1 rounded border font-mono text-xs ${
                    config.preset === p.id ? active : inactive
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {config.source === "draw" && (
            <button
              type="button"
              className={`px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${inactive}`}
              onClick={onClearDrawn}
            >
              Clear Points
            </button>
          )}
        </div>
      </Section>

      <Section label={`Speed — ${config.speed.toFixed(1)}×`}>
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.1}
          value={config.speed}
          onChange={(e) => onConfig({ speed: parseFloat(e.target.value) })}
          className="w-full accent-accent"
          aria-label="Playback speed"
        />
      </Section>

      <Section label={`Interp Step — ${config.interpStep.toFixed(0)} mm`}>
        <input
          type="range"
          min={2}
          max={10}
          step={1}
          value={config.interpStep}
          onChange={(e) => onConfig({ interpStep: parseFloat(e.target.value) })}
          className="w-full accent-accent"
          aria-label="Interpolation step size"
        />
      </Section>

      <Section label="Overlays" last>
        <div className="flex flex-col items-start gap-2">
          <Pill
            active={config.showEnvelope}
            onClick={() => onConfig({ showEnvelope: !config.showEnvelope })}
            ariaPressed={config.showEnvelope}
          >
            Polar Envelope
          </Pill>
          <button
            type="button"
            className={`px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${
              drawerOpen ? active : inactive
            }`}
            onClick={onToggleDrawer}
          >
            {drawerOpen ? "Hide" : "Show"} Firmware Drawer
          </button>
        </div>
      </Section>
    </aside>
  );
}

function Pill({
  active,
  onClick,
  ariaPressed,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaPressed?: boolean;
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
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={`${base} ${state}`}
    >
      {children}
    </button>
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
  // On mobile/short viewports, sections shrink to content. On tall viewports
  // each section gets an equal vertical slice so the panel fills its column.
  // Content sits at the top of each slice so the section label + its controls
  // stay anchored together.
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
