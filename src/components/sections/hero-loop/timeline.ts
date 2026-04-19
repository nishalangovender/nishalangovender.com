import type { Beat, Seconds } from "./types";

export const TOTAL_DURATION: Seconds = 20;

export const BEATS: readonly Beat[] = [
  { id: "sketch",    start: 0.0,  end: 3.5,  label: "Sketch establishes" },
  { id: "lift",      start: 3.5,  end: 6.5,  label: "Ink becomes robot" },
  { id: "boot",      start: 6.5,  end: 9.0,  label: "Boot sequence" },
  { id: "drive",     start: 9.0,  end: 13.5, label: "Drive" },
  { id: "dashboard", start: 13.5, end: 16.5, label: "Zoom out to system" },
  { id: "return",    start: 16.5, end: 20.0, label: "Return to desk" },
] as const;

/** Returns beat progress in [0,1] for a given elapsed time, or null if inactive. */
export function beatProgressAt(elapsed: Seconds, beat: Beat): number | null {
  if (elapsed < beat.start || elapsed > beat.end) return null;
  return (elapsed - beat.start) / (beat.end - beat.start);
}
