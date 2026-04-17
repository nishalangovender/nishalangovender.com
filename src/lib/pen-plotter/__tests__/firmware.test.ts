import { describe, expect, it } from "vitest";

import { InMemoryBus } from "../bus";
import { Firmware } from "../firmware";
import { HW, type Response } from "../types";

function run(fw: Firmware, bus: InMemoryBus, seconds: number, dt = 1 / 60): Response[] {
  const steps = Math.ceil(seconds / dt);
  const out: Response[] = [];
  for (let i = 0; i < steps; i++) {
    fw.step(dt, i * dt);
    out.push(...bus.drainResponses());
  }
  return out;
}

describe("Firmware", () => {
  it("HOME resets counters and status", () => {
    const bus = new InMemoryBus();
    const fw = new Firmware(bus);
    bus.sendCommand({ kind: "ROTATE", steps: 5000 });
    run(fw, bus, 0.5);
    bus.sendCommand({ kind: "HOME" });
    run(fw, bus, 0.2);
    const s = fw.getState();
    expect(s.thetaSteps).toBe(0);
    expect(s.thetaTargetSteps).toBe(0);
    expect(s.adc).toBe(0);
    expect(s.adcTarget).toBe(0);
    expect(s.pen).toBe("UP");
    expect(s.status).toBe("IDLE");
  });

  it("ROTATE N eventually reaches thetaSteps = N and emits one OK", () => {
    const bus = new InMemoryBus();
    const fw = new Firmware(bus);
    bus.sendCommand({ kind: "ROTATE", steps: 60_000 });
    const responses = run(fw, bus, 0.2);
    expect(fw.getState().thetaSteps).toBe(60_000);
    expect(responses.filter((r) => r.kind === "OK")).toHaveLength(1);
  });

  it("LINEAR target converges within ADC_TOLERANCE and emits OK", () => {
    const bus = new InMemoryBus();
    const fw = new Firmware(bus);
    bus.sendCommand({ kind: "LINEAR", adcTarget: 412 });
    const responses = run(fw, bus, 2.0);
    const s = fw.getState();
    expect(Math.abs(s.adc - 412)).toBeLessThanOrEqual(HW.ADC_TOLERANCE);
    expect(responses.filter((r) => r.kind === "OK")).toHaveLength(1);
  });

  it("LINEAR emits ERR timeout when settle window exceeded", () => {
    const bus = new InMemoryBus();
    // Force an effectively-unreachable settle by passing a tiny timeout override.
    const fw = new Firmware(bus, { settleTimeoutS: 0.05 });
    bus.sendCommand({ kind: "LINEAR", adcTarget: 800 });
    const responses = run(fw, bus, 0.2);
    const errs = responses.filter((r) => r.kind === "ERR");
    expect(errs).toHaveLength(1);
    expect(fw.getState().status).toBe("ERR");
  });

  it("PEN Down / PEN UP emits synchronous OK", () => {
    const bus = new InMemoryBus();
    const fw = new Firmware(bus);
    bus.sendCommand({ kind: "PEN", state: "DOWN" });
    fw.step(1 / 60, 0);
    const resps = bus.drainResponses();
    expect(resps).toHaveLength(1);
    expect(resps[0]?.kind).toBe("OK");
    expect(fw.getState().pen).toBe("DOWN");
  });
});
