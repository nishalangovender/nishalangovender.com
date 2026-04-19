export type Seconds = number;

export type BeatId =
  | "sketch"
  | "lift"
  | "boot"
  | "drive"
  | "dashboard"
  | "return";

export interface Beat {
  id: BeatId;
  start: Seconds;
  end: Seconds;
  label: string;
}

export interface BeatProps {
  /** 0 before the beat starts, 1 after it ends, linear inside. */
  progress: number;
  /** True when this beat is the active one. */
  active: boolean;
}
