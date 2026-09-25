"use client";

import { FLEET_SIZE } from "./Fleet";
import { MISSION_SPEED } from "./mission";
import { TerminalPanel } from "./TerminalPanel";

const ROWS = Array.from({ length: FLEET_SIZE }, (_, i) => `AGV-0${i + 1}`);

/** Beat 5: fleet status, as `ros2 topic echo` would print it. */
export function FleetStatus({ visible }: { visible: boolean }) {
  return (
    <TerminalPanel visible={visible} corner="top-right">
      <p className="text-[var(--terminal-text)]">
        <span className="text-[var(--terminal-prompt)]">❯ </span>ros2 topic echo /fleet/status
      </p>
      {ROWS.map((name) => (
        <p key={name} className="grid grid-cols-[7ch_2ch_1fr_auto] text-[var(--terminal-text)]/70">
          <span>{name}</span>
          <span className="text-[var(--terminal-prompt)]">▶</span>
          <span>MISSION</span>
          <span>{MISSION_SPEED.toFixed(1)} m/s</span>
        </p>
      ))}
      <p className="text-[var(--terminal-prompt)]">
        {FLEET_SIZE}/{FLEET_SIZE} ONLINE
      </p>
    </TerminalPanel>
  );
}
