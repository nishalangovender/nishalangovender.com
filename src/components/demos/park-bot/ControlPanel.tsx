// src/components/demos/park-bot/ControlPanel.tsx
"use client";

import { SCENARIOS } from "@/lib/park-bot/scenarios";
import type { KinematicMode, Scenario } from "@/lib/park-bot/types";

interface Props {
  scenarioId: Scenario["id"];
  forcedMode: KinematicMode | null;
  playing: boolean;
  onScenarioChange(id: Scenario["id"]): void;
  onForcedModeChange(mode: KinematicMode | null): void;
  onPlay(): void;
  onPause(): void;
  onReset(): void;
}

const FORCE_OPTIONS: Array<{ label: string; value: KinematicMode | null }> = [
  { label: "Auto", value: null },
  { label: "Ackermann", value: "ackermann" },
  { label: "Crab", value: "crab" },
  { label: "Counter", value: "counter_steer" },
  { label: "Pivot", value: "pivot" },
];

export function ControlPanel({
  scenarioId,
  forcedMode,
  playing,
  onScenarioChange,
  onForcedModeChange,
  onPlay,
  onPause,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border/60 bg-surface/60 p-4 text-sm">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Scenario
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onScenarioChange(s.id)}
              className={`rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
                s.id === scenarioId
                  ? "border-accent text-foreground"
                  : "border-border/60 text-muted hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Force Mode
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Force steering mode">
          {FORCE_OPTIONS.map((opt) => {
            const active = forcedMode === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onForcedModeChange(opt.value)}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  active
                    ? "border-accent text-accent"
                    : "border-border/60 text-muted hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        {playing ? (
          <button
            type="button"
            onClick={onPause}
            className="flex-1 rounded-md border border-border/60 px-3 py-2 text-sm hover:border-foreground/40"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="flex-1 rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm text-accent hover:bg-accent/15"
          >
            Run
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-border/60 px-3 py-2 text-sm hover:border-foreground/40"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
