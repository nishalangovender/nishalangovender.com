import { describe, expect, it } from "vitest";

import { DESK, PAGE_HEIGHT } from "../desk-layout";
import { BINDING, HINGE_X, LEFT_X, bindingCoil, bindingHoles } from "../Notebook";
import { PAGE } from "../sketch";

describe("spiral binding", () => {
  const coil = bindingCoil();
  const xs = coil.filter((_, i) => i % 3 === 0);
  const ys = coil.filter((_, i) => i % 3 === 1);
  const zs = coil.filter((_, i) => i % 3 === 2);

  it("runs down the gutter, rests on the desk and arches over the pages", () => {
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(DESK.height - 1e-9);
    expect(Math.max(...ys)).toBeGreaterThan(PAGE_HEIGHT);
    expect(Math.min(...xs)).toBeCloseTo(HINGE_X - BINDING.radius, 3);
    expect(Math.max(...xs)).toBeCloseTo(HINGE_X + BINDING.radius, 3);
    expect(Math.min(...zs)).toBeGreaterThan(-PAGE.depth / 2);
    expect(Math.max(...zs)).toBeLessThan(PAGE.depth / 2);
  });

  it("punches a hole each side of the gutter per turn, inside each page", () => {
    const holes = bindingHoles();
    const right = holes.filter(([x]) => x > HINGE_X);
    const left = holes.filter(([x]) => x < HINGE_X);
    expect(right.length).toBe(left.length);
    expect(right.length).toBeGreaterThan(10);
    for (const [x] of right) expect(x).toBeLessThan(HINGE_X + PAGE.width);
    for (const [x] of left) expect(x).toBeGreaterThan(LEFT_X - PAGE.width / 2);
    right.slice(1).forEach(([, z], i) => expect(z - right[i][1]).toBeCloseTo(BINDING.pitch, 9));
  });
});
