// ─── Skills Data ────────────────────────────────────────────────────────────
// Single source of truth for every skill zone.
// Consumed by the interactive Venn diagram on /skills.

import type { IconType } from "react-icons";
import {
  SiArduino,
  SiCplusplus,
  SiDassaultsystemes,
  SiDocker,
  SiEspressif,
  SiGit,
  SiGithub,
  SiKicad,
  SiLinux,
  SiNextdotjs,
  SiNvidia,
  SiPostgresql,
  SiPython,
  SiRaspberrypi,
  SiReact,
  SiRos,
  SiSiemens,
  SiStmicroelectronics,
  SiTailwindcss,
  SiTypescript,
  SiUbuntu,
} from "react-icons/si";
import {
  TbApi,
  TbBolt,
  TbBrandDocker,
  TbCar,
  TbCircuitCell,
  TbCircuitSwitchClosed,
  TbCpu,
  TbCube,
  TbEngine,
  TbGauge,
  TbGeometry,
  TbMapRoute,
  TbMathFunction,
  TbRadar2,
  TbRobot,
  TbRoute,
  TbRuler2,
  TbRulerMeasure,
  TbSettings,
  TbShieldCheck,
  TbTerminal2,
  TbTestPipe,
  TbTool,
  TbWaveSine,
  TbWifi,
} from "react-icons/tb";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ZoneKey =
  | "software"
  | "electronics"
  | "hardware"
  | "software-electronics"
  | "software-hardware"
  | "electronics-hardware"
  | "center";

export type Discipline =
  | "software"
  | "electronics"
  | "mechanical"
  | "intersection"
  | "center";

export interface Skill {
  name: string;
  icon: IconType;
  /** 0–100 self-rated proficiency. */
  proficiency: number;
  /** Optional brand hex colour for the icon — otherwise rendered in accent. */
  color?: string;
}

export interface ZoneData {
  label: string;
  subtitle?: string;
  skills: Skill[];
  discipline: Discipline;
}

// ─── Proficiency helper ─────────────────────────────────────────────────────

export function profLabel(p: number): string {
  if (p >= 90) return "Advanced";
  if (p >= 75) return "Proficient";
  if (p >= 60) return "Competent";
  return "Familiar";
}

export type ProficiencyTier = "advanced" | "proficient" | "competent" | "familiar";

export function profTier(p: number): ProficiencyTier {
  if (p >= 90) return "advanced";
  if (p >= 75) return "proficient";
  if (p >= 60) return "competent";
  return "familiar";
}

/** Returns the CSS variable reference for a given proficiency's tier colour.
 *  Use as both bar fill and label text colour for consistent scanning. */
export function profColor(p: number): { varName: string; tier: ProficiencyTier } {
  const tier = profTier(p);
  return { varName: `var(--prof-${tier})`, tier };
}

/** Ring colour for each zone's icon tile. Mirrors the discipline palette and
 *  gives each zone a distinct visual signature. */
export function zoneRingColor(key: ZoneKey): string {
  switch (key) {
    case "software":
      return "#3B82F6";
    case "electronics":
      return "#10B981";
    case "hardware":
      return "#F59E0B";
    case "software-electronics":
      return "#14B8A6";
    case "software-hardware":
      return "#8B5CF6";
    case "electronics-hardware":
      return "#84CC16";
    case "center":
      return "var(--accent)";
  }
}

/** Stable DOM anchor id for a zone section in the SkillsBrowser. */
export function zoneAnchorId(key: ZoneKey): string {
  return `zone-${key}`;
}

// ─── Zone Data ──────────────────────────────────────────────────────────────

