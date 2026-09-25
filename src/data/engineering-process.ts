import type { ComponentType } from "react";

import { PhaseDefine } from "@/components/sections/engineering-process/icons/PhaseDefine";
import { PhaseDeploy } from "@/components/sections/engineering-process/icons/PhaseDeploy";
import { PhaseDesign } from "@/components/sections/engineering-process/icons/PhaseDesign";
import { PhaseDevelop } from "@/components/sections/engineering-process/icons/PhaseDevelop";
import { PhaseIntegrate } from "@/components/sections/engineering-process/icons/PhaseIntegrate";

export interface EngineeringPhase {
  number: string;
  label: string;
  title: string;
  /** One sentence. */
  description: string;
  icon: ComponentType;
}

/** Milliseconds each phase is held before auto-advancing. */
export const PHASE_DURATION = 4500;

export const phases: EngineeringPhase[] = [
  {
    number: "01",
    label: "DEFINE",
    title: "Understand the Problem",
    description:
      "Walk the floor, talk to the people who run it, and pin down the constraints and what success looks like.",
    icon: PhaseDefine,
  },
  {
    number: "02",
    label: "DESIGN",
    title: "Architect the Solution",
    description:
      "Map the system on a blank page — black boxes, interfaces, data flows — modular from day one.",
    icon: PhaseDesign,
  },
  {
    number: "03",
    label: "DEVELOP",
    title: "Build the Software",
    description:
      "Write tested code across the stack, from C++ drivers and ROS2 nodes to Python services and React front-ends.",
    icon: PhaseDevelop,
  },
  {
    number: "04",
    label: "INTEGRATE",
    title: "Wire It All Together",
    description:
      "Wire every layer together — CAN bus to cloud dashboard — then calibrate and validate until nothing falls through.",
    icon: PhaseIntegrate,
  },
  {
    number: "05",
    label: "DEPLOY",
    title: "Ship to Production",
    description:
      "Prove it as a prototype, then harden it with CI/CD, monitoring and fail-safes to run in production.",
    icon: PhaseDeploy,
  },
];
