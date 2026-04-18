// src/components/demos/park-bot/ControlPanel.tsx
"use client";

import type { ReactNode } from "react";

import { SCENARIOS } from "@/lib/park-bot/scenarios";
import type { KinematicMode, Scenario } from "@/lib/park-bot/types";

interface Props {
  scenarioId: Scenario["id"];
  forcedMode: KinematicMode | null;
  playing: boolean;
  statusOpen: boolean;
  onScenarioChange(id: Scenario["id"]): void;
  onForcedModeChange(mode: KinematicMode | null): void;
  onPlay(): void;
  onPause(): void;
  onReset(): void;
  onToggleStatus(): void;
}

const FORCE_OPTIONS: { value: KinematicMode | null; label: string }[] = [
  { value: null, label: "Auto" },
  { value: "ackermann", label: "Ackermann" },
  { value: "crab", label: "Crab" },
  { value: "counter_steer", label: "Counter" },
  { value: "pivot", label: "Pivot" },
];

export function ControlPanel({
  scenarioId,
  forcedMode,
  playing,
  statusOpen,
  onScenarioChange,
  onForcedModeChange,
  onPlay,
  onPause,
  onReset,
  onToggleStatus,
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
            onClick={playing ? onPause : onPlay}
            className={`flex-1 px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${inactive}`}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className={`flex-1 px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${inactive}`}
          >
            Reset
          </button>
        </div>
      </Section>

      <Section label="Scenario">
        <div role="radiogroup" aria-label="Scenario" className="grid grid-cols-1 gap-2">
          {SCENARIOS.map((s) => {
            const isActive = s.id === scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onScenarioChange(s.id)}
                className={`px-2 py-1 rounded border font-mono text-xs cursor-pointer ${
                  isActive ? active : inactive
                }`}
              >
                {s.title}
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Force Mode">
        <div role="radiogroup" aria-label="Force steering mode" className="flex flex-wrap gap-1.5">
          {FORCE_OPTIONS.map((opt) => {
            const isActive = forcedMode === opt.value;
            return (
              <Pill
                key={opt.label}
                active={isActive}
                ariaChecked={isActive}
                role="radio"
                onClick={() => onForcedModeChange(opt.value)}
              >
                {opt.label}
              </Pill>
            );
          })}
        </div>
      </Section>

      <Section label="View" last>
        <button
          type="button"
          onClick={onToggleStatus}
          aria-pressed={statusOpen}
          className={`w-full px-3 py-2 rounded border font-mono text-xs uppercase tracking-wider ${
            statusOpen ? active : inactive
          }`}
        >
          {statusOpen ? "Hide Status" : "Show Status"}
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
