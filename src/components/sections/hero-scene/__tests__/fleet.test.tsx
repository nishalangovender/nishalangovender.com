import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BEATS, TOTAL_DURATION } from "../beats";
import { FLEET_SIZE, fleetDistance, fleetPresence } from "../Fleet";
import { FleetStatus } from "../FleetStatus";
import { MISSION_LENGTH, missionDistance } from "../mission";

const beat = (id: string) => BEATS.find((b) => b.id === id)!;

describe("fleet", () => {
  it("appears only for the system beat and fades out in the return", () => {
    expect(fleetPresence(beat("deploy").end - 0.01)).toBe(0);
    expect(fleetPresence(beat("system").end - 0.01)).toBe(1);
    expect(fleetPresence(TOTAL_DURATION - 1e-6)).toBeCloseTo(0, 3);
  });

  it("spaces the AGVs evenly round the mission loop", () => {
    const t = beat("system").start + 1;
    for (let i = 1; i < FLEET_SIZE; i++) {
      expect(fleetDistance(t, i) - missionDistance(t)).toBeCloseTo((i * MISSION_LENGTH) / FLEET_SIZE, 6);
    }
  });

  it("lists every AGV in the status panel", () => {
    render(<FleetStatus visible />);
    for (let i = 1; i <= FLEET_SIZE; i++) expect(screen.getByText(`AGV-0${i}`)).toBeTruthy();
    expect(screen.getByText(`${FLEET_SIZE}/${FLEET_SIZE} ONLINE`)).toBeTruthy();
  });
});
