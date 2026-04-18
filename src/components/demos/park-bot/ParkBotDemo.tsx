// src/components/demos/park-bot/ParkBotDemo.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { getScenario } from "@/lib/park-bot/scenarios";
import { runSimulation } from "@/lib/park-bot/simulation";
import { DEFAULT_CONFIG } from "@/lib/park-bot/types";
import type { KinematicMode, Pose, Scenario, SimConfig } from "@/lib/park-bot/types";

import { DemoLegend, type LegendItem } from "../DemoLegend";

import { ControlPanel } from "./ControlPanel";
import { Hud } from "./Hud";
import { ParkCanvas } from "./ParkCanvas";
import { useSimulation } from "./useSimulation";

const LEGEND: LegendItem[] = [
  { label: "Chassis", kind: "solid", color: "var(--foreground)" },
  { label: "Target Bay", kind: "chip", color: "rgba(59, 130, 246, 0.75)" },
  { label: "Obstacle", kind: "chip", color: "rgba(115, 115, 115, 0.55)" },
  { label: "Planned Path", kind: "dashed", color: "rgba(115, 115, 115, 0.55)" },
  { label: "Trail", kind: "solid", color: "rgba(59, 130, 246, 0.7)" },
  { label: "Stuck", kind: "solid", color: "rgba(239, 68, 68, 0.9)" },
];

export default function ParkBotDemo() {
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>(DEFAULT_CONFIG.scenarioId);
  const [forcedMode, setForcedMode] = useState<KinematicMode | null>(DEFAULT_CONFIG.forcedMode);
  const [statusOpen, setStatusOpen] = useState(true);
  const config: SimConfig = { scenarioId, forcedMode, dt: DEFAULT_CONFIG.dt };
  const sim = useSimulation(config);
  const reducedMotion = usePrefersReducedMotion();
  const scenario = getScenario(scenarioId);

  // Run the sim offline once per (scenario, forcedMode) to get the reference
  // trajectory; the live trail overlays it during playback.
  const plannedPath = useMemo<readonly Pose[]>(
    () => runSimulation(config).map((f) => f.pose),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioId, forcedMode],
  );

  useEffect(() => {
    if (!reducedMotion) sim.play();
    return () => sim.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, forcedMode, reducedMotion]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-4">
        <div className="flex flex-col gap-3">
          <div className="relative rounded-lg border border-border overflow-hidden bg-background h-[60vh] lg:h-[70vh]">
            <ParkCanvas scenario={scenario} frame={sim.frame} plannedPath={plannedPath} />
          </div>
          <DemoLegend items={LEGEND} />
        </div>
        <div className="lg:h-[70vh]">
          <ControlPanel
            scenarioId={scenarioId}
            forcedMode={forcedMode}
            playing={sim.playing}
            statusOpen={statusOpen}
            onScenarioChange={setScenarioId}
            onForcedModeChange={setForcedMode}
            onPlay={sim.play}
            onPause={sim.pause}
            onReset={sim.reset}
            onToggleStatus={() => setStatusOpen((v) => !v)}
          />
        </div>
      </div>
      {statusOpen && <Hud scenario={scenario} frame={sim.frame} />}
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
