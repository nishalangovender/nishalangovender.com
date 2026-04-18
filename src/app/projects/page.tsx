"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";

import ProjectsExplorer from "@/components/sections/ProjectsExplorer";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function ProjectsPage() {
  return (
    <PageSection>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>Projects</Eyebrow>
        </motion.div>

        <motion.h1
          className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
          variants={fadeUp}
        >
          What I&apos;ve Built
        </motion.h1>

        <motion.div
          className="circuit-divider max-w-xs mt-6"
          variants={fadeUp}
        />

        <motion.p
          className="mt-6 text-muted text-lg leading-relaxed max-w-2xl"
          variants={fadeUp}
        >
          A collection of engineering projects across robotics, embedded
          systems, controls, and web development. Filter by discipline to
          find what you&apos;re looking for.
        </motion.p>

        <motion.div className="mt-16" variants={fadeUp}>
          {/* Suspense boundary required by Next.js 15 for useSearchParams */}
          <Suspense fallback={<ProjectsExplorerFallback />}>
            <ProjectsExplorer />
          </Suspense>
        </motion.div>
      </motion.div>
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
