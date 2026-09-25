/**
 * Hero loop timeline: six beats telling the notebook-to-factory story.
 * Pure data and maths — no three.js — so the loop and its seams are unit-tested.
 */

export type BeatId = "sketch" | "design" | "code" | "deploy" | "system" | "return";

export interface Beat {
  id: BeatId;
  start: number;
  end: number;
}

export interface BeatInfo {
  id: BeatId;
  index: number;
  /** 0 at the beat's start, 1 at its end. */
  progress: number;
}

/** Seconds per beat — paced so each idea lands before the next one starts. */
const DURATIONS: [BeatId, number][] = [
  ["sketch", 6],
  ["design", 4.5],
  ["code", 4.5],
  ["deploy", 9],
  ["system", 8],
  ["return", 5.5],
];

export const BEATS: readonly Beat[] = DURATIONS.reduce<Beat[]>((acc, [id, d]) => {
  const start = acc.length ? acc[acc.length - 1].end : 0;
  acc.push({ id, start, end: start + d });
  return acc;
}, []);

export const TOTAL_DURATION = BEATS[BEATS.length - 1].end;

/** Wraps `t` into the loop. */
export function loopTime(t: number): number {
  return ((t % TOTAL_DURATION) + TOTAL_DURATION) % TOTAL_DURATION;
}

/** The beat playing at time `t` (wrapped into the loop). */
export function beatAt(t: number): BeatInfo {
  const lt = loopTime(t);
  const index = BEATS.findIndex((b) => lt < b.end);
  const i = index === -1 ? BEATS.length - 1 : index;
  const beat = BEATS[i];
  return { id: beat.id, index: i, progress: (lt - beat.start) / (beat.end - beat.start) };
}

/** Progress of beat `id` at `t`: 0 before it, 1 after it, linear inside. */
export function beatProgress(t: number, id: BeatId): number {
  const lt = loopTime(t);
  const beat = BEATS.find((b) => b.id === id)!;
  if (lt <= beat.start) return 0;
  if (lt >= beat.end) return 1;
  return (lt - beat.start) / (beat.end - beat.start);
}

/** Beats in which a click on the floor sets a nav goal. */
export const LIVE_BEATS: readonly BeatId[] = ["deploy", "system"];

/**
 * Dev-only `?beat=N` (1–6): the loop holds on that beat so it can be tuned.
 * Returns the 0-based beat index, or null when absent, invalid or in production.
 */
export function parseBeatParam(search: string, isDev: boolean): number | null {
  if (!isDev) return null;
  const raw = new URLSearchParams(search).get("beat");
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= BEATS.length ? n - 1 : null;
}
