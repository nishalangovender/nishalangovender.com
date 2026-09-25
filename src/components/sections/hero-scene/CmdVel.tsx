"use client";

import type { RefObject } from "react";

import { TerminalPanel } from "./TerminalPanel";

/**
 * Deploy and system beats: invites a nav goal, then echoes `/cmd_vel` while
 * the AGV drives to it. `NavGoal` writes the numbers straight into `readout`.
 */
export function CmdVel({
  visible,
  live,
  readout,
}: {
  visible: boolean;
  live: boolean;
  readout: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <TerminalPanel visible={visible} corner="bottom-left">
      <p className="text-[var(--terminal-text)]">
        <span className="text-[var(--terminal-prompt)]">❯ </span>
        {live ? "ros2 topic echo /cmd_vel" : "click the floor to send a nav goal"}
      </p>
      {live && <span ref={readout} className="block text-[var(--terminal-text)]/70" />}
    </TerminalPanel>
  );
}
