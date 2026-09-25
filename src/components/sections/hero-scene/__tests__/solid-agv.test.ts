import { describe, expect, it } from "vitest";

import { DESK, RAMP, materialised } from "../desk-layout";
import { FLOOR } from "../factory";
import { buildSolidAgv, setSolidOpacity } from "../solid-agv";

describe("materialise on the ramp", () => {
  it("is wireframe on the desk, filling in down the ramp, solid on the floor", () => {
    expect(materialised(0)).toBe(0);
    expect(materialised(DESK.maxX)).toBe(0);
    const mid = materialised((RAMP.fromX + RAMP.toX) / 2);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(materialised(FLOOR.minX)).toBe(1);
  });
});

describe("solid AGV", () => {
  it("is opaque with shadows when solid, and blended without shadows while fading", () => {
    const agv = buildSolidAgv();
    const meshes: { castShadow: boolean }[] = [];
    agv.group.traverse((o) => {
      if (o !== agv.group) meshes.push(o);
    });

    setSolidOpacity(agv, 0.5);
    expect(agv.group.visible).toBe(true);
    expect(agv.materials.every((m) => m.transparent && m.opacity === 0.5)).toBe(true);
    expect(meshes.every((m) => !m.castShadow)).toBe(true);

    setSolidOpacity(agv, 1);
    expect(agv.materials.every((m) => !m.transparent && m.depthWrite)).toBe(true);
    expect(meshes.every((m) => m.castShadow)).toBe(true);

    setSolidOpacity(agv, 0);
    expect(agv.group.visible).toBe(false);
  });
});
