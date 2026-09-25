/**
 * The factory the notebook becomes, in the ROS map frame (x forward, y left,
 * metres). `toWorld` maps a map point onto the three.js floor: (x, h, −y).
 * Pure maths — the point cloud, lidar and costmap all read from here.
 */

export interface Rect {
  /** Centre. */
  x: number;
  y: number;
  /** Size along x and y. */
  w: number;
  d: number;
  /** Height. */
  h: number;
}

export const FLOOR = { minX: -6, maxX: 6, minY: -3.6, maxY: 5.4, wallHeight: 2.6 } as const;

/** Two rack rows either side of the loop the AGV runs, plus two pillars. */
export const OBSTACLES: readonly Rect[] = [
  { x: -2.6, y: 3.2, w: 3.8, d: 0.9, h: 2.2 },
  { x: 2.6, y: 3.2, w: 3.8, d: 0.9, h: 2.2 },
  { x: -2.6, y: -1.5, w: 3.8, d: 0.9, h: 2.2 },
  { x: 2.6, y: -1.5, w: 3.8, d: 0.9, h: 2.2 },
  { x: -5.2, y: 0.9, w: 0.4, d: 0.4, h: 2.6 },
  { x: 5.2, y: 0.9, w: 0.4, d: 0.4, h: 2.6 },
];

/** Centre of the factory floor in the map frame — where the camera looks. */
export const FACTORY_CENTRE = {
  x: (FLOOR.minX + FLOOR.maxX) / 2,
  y: (FLOOR.minY + FLOOR.maxY) / 2,
} as const;

export function toWorld(x: number, y: number, h = 0): [number, number, number] {
  return [x, h, -y];
}

/** Small seeded PRNG, so the cloud is identical on every load and in tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * `n` points sampled over the factory's surfaces, as flat three.js [x, y, z]:
 * floor, walls, and the sides and tops of every obstacle — what a 3D lidar
 * map of the floor looks like.
 */
export function factoryPoints(n: number, seed = 7): Float32Array {
  const rand = mulberry32(seed);
  const out = new Float32Array(n * 3);
  const put = (i: number, x: number, y: number, h: number) => out.set(toWorld(x, y, h), i * 3);
  const spanX = FLOOR.maxX - FLOOR.minX;
  const spanY = FLOOR.maxY - FLOOR.minY;

  for (let i = 0; i < n; i++) {
    const r = rand();
    if (r < 0.16) {
      put(i, FLOOR.minX + rand() * spanX, FLOOR.minY + rand() * spanY, 0);
    } else if (r < 0.45) {
      // Walls, weighted by length.
      const h = rand() * FLOOR.wallHeight;
      const u = rand() * 2 * (spanX + spanY);
      if (u < spanX) put(i, FLOOR.minX + u, FLOOR.maxY, h);
      else if (u < 2 * spanX) put(i, FLOOR.minX + (u - spanX), FLOOR.minY, h);
      else if (u < 2 * spanX + spanY) put(i, FLOOR.minX, FLOOR.minY + (u - 2 * spanX), h);
      else put(i, FLOOR.maxX, FLOOR.minY + (u - 2 * spanX - spanY), h);
    } else {
      const o = OBSTACLES[Math.floor(rand() * OBSTACLES.length)];
      const side = rand();
      const a = rand() - 0.5;
      const h = rand() * o.h;
      if (side < 0.2) put(i, o.x + a * o.w, o.y + (rand() - 0.5) * o.d, o.h);
      else if (side < 0.5) put(i, o.x + a * o.w, o.y - o.d / 2, h);
      else if (side < 0.8) put(i, o.x + a * o.w, o.y + o.d / 2, h);
      else put(i, o.x + Math.sign(a) * (o.w / 2), o.y + (rand() - 0.5) * o.d, h);
    }
  }
  return out;
}

/** Distance from (x, y) to the nearest obstacle or wall, in metres. */
export function clearance(x: number, y: number): number {
  let best = Math.min(x - FLOOR.minX, FLOOR.maxX - x, y - FLOOR.minY, FLOOR.maxY - y);
  for (const o of OBSTACLES) {
    const dx = Math.max(Math.abs(x - o.x) - o.w / 2, 0);
    const dy = Math.max(Math.abs(y - o.y) - o.d / 2, 0);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

/** Nav2-style inflated cost in [0, 1]: lethal inside, decaying to 0 at `radius`. */
export function costAt(x: number, y: number, radius = 0.9): number {
  const c = clearance(x, y);
  if (c <= 0) return 1;
  return c >= radius ? 0 : Math.exp(-4 * (c / radius)) * (1 - c / radius);
}

/** Range along a ray from (x, y) at `angle` to the first wall or obstacle. */
export function raycast(x: number, y: number, angle: number, maxRange: number): number {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  // Walls: the ray always leaves the floor rectangle.
  let t = maxRange;
  if (dx > 0) t = Math.min(t, (FLOOR.maxX - x) / dx);
  if (dx < 0) t = Math.min(t, (FLOOR.minX - x) / dx);
  if (dy > 0) t = Math.min(t, (FLOOR.maxY - y) / dy);
  if (dy < 0) t = Math.min(t, (FLOOR.minY - y) / dy);
  // Obstacles: 2D slab test.
  for (const o of OBSTACLES) {
    const tx1 = (o.x - o.w / 2 - x) / dx;
    const tx2 = (o.x + o.w / 2 - x) / dx;
    const ty1 = (o.y - o.d / 2 - y) / dy;
    const ty2 = (o.y + o.d / 2 - y) / dy;
    const near = Math.max(Math.min(tx1, tx2), Math.min(ty1, ty2));
    const far = Math.min(Math.max(tx1, tx2), Math.max(ty1, ty2));
    if (far >= near && near > 0) t = Math.min(t, near);
  }
  return Math.max(0, t);
}
