// src/components/demos/park-bot/Hud.tsx
"use client";

import type { Scenario, SimFrame } from "@/lib/park-bot/types";

interface Props {
  scenario: Scenario;
  frame: SimFrame | null;
}

const MODE_LABELS: Record<import("@/lib/park-bot/types").KinematicMode, string> = {
  ackermann: "ACKERMANN",
  crab: "CRAB",
  counter_steer: "COUNTER-STEER",
  pivot: "PIVOT",
};

export function Hud({ scenario, frame }: Props) {
  const activeMode = frame?.activeMode ?? scenario.recommendedMode;
  const phaseIdx = frame?.phaseIndex ?? 0;
  const phase = frame?.phase ?? "idle";
  const deltas = frame?.wheels.deltas ?? [0, 0, 0, 0];

  return (
    <aside className="flex flex-col gap-4 rounded-md border border-border/60 bg-surface/60 p-4 font-mono text-xs">
      <Block label="Scenario" value={scenario.title} />
      <p className="-mt-3 text-[11px] text-muted leading-relaxed">{scenario.hint}</p>

      <Block label="Mode" value={MODE_LABELS[activeMode]} tone="accent" />

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted">Mission</p>
        <ol className="mt-1.5 space-y-1">
          {scenario.phases.map((p, i) => {
            const state =
              phase === "done" || i < phaseIdx
                ? "done"
                : i === phaseIdx && phase === "active"
                ? "active"
                : i === phaseIdx && phase === "stuck"
                ? "stuck"
                : "pending";
            return (
              <li
                key={p}
                className={
                  state === "done"
                    ? "text-muted"
                    : state === "active"
                    ? "text-accent"
                    : state === "stuck"
                    ? "text-red-500"
                    : "text-muted/70"
                }
              >
                <span aria-hidden>
                  {state === "done" ? "✓ " : state === "active" ? "→ " : state === "stuck" ? "✕ " : "○ "}
                </span>
                {p}
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted">Wheels</p>
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
          {["FL", "FR", "RL", "RR"].map((label, i) => (
            <p key={label}>
              <span className="text-muted">{label}</span>{" "}
              <span>{`${((deltas[i] * 180) / Math.PI).toFixed(1).padStart(5)}°`}</span>
            </p>
          ))}
        </div>
      </div>

      {frame?.stuck ? (
        <p className="rounded bg-red-500/10 px-2 py-1.5 text-[11px] leading-relaxed text-red-500">
          Forced mode can’t satisfy this phase — {hintForStuck(scenario.id, activeMode)}
        </p>
      ) : null}
    </aside>
  );
}

function Block({ label, value, tone }: { label: string; value: string; tone?: "accent" }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 text-sm ${tone === "accent" ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}

function hintForStuck(
  scenarioId: Scenario["id"],
  mode: import("@/lib/park-bot/types").KinematicMode,
): string {
  if (scenarioId === "parallel_tight" && mode === "ackermann") return "crab steering required.";
  if (scenarioId === "parallel_tight" && mode === "pivot") return "translation required.";
  if (scenarioId === "narrow_uturn" && mode === "ackermann") return "counter-steer required.";
  if (scenarioId === "pivot_rotate") return "pivot required.";
  return "pick a different mode.";
}
