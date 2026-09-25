"use client";

/**
 * The desk's gear, beside the notebook and in front of the monitor: a heavy
 * aluminium 60% mechanical keyboard with monochrome keycaps, and an
 * ergonomic mouse in the MX Master mould. Lit, matte and metal finishes to
 * match the desk; keycaps are instanced from the layout in keyboard.ts.
 */
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Material,
} from "three";

import { DESK } from "./desk-layout";
import { toWorld } from "./factory";
import { ROWS, ROW_UNITS, keyLayout } from "./keyboard";
import { LAYER } from "./lines";

/** Keyboard and mouse centres on the desk (map frame), between the notebook and the monitor. */
export const KEYBOARD = { x: -3.4, y: 2.75 } as const;
export const MOUSE = { x: 1.8, y: 2.6 } as const;
/** Keyboard footprint on the desk, map units. */
export const KEYBOARD_SIZE = { width: ROW_UNITS * 0.3 + 0.24, depth: ROWS.length * 0.3 + 0.24 } as const;

/** One key unit, keycap gap and height, and the case's rim and thickness. */
const U = 0.3;
const GAP = 0.035;
const CAP_H = 0.09;
const RIM = 0.12;
const CASE_H = 0.16;
/** Typing angle: the back of the board sits higher than the front. */
const TILT = (4 * Math.PI) / 180;

/** Matte and metal finishes: anodised aluminium, dark PBT caps in two greys, graphite mouse. */
const FINISH = {
  case: { color: "#5a5e65", roughness: 0.32, metalness: 0.9 },
  plate: { color: "#26282c", roughness: 0.6, metalness: 0.4 },
  alpha: { color: "#34373c", roughness: 0.75, metalness: 0 },
  modifier: { color: "#24262a", roughness: 0.75, metalness: 0 },
  mouse: { color: "#3a3c40", roughness: 0.7, metalness: 0.05 },
  thumb: { color: "#2c2e31", roughness: 0.8, metalness: 0 },
  wheel: { color: "#9aa0a7", roughness: 0.3, metalness: 0.9 },
} as const;

function keyboard(mat: Record<keyof typeof FINISH, MeshStandardMaterial>): Group {
  const board = new Group();
  const width = ROW_UNITS * U + 2 * RIM;
  const depth = ROWS.length * U + 2 * RIM;
  const shadowed = <T extends Mesh>(mesh: T): T => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    board.add(mesh);
    return mesh;
  };
  // Heavy machined case with a recessed plate the keys sit in.
  shadowed(new Mesh(new BoxGeometry(width, CASE_H, depth), mat.case)).position.y = CASE_H / 2;
  shadowed(new Mesh(new BoxGeometry(width - 2 * RIM + 0.02, 0.01, depth - 2 * RIM + 0.02), mat.plate)).position.y =
    CASE_H + 0.005;

  const keys = keyLayout();
  const cap = new BoxGeometry(1, CAP_H, U - GAP);
  const place = (modifier: boolean) => {
    const set = keys.filter((k) => k.modifier === modifier);
    const mesh = shadowed(new InstancedMesh(cap, modifier ? mat.modifier : mat.alpha, set.length));
    set.forEach((k, i) => {
      const x = -width / 2 + RIM + k.x * U;
      const z = -depth / 2 + RIM + (k.row + 0.5) * U;
      mesh.setMatrixAt(
        i,
        new Matrix4().compose(
          new Vector3(x, CASE_H + CAP_H / 2, z),
          new Quaternion(),
          new Vector3(k.width * U - GAP, 1, 1),
        ),
      );
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place(false);
  place(true);
  // Tip the back up about the front edge, so the front still rests on the desk.
  board.rotation.x = TILT;
  board.position.y = (depth / 2) * Math.sin(TILT);
  const stand = new Group();
  stand.add(board);
  return stand;
}

/** An ergonomic mouse in the MX Master mould: sculpted body, thumb rest, metal scroll wheel. */
function mouse(mat: Record<keyof typeof FINISH, MeshStandardMaterial>): Group {
  const m = new Group();
  const add = (mesh: Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    m.add(mesh);
    return mesh;
  };
  // Body: a long ellipsoid, higher at the back where the palm rests, sunk into the desk at its base.
  const body = add(new Mesh(new SphereGeometry(1, 40, 20), mat.mouse));
  body.scale.set(0.5, 0.36, 0.85);
  body.position.set(0, 0.02, 0.05);
  const palm = add(new Mesh(new SphereGeometry(1, 32, 16), mat.mouse));
  palm.scale.set(0.46, 0.4, 0.5);
  palm.position.set(0.02, 0.04, 0.3);
  // Thumb rest flaring out on the left.
  const thumb = add(new Mesh(new SphereGeometry(1, 24, 12), mat.thumb));
  thumb.scale.set(0.28, 0.13, 0.55);
  thumb.position.set(-0.42, 0.06, 0.12);
  // Scroll wheel between the buttons, and the thumb wheel on the side.
  const wheel = add(new Mesh(new CylinderGeometry(0.09, 0.09, 0.07, 24), mat.wheel));
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, 0.36, -0.42);
  const side = add(new Mesh(new CylinderGeometry(0.07, 0.07, 0.035, 20), mat.wheel));
  side.rotation.x = Math.PI / 2;
  side.rotation.z = Math.PI / 2;
  side.position.set(-0.44, 0.2, -0.05);
  // Angled a little, as a right hand leaves it. Modelled at ~2× scale, so
  // shrink it to a real mouse's length against the keyboard (~12.5 cm : 30 cm).
  m.rotation.y = -0.18;
  m.scale.set(0.45, 0.32, 0.45);
  return m;
}

/** A heavy aluminium mechanical keyboard and an ergonomic mouse on the desk. */
export function DeskGear() {
  const group = useMemo(() => {
    const mat = Object.fromEntries(
      Object.entries(FINISH).map(([k, v]) => [k, new MeshStandardMaterial(v)]),
    ) as Record<keyof typeof FINISH, MeshStandardMaterial>;
    const board = keyboard(mat);
    board.position.set(...toWorld(KEYBOARD.x, KEYBOARD.y, DESK.height));
    const pointer = mouse(mat);
    pointer.position.set(...toWorld(MOUSE.x, MOUSE.y, DESK.height));
    const group = new Group();
    group.add(board, pointer);
    group.renderOrder = LAYER.page;
    return group;
  }, []);

  useEffect(
    () => () => {
      const materials = new Set<Material>();
      group.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        if (mesh.material) materials.add(mesh.material as Material);
      });
      for (const m of materials) m.dispose();
    },
    [group],
  );

  return <primitive object={group} />;
}
