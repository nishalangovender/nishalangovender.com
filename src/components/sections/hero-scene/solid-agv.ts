/**
 * The realistic AGV the wireframe becomes on the factory floor: lit, matte
 * panels in the base_link frame (x forward, y up) matching the wireframe's
 * dimensions — light industrial-grey body (it has to read against dark
 * concrete), darker top plate, hazard-yellow bumpers, a green status strip,
 * black drive wheels and castor, and a lidar puck.
 */
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";

import { AGV, AGV_BODY_Y as BODY_Y, AGV_LIDAR_OFFSET, LIDAR_HEIGHT } from "./sketch";
import { WHEELS } from "./wheels";

export interface SolidAgv {
  group: Group;
  materials: MeshStandardMaterial[];
  /** One pivot per wheel at its axle, in WHEELS order; spin about local z. */
  wheels: Group[];
}

export function buildSolidAgv(): SolidAgv {
  const materials: MeshStandardMaterial[] = [];
  const mat = (color: string, extra: Partial<MeshStandardMaterial> = {}) => {
    const m = new MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
    Object.assign(m, extra);
    materials.push(m);
    return m;
  };
  const group = new Group();
  const add = (geometry: BufferGeometry, material: MeshStandardMaterial, x: number, y: number, z: number, axleZ = false) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    if (axleZ) mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };

  const body = mat("#d3d6da");
  const plate = mat("#5c636b");
  const hazard = mat("#f0c030");
  const tyre = mat("#111214", { roughness: 0.9 });
  const hub = mat("#8a9099", { roughness: 0.4, metalness: 0.5 });
  const lidar = mat("#15171a", { roughness: 0.4 });
  const status = mat("#2ee6a8");
  status.emissive.set("#2ee6a8");
  status.emissiveIntensity = 1.2;

  const cx = AGV.offset;
  const top = BODY_Y + AGV.height;
  add(new BoxGeometry(AGV.length, AGV.height, AGV.width), body, cx, BODY_Y + AGV.height / 2, 0);
  add(new BoxGeometry(AGV.length - 0.1, 0.03, AGV.width - 0.1), plate, cx, top + 0.015, 0);
  // Bumpers front and back, and a status strip down each side.
  for (const end of [-1, 1]) {
    add(new BoxGeometry(0.06, 0.14, AGV.width + 0.02), hazard, cx + (end * AGV.length) / 2, BODY_Y + 0.1, 0);
    add(new BoxGeometry(AGV.length * 0.6, 0.03, 0.02), status, cx, top - 0.05, (end * AGV.width) / 2 + 0.005);
  }
  // Wheels: tyre plus a hub with three spokes on the outer face, so the spin reads.
  const wheels = WHEELS.map((w) => {
    const pivot = new Group();
    pivot.position.set(w.x, w.y, w.z);
    const outer = Math.sign(w.z) || 1;
    const parts = [
      new Mesh(new CylinderGeometry(w.radius, w.radius, w.width, 20), tyre),
      new Mesh(new CylinderGeometry(w.radius * 0.45, w.radius * 0.45, w.width + 0.01, 12), hub),
      ...[0, 1, 2].map((k) => {
        const spoke = new Mesh(new BoxGeometry(w.radius * 1.5, w.radius * 0.18, 0.01), hub);
        spoke.rotation.z = (k * Math.PI) / 3;
        spoke.position.z = outer * (w.width / 2 + 0.006);
        return spoke;
      }),
    ];
    for (const p of parts.slice(0, 2)) p.rotation.x = Math.PI / 2;
    for (const p of parts) {
      p.castShadow = true;
      p.receiveShadow = true;
      pivot.add(p);
    }
    group.add(pivot);
    return pivot;
  });
  add(new CylinderGeometry(AGV.lidarRadius, AGV.lidarRadius, 0.1, 20), lidar, AGV_LIDAR_OFFSET, LIDAR_HEIGHT, 0);
  return { group, materials, wheels };
}

/**
 * Fades the solid panels: fully opaque at 1, blended below it. Toggling
 * transparency only when it changes keeps the opaque path cheap and sorted;
 * a half-faded robot casts no shadow, so the shadow never outlives the body.
 */
export function setSolidOpacity({ group, materials }: SolidAgv, k: number) {
  group.visible = k > 0;
  const fading = k < 1;
  for (const m of materials) m.opacity = k;
  if (materials[0].transparent === fading) return;
  for (const m of materials) {
    m.transparent = fading;
    m.depthWrite = !fading;
    m.needsUpdate = true;
  }
  group.traverse((o) => {
    o.castShadow = !fading;
  });
}
