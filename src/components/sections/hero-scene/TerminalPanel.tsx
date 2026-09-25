"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

const CORNER = { "bottom-left": "left-2 bottom-2", "top-right": "right-2 top-2" } as const;

/** Dark terminal window over the hero canvas, faded in and out with its beat. */
export function TerminalPanel({
  visible,
  corner,
  children,
}: {
  visible: boolean;
  corner: keyof typeof CORNER;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`absolute ${CORNER[corner]} w-[min(22rem,80%)] rounded-md border border-[var(--terminal-border)] bg-[var(--terminal-bg)]/90 px-3 py-2 font-mono text-[10px] sm:text-[11px] leading-relaxed shadow-lg`}
          aria-hidden="true"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
