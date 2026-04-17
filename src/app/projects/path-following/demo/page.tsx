// src/app/projects/path-following/demo/page.tsx
import type { Metadata } from "next";

import PathFollowingDemo from "@/components/demos/path-following/PathFollowingDemo";
import { PageSection } from "@/components/ui/PageSection";

export const metadata: Metadata = {
  title: "Path Following — Interactive Demo",
  description:
    "Live EKF + Pure Pursuit simulation of the differential-drive path-following system.",
  alternates: { canonical: "/projects/path-following/demo" },
};

export default function PathFollowingDemoPage() {
  return (
    <PageSection>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-widest uppercase text-accent">
          Interactive Demo
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          Path Following Control System
        </h1>
        <p className="mt-2 text-muted text-sm">
          Live EKF + Pure Pursuit simulation — toggle filter modes mid-run.
        </p>
      </header>

      <PathFollowingDemo />
    </PageSection>
  );
}
