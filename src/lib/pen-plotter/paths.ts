import { HW, type PresetId, type Vec2 } from "./types";

export function interpolatePolyline(
  poly: ReadonlyArray<Vec2>,
  stepMm: number,
): Vec2[] {
  if (poly.length === 0) return [];
  if (poly.length === 1) return [{ ...poly[0] }];
  const out: Vec2[] = [{ ...poly[0] }];
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1];
    const b = poly[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len <= stepMm) {
      out.push({ ...b });
      continue;
    }
    const n = Math.ceil(len / stepMm);
    for (let k = 1; k <= n; k++) {
      const f = k / n;
      out.push({ x: a.x + dx * f, y: a.y + dy * f });
    }
  }
  return out;
}

export function getPreset(id: PresetId): Vec2[] {
  switch (id) {
    case "star":
      return star();
    case "spiral":
      return spiral();
    case "rose":
      return rose();
    case "rounded-rect":
      return roundedRect();
  }
}

// ---- Preset generators (mm, centred on pivot with offset so envelope clears) ----

const CENTER: Vec2 = { x: 150, y: 0 }; // shift drawings to the +x side of the pivot

function star(): Vec2[] {
  const outer = 90;
  const inner = 36;
  const pts: Vec2[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (-Math.PI / 2) + i * (Math.PI / 5);
    pts.push({ x: CENTER.x + r * Math.cos(a), y: CENTER.y + r * Math.sin(a) });
  }
  pts.push({ ...pts[0] }); // close
  return pts;
}

function spiral(): Vec2[] {
  const turns = 3.5;
  const pts: Vec2[] = [];
  const samples = 220;
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * turns * 2 * Math.PI;
    const r = 10 + (t / (turns * 2 * Math.PI)) * 85; // 10 mm → 95 mm
    pts.push({ x: CENTER.x + r * Math.cos(t), y: CENTER.y + r * Math.sin(t) });
  }
  return pts;
}

function rose(): Vec2[] {
  // r = a·cos(k·θ), k = 5 → five-petal rose.
  const a = 95;
  const k = 5;
  const pts: Vec2[] = [];
  const samples = 360;
  for (let i = 0; i <= samples; i++) {
    const theta = (i / samples) * 2 * Math.PI;
    const r = a * Math.cos(k * theta);
    pts.push({ x: CENTER.x + r * Math.cos(theta), y: CENTER.y + r * Math.sin(theta) });
  }
  return pts;
}

function roundedRect(): Vec2[] {
  const w = 160;
  const h = 120;
  const rad = 24;
  const cx = CENTER.x;
  const cy = CENTER.y;
  const pts: Vec2[] = [];
  const arcSamples = 8;
  const corners: [number, number, number][] = [
    [cx + w / 2 - rad, cy - h / 2 + rad, -Math.PI / 2], // top-right
    [cx + w / 2 - rad, cy + h / 2 - rad, 0],            // bottom-right
    [cx - w / 2 + rad, cy + h / 2 - rad, Math.PI / 2],  // bottom-left
    [cx - w / 2 + rad, cy - h / 2 + rad, Math.PI],      // top-left
  ];
  for (let i = 0; i < corners.length; i++) {
    const [ax, ay, start] = corners[i];
    for (let s = 0; s <= arcSamples; s++) {
      const a = start + (s / arcSamples) * (Math.PI / 2);
      pts.push({ x: ax + rad * Math.cos(a), y: ay + rad * Math.sin(a) });
    }
  }
  pts.push({ ...pts[0] }); // close
  // Envelope-clamp: rounded-rect as drawn must stay inside R_MAX for any CENTER choice.
  // With CENTER (150, 0) and half-width 80, max r = hypot(230, 60) ≈ 237 < R_MAX (260).
  // Assertion left to the preset test.
  return pts;
}

export { HW };
