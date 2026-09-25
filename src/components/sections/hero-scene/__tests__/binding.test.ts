import { describe, expect, it } from "vitest";

import { DESK, NOTEBOOK, PAGE_HEIGHT } from "../desk-layout";
import { BINDING, bindingCoil, bindingHoles } from "../Notebook";
import { PAGE } from "../sketch";

describe("spiral binding", () => {
  const coil = bindingCoil();
  const ys = coil.filter((_, i) => i % 3 === 1);
  const zs = coil.filter((_, i) => i % 3 === 2);

  it("rests on the desk and rises over the top page", () => {
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(DESK.height - 1e-9);
    expect(Math.max(...ys)).toBeGreaterThan(PAGE_HEIGHT);
  });

  it("wraps round the outside of the spine and in through the page", () => {
    const spine = -PAGE.depth / 2 - NOTEBOOK.coverMargin;
    expect(Math.min(...zs)).toBeLessThan(spine);
    expect(Math.max(...zs)).toBeGreaterThan(-PAGE.depth / 2 + BINDING.holeInset - 1e-9);
  });

  it("punches one hole per turn along the bound edge, inside the page", () => {
    const holes = bindingHoles();
    expect(holes.length).toBeGreaterThan(10);
    for (const [x, z] of holes) {
      expect(Math.abs(x)).toBeLessThan(PAGE.width / 2);
      expect(z).toBeCloseTo(-PAGE.depth / 2 + BINDING.holeInset, 9);
    }
    holes.slice(1).forEach(([x], i) => expect(x - holes[i][0]).toBeCloseTo(BINDING.pitch, 9));
  });
});
