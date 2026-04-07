"use client";

import { motion } from "framer-motion";

import ProjectCard from "@/components/ui/ProjectCard";
import { projects } from "@/data/projects";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function ProjectsPage() {
  return (
    <section className="blueprint-grid min-h-[calc(100dvh-4rem)] px-4 py-20 sm:py-24">
      <motion.div
        className="mx-auto max-w-5xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="font-mono text-sm text-accent tracking-wider uppercase"
          variants={fadeUp}
        >
          Projects
        </motion.p>

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
          systems, controls, and web development. Each card links to a deeper
          case study.
        </motion.p>

        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
