"use client";

import { motion } from "framer-motion";

import { TerminalPanel } from "./TerminalPanel";

/** Seconds between lines, so the whole session types out inside the code beat. */
const LINE_DELAY = 0.32;

export const TERMINAL_LINES: readonly { text: string; kind: "prompt" | "log" | "ok" }[] = [
  { text: "colcon build --packages-up-to nish_bot", kind: "prompt" },
  { text: "Summary: 12 packages finished [8.4s]", kind: "log" },
  { text: "ros2 launch nish_bot bringup.launch.py", kind: "prompt" },
  { text: "[nish_bot_lidar] scan @ 15 Hz", kind: "log" },
  { text: "[nish_bot_canopen] 2 drives OPERATIONAL", kind: "log" },
  { text: "[nav2] lifecycle nodes active", kind: "log" },
  { text: "nodes up", kind: "ok" },
];

const KIND_CLASS = { prompt: "text-[var(--terminal-text)]", log: "text-[var(--terminal-text)]/60", ok: "text-[var(--terminal-prompt)]" };

/** Beat 3: a terminal session that builds and launches the stack. */
export function CodeTerminal({ visible }: { visible: boolean }) {
  return (
    <TerminalPanel visible={visible}>
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
    </TerminalPanel>
  );
}
