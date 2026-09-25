/**
 * The build terminal the monitor shows in the code beat: a session that
 * builds and launches the stack, typed out a line at a time.
 */
import { beatAt, beatProgress, BEATS } from "./beats";

/** Seconds between lines, so the whole session types out inside the code beat. */
export const LINE_DELAY = 0.5;
/** Seconds into the code beat before the first line types. */
export const TYPING_START = 0.2;

export const TERMINAL_LINES: readonly { text: string; kind: "prompt" | "log" | "ok" }[] = [
  { text: "colcon build --packages-up-to nish_bot", kind: "prompt" },
  { text: "Summary: 12 packages finished [8.4s]", kind: "log" },
  { text: "ros2 launch nish_bot bringup.launch.py", kind: "prompt" },
  { text: "[nish_bot_lidar] scan @ 15 Hz", kind: "log" },
  { text: "[nish_bot_canopen] 2 drives OPERATIONAL", kind: "log" },
  { text: "[nav2] lifecycle nodes active", kind: "log" },
  { text: "nodes up", kind: "ok" },
];

const CODE = BEATS.find((b) => b.id === "code")!;

/** Lines typed at loop time `t`, or null outside the code beat (no terminal on screen). */
export function terminalLinesAt(t: number): number | null {
  if (beatAt(t).id !== "code") return null;
  const elapsed = beatProgress(t, "code") * (CODE.end - CODE.start) - TYPING_START;
  if (elapsed < 0) return 0;
  return Math.min(TERMINAL_LINES.length, Math.floor(elapsed / LINE_DELAY) + 1);
}
