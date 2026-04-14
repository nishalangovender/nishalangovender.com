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
      "Walk the shop floor, sit down with stakeholders, and unpack the brief. Every project starts with scoping the constraints, assessing feasibility, and defining what success looks like.",
    icon: PhaseDefine,
  },
  {
    number: "02",
    label: "DESIGN",
    title: "Architect the Solution",
    description:
      "Start with a blank page and map the system — black boxes, interfaces, data flows. Modular and scalable from day one, whether it's an embedded controller or a web platform.",
    icon: PhaseDesign,
  },
  {
    number: "03",
    label: "DEVELOP",
    title: "Build the Software",
    description:
      "Write clean, testable code across the stack — from low-level C++ and ROS2 nodes to Python services and React front-ends. Every module documented and ready to integrate.",
    icon: PhaseDevelop,
  },
  {
    number: "04",
    label: "INTEGRATE",
    title: "Wire It All Together",
    description:
      "Connect every layer — CAN buses to cloud dashboards, sensor pipelines to state machines, APIs to front-ends. Calibrate, validate, and make sure nothing falls through the gaps.",
    icon: PhaseIntegrate,
  },
  {
    number: "05",
    label: "DEPLOY",
    title: "Ship to Production",
    description:
      "Prove it works as a prototype, then harden it for production. Fleet management, CI/CD pipelines, monitoring, and fail-safes — built to run reliably at scale.",
    icon: PhaseDeploy,
  },
];
