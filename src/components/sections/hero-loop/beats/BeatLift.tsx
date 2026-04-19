"use client";

import { ChromaticShift } from "../primitives/ChromaticShift";
import type { BeatProps } from "../types";

import { SketchScaffold } from "./SketchScaffold";

/**
 * Beat 2 (3.5–6.5s): the kinematic drawing comes alive.
 *
 * Pure top-down camera — no oblique projection. The 2D ink sketch becomes
 * a physical robot through flat material fills and internal details:
 *   Chassis walls   rgb(120,120,120)    neutral industrial grey (outer shell)
 *   Inner chamfers  rgb(105-110,…)       shadowed sloped walls into the opening
 *   Interior floor  rgb(155,155,155)     lighter, "lit from above" — open-top view
 *   Wheels          rgb(20,20,20)        dark rubber
 *   RPi board       rgb(30,90,50)        PCB green
 *   Battery         rgb(40,80,180)       blue cell case
 *   LIDAR           rgb(40,40,40)        dark housing
 *   Camera          rgb(30,30,30) lens   dark body + accent lens dot
 *   LEDs            rgb(18,18,18)        unlit — powered off until Beat 3 boot
 *
 * Analysis overlay (world frame, V, θ, ω, labels) stays visible throughout.
 *
 * Chassis geometry pre-rotate (all body frame):
 *   Chassis bbox   x=258..378  y=175..245   (sharp, 120×70)
 *   Wheels         top (281..315, 161..175), bottom (281..315, 245..259)
 *   Upper deck     x=266..370  y=181..239   (104×58, inset 8×6)
 *   RPi board      x=278..322  y=200..230   (44×30, rear half)
 *   LIDAR          centre (348, 210), r=10
 *   Camera         centre (378, 210), 8×6 rounded
 *   LEDs           (280,240) (295,240) (310,240)  rear edge of chassis
 * All rotated -25° about robot centre (318, 210).
 *
 * Sub-timing (3s beat):
 *   0.00–0.40  ink outline only (Beat 1 end-state)
 *   0.30–0.60  chromatic shift peak at 0.45
 *   0.40–0.80  chassis + wheels fill in (materialise 0 → 1)
 *   0.55–0.85  internal details fade in (details 0 → 1, staggered by element)
 *   0.85–1.00  steady finished robot
 */
