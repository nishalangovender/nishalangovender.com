"use client";

import { motion, useReducedMotion } from "framer-motion";

import { fadeUpInView } from "@/lib/animations";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article";
  amount?: number;
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={fadeUpInView}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
