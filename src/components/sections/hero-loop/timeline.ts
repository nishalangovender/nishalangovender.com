import type { Beat, Seconds } from "./types";

export const TOTAL_DURATION: Seconds = 12;

export const BEATS: readonly Beat[] = [
  { id: "sketch",    start: 0.0,  end: 2.0,  label: "Sketch establishes" },
  { id: "math",      start: 2.0,  end: 3.5,  label: "Math writes itself" },
  { id: "lift",      start: 3.5,  end: 5.0,  label: "Ink lifts" },
  { id: "boot",      start: 5.0,  end: 6.5,  label: "Boot sequence" },
  { id: "drive",     start: 6.5,  end: 9.0,  label: "Drive" },
  { id: "dashboard", start: 9.0,  end: 10.5, label: "Zoom out to system" },
  { id: "return",    start: 10.5, end: 12.0, label: "Return to desk" },
] as const;

/** Returns beat progress in [0,1] for a given elapsed time, or null if inactive. */
export function beatProgressAt(elapsed: Seconds, beat: Beat): number | null {
  if (elapsed < beat.start || elapsed > beat.end) return null;
  return (elapsed - beat.start) / (beat.end - beat.start);
}
