// src/components/demos/park-bot/ParkBotDemo.tsx
"use client";

import { useEffect, useState } from "react";

import { getScenario } from "@/lib/park-bot/scenarios";
import { DEFAULT_CONFIG } from "@/lib/park-bot/types";
import type { KinematicMode, Scenario, SimConfig } from "@/lib/park-bot/types";

import { DemoLegend, type LegendItem } from "../DemoLegend";

import { ControlPanel } from "./ControlPanel";
import { Hud } from "./Hud";
import { ParkCanvas } from "./ParkCanvas";
import { useSimulation } from "./useSimulation";

const LEGEND: LegendItem[] = [
  { label: "Chassis", kind: "ring", color: "var(--foreground)" },
  { label: "Target bay", kind: "chip", color: "rgba(59, 130, 246, 0.75)" },
  { label: "Obstacle", kind: "chip", color: "rgba(115, 115, 115, 0.55)" },
  { label: "Trail", kind: "solid", color: "rgba(59, 130, 246, 0.7)" },
  { label: "Stuck", kind: "solid", color: "rgba(239, 68, 68, 0.9)" },
];

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

export default function ParkBotDemo() {
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>(DEFAULT_CONFIG.scenarioId);
  const [forcedMode, setForcedMode] = useState<KinematicMode | null>(DEFAULT_CONFIG.forcedMode);
  const config: SimConfig = { scenarioId, forcedMode, dt: DEFAULT_CONFIG.dt };
  const sim = useSimulation(config);
  const reducedMotion = usePrefersReducedMotion();
  const scenario = getScenario(scenarioId);

  useEffect(() => {
    if (!reducedMotion) sim.play();
    return () => sim.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, forcedMode, reducedMotion]);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <DemoLegend items={LEGEND} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
        <ParkCanvas scenario={scenario} frame={sim.frame} />
        <div className="flex flex-col gap-4">
          <ControlPanel
            scenarioId={scenarioId}
            forcedMode={forcedMode}
            playing={sim.playing}
            onScenarioChange={(id) => {
              setScenarioId(id);
            }}
            onForcedModeChange={setForcedMode}
            onPlay={sim.play}
            onPause={sim.pause}
            onReset={sim.reset}
          />
          <Hud scenario={scenario} frame={sim.frame} />
        </div>
      </div>
    </div>
  );
}
