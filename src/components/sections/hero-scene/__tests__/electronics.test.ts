import { describe, expect, it } from "vitest";

import { BEATS } from "../beats";
import { LEDS, PARTS, buildElectronics, cablesDrawn, ledLit, partDrop } from "../electronics";
import { LINE_DELAY, TYPING_START } from "../terminal";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;
const design = beat("design");
const code = beat("code");
const at = (b: { start: number; end: number }, p: number) => b.start + p * (b.end - b.start);

describe("electronics build", () => {
  it("drops each part into the chassis in the design beat, one after another", () => {
    for (let k = 0; k < PARTS.length; k++) {
      expect(partDrop(beat("sketch").start + 1, k).scale).toBe(0);
      expect(partDrop(design.end - 1e-6, k)).toEqual({ drop: expect.closeTo(0, 6), scale: 1 });
      expect(partDrop(code.start + 1, k)).toEqual({ drop: 0, scale: 1 });
    }
    // Midway through the drops the battery is in and the Pi is still to come.
    const mid = at(design, 0.75);
    expect(partDrop(mid, 0).drop).toBe(0);
    expect(partDrop(mid, PARTS.length - 1).scale).toBe(0);
  });

  it("runs the cables once the parts are in", () => {
    expect(cablesDrawn(at(design, 0.8))).toBe(0);
    expect(cablesDrawn(at(design, 0.95))).toBeGreaterThan(0);
    expect(cablesDrawn(code.start)).toBe(1);
  });

  it("lights the status LEDs as the stack boots", () => {
    LEDS.forEach((_, k) => expect(ledLit(at(design, 0.99), k)).toBe(false));
    expect(ledLit(code.start + TYPING_START + 0.01, 0)).toBe(true);
    expect(ledLit(code.start + TYPING_START + 0.01, LEDS.length - 1)).toBe(false);
    LEDS.forEach((_, k) => expect(ledLit(code.end - 0.01, k)).toBe(true));
    LEDS.forEach((_, k) => expect(ledLit(beat("deploy").start + 1, k)).toBe(true));
    expect(TYPING_START + (Math.max(...LEDS.map((l) => l.onLine)) - 1) * LINE_DELAY).toBeLessThan(code.end - code.start);
  });

  it("keeps the AGV's draw layer: no nested Group", () => {
    const e = buildElectronics();
    const groups: unknown[] = [];
    e.root.traverse((o) => {
      if ((o as { isGroup?: boolean }).isGroup) groups.push(o);
    });
    expect(groups).toEqual([]);
    e.dispose();
  });
});
