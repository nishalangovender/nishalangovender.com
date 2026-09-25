import { describe, expect, it } from "vitest";

import { BEATS } from "../beats";
import { LEDS, PARTS, buildElectronics, cablesDrawn, ledLit, partPlacement } from "../electronics";
import { LINE_DELAY, TYPING_START } from "../terminal";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;
const design = beat("design");
const code = beat("code");
const at = (b: { start: number; end: number }, p: number) => b.start + p * (b.end - b.start);

describe("electronics build", () => {
  it("shows the parts exploded above the chassis, then collapses them into place", () => {
    for (let k = 0; k < PARTS.length; k++) {
      expect(partPlacement(beat("sketch").start + 1, k).shown).toBe(0);
      expect(partPlacement(at(design, 0.66), k)).toEqual({ shown: 1, explode: 1 });
      expect(partPlacement(design.end - 1e-6, k)).toEqual({ shown: 1, explode: 0 });
      expect(partPlacement(code.start + 1, k)).toEqual({ shown: 1, explode: 0 });
    }
    // Parts appear one after another: the battery before the Pi.
    const early = at(design, 0.47);
    expect(partPlacement(early, 0).shown).toBeGreaterThan(partPlacement(early, PARTS.length - 1).shown);
    // Every part explodes upward, clear of the chassis.
    for (const p of PARTS) expect(p.explode[1]).toBeGreaterThan(0.4);
  });

  it("runs the cables once the parts are in", () => {
    expect(cablesDrawn(at(design, 0.85))).toBe(0);
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
