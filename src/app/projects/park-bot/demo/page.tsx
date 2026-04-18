// src/app/projects/park-bot/demo/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import ParkBotDemo from "@/components/demos/park-bot/ParkBotDemo";
import { PageSection } from "@/components/ui/PageSection";

export const metadata: Metadata = {
  title: "Park Bot — Interactive Demo",
  description:
    "Live 4WS parking simulation — four curated scenarios, one per kinematic mode.",
  alternates: { canonical: "/projects/park-bot/demo" },
};

export default function ParkBotDemoPage() {
  return (
    <PageSection>
      <Link
        href="/projects/park-bot"
        className="inline-flex items-center font-mono text-xs tracking-wider uppercase text-muted transition-colors hover:text-accent"
      >
        &larr; Back To Park Bot
      </Link>
      <header className="mt-8 mb-6">
        <p className="font-mono text-xs tracking-widest uppercase text-accent">
          Interactive Demo
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Park Bot — 4WS Parking
        </h1>
        <p className="mt-2 text-muted text-sm">
          Four scenarios, one per kinematic primitive. Force a mode to watch where it breaks.
        </p>
      </header>

      <ParkBotDemo />
    </PageSection>
  );
}