export const zones: { key: ZoneKey; data: ZoneData }[] = [
  {
    key: "software",
    data: {
      label: "Software Engineering",
      discipline: "software",
      skills: [
        { name: "Linux", icon: SiLinux, proficiency: 93, color: "#FCC624" },
        { name: "Bash / Shell", icon: TbTerminal2, proficiency: 91 },
        { name: "Git / GitHub", icon: SiGit, proficiency: 90, color: "#F05032" },
        { name: "Python", icon: SiPython, proficiency: 88, color: "#3776AB" },
        { name: "Docker / CI-CD", icon: SiDocker, proficiency: 85, color: "#2496ED" },
        { name: "React", icon: SiReact, proficiency: 81, color: "#61DAFB" },
        { name: "Next.js", icon: SiNextdotjs, proficiency: 75 },
        { name: "TypeScript", icon: SiTypescript, proficiency: 75, color: "#3178C6" },
        { name: "REST API", icon: TbApi, proficiency: 70 },
        { name: "Testing Frameworks", icon: TbTestPipe, proficiency: 70 },
        { name: "PostgreSQL", icon: SiPostgresql, proficiency: 68, color: "#4169E1" },
        { name: "Tailwind CSS", icon: SiTailwindcss, proficiency: 60, color: "#06B6D4" },
      ],
    },
  },
  {
    key: "software-electronics",
    data: {
      label: "Embedded Software",
      subtitle: "Software × Electronics",
      discipline: "intersection",
      skills: [
        { name: "Embedded Linux", icon: SiUbuntu, proficiency: 90, color: "#E95420" },
        { name: "RPi / Jetson", icon: SiRaspberrypi, proficiency: 90, color: "#A22846" },
        { name: "Device Tree", icon: TbCpu, proficiency: 88 },
        { name: "Firmware Development", icon: TbCpu, proficiency: 88 },
        { name: "BSP / Board Bring-Up", icon: TbCircuitSwitchClosed, proficiency: 84 },
        { name: "Cross-Compilation Toolchains", icon: TbBrandDocker, proficiency: 82 },
        { name: "Bootloaders / U-Boot", icon: TbTerminal2, proficiency: 82 },
        { name: "Real-Time Linux (PREEMPT_RT)", icon: SiLinux, proficiency: 71, color: "#FCC624" },
        { name: "RTOS (FreeRTOS / Zephyr)", icon: TbSettings, proficiency: 55 },
      ],
    },
  },
  {
    key: "electronics",
    data: {
      label: "Electronics & Embedded",
      discipline: "electronics",
      skills: [
        { name: "C / C++", icon: SiCplusplus, proficiency: 92, color: "#00599C" },
        { name: "STM32", icon: SiStmicroelectronics, proficiency: 85, color: "#03234B" },
        { name: "I2C / SPI / UART", icon: TbCpu, proficiency: 85 },
        { name: "CANOpen", icon: TbCircuitCell, proficiency: 85 },
        { name: "RP2040", icon: SiRaspberrypi, proficiency: 80, color: "#A22846" },
        { name: "ESP32", icon: SiEspressif, proficiency: 75, color: "#E7352C" },
        { name: "Arduino", icon: SiArduino, proficiency: 75, color: "#00979D" },
        { name: "Oscilloscopes / Logic Analysers", icon: TbWaveSine, proficiency: 75 },
        { name: "Soldering / Rework", icon: TbTool, proficiency: 75 },
        { name: "KiCAD", icon: SiKicad, proficiency: 75, color: "#314CB0" },
        { name: "PCB & Circuit Design", icon: TbCircuitSwitchClosed, proficiency: 65 },
        { name: "Power Electronics", icon: TbBolt, proficiency: 60 },
      ],
    },
  },
  {
    key: "software-hardware",
    data: {
      label: "Simulation & Digital Twins",
      subtitle: "Software × Mechanical",
      discipline: "intersection",
      skills: [
        { name: "URDF", icon: TbCar, proficiency: 95 },
        { name: "TF", icon: TbRoute, proficiency: 90 },
        { name: "RViz", icon: TbRadar2, proficiency: 85 },
        { name: "Gazebo", icon: TbRobot, proficiency: 80 },
        { name: "MATLAB / Simulink", icon: TbMathFunction, proficiency: 80 },
        { name: "Foxglove", icon: TbGauge, proficiency: 75 },
        { name: "Digital Twins", icon: TbCube, proficiency: 70 },
      ],
    },
  },
  {
    key: "center",
    data: {
      label: "Mechatronics & Robotics",
      subtitle: "The Convergence",
      discipline: "center",
      skills: [
        { name: "ROS2", icon: SiRos, proficiency: 95, color: "#22314E" },
        { name: "Fleet Architecture", icon: TbCar, proficiency: 92 },
        { name: "Field Deployment & Commissioning", icon: SiGithub, proficiency: 90 },
        { name: "SMACC2", icon: SiNvidia, proficiency: 90, color: "#76B900" },
        { name: "NAV2", icon: TbRadar2, proficiency: 88 },
        { name: "Control Systems (PID, State-Space, MPC, Adaptive)", icon: TbMathFunction, proficiency: 85 },
        { name: "Sensor Fusion (LiDAR, IMU, EKF)", icon: TbRobot, proficiency: 85 },
        { name: "Zenoh / DDS", icon: TbWifi, proficiency: 85 },
        { name: "Kinematics (Forward / Inverse)", icon: TbSettings, proficiency: 85 },
        { name: "Path-Following Control (RPP / Pure Pursuit)", icon: TbRoute, proficiency: 85 },
        { name: "Motion & Path Planning (A*, RRT)", icon: TbMapRoute, proficiency: 82 },
        { name: "Open-RMF", icon: TbCar, proficiency: 82 },
        { name: "SLAM", icon: TbRadar2, proficiency: 78 },
      ],
    },
  },
  {
    key: "electronics-hardware",
    data: {
      label: "Electromechanical Systems",
      subtitle: "Electronics × Mechanical",
      discipline: "intersection",
      skills: [
        { name: "Motor Controllers", icon: TbEngine, proficiency: 90 },
        { name: "Encoders", icon: TbSettings, proficiency: 90 },
        { name: "CAN Bus", icon: TbCircuitCell, proficiency: 85 },
        { name: "LiDAR / IMU", icon: TbRadar2, proficiency: 85 },
        { name: "Steppers / Servos / DC Motors", icon: TbEngine, proficiency: 85 },
        { name: "Sensor Calibration", icon: TbRulerMeasure, proficiency: 82 },
        { name: "Sensor Mounting & Harnessing", icon: TbWifi, proficiency: 80 },
        { name: "PLCs / Siemens TIA", icon: SiSiemens, proficiency: 80, color: "#009999" },
        { name: "Safety Systems / E-Stops", icon: TbShieldCheck, proficiency: 75 },
        { name: "Pneumatics", icon: TbBolt, proficiency: 70 },
      ],
    },
  },
  {
    key: "hardware",
    data: {
      label: "Mechanical Engineering",
      discipline: "mechanical",
      skills: [
        { name: "CAD (Inventor / Fusion 360)", icon: SiDassaultsystemes, proficiency: 80, color: "#005386" },
        { name: "Mechanical Design", icon: TbRuler2, proficiency: 75 },
        { name: "3D Printing", icon: TbCube, proficiency: 75 },
        { name: "FEA & Fatigue Analysis", icon: TbGeometry, proficiency: 70 },
        { name: "Technical Drawing / GD&T", icon: TbRulerMeasure, proficiency: 68 },
        { name: "Design for Manufacturing", icon: TbTool, proficiency: 65 },
        { name: "Bill of Materials (BOM)", icon: TbTestPipe, proficiency: 65 },
      ],
    },
  },
];
