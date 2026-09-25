"use client";

import { AnimatePresence, motion } from "framer-motion";

/** Seconds between lines, so the whole session types out inside the code beat. */
const LINE_DELAY = 0.32;

export const TERMINAL_LINES: readonly { text: string; kind: "prompt" | "log" | "ok" }[] = [
  { text: "colcon build --symlink-install", kind: "prompt" },
  { text: "Summary: 12 packages finished [8.4s]", kind: "log" },
  { text: "ros2 launch agv_bringup fleet.launch.py", kind: "prompt" },
  { text: "[lidar_driver] scan @ 15 Hz", kind: "log" },
  { text: "[canopen_master] 2 drives OPERATIONAL", kind: "log" },
  { text: "[nav2] lifecycle nodes active", kind: "log" },
  { text: "nodes up", kind: "ok" },
];

const KIND_CLASS = { prompt: "text-[var(--terminal-text)]", log: "text-[var(--terminal-text)]/60", ok: "text-[var(--terminal-prompt)]" };

/** Beat 3: a terminal session that builds and launches the stack. */
export function CodeTerminal({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="absolute left-2 bottom-2 w-[min(22rem,80%)] rounded-md border border-[var(--terminal-border)] bg-[var(--terminal-bg)]/90 px-3 py-2 font-mono text-[10px] sm:text-[11px] leading-relaxed shadow-lg"
          aria-hidden="true"
        >
          {TERMINAL_LINES.map((line, i) => (
            <motion.p
              key={line.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * LINE_DELAY, duration: 0.05 }}
              className={`truncate ${KIND_CLASS[line.kind]}`}
            >
              {line.kind === "prompt" && <span className="text-[var(--terminal-prompt)]">❯ </span>}
              {line.kind === "ok" && "✓ "}
              {line.text}
            </motion.p>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
