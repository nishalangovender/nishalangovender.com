"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { Simulator } from "@/lib/pen-plotter/simulation";
import type { SimConfig, SimFrame, SimStats } from "@/lib/pen-plotter/types";

const MAX_ITERS_PER_RAF = 32;
const DT = 1 / 60;

type Listener = () => void;

interface SimSnapshot {
  latest: SimFrame | null;
  isPlaying: boolean;
  isComplete: boolean;
  stats: SimStats;
}

export interface UseSimulationResult {
  latest: SimFrame | null;
  stats: SimStats;
  isPlaying: boolean;
  isComplete: boolean;
  play: () => void;
  pause: () => void;
  reset: (nextConfig?: SimConfig) => void;
  updateConfig: (patch: Partial<SimConfig>) => void;
}

export function useSimulation(initial: SimConfig): UseSimulationResult {
  const configRef = useRef<SimConfig>(initial);
  const simRef = useRef<Simulator>(new Simulator(initial));
  const listenersRef = useRef<Set<Listener>>(new Set());
  const playingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const simClockRef = useRef<number>(0);
  const wallStartRef = useRef<number>(0);
  const snapRef = useRef<SimSnapshot>({
    latest: null,
    isPlaying: false,
    isComplete: false,
    stats: { commandsIssued: 0, errorsReported: 0, tracePenDownSegments: 0 },
  });

  const notify = useCallback(() => {
    snapRef.current = {
      latest: simRef.current.getLatestFrame(),
      isPlaying: playingRef.current,
      isComplete: simRef.current.isComplete(),
      stats: simRef.current.getStats(),
    };
    for (const l of listenersRef.current) l();
  }, []);

  const subscribe = useCallback((l: Listener) => {
    listenersRef.current.add(l);
    return () => {
      listenersRef.current.delete(l);
    };
  }, []);
  const snapshot = useCallback(() => snapRef.current, []);
  const snap = useSyncExternalStore(subscribe, snapshot, snapshot);

  const tickRef = useRef<(now: number) => void>(() => {});
  const tick = useCallback(
    (now: number) => {
      if (!playingRef.current) return;
      const wall = (now - wallStartRef.current) / 1000;
      const target = wall * configRef.current.speed;
      let iters = 0;
      while (simClockRef.current < target && iters < MAX_ITERS_PER_RAF) {
        simRef.current.step();
        simClockRef.current += DT;
        iters++;
        if (simRef.current.isComplete()) break;
      }
      notify();
      if (simRef.current.isComplete()) {
        playingRef.current = false;
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        notify();
        return;
      }
      rafRef.current = requestAnimationFrame(tickRef.current);
    },
    [notify],
  );
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const play = useCallback(() => {
    if (playingRef.current) return;
    if (simRef.current.isComplete()) return;
    playingRef.current = true;
    wallStartRef.current =
      performance.now() - (simClockRef.current * 1000) / configRef.current.speed;
    rafRef.current = requestAnimationFrame(tickRef.current);
    notify();
  }, [notify]);

  const pause = useCallback(() => {
    playingRef.current = false;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    notify();
  }, [notify]);

  const reset = useCallback(
    (nextConfig?: SimConfig) => {
      const next = nextConfig ?? configRef.current;
      configRef.current = next;
      simRef.current = new Simulator(next);
      simClockRef.current = 0;
      wallStartRef.current = 0;
      notify();
    },
    [notify],
  );

  const updateConfig = useCallback((patch: Partial<SimConfig>) => {
    configRef.current = { ...configRef.current, ...patch };
    if (Simulator.canUpdateLive(patch)) {
      simRef.current.updateConfig(patch);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const result = useMemo<UseSimulationResult>(
    () => ({
      latest: snap.latest,
      stats: snap.stats,
      isPlaying: snap.isPlaying,
      isComplete: snap.isComplete,
      play,
      pause,
      reset,
      updateConfig,
    }),
    [snap, play, pause, reset, updateConfig],
  );
  return result;
}
