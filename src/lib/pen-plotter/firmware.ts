import type { CommandBus } from "./bus";
import {
  HW,
  type Command,
  type FirmwareState,
  type FirmwareStatus,
} from "./types";

interface FirmwareOpts {
  settleTimeoutS?: number;
}

export class Firmware {
  private state: FirmwareState = {
    thetaSteps: 0,
    thetaTargetSteps: 0,
    adc: 0,
    adcTarget: 0,
    pen: "UP",
    status: "IDLE",
  };
  private settleElapsed = 0;
  private readonly settleTimeoutS: number;

  constructor(
    private readonly bus: CommandBus,
    opts: FirmwareOpts = {},
  ) {
    this.settleTimeoutS = opts.settleTimeoutS ?? HW.LINEAR_SETTLE_TIMEOUT_S;
  }

  getState(): FirmwareState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      thetaSteps: 0,
      thetaTargetSteps: 0,
      adc: 0,
      adcTarget: 0,
      pen: "UP",
      status: "IDLE",
    };
    this.settleElapsed = 0;
  }

  step(dt: number, t: number): void {
    // 1) Accept a new command if we're idle.
    if (this.state.status === "IDLE" || this.state.status === "ERR") {
      const incoming = this.bus.drainCommands();
      for (const cmd of incoming) {
        this.accept(cmd, t);
        // Only accept one command per tick while busy — return remaining to queue.
        const statusAfter = this.state.status as FirmwareStatus;
        if (statusAfter === "MOVING" || statusAfter === "SETTLING") {
          for (const leftover of incoming.slice(incoming.indexOf(cmd) + 1)) {
            this.bus.sendCommand(leftover);
          }
          break;
        }
      }
    }

    // 2) Advance the active motion.
    if (this.state.status === "MOVING") {
      const diff = this.state.thetaTargetSteps - this.state.thetaSteps;
      const maxStep = HW.STEPPER_MAX_STEPS_PER_TICK;
      const applied = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
      this.state.thetaSteps += applied;
      if (this.state.thetaSteps === this.state.thetaTargetSteps) {
        this.state.status = "IDLE";
        this.bus.sendResponse({ kind: "OK", at: t });
      }
    } else if (this.state.status === "SETTLING") {
      const k = dt / HW.LINEAR_SETTLE_TAU_S;
      const clamp = Math.min(1, k);
      this.state.adc += (this.state.adcTarget - this.state.adc) * clamp;
      this.settleElapsed += dt;
      if (Math.abs(this.state.adc - this.state.adcTarget) <= HW.ADC_TOLERANCE) {
        this.state.status = "IDLE";
        this.bus.sendResponse({ kind: "OK", at: t });
      } else if (this.settleElapsed > this.settleTimeoutS) {
        this.state.status = "ERR";
        this.bus.sendResponse({ kind: "ERR", reason: "timeout" });
      }
    }
  }

  private accept(cmd: Command, t: number): void {
    switch (cmd.kind) {
      case "HOME":
        this.reset();
        this.bus.sendResponse({ kind: "OK", at: t });
        return;
      case "ROTATE":
        this.state.thetaTargetSteps = cmd.steps;
        if (this.state.thetaSteps === cmd.steps) {
          this.bus.sendResponse({ kind: "OK", at: t });
        } else {
          this.setStatus("MOVING");
        }
        return;
      case "LINEAR":
        this.state.adcTarget = cmd.adcTarget;
        this.settleElapsed = 0;
        if (Math.abs(this.state.adc - cmd.adcTarget) <= HW.ADC_TOLERANCE) {
          this.bus.sendResponse({ kind: "OK", at: t });
        } else {
          this.setStatus("SETTLING");
        }
        return;
      case "PEN":
        this.state.pen = cmd.state;
        this.bus.sendResponse({ kind: "OK", at: t });
        return;
      case "GET_POS":
        this.bus.sendResponse({ kind: "OK", at: t });
        return;
    }
  }

  private setStatus(s: FirmwareStatus): void {
    this.state.status = s;
  }
}
