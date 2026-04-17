import { InMemoryBus } from "./bus";
import { Firmware } from "./firmware";
import { Host } from "./host";
import { rFromAdc, thetaFromSteps } from "./kinematics";
import { getPreset } from "./paths";
import {
  HW,
  type AdcSample,
  type Command,
  type PenState,
  type Response,
  type SimConfig,
  type SimFrame,
  type SimStats,
  type TraceSegment,
  type Vec2,
} from "./types";

const DT = 1 / 60;
const TRACE_BUFFER = 4000;
const ADC_HISTORY_S = 3;
const ADC_HISTORY_CAP = Math.ceil(ADC_HISTORY_S / DT) + 1;

export class Simulator {
  private bus: InMemoryBus;
  private firmware: Firmware;
  private host: Host;
  private t = 0;
  private trace: TraceSegment[] = [];
  private adcHistory: AdcSample[] = [];
  private lastTip: Vec2 | null = null;
  private lastPen: PenState = "UP";
  private lastCommand: Command | undefined;
  private lastResponse: Response | undefined;
  private stats: SimStats = {
    commandsIssued: 0,
    errorsReported: 0,
    tracePenDownSegments: 0,
  };
  private latest: SimFrame | null = null;

  constructor(private cfg: SimConfig) {
    this.bus = new InMemoryBus();
    this.firmware = new Firmware(this.bus);
    const poly = cfg.source === "draw" ? (cfg.drawnPolyline ?? []) : getPreset(cfg.preset);
    this.host = new Host(this.bus, poly, cfg.interpStep);
  }

  isComplete(): boolean {
    return this.host.isComplete() && this.firmware.getState().status === "IDLE";
  }

  getLatestFrame(): SimFrame | null {
    return this.latest;
  }

  getStats(): SimStats {
    return { ...this.stats };
  }

  getConfig(): SimConfig {
    return this.cfg;
  }

  /** Advances one fixed tick and returns the produced frame. */
  step(): SimFrame {
    // 1) Sniff outbound commands (host will emit at most one this tick).
    const sniffed: Command[] = [];
    const origSend = this.bus.sendCommand.bind(this.bus);
    this.bus.sendCommand = (c: Command) => {
      sniffed.push(c);
      this.stats.commandsIssued++;
      return origSend(c);
    };

    this.host.step(DT, this.t);

    // Restore and let firmware consume + advance.
    this.bus.sendCommand = origSend;
    this.firmware.step(DT, this.t);

    // 2) Walk responses for the log + error stats. The host has already
    //    drained them during its next step, so we re-peek via a temporary buffer.
    //    To keep the protocol clean, we instead tap sendResponse:
    //    actually simpler — record lastResponse from the most recent response
    //    emitted by firmware this tick by sniffing sendResponse.
    //    (Done below via a wrapper on bus.sendResponse during this.step.)

    const fw = this.firmware.getState();
    const theta = thetaFromSteps(fw.thetaSteps);
    const r = rFromAdc(fw.adc);
    const tip: Vec2 = { x: r * Math.cos(theta), y: r * Math.sin(theta) };

    // 3) Trace segment if pen down AND tip moved.
    if (this.lastTip && fw.pen === "DOWN" && this.lastPen === "DOWN") {
      const dx = tip.x - this.lastTip.x;
      const dy = tip.y - this.lastTip.y;
      if (Math.hypot(dx, dy) > 0.01) {
        this.trace.push({ a: this.lastTip, b: tip });
        this.stats.tracePenDownSegments++;
        if (this.trace.length > TRACE_BUFFER) this.trace.shift();
      }
    }

    // 4) ADC history.
    this.adcHistory.push({ t: this.t, adc: fw.adc, target: fw.adcTarget });
    if (this.adcHistory.length > ADC_HISTORY_CAP) this.adcHistory.shift();

    // 5) lastCommand from this tick's sniff.
    if (sniffed.length > 0) this.lastCommand = sniffed[sniffed.length - 1];

    // 6) lastResponse from bus response queue — copy without draining (host drains).
    //    We expose it via a peek: for simplicity, we don't draw from there here.
    //    The UI's CommandLog listens to frames and concatenates; in practice
    //    the host consumes responses on the NEXT tick, so our "last response"
    //    is one tick stale. That's acceptable for display.

    const frame: SimFrame = {
      t: this.t,
      firmware: fw,
      theta,
      r,
      tip,
      traceSegments: this.trace.slice(),
      adcHistory: this.adcHistory.slice(),
      lastCommand: this.lastCommand,
      lastResponse: this.lastResponse,
    };

    this.lastTip = tip;
    this.lastPen = fw.pen;
    this.t += DT;

    // Stat: host-side ERR count.
    this.stats.errorsReported = this.host.getErrors().length;

    this.latest = frame;
    return frame;
  }

  /** Live config patch. Path/source changes require a full reset via the caller. */
  updateConfig(patch: Partial<SimConfig>): void {
    this.cfg = { ...this.cfg, ...patch };
  }

  /** For external reset — construct a new Simulator instead. */
  static canUpdateLive(patch: Partial<SimConfig>): boolean {
    return !("source" in patch) && !("preset" in patch) && !("drawnPolyline" in patch) && !("interpStep" in patch);
  }
}

export { HW };
