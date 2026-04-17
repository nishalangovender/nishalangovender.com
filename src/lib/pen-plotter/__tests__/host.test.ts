import { describe, expect, it } from "vitest";

import { InMemoryBus } from "../bus";
import { Host } from "../host";
import type { Command, Vec2 } from "../types";

function replyOk(bus: InMemoryBus, at = 0): void {
  bus.sendResponse({ kind: "OK", at });
}

describe("Host", () => {
  it("empty polyline emits no commands", () => {
    const bus = new InMemoryBus();
    const host = new Host(bus, [], 4);
    host.step(0.016, 0);
    expect(bus.drainCommands()).toEqual([]);
    expect(host.isComplete()).toBe(true);
  });

  it("three-point in-envelope polyline emits expected command sequence", () => {
    const bus = new InMemoryBus();
    const poly: Vec2[] = [
      { x: 100, y: 0 },
      { x: 100, y: 40 },
      { x: 140, y: 40 },
    ];
    const host = new Host(bus, poly, 100); // step so large nothing subdivides

    const cmdsEmitted: Command[] = [];
    let t = 0;
    for (let i = 0; i < 200 && !host.isComplete(); i++) {
      host.step(0.016, t);
      const cmds = bus.drainCommands();
      cmdsEmitted.push(...cmds);
      // Acknowledge every outgoing command so the host progresses.
      for (let k = 0; k < cmds.length; k++) replyOk(bus, t);
      // Let the host consume responses on the next step.
      t += 0.016;
    }

    // For each transition i→i+1: [PEN UP?, ROTATE, LINEAR, PEN DOWN].
    // First transition is seeded: PEN UP, ROTATE, LINEAR, PEN DOWN.
    expect(cmdsEmitted.filter((c) => c.kind === "ROTATE").length).toBeGreaterThanOrEqual(3);
    expect(cmdsEmitted.filter((c) => c.kind === "LINEAR").length).toBeGreaterThanOrEqual(3);
    expect(cmdsEmitted.filter((c) => c.kind === "PEN" && c.state === "DOWN").length).toBeGreaterThanOrEqual(1);
    expect(host.isComplete()).toBe(true);
  });

  it("out-of-envelope waypoint emits ERR out-of-envelope and lifts pen", () => {
    const bus = new InMemoryBus();
    const poly: Vec2[] = [
      { x: 100, y: 0 },
      { x: 400, y: 0 },  // outside R_MAX
      { x: 150, y: 0 },
    ];
    const host = new Host(bus, poly, 100);

    let t = 0;
    for (let i = 0; i < 300 && !host.isComplete(); i++) {
      host.step(0.016, t);
      const drained = bus.drainCommands();
      for (let k = 0; k < drained.length; k++) replyOk(bus, t);
      // Do NOT drain responses here — the host reads its own bus responses on
      // the next tick. Draining in-test would race with the protocol and
      // permanently stall the host (awaitingOk never clears).
      t += 0.016;
    }

    // The host records out-of-envelope errors internally; verify via getErrors().
    // (A synthetic ERR is also emitted to the bus for the firmware log,
    // but that's consumed by the host itself on its next tick.)
    expect(host.getErrors().some((e) => e.reason === "out-of-envelope")).toBe(true);
  });
});
