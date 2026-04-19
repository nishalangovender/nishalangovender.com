"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  /**
   * Optional trailing slot rendered as the final staggered step. Use for
   * anything that should fade-up with the hero (a featured block, a grid,
   * etc.). Plain React children — no motion wrapper needed from the caller.
   */
  children?: ReactNode;
  /** Wrapper class for the trailing slot. Defaults to `mt-16`. */
  childrenClassName?: string;
}

/**
 * Staggered page-header block shared by /projects, /skills, and similar
 * index pages: eyebrow + h1 + circuit divider + lede paragraph (+ optional
 * trailing slot). Lives in a small client island so the parent page can
 * stay server-rendered.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  childrenClassName = "mt-16",
}: PageHeroProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </motion.div>

      <motion.h1
        className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
        variants={fadeUp}
      >
        {title}
      </motion.h1>

      <motion.div className="circuit-divider max-w-xs mt-6" variants={fadeUp} />

      <motion.p
        className="mt-6 text-muted text-lg leading-relaxed max-w-2xl"
        variants={fadeUp}
      >
        {description}
      </motion.p>

      {children !== undefined && (
        <motion.div className={childrenClassName} variants={fadeUp}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
