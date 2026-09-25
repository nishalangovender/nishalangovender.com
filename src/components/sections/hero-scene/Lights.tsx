"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DirectionalLight, Group, HemisphereLight, PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { DESK } from "./desk-layout";
import { FLOOR, toWorld } from "./factory";

/** Strength of the studio-room image light; the key light still does the modelling. */
const ENV_INTENSITY = 0.55;

/** Centre of everything lit: the desk on the left, the factory on the right. */
const MID_X = (DESK.minX + FLOOR.maxX) / 2;
const HALF_SPAN = (FLOOR.maxX - DESK.minX) / 2 + 1;

/**
 * One light rig for the whole scene, so the desk and the factory read as the
 * same world: image-based light from a generated studio room (soft fill and
 * real reflections on metal and screens), a gentle sky fill, and a key light
 * from above and to the front that casts the only shadows (desktop only —
 * see HeroCanvas). No image files: the room is built in code.
 */
export function Lights() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = ENV_INTENSITY;
    room.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);

  const rig = useMemo(() => {
    const fill = new HemisphereLight("#ffffff", "#3a3a3a", 0.6);
    const key = new DirectionalLight("#ffffff", 2.4);
    key.position.set(...toWorld(MID_X + 4, -8, 16));
    key.target.position.set(...toWorld(MID_X, 0, 0));
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -HALF_SPAN,
      right: HALF_SPAN,
      top: 10,
      bottom: -10,
      near: 1,
      far: 45,
    });
    key.shadow.bias = -0.0005;
    const group = new Group();
    group.add(fill, key, key.target);
    return group;
  }, []);

  return <primitive object={rig} />;
}
