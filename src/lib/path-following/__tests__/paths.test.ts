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

  it("figure-eight has curvature that changes sign", () => {
    const curvatures = Array.from({ length: 100 }, (_, i) =>
      samplePath("figure-eight", (i / 100) * 20).kappa,
    );
    expect(Math.min(...curvatures)).toBeLessThan(0);
    expect(Math.max(...curvatures)).toBeGreaterThan(0);
  });
});

describe("densify", () => {
  it("returns the requested number of samples", () => {
    const pts = densify("lemniscate", 20, 200);
    expect(pts).toHaveLength(200);
  });
});
