/**
 * Procedural surface textures for the factory, drawn once to canvases from a
 * seeded random stream — no image files to download. Near-white, so each
 * material's colour tints them: polished concrete with trowel mottling,
 * specks and saw-cut joints, and kraft cardboard with fibre and packing tape.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

import { mulberry32 } from "./factory";

/** Metres of floor one concrete tile covers; its saw-cut joints fall on the tile edges. */
export const CONCRETE_TILE = 3;

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!];
}

function texture(c: HTMLCanvasElement): CanvasTexture {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Polished concrete: soft mottling, fine specks and a saw-cut joint along two edges (so tiles meet in a grid). */
export function concreteTexture(): CanvasTexture {
  const size = 512;
  const [c, ctx] = canvas(size);
  const rand = mulberry32(7);
  ctx.fillStyle = "#e6e6e2";
  ctx.fillRect(0, 0, size, size);
  // Trowel mottling: large, faint light and dark patches.
  for (let i = 0; i < 40; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 40 + rand() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const shade = rand() < 0.5 ? "0,0,0" : "255,255,255";
    g.addColorStop(0, `rgba(${shade},${0.04 + rand() * 0.05})`);
    g.addColorStop(1, `rgba(${shade},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // Aggregate specks.
  for (let i = 0; i < 5000; i++) {
    const v = rand() < 0.5 ? 60 : 250;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.08 + rand() * 0.12})`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand(), 1 + rand());
  }
  // Saw-cut control joints.
  ctx.fillStyle = "rgba(40,40,40,0.35)";
  ctx.fillRect(0, 0, size, 2);
  ctx.fillRect(0, 0, 2, size);
  return texture(c);
}

/** Kraft cardboard: fine vertical fibre, a darker fold line and a band of packing tape across the top. */
export function cardboardTexture(): CanvasTexture {
  const size = 256;
  const [c, ctx] = canvas(size);
  const rand = mulberry32(11);
  ctx.fillStyle = "#f2ece2";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const v = rand() < 0.6 ? 120 : 255;
    ctx.fillStyle = `rgba(${v},${v - 20},${v - 50},${0.05 + rand() * 0.08})`;
    ctx.fillRect(rand() * size, rand() * size, 1, 4 + rand() * 10);
  }
  // Packing tape: a slightly glossier, lighter band through the middle.
  ctx.fillStyle = "rgba(255,248,230,0.55)";
  ctx.fillRect(size * 0.42, 0, size * 0.16, size);
  ctx.fillStyle = "rgba(90,70,40,0.18)";
  ctx.fillRect(size * 0.42, 0, 1, size);
  ctx.fillRect(size * 0.58, 0, 1, size);
  return texture(c);
}
