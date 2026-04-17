import type { CommandBus } from "./bus";
import {
  adcFromR,
  isInsideEnvelope,
  polarFromXY,
  stepsFromTheta,
} from "./kinematics";
import { interpolatePolyline } from "./paths";
import type { Command, Vec2 } from "./types";

interface HostError {
  at: number;
  reason: string;
  point: Vec2;
}

export class Host {
  private readonly interpolated: Vec2[];
  private cursor = 0;            // index of the next waypoint we still need to emit for
  private queue: Command[] = [];
  private awaitingOk = false;
  private penDown = false;
  private errors: HostError[] = [];
  private done = false;

  constructor(
    private readonly bus: CommandBus,
    poly: ReadonlyArray<Vec2>,
    interpStepMm: number,
  ) {
    this.interpolated = interpolatePolyline(poly, interpStepMm);
    if (this.interpolated.length === 0) {
      this.done = true;
    } else {
      // Seed the very first move: go to interpolated[0] with pen up, then drop pen.
      this.enqueueMoveTo(this.interpolated[0], { withPenDown: true, firstMove: true });
      this.cursor = 1;
    }
  }

  isComplete(): boolean {
    return this.done;
  }

  getErrors(): ReadonlyArray<HostError> {
    return this.errors;
  }

  step(_dt: number, t: number): void {
    // Read responses: every OK advances the protocol.
    const resps = this.bus.drainResponses();
    for (const r of resps) {
      if (r.kind === "OK" && this.awaitingOk) this.awaitingOk = false;
      // ERR from firmware stalls — caller handles reset; host just stops queuing.
      if (r.kind === "ERR") this.awaitingOk = false;
    }

    if (this.done) return;

    // Send next queued command if bus is idle.
    if (!this.awaitingOk && this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.bus.sendCommand(next);
      this.awaitingOk = true;
      return;
    }

    // Queue empty? Advance to next waypoint if any, else mark complete.
    if (!this.awaitingOk && this.queue.length === 0) {
      if (this.cursor >= this.interpolated.length) {
        this.done = true;
        // Final pen-up so the carriage parks safely.
        if (this.penDown) {
          this.queue.push({ kind: "PEN", state: "UP" });
          this.penDown = false;
          // will be sent next tick; but we're done — fine to leave queued if loop exits.
        }
        return;
      }
      const next = this.interpolated[this.cursor++];
      if (!isInsideEnvelope(next)) {
        this.errors.push({ at: t, reason: "out-of-envelope", point: next });
        // Synthetic ERR into the response stream so the log shows it.
        this.bus.sendResponse({ kind: "ERR", reason: "out-of-envelope" });
        // Lift pen; the next reachable point will re-engage.
        if (this.penDown) {
          this.queue.push({ kind: "PEN", state: "UP" });
          this.penDown = false;
        }
        return;
      }
      this.enqueueMoveTo(next, { withPenDown: true, firstMove: false });
    }
  }

  private enqueueMoveTo(p: Vec2, opts: { withPenDown: boolean; firstMove: boolean }): void {
    const pol = polarFromXY(p);
    const rotSteps = stepsFromTheta(pol.theta);
    const linAdc = adcFromR(pol.r);

    if (opts.firstMove) {
      // Pen stays up until the positioning is done.
      this.queue.push({ kind: "PEN", state: "UP" });
    } else if (!this.penDown && opts.withPenDown) {
      // Returning from a skip: arrive with pen up, position, drop.
      this.queue.push({ kind: "PEN", state: "UP" });
    }

    this.queue.push({ kind: "ROTATE", steps: rotSteps });
    this.queue.push({ kind: "LINEAR", adcTarget: linAdc });

    if (opts.withPenDown) {
      this.queue.push({ kind: "PEN", state: "DOWN" });
      this.penDown = true;
    }
  }
}
