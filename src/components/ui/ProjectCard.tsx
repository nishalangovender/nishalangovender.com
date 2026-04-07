"use client";

import { motion } from "framer-motion";

import type { Project } from "@/data/projects";
import { fadeUp } from "@/lib/animations";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group relative flex h-full flex-col rounded-xl border border-border/60 bg-surface p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] tracking-wider uppercase rounded-full bg-accent-light text-accent px-2.5 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
        {project.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm text-muted leading-relaxed">
        {project.description}
      </p>

      {/* Links (external / source) — push to the bottom of the card */}
      {(project.link || project.github) && (
        <div className="mt-auto flex items-center gap-4 pt-4">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent transition-colors hover:text-accent-dark"
            >
              View Project &rarr;
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted transition-colors hover:text-foreground"
            >
              Source
            </a>
          )}
        </div>
      )}

      {/* Hover accent bar */}
      <div
        className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden="true"
      />
    </motion.article>
  );
}
