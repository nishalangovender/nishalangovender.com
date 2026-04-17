// src/components/demos/pen-plotter/PenPlotterDemo.tsx
"use client";

import { useEffect } from "react";

import { DEFAULT_CONFIG } from "@/lib/pen-plotter/types";

import { PlotterCanvas } from "./PlotterCanvas";
import { useSimulation } from "./useSimulation";

export default function PenPlotterDemo() {
  const sim = useSimulation(DEFAULT_CONFIG);

  useEffect(() => {
    sim.play();
    return () => sim.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-lg border border-border overflow-hidden bg-background h-[60vh] lg:h-[70vh]">
        <PlotterCanvas
          latest={sim.latest}
          showEnvelope={false}
          ariaLabel="Pen plotter tracing a preset star."
        />
      </div>
    </div>
  );
}
