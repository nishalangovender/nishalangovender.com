"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function Hero() {
  return (
    <section className="blueprint-grid min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-3xl space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>Design &middot; Iterate &middot; Deploy</Eyebrow>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
          variants={fadeUp}
        >
          I Solve Problems
        </motion.h1>

        <motion.div className="circuit-divider max-w-xs mx-auto" variants={fadeUp} />

        <motion.p
          className="text-muted text-lg max-w-xl mx-auto leading-relaxed"
          variants={fadeUp}
        >
          Starting at the whiteboard, not the keyboard. I walk the floor,
          understand the process, then design modular systems that
          scale — deploying a proof of concept as fast as possible,
          then iterating. The tech stack changes; the approach doesn&apos;t.
        </motion.p>

        <motion.div className="flex items-center justify-center gap-4" variants={fadeUp}>
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            View My Work
          </Link>
          <Link
            href="/cv"
            className="inline-flex items-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-surface transition-colors"
          >
            View Profile
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