export function BeatLift({ progress, active }: BeatProps) {
  if (!active) return null;

  const materialise = clamp01((progress - 0.40) / 0.40);
  const details = clamp01((progress - 0.55) / 0.30);
  const chroma = triangle(progress, 0.45) * 0.7;

  // Staggered reveal for detail elements (each element has its own onset offset)
  const deckOpacity = clamp01((details - 0.00) / 0.40);
  const rpiOpacity = clamp01((details - 0.25) / 0.40);
  const sensorsOpacity = clamp01((details - 0.40) / 0.35);
  const ledsOpacity = clamp01((details - 0.65) / 0.35);
  const cablesOpacity = clamp01((details - 0.50) / 0.40);

  return (
    <svg
      viewBox="0 0 640 400"
      width="100%"
      height="100%"
      style={{ color: "var(--foreground)" }}
    >
      <SketchScaffold />

      <ChromaticShift strength={chroma}>
        {/* Wheels — dark rubber with cylindrical shading (lighter at centre of
            rolling surface, darker at the rolling edges) */}
        <defs>
          <linearGradient
            id="tyreShadingTop"
            gradientUnits="userSpaceOnUse"
            x1={281}
            y1={168}
            x2={315}
            y2={168}
          >
            <stop offset="0%" stopColor="rgb(0,0,0)" />
            <stop offset="50%" stopColor="rgb(60,60,60)" />
            <stop offset="100%" stopColor="rgb(0,0,0)" />
          </linearGradient>
          <linearGradient
            id="tyreShadingBottom"
            gradientUnits="userSpaceOnUse"
            x1={281}
            y1={252}
            x2={315}
            y2={252}
          >
            <stop offset="0%" stopColor="rgb(0,0,0)" />
            <stop offset="50%" stopColor="rgb(60,60,60)" />
            <stop offset="100%" stopColor="rgb(0,0,0)" />
          </linearGradient>
        </defs>
        <g transform="rotate(-25 318 210)">
          <path
            d="M 284 161 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
            fill="url(#tyreShadingTop)"
            fillOpacity={materialise}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 284 245 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
            fill="url(#tyreShadingBottom)"
            fillOpacity={materialise}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Chassis base — solid grey */}
        <g transform="rotate(-25 318 210)">
          <path
            d="M 258 175 h 120 v 70 h -120 Z"
            fill="rgb(120, 120, 120)"
            fillOpacity={materialise}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Internal details — rotated with the robot */}
        <g transform="rotate(-25 318 210)">
          {/* Upper deck / mounting plate — slightly smaller than chassis, with
              chamfered edges suggesting it sits above the chassis top face */}
          {deckOpacity > 0 && (
            <g opacity={deckOpacity}>
              {/* Chamfer edges — four trapezoids forming the angled inner walls
                  of the open chassis. The chassis base is the dark grey wall,
                  these chamfers are slightly darker (in shadow from the opening),
                  the interior floor (deck) is lighter as if lit from above. */}
              <polygon
                points="258,175 378,175 370,181 266,181"
                fill="rgb(105, 105, 105)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={0.5}
              />
              <polygon
                points="378,175 378,245 370,239 370,181"
                fill="rgb(110, 110, 110)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={0.5}
              />
              <polygon
                points="378,245 258,245 266,239 370,239"
                fill="rgb(105, 105, 105)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={0.5}
              />
              <polygon
                points="258,245 258,175 266,181 266,239"
                fill="rgb(110, 110, 110)"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={0.5}
              />
              {/* Rear open bay — lighter, "lit from above" — shows battery + RPi
                  Includes breathing space beyond the RPi before the roof begins. */}
              <rect
                x={266}
                y={181}
                width={62}
                height={58}
                rx={2}
                fill="rgb(155, 155, 155)"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={0.75}
              />
              {/* Front closed roof — solid chassis top where LIDAR / camera mount */}
              <rect
                x={328}
                y={181}
                width={42}
                height={58}
                rx={2}
                fill="rgb(115, 115, 115)"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={0.75}
              />
              {/* Seam between removable roof panel and fixed bay edge */}
              <line
                x1={328}
                y1={181}
                x2={328}
                y2={239}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={0.75}
              />
              {/* Inner shadow stripe on bay side of the seam (depth cue) */}
              <line
                x1={326.5}
                y1={181}
                x2={326.5}
                y2={239}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={1.25}
              />
              {/* Mount holes — 2 on bay corners (rear), 2 on roof corners (front) */}
              <circle cx={272} cy={187} r={1.5} fill="rgb(50,50,50)" />
              <circle cx={272} cy={233} r={1.5} fill="rgb(50,50,50)" />
              <circle cx={364} cy={187} r={1.5} fill="rgb(50,50,50)" />
              <circle cx={364} cy={233} r={1.5} fill="rgb(50,50,50)" />
              {/* LIDAR mount screws — 4 around the LIDAR housing on the roof */}
              <circle cx={338} cy={200} r={0.75} fill="rgb(40,40,40)" />
              <circle cx={358} cy={200} r={0.75} fill="rgb(40,40,40)" />
              <circle cx={338} cy={220} r={0.75} fill="rgb(40,40,40)" />
              <circle cx={358} cy={220} r={0.75} fill="rgb(40,40,40)" />
            </g>
          )}

          {/* Battery pack — rear-left of upper deck, blue-cased with cell lines */}
          {rpiOpacity > 0 && (
            <g opacity={rpiOpacity}>
              <rect
                x={268}
                y={200}
                width={8}
                height={30}
                rx={1}
                fill="rgb(40, 80, 180)"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={0.5}
              />
              {/* Cell divisions — thin darker lines across the pack */}
              <line x1={268} y1={210} x2={276} y2={210} stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
              <line x1={268} y1={220} x2={276} y2={220} stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
              {/* Terminals — tiny rects on the forward-facing edge */}
              <rect x={276} y={203} width={1.5} height={2} fill="rgb(150,40,40)" />
              <rect x={276} y={225} width={1.5} height={2} fill="rgb(30,30,30)" />
            </g>
          )}

          {/* Raspberry Pi — PCB green, rear half */}
          {rpiOpacity > 0 && (
            <g opacity={rpiOpacity}>
              {/* PCB board */}
              <rect
                x={278}
                y={200}
                width={42}
                height={30}
                rx={1.5}
                fill="rgb(30, 90, 50)"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={0.5}
              />
              {/* Silkscreen mount holes */}
              <circle cx={282} cy={204} r={1} fill="rgb(200,200,200)" />
              <circle cx={316} cy={204} r={1} fill="rgb(200,200,200)" />
              <circle cx={282} cy={226} r={1} fill="rgb(200,200,200)" />
              <circle cx={316} cy={226} r={1} fill="rgb(200,200,200)" />
              {/* Central IC block (BCM SoC) */}
              <rect
                x={292}
                y={211}
                width={12}
                height={8}
                fill="rgb(20, 20, 20)"
              />
              {/* Ethernet port on rear */}
              <rect
                x={279}
                y={212}
                width={4}
                height={6}
                fill="rgb(170, 170, 170)"
                stroke="rgb(30,30,30)"
                strokeWidth={0.3}
              />
              {/* Two USB ports on rear */}
              <rect
                x={316}
                y={209}
                width={3}
                height={4}
                fill="rgb(30, 30, 30)"
              />
              <rect
                x={316}
                y={217}
                width={3}
                height={4}
                fill="rgb(30, 30, 30)"
              />
              {/* GPIO header — line of pins along one edge */}
              <rect
                x={294}
                y={202}
                width={16}
                height={2}
                fill="rgb(40, 30, 20)"
              />
            </g>
          )}

          {/* LIDAR — front of upper deck, circular housing */}
          {sensorsOpacity > 0 && (
            <g opacity={sensorsOpacity}>
              {/* Outer housing */}
              <circle cx={348} cy={210} r={10} fill="rgb(40, 40, 40)" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
              {/* Inner rotating disc */}
              <circle cx={348} cy={210} r={6} fill="rgb(60, 60, 60)" />
              {/* Laser slit (indicates rotation axis) */}
              <rect x={346} y={204} width={4} height={1.5} fill="rgb(20,20,20)" />
              {/* Dashed arc hinting at rotation (powered off until Beat 3 boot) */}
              <path
                d="M 338 210 A 10 10 0 0 1 358 210"
                fill="none"
                stroke="rgba(200,200,200,0.4)"
                strokeWidth={0.75}
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Camera — forward-facing lens, viewed top-down.
              Mount body sits on the chassis front; the lens barrel extends
              horizontally forward. Top-down we see the barrel from above as a
              rectangle, not a circular glass face. */}
          {sensorsOpacity > 0 && (
            <g opacity={sensorsOpacity}>
              {/* Mount body */}
              <rect
                x={372}
                y={205}
                width={8}
                height={10}
                rx={1.25}
                fill="rgb(30, 30, 30)"
                stroke="rgba(0,0,0,0.6)"
                strokeWidth={0.5}
              />
              {/* Lens barrel extending forward — narrower than the mount body */}
              <rect
                x={380}
                y={207.5}
                width={3}
                height={5}
                rx={0.75}
                fill="rgb(45, 45, 45)"
                stroke="rgba(0,0,0,0.55)"
                strokeWidth={0.4}
              />
              {/* Front cap — the lens-retaining ring, darker ring at the barrel tip */}
              <rect
                x={382.3}
                y={207.5}
                width={0.7}
                height={5}
                fill="rgb(15, 15, 15)"
              />
              {/* Subtle highlight along the barrel top edge */}
              <line
                x1={380.5}
                y1={208}
                x2={382.2}
                y2={208}
                stroke="rgba(200,200,200,0.4)"
                strokeWidth={0.3}
              />
            </g>
          )}

          {/* "Eye" LEDs — powered off in Beat 2 (robot about to turn on).
              Beat 3 (boot sequence) will switch them to lit blue.
              Dark housing with a thin ring showing the LED aperture. */}
          {ledsOpacity > 0 && (
            <g opacity={ledsOpacity}>
              {[192, 228].map((cy) => (
                <g key={cy}>
                  {/* Outer bezel */}
                  <circle cx={374} cy={cy} r={2.2} fill="rgb(30, 30, 30)" stroke="rgba(0,0,0,0.6)" strokeWidth={0.3} />
                  {/* LED dome (unlit, dark) */}
                  <circle cx={374} cy={cy} r={1.5} fill="rgb(18, 18, 18)" />
                  {/* Subtle highlight to show it's still a physical lens */}
                  <circle cx={373.5} cy={cy - 0.5} r={0.3} fill="rgba(200, 200, 200, 0.35)" />
                </g>
              ))}
            </g>
          )}

          {/* Cable traces — solid where visible in the open bay, dashed where
              they pass under the closed roof (convention: hidden = dashed). */}
          {cablesOpacity > 0 && (
            <>
              {/* Visible solid cables (in the open bay, x ≤ 328) */}
              <g
                fill="none"
                stroke="rgba(200, 180, 80, 0.55)"
                strokeWidth={0.75}
                strokeLinecap="round"
                opacity={cablesOpacity}
              >
                {/* Battery → RPi (power) */}
                <path d="M 276 215 L 278 215" />
                {/* RPi → bay floor → seam (LIDAR cable segment in bay) */}
                <path d="M 320 218 L 328 218" />
                {/* RPi top edge → seam (top-LED cable segment in bay) */}
                <path d="M 312 200 L 312 195 L 328 195" />
                {/* RPi bottom edge → seam (bottom-LED cable segment in bay) */}
                <path d="M 312 230 L 312 233 L 328 233" />
                {/* RPi → bay floor → seam (camera cable segment in bay) */}
                <path d="M 320 225 L 328 225" />
                {/* RPi → top wheel (vertical through chassis, visible in bay up to wall) */}
                <path d="M 298 200 L 298 181" />
                {/* RPi → bottom wheel */}
                <path d="M 298 230 L 298 239" />
              </g>

              {/* Hidden dashed cables (under the closed roof, x ≥ 328, or inside
                  chassis wall thickness at the wheels) */}
              <g
                fill="none"
                stroke="rgba(200, 180, 80, 0.55)"
                strokeWidth={0.75}
                strokeLinecap="round"
                strokeDasharray="2 2"
                opacity={cablesOpacity}
              >
                {/* Roof segment → LIDAR */}
                <path d="M 328 218 L 338 218 L 348 220" />
                {/* Roof segment → top-front LED */}
                <path d="M 328 195 L 360 195 L 374 192" />
                {/* Roof segment → bottom-front LED */}
                <path d="M 328 233 L 360 233 L 374 228" />
                {/* Roof segment → Camera */}
                <path d="M 328 225 L 360 225 L 370 220 L 374 213" />
                {/* Wheel segments (through chassis wall) */}
                <path d="M 298 181 L 298 175 L 298 168" />
                <path d="M 298 239 L 298 245 L 298 252" />
              </g>
            </>
          )}
        </g>
      </ChromaticShift>
    </svg>
  );
}

/** Triangle wave centred at `peak` with range [0,1]. */
function triangle(p: number, peak: number): number {
  const dist = Math.abs(p - peak);
  const width = Math.max(peak, 1 - peak);
  return Math.max(0, 1 - dist / width);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
