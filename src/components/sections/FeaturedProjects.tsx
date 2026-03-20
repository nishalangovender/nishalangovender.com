"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { fadeUp, staggerContainer } from "@/lib/animations";

const featuredProjects = [
  {
    slug: "toyota-agv-fleet",
    title: "COMMANDER",
    description: "BATTALION Technologies Fullstack AGV System",
    techStack: "Ubuntu · ROS2 · C++ · Python · CANOpen · Zenoh",
    tags: ["Robotics", "ROS2", "C++", "CANOpen", "Zenoh"],
  },
  {
    slug: "nish-os",
    title: "NishOS",
    description: "Personal Productivity System",
    techStack: "Next.js · Supabase · TypeScript · AI",
    tags: ["Next.js", "Supabase", "TypeScript", "AI", "PWA"],
  },
];

export default function FeaturedProjects() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="mb-12" variants={fadeUp}>
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Selected Work
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Featured Projects
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {featuredProjects.map((project) => (
            <motion.div key={project.slug} variants={fadeUp}>
              <Link
                href={`/projects/${project.slug}`}
                className="block group h-full p-6 rounded-lg border border-border bg-surface hover:border-accent/40 transition-colors"
              >
                <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mt-2 mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2 py-1 rounded bg-accent-light text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-8 text-center" variants={fadeUp}>
          <Link
            href="/projects"
            className="font-mono text-sm text-accent hover:text-accent-dark transition-colors"
          >
            View All Projects →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
