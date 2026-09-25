"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Dark terminal window over the scene, faded in and out with its beat. Sits
 * top-left on phones and bottom-right on desktop, clear of the headline.
 */
export function TerminalPanel({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="absolute left-4 top-4 md:left-auto md:top-auto md:right-6 md:bottom-6 w-[min(22rem,80%)] rounded-md border border-[var(--terminal-border)] bg-[var(--terminal-bg)]/90 px-3 py-2 font-mono text-[10px] sm:text-[11px] leading-relaxed shadow-lg"
          aria-hidden="true"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
