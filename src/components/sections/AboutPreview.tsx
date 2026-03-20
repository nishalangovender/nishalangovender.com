"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { fadeUp, staggerContainer } from "@/lib/animations";

export default function AboutPreview() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.p
          className="font-mono text-sm text-accent tracking-wider uppercase mb-2"
          variants={fadeUp}
        >
          About Me
        </motion.p>
        <motion.h2
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
          variants={fadeUp}
        >
          Mechatronics engineer and technical lead
        </motion.h2>
        <motion.p
          className="text-muted text-lg leading-relaxed mb-8"
          variants={fadeUp}
        >
          Technical lead at an industrial robotics startup — software
          architecture, embedded systems, controls, DevOps and client-facing
          technical engagement. I led the end-to-end deployment of a production
          AGV fleet at Toyota SA Manufacturing, and built every layer of the
          stack from C++ hardware interfaces to fleet communication.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/about"
            className="font-mono text-sm text-accent hover:text-accent-dark transition-colors"
          >
            Read more about my journey →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
