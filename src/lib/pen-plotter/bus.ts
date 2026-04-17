import type { Command, Response } from "./types";

export interface CommandBus {
  sendCommand(cmd: Command): void;
  drainCommands(): Command[];
  sendResponse(res: Response): void;
  drainResponses(): Response[];
}

export class InMemoryBus implements CommandBus {
  private cmds: Command[] = [];
  private resps: Response[] = [];

  sendCommand(cmd: Command): void {
    this.cmds.push(cmd);
  }
  drainCommands(): Command[] {
    const out = this.cmds;
    this.cmds = [];
    return out;
  }
  sendResponse(res: Response): void {
    this.resps.push(res);
  }
  drainResponses(): Response[] {
    const out = this.resps;
    this.resps = [];
    return out;
  }
}
