"use client";

import type { ComponentType, ReactNode } from "react";

import type { BeatProps } from "@/components/sections/hero-loop/types";

interface BeatFrameProps {
  title: string;
  window: string;
  Beat: ComponentType<BeatProps>;
  children?: ReactNode;
}

/**
 * Renders a single beat at its end-state (progress=1, active=true) inside
 * the same 16:10 blueprint-grid container the live loop uses. Used by the
 * /hero-loop-preview/beat-N pages so Nish can inspect a beat's final frame
 * without waiting for the animation.
 */
export function BeatFrame({ title, window, Beat, children }: BeatFrameProps) {
  return (
    <main className="min-h-screen grid place-items-center p-8 gap-6">
      <header className="max-w-3xl w-full text-center space-y-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="font-mono text-sm text-muted">{window}</p>
      </header>
      <div className="w-full max-w-3xl">
        <div className="relative w-full" style={{ aspectRatio: "640 / 540" }}>
          <div className="absolute inset-0">
            <Beat progress={1} active={true} />
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}
