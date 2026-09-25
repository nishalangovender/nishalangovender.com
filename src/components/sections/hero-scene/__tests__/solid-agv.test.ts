import { describe, expect, it } from "vitest";

import { buildAgvModel } from "../Agv";
import { LAYER } from "../lines";
import { buildSolidAgv, setSolidOpacity } from "../solid-agv";

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

describe("AGV draw layer", () => {
  it("has no nested Group to reset the layer the AGV's top group sets", () => {
    const { group } = buildAgvModel();
    const nested: unknown[] = [];
    group.traverse((o) => {
      if (o !== group && (o as { isGroup?: boolean }).isGroup) nested.push(o);
    });
    expect(group.renderOrder).toBe(LAYER.agv);
    expect(nested).toEqual([]);
  });
});
