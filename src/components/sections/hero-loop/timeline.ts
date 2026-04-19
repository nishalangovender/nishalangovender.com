import type { Beat, Seconds } from "./types";

export const TOTAL_DURATION: Seconds = 20;

export const BEATS: readonly Beat[] = [
  { id: "sketch",    start: 0.0,  end: 3.5,  label: "Sketch establishes" },
  { id: "math",      start: 3.5,  end: 6.0,  label: "Math writes itself" },
  { id: "lift",      start: 6.0,  end: 8.5,  label: "Ink lifts" },
  { id: "boot",      start: 8.5,  end: 11.0, label: "Boot sequence" },
  { id: "drive",     start: 11.0, end: 15.0, label: "Drive" },
  { id: "dashboard", start: 15.0, end: 17.5, label: "Zoom out to system" },
  { id: "return",    start: 17.5, end: 20.0, label: "Return to desk" },
] as const;

/** Returns beat progress in [0,1] for a given elapsed time, or null if inactive. */
export function beatProgressAt(elapsed: Seconds, beat: Beat): number | null {
  if (elapsed < beat.start || elapsed > beat.end) return null;
  return (elapsed - beat.start) / (beat.end - beat.start);
}
