// src/app/projects/pen-plotter/demo/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import PenPlotterDemo from "@/components/demos/pen-plotter/PenPlotterDemo";
import { PageSection } from "@/components/ui/PageSection";

export const metadata: Metadata = {
  title: "Pen Plotter — Interactive Demo",
  description:
    "In-browser polar pen plotter simulation — host-firmware command protocol, closed-loop ADC feedback, live mechanism.",
  alternates: { canonical: "/projects/pen-plotter/demo" },
};

export default function PenPlotterDemoPage() {
  return (
    <PageSection>
      <Link
        href="/projects/pen-plotter"
        className="inline-flex items-center font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-accent"
      >
        &larr; Back To Pen Plotter
      </Link>
      <header className="mt-8 mb-6">
        <p className="font-mono text-xs tracking-widest uppercase text-accent">
          Interactive Demo
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Pen Plotter Control System
        </h1>
        <p className="mt-2 text-muted text-sm">
          Browser simulation of the RP2040 firmware + polar kinematics — watch it draw, then open the firmware drawer.
        </p>
      </header>

      <PenPlotterDemo />
    </PageSection>
  );
}
