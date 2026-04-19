"use client";

import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useRef, useState, type ComponentType } from "react";

import { BeatBoot } from "./beats/BeatBoot";
import { BeatDashboard } from "./beats/BeatDashboard";
import { BeatDrive } from "./beats/BeatDrive";
import { BeatLift } from "./beats/BeatLift";
import { BeatReturn } from "./beats/BeatReturn";
import { BeatSketch } from "./beats/BeatSketch";
import { HeroLoopStatic } from "./HeroLoopStatic";
import { BEATS, TOTAL_DURATION, beatProgressAt } from "./timeline";
import type { BeatId } from "./types";

const BEAT_COMPONENTS: Record<BeatId, ComponentType<{ progress: number; active: boolean }>> = {
  sketch: BeatSketch,
  lift: BeatLift,
  boot: BeatBoot,
  drive: BeatDrive,
  dashboard: BeatDashboard,
  return: BeatReturn,
};

export default function HeroLoop() {
  const reducedMotion = useReducedMotion();
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useAnimationFrame((t) => {
    if (reducedMotion) return;
    if (startRef.current === null) startRef.current = t;
    const secs = ((t - startRef.current) / 1000) % TOTAL_DURATION;
    setElapsed(secs);
  });

  if (reducedMotion) {
    return (
      <div className="w-full" style={{ aspectRatio: "640 / 540" }}>
        <HeroLoopStatic />
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "640 / 540" }}
      role="img"
      aria-label="Animated engineering sketch: a hand-drawn kinematic diagram comes alive into a robot operating in a workshop, then pulls back to a fleet dashboard and closes the loop on the desk."
    >
      {/* Blueprint-grid substrate is rendered INSIDE each beat's SVG (so it
          can be transformed / clipped to the sketch area when the camera
          pans into non-sketch regions like the warehouse in Beat 4). */}
      {BEATS.map((beat) => {
        const progress = beatProgressAt(elapsed, beat);
        const active = progress !== null;
        const Beat = BEAT_COMPONENTS[beat.id];
        return (
          <div key={beat.id} className="absolute inset-0" aria-hidden="true">
            <Beat progress={progress ?? 0} active={active} />
          </div>
        );
      })}
    </div>
  );
}
