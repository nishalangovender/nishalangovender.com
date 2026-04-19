import { Suspense } from "react";

import ProjectsExplorer from "@/components/sections/ProjectsExplorer";
import { PageHero } from "@/components/ui/PageHero";
import { PageSection } from "@/components/ui/PageSection";

export default function ProjectsPage() {
  return (
    <PageSection>
      <PageHero
        eyebrow="Projects"
        title="What I've Built"
        description="A collection of engineering projects across robotics, embedded systems, controls, and web development. Filter by discipline to find what you're looking for."
      >
        {/* Suspense boundary required by Next.js 15 for useSearchParams */}
        <Suspense fallback={<ProjectsExplorerFallback />}>
          <ProjectsExplorer />
        </Suspense>
      </PageHero>
    </PageSection>
  );
}

/** Minimal skeleton shown while the explorer hydrates on first paint. */
function ProjectsExplorerFallback() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-48 rounded bg-surface/50" />
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 rounded-full border border-border bg-surface/50" />
          <div className="h-7 w-28 rounded-full border border-border bg-surface/50" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl border border-border/60 bg-surface/50"
          />
        ))}
      </div>
    </div>
  );
}
