// src/components/demos/path-following/PathFollowingDemo.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_CONFIG, type SimConfig } from "@/lib/path-following/types";

import { ControlPanel, type Layers } from "./ControlPanel";
import { StatsDrawer } from "./StatsDrawer";
import { StatsStrip } from "./StatsStrip";
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
  const [chartsOpen, setChartsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const lastResetAtRef = useRef(0);

  const sim = useSimulation(config);
  const reducedMotion = useReducedMotion();

  // Auto-play on mount unless reduced motion
  useEffect(() => {
    if (!reducedMotion) sim.play();
    return () => sim.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Divergence watchdog — if the covariance trace blows up, reset + toast.
  useEffect(() => {
    if (!sim.latest) return;
    const trace =
      sim.latest.covariance[0] + sim.latest.covariance[6] +
      sim.latest.covariance[12] + sim.latest.covariance[18] +
      sim.latest.covariance[24];
    if (!Number.isFinite(trace) || trace > 1e5) {
      setToast("Filter diverged — resetting.");
      sim.reset(config);
    }
  }, [sim.latest, sim, config]);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const debouncedReset = useCallback(() => {
    const now = performance.now();
    if (now - lastResetAtRef.current < 150) return;
    lastResetAtRef.current = now;
    sim.reset(config);
  }, [sim, config]);

  const onPlayPause = useCallback(() => {
    if (sim.isComplete) {
      // Restart: reset + auto-play.
      sim.reset(config);
      sim.play();
    } else if (sim.isPlaying) {
      sim.pause();
    } else {
      sim.play();
    }
  }, [sim, config]);

  // Keyboard: space = play/pause/restart, R = reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        onPlayPause();
      } else if (e.key === "r" || e.key === "R") {
        debouncedReset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPlayPause, debouncedReset]);

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

  const reference = useMemo(() => sim.sampleReference(), [sim]);

  const ariaLabel = useMemo(() => {
    const f = sim.latest;
    if (!f) return "Path-following simulation initialising.";
    return `Differential-drive wagon tracking a ${config.path} trajectory. Current error ${f.trackingError.toFixed(2)} metres.`;
  }, [sim.latest, config.path]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-rows-[1fr_auto] lg:grid-rows-none lg:grid-cols-[1fr_16rem] gap-4 h-[calc(100vh-12rem)]">
        <div className="relative rounded-lg border border-border overflow-hidden bg-background">
          <TrajectoryCanvas
            frames={sim.frames}
            reference={reference}
            layers={layers}
            reducedMotion={reducedMotion}
            ariaLabel={ariaLabel}
          />
        </div>
        <div className="max-h-[40vh] overflow-y-auto lg:max-h-none lg:h-full lg:overflow-visible">
          <ControlPanel
            config={config}
            layers={layers}
            isPlaying={sim.isPlaying}
            isComplete={sim.isComplete}
            onConfig={onConfig}
            onLayers={onLayers}
            onPlayPause={onPlayPause}
            onReset={debouncedReset}
            onOpenCharts={() => setChartsOpen(true)}
          />
        </div>
      </div>
      <StatsStrip latest={sim.latest} stats={sim.stats} />
      <StatsDrawer
        frames={sim.frames}
        open={chartsOpen}
        onClose={() => setChartsOpen(false)}
      />
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded border border-border bg-surface px-4 py-2 font-mono text-xs shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
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
