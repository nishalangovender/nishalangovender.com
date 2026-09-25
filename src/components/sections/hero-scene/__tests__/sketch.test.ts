import { describe, expect, it } from "vitest";

import { agvEdges, agvPresence, heroPose } from "../Agv";
import { BEATS, TOTAL_DURATION } from "../beats";
import { PAGE_LANDING } from "../camera";
import { inkAt } from "../InkSketch";
import {
  BASE_LINK,
  DOT_PITCH,
  PAGE,
  SKETCH_BODY,
  SKETCH_HEADING,
  SKETCH_LABELS,
  SKETCH_ORIGIN,
  SKETCH_ROLES,
  SKETCH_SEGMENTS,
  SKETCH_STROKES,
  bodySegmentsIn,
  pageDots,
  segmentsDrawn,
} from "../sketch";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;
const mid = (id: string) => (beat(id).start + beat(id).end) / 2;

describe("sketch geometry", () => {
  it("is whole segments that stay on the page, one role per segment", () => {
    expect(SKETCH_SEGMENTS.length % 4).toBe(0);
    expect(SKETCH_ROLES).toHaveLength(SKETCH_SEGMENTS.length / 4);
    for (let i = 0; i < SKETCH_SEGMENTS.length; i += 2) {
      expect(Math.abs(SKETCH_SEGMENTS[i])).toBeLessThan(PAGE.width / 2);
      expect(Math.abs(SKETCH_SEGMENTS[i + 1])).toBeLessThan(PAGE.depth / 2);
    }
  });

  it("gives every stroke an equal share of the drawing time", () => {
    expect(segmentsDrawn(0)).toBe(0);
    expect(segmentsDrawn(1)).toBe(SKETCH_SEGMENTS.length / 4);
    let prev = 0;
    for (let f = 0; f <= 1; f += 0.01) {
      const n = segmentsDrawn(f);
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
  });

  it("marks only the chassis, drive wheels and castor as the lifting robot outline", () => {
    expect(SKETCH_STROKES.filter((st) => st.body)).toHaveLength(4); // chassis, two wheels, castor
    const bodyCount = SKETCH_BODY.filter(Boolean).length;
    expect(bodySegmentsIn(SKETCH_BODY.length)).toBe(bodyCount);
    SKETCH_BODY.forEach((isBody, i) => {
      if (isBody) expect(SKETCH_ROLES[i]).toBe("ink");
    });
  });

  it("writes every symbol of the kinematic diagram on the page", () => {
    expect(SKETCH_LABELS.map((l) => l.text).sort()).toEqual(["V", "X", "Y", "x", "y", "θ", "ω"].sort());
    for (const l of SKETCH_LABELS) {
      expect(Math.abs(l.x)).toBeLessThan(PAGE.width / 2);
      expect(Math.abs(l.z)).toBeLessThan(PAGE.depth / 2);
    }
    expect(new Set(SKETCH_ROLES)).toEqual(new Set(["ink", "axisX", "axisY", "motion"]));
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
  });

  it("finishes the drawing and labels before the design beat, then lifts only the robot outline", () => {
    expect(inkAt(beat("sketch").end - 0.01).drawn).toBe(1);
    expect(inkAt(mid("sketch")).drawn).toBeLessThan(1);
    const lifting = inkAt(mid("design"));
    expect(lifting.lift).toBeGreaterThan(0);
    expect(lifting.body).toBeLessThan(1);
    // Annotations and symbols stay written on the page.
    expect(lifting.turn).toBe(0);
    expect(inkAt(mid("system")).turn).toBe(0);
    expect(agvPresence(mid("design"))).toBeGreaterThan(0);
    expect(agvPresence(mid("code"))).toBe(1);
  });

  it("raises the AGV at the sketched heading and turns it to the mission lane while booting", () => {
    expect(heroPose(mid("design")).theta).toBeCloseTo(SKETCH_HEADING, 6);
    expect(heroPose(beat("code").end - 0.01).theta).toBeCloseTo(0, 2);
    expect(heroPose(beat("deploy").start + 0.1).theta).toBe(0);
  });

  it("turns the written sheet over onto the left-hand stack in the return beat", () => {
    // Nothing turns while the camera is still pulling back from the monitor.
    expect(inkAt(mid("return")).turn).toBe(0);
    const r = beat("return");
    const turning = inkAt(r.start + (PAGE_LANDING + 0.15) * (r.end - r.start));
    expect(turning.turn).toBeGreaterThan(0);
    expect(turning.turn).toBeLessThan(1);
    expect(inkAt(beat("return").end - 0.2).turn).toBe(1);
    expect(inkAt(0).turn).toBe(0);
  });

  it("clears the page by the end of the loop", () => {
    const end = TOTAL_DURATION - 1e-6;
    // The sheet has landed on the turned stack; the right page is fresh.
    expect(inkAt(end).turn).toBe(1);
    expect(inkAt(end).body).toBe(0);
    expect(agvPresence(end)).toBeCloseTo(0, 3);
  });
});

describe("sketch on the dot grid", () => {
  const onGrid = (v: number) => Math.abs(v / DOT_PITCH - Math.round(v / DOT_PITCH)) < 1e-9;

  it("puts the world origin on a dot, so the axes run along rows of dots", () => {
    expect(onGrid(SKETCH_ORIGIN[0])).toBe(true);
    expect(onGrid(SKETCH_ORIGIN[1])).toBe(true);
  });

  it("draws the position line from the origin to base_link as one unbroken stroke", () => {
    const near = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-9;
    const lines = SKETCH_STROKES.filter(
      (st) => near(st.points[0], SKETCH_ORIGIN) && near(st.points.at(-1)!, [BASE_LINK.x, -BASE_LINK.z]),
    );
    expect(lines).toHaveLength(1);
  });
});
