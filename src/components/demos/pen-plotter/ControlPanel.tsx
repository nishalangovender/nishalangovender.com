// src/components/demos/pen-plotter/ControlPanel.tsx
"use client";

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
    <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-surface text-foreground overflow-auto">
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

      <fieldset className="flex flex-col gap-2">
        <legend className="font-mono text-xs uppercase tracking-widest text-muted mb-1">
          Source
        </legend>
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
          <div className="grid grid-cols-2 gap-2 mt-2">
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
            className={`mt-2 px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${inactive}`}
            onClick={onClearDrawn}
          >
            Clear Points
          </button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-mono text-xs uppercase tracking-widest text-muted mb-1">
          Speed — {config.speed.toFixed(1)}×
        </legend>
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.1}
          value={config.speed}
          onChange={(e) => onConfig({ speed: parseFloat(e.target.value) })}
          className="accent-accent"
          aria-label="Playback speed"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-mono text-xs uppercase tracking-widest text-muted mb-1">
          Interp Step — {config.interpStep.toFixed(0)} mm
        </legend>
        <input
          type="range"
          min={2}
          max={10}
          step={1}
          value={config.interpStep}
          onChange={(e) => onConfig({ interpStep: parseFloat(e.target.value) })}
          className="accent-accent"
          aria-label="Interpolation step size"
        />
      </fieldset>

      <label className="flex items-center gap-2 font-mono text-xs text-foreground">
        <input
          type="checkbox"
          checked={config.showEnvelope}
          onChange={(e) => onConfig({ showEnvelope: e.target.checked })}
          className="accent-accent"
        />
        Show Polar Envelope
      </label>

      <button
        type="button"
        className={`px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${
          drawerOpen ? active : inactive
        }`}
        onClick={onToggleDrawer}
      >
        Firmware Drawer — {drawerOpen ? "Hide" : "Show"}
      </button>
    </div>
  );
}
