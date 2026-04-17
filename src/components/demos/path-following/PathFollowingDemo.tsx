// src/components/demos/path-following/PathFollowingDemo.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_CONFIG, type SimConfig } from "@/lib/path-following/types";

import { ControlPanel, type Layers } from "./ControlPanel";
import { TrajectoryCanvas } from "./TrajectoryCanvas";
import { useSimulation } from "./useSimulation";

const DEFAULT_LAYERS: Layers = {
  reference: true,
  truth: true,
  estimate: true,
  gps: false,
  outliers: false,
};

export default function PathFollowingDemo() {
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [layers, setLayers] = useState<Layers>(DEFAULT_LAYERS);
  const sim = useSimulation(config);
  const reducedMotion = useReducedMotion();

  // Auto-play on mount unless reduced motion
  useEffect(() => {
    if (!reducedMotion) sim.play();
    return () => sim.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard: space = play/pause, R = reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        sim.isPlaying ? sim.pause() : sim.play();
      } else if (e.key === "r" || e.key === "R") {
        sim.reset(config);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sim, config]);

  const onConfig = useCallback(
    (patch: Partial<SimConfig>) => {
      const next = { ...config, ...patch };
      setConfig(next);
      // path changes require a full reset; everything else can be live.
      if (patch.path && patch.path !== config.path) {
        sim.reset(next);
      } else {
        sim.updateConfig(patch);
      }
    },
    [config, sim],
  );

  const onLayers = useCallback(
    (patch: Partial<Layers>) => setLayers((prev) => ({ ...prev, ...patch })),
    [],
  );

  const reference = useMemo(() => sim.sampleReference(), [sim, config.path]);

  const ariaLabel = useMemo(() => {
    const f = sim.latest;
    if (!f) return "Path-following simulation initialising.";
    return `Differential-drive wagon tracking a ${config.path} trajectory. Current error ${f.trackingError.toFixed(2)} metres.`;
  }, [sim.latest, config.path]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-4 h-[calc(100vh-10rem)]">
      <div className="relative rounded-lg border border-border overflow-hidden bg-[#0A0A0A]">
        <TrajectoryCanvas
          frames={sim.frames}
          reference={reference}
          layers={layers}
          reducedMotion={reducedMotion}
          ariaLabel={ariaLabel}
        />
      </div>
      <ControlPanel
        config={config}
        layers={layers}
        isPlaying={sim.isPlaying}
        onConfig={onConfig}
        onLayers={onLayers}
        onPlayPause={() => (sim.isPlaying ? sim.pause() : sim.play())}
        onReset={() => sim.reset(config)}
        onOpenCharts={() => {
          // Wired up in Commit 2.
        }}
      />
    </div>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
