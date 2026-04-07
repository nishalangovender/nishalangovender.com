"use client";

import { motion } from "framer-motion";

import { fadeUp, staggerContainer } from "@/lib/animations";

const contributions = [
  {
    name: "NAV2",
    role: "Contributor",
    description:
      "Contributing to the ROS2 Navigation stack — the industry-standard autonomous navigation framework for mobile robots.",
    url: "https://github.com/ros-navigation/navigation2",
  },
  {
    name: "SMACC2",
    role: "Research Group Member",
    description:
      "RobosoftAI / NVIDIA state machine architecture for robotics — providing advanced behavioural control for complex robot systems.",
    url: "https://github.com/robosoft-ai/SMACC2",
  },
];

export default function OpenSource() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-3xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="mb-12" variants={fadeUp}>
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            Community
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Open Source
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {contributions.map((contrib) => (
            <motion.a
              key={contrib.name}
              href={contrib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group p-6 rounded-lg border border-border bg-surface hover:border-accent/40 transition-colors"
              variants={fadeUp}
            >
              <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                {contrib.name}
              </h3>
              <p className="font-mono text-xs text-accent tracking-wide mt-1 mb-3">
                {contrib.role}
              </p>
              <p className="text-sm text-muted leading-relaxed">
                {contrib.description}
              </p>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
