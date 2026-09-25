import { describe, expect, it } from "vitest";

import { agvEdges, agvPresence } from "../Agv";
import { BEATS, TOTAL_DURATION } from "../beats";
import { inkAt } from "../InkSketch";
import { pageOpacity } from "../Notebook";
import { PAGE, SKETCH_AXES, SKETCH_SEGMENTS, pageDots } from "../sketch";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;
const mid = (id: string) => (beat(id).start + beat(id).end) / 2;

describe("sketch geometry", () => {
  it("is whole segments that stay on the page", () => {
    for (const segs of [SKETCH_SEGMENTS, SKETCH_AXES]) {
      expect(segs.length % 4).toBe(0);
      for (let i = 0; i < segs.length; i += 2) {
        expect(Math.abs(segs[i])).toBeLessThan(PAGE.width / 2);
        expect(Math.abs(segs[i + 1])).toBeLessThan(PAGE.depth / 2);
      }
    }
  });

  it("builds AGV edges as whole 3D segments", () => {
    const e = agvEdges();
    expect(e.length).toBeGreaterThan(0);
    expect(e.length % 6).toBe(0);
  });

  it("lays the dot grid inside the page", () => {
    const dots = pageDots();
    expect(dots.length % 3).toBe(0);
    for (let i = 0; i < dots.length; i += 3) {
      expect(Math.abs(dots[i])).toBeLessThan(PAGE.width / 2);
      expect(Math.abs(dots[i + 2])).toBeLessThan(PAGE.depth / 2);
    }
  });
});

describe("beats 1–2", () => {
  it("starts the loop on a blank page", () => {
    expect(inkAt(0).drawn).toBe(0);
    expect(agvPresence(0)).toBe(0);
    expect(pageOpacity(0)).toBe(1);
  });

  it("finishes the drawing before the design beat, then lifts it into the AGV", () => {
    expect(inkAt(beat("sketch").end - 0.01).drawn).toBe(1);
    const lifting = inkAt(mid("design"));
    expect(lifting.lift).toBeGreaterThan(0);
    expect(lifting.opacity).toBeLessThan(1);
    expect(agvPresence(mid("design"))).toBeGreaterThan(0);
    expect(agvPresence(mid("code"))).toBe(1);
  });

  it("clears the page by the end of the loop", () => {
    const end = TOTAL_DURATION - 1e-6;
    expect(inkAt(end).opacity).toBe(0);
    expect(agvPresence(end)).toBeCloseTo(0, 3);
    expect(pageOpacity(end)).toBeCloseTo(1, 3);
  });
});
