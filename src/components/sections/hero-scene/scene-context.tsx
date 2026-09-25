"use client";

import { createContext, useContext, useEffect, useState, type RefObject } from "react";

import type { Pose } from "@/lib/path-following/types";

/**
 * Mutable scene state shared by every object in the canvas. It lives in one
 * object read inside `useFrame`, never in React state, so the loop costs no
 * re-renders.
 */
export interface SceneState {
  /** Loop clock in seconds. */
  t: number;
  /** Dev `?beat=N`: the beat index the clock loops within, or null. */
  hold: number | null;
  /** Hero AGV pose in the map frame, written by the AGV each frame. */
  agv: Pose;
}

const SceneContext = createContext<RefObject<SceneState> | null>(null);

export const SceneProvider = SceneContext.Provider;

export function useScene(): RefObject<SceneState> {
  const scene = useContext(SceneContext);
  if (!scene) throw new Error("useScene must be used inside <SceneProvider>");
  return scene;
}

/** TTY tokens the scene draws with, as hex strings from the live theme. */
export interface Palette {
  bg: string;
  surface: string;
  rule: string;
  fg: string;
  dim: string;
  accent: string;
  focus: string;
  ok: string;
  warn: string;
  error: string;
  page: string;
}

const TOKENS: Record<keyof Palette, string> = {
  bg: "--tty-bg",
  surface: "--tty-surface",
  rule: "--tty-rule",
  fg: "--tty-fg",
  dim: "--tty-dim",
  accent: "--tty-accent",
  focus: "--tty-focus",
  ok: "--tty-ok",
  warn: "--tty-warn",
  error: "--tty-error",
  page: "--notebook-page",
};

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, name]) => [key, style.getPropertyValue(name).trim()]),
  ) as unknown as Palette;
}

/** Reads the palette and re-reads it whenever the theme changes. */
export function usePalette(): Palette {
  const [palette, setPalette] = useState<Palette>(readPalette);

  useEffect(() => {
    const update = () => setPalette(readPalette());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return palette;
}

const PaletteContext = createContext<Palette | null>(null);

export const PaletteProvider = PaletteContext.Provider;

export function useScenePalette(): Palette {
  const palette = useContext(PaletteContext);
  if (!palette) throw new Error("useScenePalette must be used inside <PaletteProvider>");
  return palette;
}
