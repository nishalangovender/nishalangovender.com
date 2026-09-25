"use client";

import { motion } from "framer-motion";

import HeroScene from "@/components/sections/hero-scene/HeroScene";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { fadeUp, staggerContainer } from "@/lib/animations";

/**
 * Full-bleed hero: the 3D scene fills the viewport and the headline sits over
 * it — bottom on phones, left on desktop, where the scene is framed away from
 * the text. The h1 stays in the DOM from first paint, so it remains the LCP.
 */
export default function Hero() {
  return (
    <section className="blueprint-grid relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="absolute inset-0">
        <HeroScene />
      </div>

      {/* Scrim: keeps the copy readable over the scene. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/70 via-35% to-transparent to-60% md:bg-linear-to-r md:via-background/60 md:via-30% md:to-55%"
      />

      <div className="pointer-events-none relative flex min-h-[calc(100dvh-4rem)] items-end md:items-center px-4 pb-12 md:pb-0">
        <motion.div
          className="mx-auto w-full max-w-6xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="pointer-events-auto max-w-xl space-y-6 md:space-y-8">
            <motion.div variants={fadeUp}>
              <Eyebrow variant="chip" className="normal-case">~/robotics</Eyebrow>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
              variants={fadeUp}
            >
              From Notebook to Factory Floor
            </motion.h1>

            <motion.div className="circuit-divider max-w-xs" variants={fadeUp} />

            <motion.p className="text-muted text-lg leading-relaxed" variants={fadeUp}>
              Robotics engineer. Shipped production AGV fleets into Toyota
              South Africa — ROS2, controls, embedded C++, kernel to cloud.
              Now exploring Physical AI at Ubundi.
            </motion.p>

            <motion.div className="flex items-center gap-4" variants={fadeUp}>
              <LinkButton href="/projects">View My Work</LinkButton>
              <LinkButton href="/cv" variant="outline">
                View CV
              </LinkButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
