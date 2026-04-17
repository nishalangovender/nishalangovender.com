// src/components/demos/path-following/useSimulation.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { Simulator } from "@/lib/path-following/simulation";
import type { SimConfig, SimFrame, SimStats } from "@/lib/path-following/types";

const BUFFER_SIZE = 1000;
const MIN_FRAME_INTERVAL_MS = 20; // 50 Hz cap

type Listener = () => void;

interface SimSnapshot {
  frames: SimFrame[];
  isPlaying: boolean;
  stats: SimStats;
}

export interface UseSimulationResult {
  frames: SimFrame[];
  latest: SimFrame | null;
  stats: SimStats;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  reset: (nextConfig?: Partial<SimConfig>) => void;
  updateConfig: (patch: Partial<SimConfig>) => void;
  sampleReference: () => { x: number; y: number }[];
}

export function useSimulation(initial: SimConfig): UseSimulationResult {
  const configRef = useRef<SimConfig>(initial);
  const simRef = useRef<Simulator>(new Simulator(initial));
  const bufferRef = useRef<SimFrame[]>([]);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const playingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const degradedRef = useRef<boolean>(false);
  const slowFramesRef = useRef<number>(0);
  const tickRef = useRef<(now: number) => void>(() => {});
  const snapRef = useRef<SimSnapshot>({
    frames: [],
    isPlaying: false,
    stats: { meanError: 0, maxError: 0, outliersRejected: 0, samplesProcessed: 0 },
  });

  const notify = useCallback(() => {
    // Update the snapshot before notifying so subscribers see fresh values.
    snapRef.current = {
      frames: bufferRef.current,
      isPlaying: playingRef.current,
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

  const tick = useCallback(
    (now: number) => {
      if (!playingRef.current) return;
      const delta = now - lastTickRef.current;
      if (delta > 50) {
        slowFramesRef.current += 1;
        if (slowFramesRef.current >= 3) degradedRef.current = true;
      } else {
        slowFramesRef.current = 0;
      }
      const interval = degradedRef.current ? 40 : MIN_FRAME_INTERVAL_MS;
      if (delta >= interval) {
        lastTickRef.current = now;
        const frame = simRef.current.step();
        const buf = bufferRef.current;
        buf.push(frame);
        if (buf.length > BUFFER_SIZE) buf.shift();
        notify();
      }
      rafRef.current = requestAnimationFrame(tickRef.current);
    },
    [notify],
  );

  // Keep the ref pointed at the latest tick so the rAF scheduler always
  // references the current closure.
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const play = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    lastTickRef.current = performance.now();
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
    (patch?: Partial<SimConfig>) => {
      const next = { ...configRef.current, ...(patch ?? {}) };
      configRef.current = next;
      simRef.current = new Simulator(next);
      bufferRef.current = [];
      degradedRef.current = false;
      slowFramesRef.current = 0;
      notify();
    },
    [notify],
  );

  const updateConfig = useCallback((patch: Partial<SimConfig>) => {
    configRef.current = { ...configRef.current, ...patch };
    simRef.current.updateConfig(patch);
  }, []);

  // Stop the rAF loop on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const sampleReference = useCallback(
    () => simRef.current.getSamples().map((p) => ({ x: p.x, y: p.y })),
    [],
  );

  const result = useMemo<UseSimulationResult>(
    () => ({
      frames: snap.frames,
      latest: snap.frames.length ? snap.frames[snap.frames.length - 1] : null,
      stats: snap.stats,
      isPlaying: snap.isPlaying,
      play,
      pause,
      reset,
      updateConfig,
      sampleReference,
    }),
    [snap, play, pause, reset, updateConfig, sampleReference],
  );

  return result;
}
