"use client";

import { motion } from "framer-motion";

import HeroScene from "@/components/sections/hero-scene/HeroScene";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function Hero() {
  return (
    <section className="blueprint-grid min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-8 md:gap-12">
        <motion.div
          className="text-center md:text-left max-w-3xl space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <Eyebrow variant="chip" className="normal-case">~/robotics</Eyebrow>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            variants={fadeUp}
          >
            From Notebook to Factory Floor
          </motion.h1>

          <motion.div
            className="circuit-divider max-w-xs mx-auto md:mx-0"
            variants={fadeUp}
          />

          <motion.p
            className="text-muted text-lg max-w-xl mx-auto md:mx-0 leading-relaxed"
            variants={fadeUp}
          >
            Robotics engineer. Shipped production AGV fleets into Toyota
            South Africa — ROS2, controls, embedded C++, kernel to cloud.
            Now exploring Physical AI at Ubundi.
          </motion.p>

          <motion.div
            className="flex items-center justify-center md:justify-start gap-4"
            variants={fadeUp}
          >
            <LinkButton href="/projects">View My Work</LinkButton>
            <LinkButton href="/cv" variant="outline">
              View CV
            </LinkButton>
          </motion.div>
        </motion.div>

        <div className="w-full max-w-xl mx-auto md:mx-0">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
