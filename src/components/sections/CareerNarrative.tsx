"use client";

import { motion } from "framer-motion";

import { timelineChapters } from "@/data/timeline";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function CareerNarrative() {
  const formative = timelineChapters[0];

  return (
    <section className="pt-24 pb-8 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={fadeUp}>
          <p className="font-mono text-sm text-accent tracking-wider uppercase mb-2">
            About
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            The Engineer Behind the Code
          </h2>
        </motion.div>

        <motion.div className="mt-8 max-w-2xl" variants={fadeUp}>
          <p className="font-mono text-xs text-accent tracking-wider uppercase mb-1">
            {formative.yearRange}
          </p>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
            {formative.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {formative.description}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
