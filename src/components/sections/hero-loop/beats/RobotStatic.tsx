/**
 * RobotStatic — the robot at full materialisation (Beat 2 end-state).
 *
 * Renders as a <g> element (NOT a standalone <svg>) — must be embedded inside
 * a parent <svg> with viewBox="0 0 640 400".
 *
 * Props:
 *   ledsOn     — false: dark unlit LEDs (Beat 2 default)
 *                true:  accent-blue glow (Beat 3 boot)
 *   lidarAngle — degrees to rotate the LIDAR sweep arc around (348, 210).
 *                Default 0 = static.
 */

interface RobotStaticProps {
  /** LEDs lit state. false = unlit dark, true = accent blue glow. */
  ledsOn?: boolean;
  /** Optional LIDAR rotation angle in degrees (for Beat 3 rotation animation). Default 0 = static. */
  lidarAngle?: number;
  /** Camera recording indicator. True = red LED visible on camera body. */
  cameraRecording?: boolean;
}

export function RobotStatic({
  ledsOn = false,
  lidarAngle = 0,
  cameraRecording = false,
}: RobotStaticProps) {
  return (
    <g transform="rotate(-25 318 210)">
      {/* Gradient defs — inline so this component is self-contained */}
      <defs>
        <linearGradient
          id="robotStaticTyreShadingTop"
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
          id="robotStaticTyreShadingBottom"
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
        {ledsOn && (
          <>
            <radialGradient id="ledGlowTop" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.9} />
              <stop offset="60%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="ledGlowBottom" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.9} />
              <stop offset="60%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </radialGradient>
          </>
        )}
      </defs>

      {/* Wheels — dark rubber with cylindrical shading */}
      <path
        d="M 284 161 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
        fill="url(#robotStaticTyreShadingTop)"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 284 245 h 28 q 3 0 3 3 v 8 q 0 3 -3 3 h -28 q -3 0 -3 -3 v -8 q 0 -3 3 -3 Z"
        fill="url(#robotStaticTyreShadingBottom)"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chassis base — solid grey */}
      <path
        d="M 258 175 h 120 v 70 h -120 Z"
        fill="rgb(120, 120, 120)"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chamfer edges — four trapezoids */}
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

      {/* Rear open bay — lighter, lit from above */}
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
      {/* Front closed roof */}
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
      {/* Seam between roof panel and bay edge */}
      <line
        x1={328}
        y1={181}
        x2={328}
        y2={239}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth={0.75}
      />
      {/* Inner shadow stripe on bay side of the seam */}
      <line
        x1={326.5}
        y1={181}
        x2={326.5}
        y2={239}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={1.25}
      />
      {/* Mount holes */}
      <circle cx={272} cy={187} r={1.5} fill="rgb(50,50,50)" />
      <circle cx={272} cy={233} r={1.5} fill="rgb(50,50,50)" />
      <circle cx={364} cy={187} r={1.5} fill="rgb(50,50,50)" />
      <circle cx={364} cy={233} r={1.5} fill="rgb(50,50,50)" />
      {/* LIDAR mount screws */}
      <circle cx={338} cy={200} r={0.75} fill="rgb(40,40,40)" />
      <circle cx={358} cy={200} r={0.75} fill="rgb(40,40,40)" />
      <circle cx={338} cy={220} r={0.75} fill="rgb(40,40,40)" />
      <circle cx={358} cy={220} r={0.75} fill="rgb(40,40,40)" />

      {/* Battery pack */}
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
      <line x1={268} y1={210} x2={276} y2={210} stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
      <line x1={268} y1={220} x2={276} y2={220} stroke="rgba(0,0,0,0.3)" strokeWidth={0.4} />
      <rect x={276} y={203} width={1.5} height={2} fill="rgb(150,40,40)" />
      <rect x={276} y={225} width={1.5} height={2} fill="rgb(30,30,30)" />

      {/* Raspberry Pi — PCB green */}
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
      <circle cx={282} cy={204} r={1} fill="rgb(200,200,200)" />
      <circle cx={316} cy={204} r={1} fill="rgb(200,200,200)" />
      <circle cx={282} cy={226} r={1} fill="rgb(200,200,200)" />
      <circle cx={316} cy={226} r={1} fill="rgb(200,200,200)" />
      <rect x={292} y={211} width={12} height={8} fill="rgb(20, 20, 20)" />
      <rect
        x={279}
        y={212}
        width={4}
        height={6}
        fill="rgb(170, 170, 170)"
        stroke="rgb(30,30,30)"
        strokeWidth={0.3}
      />
      <rect x={316} y={209} width={3} height={4} fill="rgb(30, 30, 30)" />
      <rect x={316} y={217} width={3} height={4} fill="rgb(30, 30, 30)" />
      <rect x={294} y={202} width={16} height={2} fill="rgb(40, 30, 20)" />

      {/* LIDAR — front of upper deck */}
      <circle cx={348} cy={210} r={10} fill="rgb(40, 40, 40)" stroke="rgba(0,0,0,0.5)" strokeWidth={0.5} />
      <circle cx={348} cy={210} r={6} fill="rgb(60, 60, 60)" />
      <rect x={346} y={204} width={4} height={1.5} fill="rgb(20,20,20)" />
      {/* Sweep — internal dashed arc (always faint, rotates) + external beam (only
          when lidarAngle > 0, i.e. Beat 3 onwards). The external beam is the
          visible scan ray, extending past the chassis into the world. */}
      <g transform={`rotate(${lidarAngle} 348 210)`}>
        <path
          d="M 338 210 A 10 10 0 0 1 358 210"
          fill="none"
          stroke="rgba(200,200,200,0.4)"
          strokeWidth={0.75}
          strokeDasharray="2 2"
        />
        {lidarAngle > 0 && (
          <>
            {/* Leading beam — bright accent, extends past chassis */}
            <line
              x1={348}
              y1={210}
              x2={398}
              y2={210}
              stroke="var(--accent)"
              strokeWidth={1.25}
              strokeLinecap="round"
              opacity={0.85}
            />
            {/* Trailing fade — behind the beam, gives a comet-tail feel */}
            <line
              x1={348}
              y1={210}
              x2={388}
              y2={210}
              stroke="var(--accent)"
              strokeWidth={0.75}
              strokeLinecap="round"
              opacity={0.35}
              transform="rotate(-20 348 210)"
            />
            <line
              x1={348}
              y1={210}
              x2={378}
              y2={210}
              stroke="var(--accent)"
              strokeWidth={0.5}
              strokeLinecap="round"
              opacity={0.2}
              transform="rotate(-40 348 210)"
            />
          </>
        )}
      </g>

      {/* Camera */}
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
      <rect x={382.3} y={207.5} width={0.7} height={5} fill="rgb(15, 15, 15)" />
      <line
        x1={380.5}
        y1={208}
        x2={382.2}
        y2={208}
        stroke="rgba(200,200,200,0.4)"
        strokeWidth={0.3}
      />
      {/* Camera recording indicator — small red dot on the mount body, blinks
          when camera is active (Beat 3 onwards). */}
      {cameraRecording && (
        <g>
          <circle cx={374} cy={207.5} r={1.2} fill="rgb(220, 40, 40)" opacity={0.4} />
          <circle cx={374} cy={207.5} r={0.8} fill="rgb(230, 50, 50)" />
        </g>
      )}

      {/* LEDs — cy=192 and cy=228 in body frame */}
      {[192, 228].map((cy) => (
        <g key={cy}>
          {ledsOn ? (
            <>
              {/* Soft glow halo — larger circle behind */}
              <circle cx={374} cy={cy} r={6} fill={`url(#ledGlow${cy === 192 ? "Top" : "Bottom"})`} />
              {/* Outer bezel */}
              <circle cx={374} cy={cy} r={2.2} fill="rgb(20, 20, 20)" stroke="var(--accent)" strokeWidth={0.5} />
              {/* Lit LED dome — accent blue */}
              <circle cx={374} cy={cy} r={1.5} fill="var(--accent)" />
              {/* Specular highlight */}
              <circle cx={373.5} cy={cy - 0.5} r={0.4} fill="rgba(255, 255, 255, 0.7)" />
            </>
          ) : (
            <>
              {/* Outer bezel */}
              <circle cx={374} cy={cy} r={2.2} fill="rgb(30, 30, 30)" stroke="rgba(0,0,0,0.6)" strokeWidth={0.3} />
              {/* LED dome (unlit, dark) */}
              <circle cx={374} cy={cy} r={1.5} fill="rgb(18, 18, 18)" />
              {/* Subtle highlight to show it's still a physical lens */}
              <circle cx={373.5} cy={cy - 0.5} r={0.3} fill="rgba(200, 200, 200, 0.35)" />
            </>
          )}
        </g>
      ))}

      {/* Cable traces — visible in open bay (solid), hidden under roof (dashed) */}
      <g
        fill="none"
        stroke="rgba(200, 180, 80, 0.55)"
        strokeWidth={0.75}
        strokeLinecap="round"
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
        {/* RPi → top wheel */}
        <path d="M 298 200 L 298 181" />
        {/* RPi → bottom wheel */}
        <path d="M 298 230 L 298 239" />
      </g>
      <g
        fill="none"
        stroke="rgba(200, 180, 80, 0.55)"
        strokeWidth={0.75}
        strokeLinecap="round"
        strokeDasharray="2 2"
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
    </g>
  );
}
