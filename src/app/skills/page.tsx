"use client";

import { motion } from "framer-motion";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageSection } from "@/components/ui/PageSection";
import SkillsVenn from "@/components/ui/SkillsVenn";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function SkillsPage() {
  return (
    <PageSection>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow>Toolkit</Eyebrow>
        </motion.div>

        <motion.h1
          className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
          variants={fadeUp}
        >
          Skills & Technologies
        </motion.h1>

        <motion.div
          className="circuit-divider max-w-xs mt-6"
          variants={fadeUp}
        />

        <motion.p
          className="mt-6 text-muted text-lg leading-relaxed max-w-2xl"
          variants={fadeUp}
        >
          Mechatronics sits at the intersection of software, electronics, and
          mechanical engineering. Explore each discipline — and the overlaps
          where they meet.
        </motion.p>

        <motion.div className="mt-16" variants={fadeUp}>
          <SkillsVenn />
        </motion.div>
      </motion.div>
    </PageSection>
  );
}
