// src/components/demos/park-bot/Hud.tsx
"use client";

import type { KinematicMode, Scenario, SimFrame } from "@/lib/park-bot/types";

interface Props {
  scenario: Scenario;
  frame: SimFrame | null;
}

const MODE_LABELS: Record<KinematicMode, string> = {
  ackermann: "Ackermann",
  crab: "Crab",
  counter_steer: "Counter-Steer",
  pivot: "Pivot",
};

export function Hud({ scenario, frame }: Props) {
  const activeMode = frame?.activeMode ?? scenario.recommendedMode;
  const phaseIdx = frame?.phaseIndex ?? 0;
  const phase = frame?.phase ?? "idle";
  const deltas = frame?.wheels.deltas ?? [0, 0, 0, 0];

  return (
    <aside className="rounded-lg border border-border bg-surface text-foreground">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted px-3 py-2 border-b border-border">
        Mission Status
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 font-mono text-xs">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">Active Mode</p>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            {MODE_LABELS[activeMode]}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">Mission</p>
          <ol className="space-y-1">
            {scenario.phases.map((p, i) => {
              const state = tickerState({ i, phaseIdx, phase });
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
          <p className="text-[10px] uppercase tracking-widest text-muted mb-1.5">Wheels</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {["FL", "FR", "RL", "RR"].map((label, i) => (
              <p key={label}>
                <span className="text-muted">{label}</span>{" "}
                <span>{`${((deltas[i] * 180) / Math.PI).toFixed(1).padStart(5)}°`}</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {frame?.stuck ? (
        <div className="mx-3 mb-3 rounded bg-red-500/10 px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-red-500">
          Impossible — Try {MODE_LABELS[suggestedMode(scenario.id)]}
        </div>
      ) : null}
    </aside>
  );
}

type TickerState = "done" | "active" | "stuck" | "pending";

function tickerState({
  i,
  phaseIdx,
  phase,
}: {
  i: number;
  phaseIdx: number;
  phase: string;
}): TickerState {
  if (phase === "done") return "done";
  if (phase === "stuck" && i === phaseIdx) return "stuck";
  if (i < phaseIdx) return "done";
  if (i === phaseIdx && (phase === "approach" || phase === "active" || phase === "align"))
    return "active";
  return "pending";
}

// Scenario-appropriate alternative mode to suggest when the forced choice fails.
// Simpler than tracking every (scenarioId, forcedMode) pair — the recommended
// mode is what the mission was built around, so that's the honest answer.
function suggestedMode(scenarioId: Scenario["id"]): KinematicMode {
  switch (scenarioId) {
    case "forward_bay":    return "ackermann";
    case "parallel_tight": return "crab";
    case "narrow_uturn":   return "counter_steer";
    case "pivot_rotate":   return "pivot";
  }
}
