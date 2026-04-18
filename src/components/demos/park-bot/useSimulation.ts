// src/components/demos/park-bot/useSimulation.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { computeWheelTargets } from "@/lib/park-bot/kinematics";
import { planMission } from "@/lib/park-bot/mission";
import { getScenario } from "@/lib/park-bot/scenarios";
import type {
  Pose,
  SimConfig,
  SimFrame,
  Twist,
} from "@/lib/park-bot/types";

export interface SimulationHandle {
  frame: SimFrame | null;
  playing: boolean;
  play(): void;
  pause(): void;
  reset(): void;
}

export function useSimulation(config: SimConfig): SimulationHandle {
  const scenario = useMemo(() => getScenario(config.scenarioId), [config.scenarioId]);
  const mission = useMemo(
    () => planMission(scenario, config.forcedMode),
    [scenario, config.forcedMode],
  );

  const [frame, setFrame] = useState<SimFrame | null>(null);
  const [playing, setPlaying] = useState(false);

  const tRef = useRef(0);
  const poseRef = useRef<Pose>({ ...scenario.start });
  const trailRef = useRef<Pose[]>([{ ...scenario.start }]);
  const rafRef = useRef<number | null>(null);
  const lastWallRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    tRef.current = 0;
    poseRef.current = { ...scenario.start };
    trailRef.current = [{ ...scenario.start }];
    lastWallRef.current = null;
    setPlaying(false);
    setFrame({
      t: 0,
      pose: { ...scenario.start },
      wheels: computeWheelTargets({ vx: 0, vy: 0, omega: 0 }, config.forcedMode ?? scenario.recommendedMode),
      activeMode: config.forcedMode ?? scenario.recommendedMode,
      phase: "idle",
      phaseIndex: 0,
      trail: [{ ...scenario.start }],
      stuck: false,
    });
  }, [scenario, config.forcedMode]);

  // Reset derived state whenever the external sim config changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting derived state on config change is the intended behaviour
    reset();
  }, [reset]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastWallRef.current = null;
      return;
    }

    const tick = (wall: number) => {
      if (lastWallRef.current === null) lastWallRef.current = wall;
      const wallDt = Math.min((wall - lastWallRef.current) / 1000, 0.05);
      lastWallRef.current = wall;

      let simDt = wallDt;
      while (simDt > 1e-6) {
        const step = Math.min(config.dt, simDt);
        const sample = mission.sample(tRef.current);
        const twist: Twist = sample.twist;
        const cos = Math.cos(poseRef.current.theta);
        const sin = Math.sin(poseRef.current.theta);
        poseRef.current = {
          x: poseRef.current.x + (twist.vx * cos - twist.vy * sin) * step,
          y: poseRef.current.y + (twist.vx * sin + twist.vy * cos) * step,
          theta: poseRef.current.theta + twist.omega * step,
        };
        trailRef.current = [...trailRef.current, poseRef.current];
        tRef.current += step;
        simDt -= step;

        if (sample.phase === "done") {
          setPlaying(false);
          simDt = 0;
        }
      }

      const sample = mission.sample(tRef.current);
      const wheels = computeWheelTargets(sample.twist, sample.activeMode);
      setFrame({
        t: tRef.current,
        pose: poseRef.current,
        wheels,
        activeMode: sample.activeMode,
        phase: sample.phase,
        phaseIndex: sample.phaseIndex,
        trail: trailRef.current,
        stuck: sample.stuck,
      });

      if (playing) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, mission, config.dt]);

  return { frame, playing, play, pause, reset };
}
