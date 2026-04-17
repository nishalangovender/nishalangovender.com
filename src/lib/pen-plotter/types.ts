export type Vec2 = { x: number; y: number };

// Host → firmware
export type Command =
  | { kind: "HOME" }
  | { kind: "ROTATE"; steps: number }          // absolute microstep target
  | { kind: "LINEAR"; adcTarget: number }      // 0–834
  | { kind: "PEN"; state: "UP" | "DOWN" }
  | { kind: "GET_POS" };

// Firmware → host
export type Response =
  | { kind: "OK"; at: number }                 // tick timestamp (seconds)
  | { kind: "BUSY" }
  | { kind: "ERR"; reason: string };

export type PenState = "UP" | "DOWN";
export type FirmwareStatus = "IDLE" | "MOVING" | "SETTLING" | "ERR";

export interface FirmwareState {
  thetaSteps: number;
  thetaTargetSteps: number;
  adc: number;
  adcTarget: number;
  pen: PenState;
  status: FirmwareStatus;
}

export interface TraceSegment { a: Vec2; b: Vec2 }
export interface AdcSample { t: number; adc: number; target: number }

export interface SimFrame {
  t: number;
  firmware: FirmwareState;
  theta: number;                // radians (derived from thetaSteps)
  r: number;                    // mm (derived from adc)
  tip: Vec2;                    // (x, y) of pen tip in workspace coords (mm)
  traceSegments: ReadonlyArray<TraceSegment>;
  adcHistory: ReadonlyArray<AdcSample>;
  lastCommand?: Command;
  lastResponse?: Response;
}

export type PresetId = "star" | "spiral" | "rose" | "rounded-rect";

export interface SimConfig {
  source: "preset" | "draw";
  preset: PresetId;
  drawnPolyline?: ReadonlyArray<Vec2>;
  speed: number;                // 0.5–4× playback multiplier
  interpStep: number;           // mm per interpolated sub-segment
  showEnvelope: boolean;
}

export const DEFAULT_CONFIG: SimConfig = {
  source: "preset",
  preset: "star",
  speed: 1,
  interpStep: 4,
  showEnvelope: false,
};

export const HW = {
  STEPPER_FULL_STEPS: 200,
  STEPPER_MICROSTEPS: 256,
  STEPPER_GEAR_RATIO: 20,
  STEPPER_MICROSTEPS_PER_REV: 200 * 256 * 20,   // 1,024,000

  ADC_RANGE: 834,
  ADC_TRAVEL_MM: 300,
  ADC_TOLERANCE: 10,

  R_MIN: 20,
  R_MAX: 260,

  STEPPER_MAX_STEPS_PER_TICK: 25_000,
  LINEAR_SETTLE_TAU_S: 0.12,
  LINEAR_SETTLE_TIMEOUT_S: 20,
} as const;

export interface SimStats {
  commandsIssued: number;
  errorsReported: number;
  tracePenDownSegments: number;
}
