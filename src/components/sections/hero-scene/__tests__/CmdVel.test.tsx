import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { CmdVel } from "../CmdVel";

afterEach(cleanup);

describe("CmdVel", () => {
  it("invites a nav goal before one is set", () => {
    render(<CmdVel visible live={false} readout={createRef()} />);
    expect(screen.getByText(/send a nav goal/)).toBeTruthy();
  });

  it("echoes /cmd_vel into the readout while driving", () => {
    const readout = createRef<HTMLSpanElement>();
    render(<CmdVel visible live readout={readout} />);
    expect(screen.getByText(/ros2 topic echo \/cmd_vel/)).toBeTruthy();
    expect(readout.current).not.toBeNull();
  });
});
