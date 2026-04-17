// src/components/demos/pen-plotter/PenPlotterDemo.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isInsideEnvelope } from "@/lib/pen-plotter/kinematics";
import { DEFAULT_CONFIG, type SimConfig, type Vec2 } from "@/lib/pen-plotter/types";

import { ControlPanel } from "./ControlPanel";
import { PlotterCanvas } from "./PlotterCanvas";
import { useSimulation } from "./useSimulation";

export default function PenPlotterDemo() {
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [drawnPolyline, setDrawnPolyline] = useState<Vec2[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flashAt, setFlashAt] = useState<number | undefined>(undefined);
  const lastResetAtRef = useRef(0);

  const sim = useSimulation(config);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!reducedMotion) sim.play();
    return () => sim.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedReset = useCallback(
    (nextConfig?: SimConfig) => {
      const now = performance.now();
      if (now - lastResetAtRef.current < 150) return;
      lastResetAtRef.current = now;
      sim.reset(nextConfig ?? config);
    },
    [sim, config],
  );

  const onPlayPause = useCallback(() => {
    if (sim.isComplete) {
      sim.reset(config);
      sim.play();
    } else if (sim.isPlaying) {
      sim.pause();
    } else {
      sim.play();
    }
  }, [sim, config]);

  const onConfig = useCallback(
    (patch: Partial<SimConfig>) => {
      const next: SimConfig = { ...config, ...patch };
      setConfig(next);
      // Changes that restructure the path require a full reset.
      if (
        patch.source !== undefined ||
        patch.preset !== undefined ||
        patch.drawnPolyline !== undefined ||
        patch.interpStep !== undefined
      ) {
        debouncedReset(next);
      } else {
        sim.updateConfig(patch);
      }
    },
    [config, sim, debouncedReset],
  );

  const onDrawClick = useCallback(
    (p: Vec2) => {
      if (config.source !== "draw") return;
      if (!isInsideEnvelope(p)) {
        setFlashAt(performance.now());
        return;
      }
      const next = [...drawnPolyline, p];
      setDrawnPolyline(next);
      onConfig({ drawnPolyline: next, source: "draw" });
    },
    [config.source, drawnPolyline, onConfig],
  );

  const onClearDrawn = useCallback(() => {
    setDrawnPolyline([]);
    onConfig({ drawnPolyline: [], source: "draw" });
  }, [onConfig]);

  const onReset = useCallback(() => debouncedReset(config), [debouncedReset, config]);

  const ariaLabel = useMemo(() => {
    if (!sim.latest) return "Pen plotter initialising.";
    return `Polar pen plotter tracing ${config.source === "preset" ? config.preset : "a drawn path"}.`;
  }, [sim.latest, config.source, config.preset]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-4">
        <div className="relative rounded-lg border border-border overflow-hidden bg-background h-[60vh] lg:h-[70vh]">
          <PlotterCanvas
            latest={sim.latest}
            showEnvelope={config.showEnvelope}
            drawMode={config.source === "draw"}
            drawnPolyline={drawnPolyline}
            onDrawClick={onDrawClick}
            outOfEnvelopeFlash={flashAt}
            ariaLabel={ariaLabel}
          />
        </div>
        <div className="lg:h-[70vh]">
          <ControlPanel
            config={config}
            isPlaying={sim.isPlaying}
            isComplete={sim.isComplete}
            drawerOpen={drawerOpen}
            onConfig={onConfig}
            onPlayPause={onPlayPause}
            onReset={onReset}
            onToggleDrawer={() => setDrawerOpen((v) => !v)}
            onClearDrawn={onClearDrawn}
          />
        </div>
      </div>
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
