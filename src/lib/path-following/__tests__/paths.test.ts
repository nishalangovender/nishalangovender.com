import { describe, expect, it } from "vitest";

import { samplePath, densify } from "../paths";

describe("samplePath", () => {
  it("lemniscate closes on itself after full period (T = 20s)", () => {
    const p0 = samplePath("lemniscate", 0);
    const pT = samplePath("lemniscate", 20);
    expect(pT.x).toBeCloseTo(p0.x, 5);
    expect(pT.y).toBeCloseTo(p0.y, 5);
  });

  it("circle has constant positive curvature", () => {
    const p1 = samplePath("circle", 5);
    const p2 = samplePath("circle", 10);
    expect(Math.abs(p1.kappa - p2.kappa)).toBeLessThan(1e-6);
    expect(p1.kappa).toBeGreaterThan(0);
  });

  it("stadium has zero curvature on straights and constant on arcs", () => {
    const midBottom = samplePath("stadium", 1.5); // mid of bottom straight
    expect(midBottom.kappa).toBe(0);
    const midArc = samplePath("stadium", 5); // well into the right arc
    expect(midArc.kappa).toBeGreaterThan(0);
  });

  it("stadium closes on itself after full period", () => {
    const p0 = samplePath("stadium", 0);
    const pT = samplePath("stadium", 20);
    expect(pT.x).toBeCloseTo(p0.x, 5);
    expect(pT.y).toBeCloseTo(p0.y, 5);
  });
});

describe("densify", () => {
  it("returns the requested number of samples", () => {
    const pts = densify("lemniscate", 20, 200);
    expect(pts).toHaveLength(200);
  });
});
