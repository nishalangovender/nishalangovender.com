import { describe, expect, it } from "vitest";

import { InMemoryBus } from "../bus";
import type { Command, Response } from "../types";

describe("InMemoryBus", () => {
  it("delivers host → firmware commands FIFO", () => {
    const bus = new InMemoryBus();
    const a: Command = { kind: "HOME" };
    const b: Command = { kind: "GET_POS" };
    bus.sendCommand(a);
    bus.sendCommand(b);
    expect(bus.drainCommands()).toEqual([a, b]);
    expect(bus.drainCommands()).toEqual([]);
  });

  it("delivers firmware → host responses FIFO", () => {
    const bus = new InMemoryBus();
    const r1: Response = { kind: "OK", at: 1 };
    const r2: Response = { kind: "ERR", reason: "timeout" };
    bus.sendResponse(r1);
    bus.sendResponse(r2);
    expect(bus.drainResponses()).toEqual([r1, r2]);
    expect(bus.drainResponses()).toEqual([]);
  });
});
