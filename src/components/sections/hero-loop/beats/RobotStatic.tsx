/**
 * RobotStatic — the robot at full materialisation (Beat 2 end-state).
 *
 * Renders as a <g> element (NOT a standalone <svg>) — must be embedded inside
 * a parent <svg> with viewBox="0 0 640 400".
 *
 * Props:
 *   ledsOn          — false: dark unlit LEDs (Beat 2 default)
 *                     true:  accent-blue glow (Beat 3 boot)
 *   lidarAngle      — degrees to rotate the LIDAR sweep arc around (348, 210).
 *                     Default 0 = static.
 *   cameraRecording — True = red LED visible on camera body.
 *   centerX         — Robot centre in screen coords. Default 318 (body-frame cx).
 *   centerY         — Robot centre in screen coords. Default 210 (body-frame cy).
 *   yawDeg          — Robot heading in screen degrees. Default -25.
 *
 * Transform order: rotate by yawDeg around the default body-frame centre (318, 210),
 * then translate to the desired (centerX, centerY). This keeps all inner body-frame
 * coordinates unchanged while moving the robot to any screen position.
 *
 * Default props reproduce `rotate(-25 318 210)` — identical to the original behaviour.
 */

interface RobotStaticProps {
  /** LEDs lit state. false = unlit dark, true = accent blue glow. */
  ledsOn?: boolean;
  /** Optional LIDAR rotation angle in degrees (for Beat 3 rotation animation). Default 0 = static. */
  lidarAngle?: number;
  /** Camera recording indicator. True = red LED visible on camera body. */
  cameraRecording?: boolean;
  /** Robot centre X in screen coords. Default 318. */
  centerX?: number;
  /** Robot centre Y in screen coords. Default 210. */
  centerY?: number;
  /** Robot heading in screen degrees. Default -25. */
  yawDeg?: number;
  /** Bay openness [0..1]. 1 = fully open (Beat 2/3). 0 = fully closed (drive). */
  bayOpen?: number;
}

export function RobotStatic({
  ledsOn = false,
  lidarAngle = 0,
  cameraRecording = false,
  centerX = 318,
  centerY = 210,
  yawDeg = -25,
  bayOpen = 1,
}: RobotStaticProps) {
  const bayClamp = Math.max(0, Math.min(1, bayOpen));
  // Bay fill interpolates from open (155,155,155) to closed-matches-roof (115,115,115)
  const bayFillGrey = Math.round(115 + (155 - 115) * bayClamp);
  const bayFill = `rgb(${bayFillGrey}, ${bayFillGrey}, ${bayFillGrey})`;
  // Seam visibility fades with bay-open; closed roof is one piece
  const seamOpacity = bayClamp;
  // Industrial-transformation overlay — fades IN as bay closes
  //   0 when bay fully open (Beat 2/3 prototype)
  //   1 when bay fully closed (Beat 4 production robot)
  const industrial = 1 - bayClamp;
  // Rotate around the body-frame centre (318, 210), then translate to desired position.
  // At defaults: translate(0 0) rotate(-25 318 210) — identical to original behaviour.
  const tx = centerX - 318;
  const ty = centerY - 210;
  return (
    <g transform={`translate(${tx} ${ty}) rotate(${yawDeg} 318 210)`}>
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

      {/* ─────────────────────────── PROTOTYPE BODY ───────────────────────────
          The original 120×70 prototype chassis with wheels, bay, roof, mount
          holes. Fades OUT as bay closes (Beat 4) — replaced by the industrial
          chassis below. */}
      <g opacity={bayClamp}>
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

        {/* Chassis base */}
        <path
          d="M 258 175 h 120 v 70 h -120 Z"
          fill="rgb(120, 120, 120)"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Chamfer edges */}
        <polygon points="258,175 378,175 370,181 266,181" fill="rgb(105, 105, 105)" stroke="rgba(0,0,0,0.25)" strokeWidth={0.5} />
        <polygon points="378,175 378,245 370,239 370,181" fill="rgb(110, 110, 110)" stroke="rgba(0,0,0,0.25)" strokeWidth={0.5} />
        <polygon points="378,245 258,245 266,239 370,239" fill="rgb(105, 105, 105)" stroke="rgba(0,0,0,0.25)" strokeWidth={0.5} />
        <polygon points="258,245 258,175 266,181 266,239" fill="rgb(110, 110, 110)" stroke="rgba(0,0,0,0.25)" strokeWidth={0.5} />

        {/* Rear bay + front roof + seam + mount holes */}
        <rect x={266} y={181} width={62} height={58} rx={2} fill={bayFill} stroke="rgba(0,0,0,0.3)" strokeWidth={0.75} />
        <rect x={328} y={181} width={42} height={58} rx={2} fill="rgb(115, 115, 115)" stroke="rgba(0,0,0,0.3)" strokeWidth={0.75} />
        <line x1={328} y1={181} x2={328} y2={239} stroke="rgba(0,0,0,0.4)" strokeWidth={0.75} opacity={seamOpacity} />
        <line x1={326.5} y1={181} x2={326.5} y2={239} stroke="rgba(0,0,0,0.2)" strokeWidth={1.25} opacity={seamOpacity} />
        <circle cx={272} cy={187} r={1.5} fill="rgb(50,50,50)" />
        <circle cx={272} cy={233} r={1.5} fill="rgb(50,50,50)" />
        <circle cx={364} cy={187} r={1.5} fill="rgb(50,50,50)" />
        <circle cx={364} cy={233} r={1.5} fill="rgb(50,50,50)" />
        <circle cx={338} cy={200} r={0.75} fill="rgb(40,40,40)" />
        <circle cx={358} cy={200} r={0.75} fill="rgb(40,40,40)" />
        <circle cx={338} cy={220} r={0.75} fill="rgb(40,40,40)" />
        <circle cx={358} cy={220} r={0.75} fill="rgb(40,40,40)" />
      </g>

      {/* ─────────────────────────── INDUSTRIAL BODY ───────────────────────────
          Production-grade chassis that fades IN as the bay closes.
          Bigger footprint (180×115 vs 120×70), matte black, skirted, bumpers. */}
      {industrial > 0 && (
        <g opacity={industrial}>
          <defs>
            <pattern
              id="robotStaticHazardStripes"
              patternUnits="userSpaceOnUse"
              width={10}
              height={10}
              patternTransform="rotate(45)"
            >
              <rect x={0} y={0} width={5} height={10} fill="rgb(230, 190, 30)" />
              <rect x={5} y={0} width={5} height={10} fill="rgb(20, 20, 20)" />
            </pattern>
          </defs>

          {/* Industrial chassis — bigger (180×115), matte black, heavily rounded */}
          <rect
            x={228}
            y={152.5}
            width={180}
            height={115}
            rx={14}
            fill="rgb(28, 28, 30)"
            stroke="rgba(0,0,0,0.7)"
            strokeWidth={1.5}
          />

          {/* Bumper corners — thicker rubber at all 4 corners */}
          {[
            { cx: 236, cy: 160 },
            { cx: 400, cy: 160 },
            { cx: 400, cy: 260 },
            { cx: 236, cy: 260 },
          ].map(({ cx, cy }, i) => (
            <rect
              key={i}
              x={cx - 6}
              y={cy - 6}
              width={12}
              height={12}
              rx={4}
              fill="rgb(15, 15, 15)"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth={0.5}
            />
          ))}

          {/* Payload deck — raised platform on top with a brushed-metal finish */}
          <rect
            x={246}
            y={170}
            width={144}
            height={80}
            rx={6}
            fill="rgb(60, 60, 62)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={0.6}
          />
          {/* Deck mounting rails — thin lines */}
          <line x1={260} y1={170} x2={260} y2={250} stroke="rgba(0,0,0,0.35)" strokeWidth={0.5} />
          <line x1={376} y1={170} x2={376} y2={250} stroke="rgba(0,0,0,0.35)" strokeWidth={0.5} />

          {/* Forward-direction chevron arrow on the deck (big, yellow) */}
          <path
            d="M 340 210 L 362 195 L 362 225 Z"
            fill="rgb(240, 200, 40)"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={0.5}
          />

          {/* Warning tape along the lateral sides (top/bottom of body frame,
              i.e. the long edges of the industrial chassis). 18 units thick. */}
          <rect
            x={246}
            y={152.5}
            width={144}
            height={18}
            fill="url(#robotStaticHazardStripes)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={0.4}
          />
          <rect
            x={246}
            y={249.5}
            width={144}
            height={18}
            fill="url(#robotStaticHazardStripes)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={0.4}
          />

          {/* Bumper trim at the short (front / rear) edges — thin dark strips */}
          <rect x={388} y={168} width={4} height={84} fill="rgb(15, 15, 15)" />
          <rect x={244} y={168} width={4} height={84} fill="rgb(15, 15, 15)" />

          {/* Large ID panel on the rear portion of the deck */}
          <rect
            x={262}
            y={198}
            width={50}
            height={24}
            rx={2}
            fill="rgb(18, 18, 20)"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth={0.4}
          />
          <text
            x={287}
            y={215}
            textAnchor="middle"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontSize={11}
            fontWeight={700}
            fill="rgb(240, 200, 40)"
            stroke="none"
          >
            NB-01
          </text>

          {/* LCD screen on the front panel — abstract green readout (no legible text) */}
          <rect
            x={388}
            y={184}
            width={12}
            height={52}
            rx={1}
            fill="rgb(8, 20, 12)"
            stroke="rgba(0,0,0,0.7)"
            strokeWidth={0.5}
          />
          {/* Abstract readout — a few scan lines + a waveform-like pattern */}
          <g stroke="rgb(90, 220, 130)" strokeWidth={0.5} fill="none" opacity={0.8}>
            <line x1={390} y1={190} x2={398} y2={190} />
            <line x1={390} y1={193} x2={396} y2={193} />
            <line x1={390} y1={196} x2={397} y2={196} />
            {/* Waveform */}
            <polyline points="390,205 392,202 394,206 396,201 398,205" />
            {/* Dashed progress bar */}
            <line x1={390} y1={215} x2={398} y2={215} strokeDasharray="1.5 1" />
            {/* Bottom dots */}
            <line x1={390} y1={222} x2={395} y2={222} />
            <line x1={390} y1={228} x2={398} y2={228} />
          </g>

          {/* Status indicator triplet on the LCD — red / amber / green dots.
              All three visible but only green is lit (operational state). */}
          <circle cx={394} cy={232} r={1.0} fill="rgb(80, 20, 20)" />
          <circle cx={394} cy={234.5} r={1.0} fill="rgb(80, 55, 15)" />
          <circle cx={394} cy={237} r={1.0} fill="rgb(80, 240, 110)" />
          <circle cx={394} cy={237} r={1.6} fill="rgb(80, 240, 110)" opacity={0.3} />

          {/* Power/charge socket — small cover on rear */}
          <rect x={230} y={208} width={4} height={8} fill="rgb(55, 55, 55)" stroke="rgba(0,0,0,0.5)" strokeWidth={0.3} />
        </g>
      )}

      {/* Battery pack + Raspberry Pi — fade out when bay closes (Beat 4 onwards) */}
      <g opacity={bayClamp}>
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
      </g>

      {/* ─────────────────── PROTOTYPE SENSORS (centre LIDAR + camera + eye LEDs) ───────────────────
          Fade out as the bay closes — industrial phase uses 4 corner LIDARs instead. */}
      <g opacity={bayClamp}>
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

      {/* Front "eye" LEDs — prototype-only, fade out with the bay */}
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
      </g>{/* end prototype sensors bayClamp group */}

      {/* ─────────────────── INDUSTRIAL SENSORS — 2 diagonal 3D LIDARs ────────
          Typical real-world config: LIDARs at opposite corners (front-right +
          rear-left). With 180° fans they cover the full surroundings. */}
      {industrial > 0 && (
        <g opacity={industrial}>
          {[
            // baseAngle = fan centre direction in SVG convention
            //   0° = +x (right), 90° = +y (down), 180° = left, 270° = up.
            // Each fan spans 270° around its diagonal. Both fans are static —
            // no rotation — for a clean dense scan pattern.
            { cx: 252, cy: 176, baseAngle: 225 },   // rear-left: fan centred up-left diagonal
            { cx: 384, cy: 244, baseAngle: 45 },    // front-right: fan centred down-right diagonal
          ].map(({ cx, cy, baseAngle }) => {
            // Dense static fan — 41 beams over 270°. No rotation (fan is
            // fixed relative to the robot body). Typical 3D-LIDAR coverage:
            // the 90° blind wedge points into the robot.
            const FAN_COUNT = 41;          // 41 beams → 40 gaps → 6.75° apart
            const FAN_SPAN = 270;
            const SHORT_LEN = 90;
            const LONG_LEN = 260;
            return (
              <g key={`corner-lidar-${cx}-${cy}`}>
                {/* Short beams — bulk of the fan */}
                <g fill="none" stroke="var(--accent)" strokeWidth={0.5} strokeLinecap="round" opacity={0.5}>
                  {Array.from({ length: FAN_COUNT }).map((_, i) => {
                    const isLong = i === 0 || i === 13 || i === 27 || i === 40;
                    if (isLong) return null;
                    const a = baseAngle - FAN_SPAN / 2 + (FAN_SPAN / (FAN_COUNT - 1)) * i;
                    const rad = (a * Math.PI) / 180;
                    return (
                      <line
                        key={i}
                        x1={cx}
                        y1={cy}
                        x2={cx + SHORT_LEN * Math.cos(rad)}
                        y2={cy + SHORT_LEN * Math.sin(rad)}
                      />
                    );
                  })}
                </g>

                {/* Long reference beams — every 90° within the 270° fan
                    (indices 0, 13, 27, 40 in a 41-beam fan). */}
                <g fill="none" stroke="var(--accent)" strokeWidth={0.8} strokeLinecap="round" opacity={0.75}>
                  {[0, 13, 27, 40].map((i) => {
                    const a = baseAngle - FAN_SPAN / 2 + (FAN_SPAN / (FAN_COUNT - 1)) * i;
                    const rad = (a * Math.PI) / 180;
                    return (
                      <line
                        key={`long-${i}`}
                        x1={cx}
                        y1={cy}
                        x2={cx + LONG_LEN * Math.cos(rad)}
                        y2={cy + LONG_LEN * Math.sin(rad)}
                      />
                    );
                  })}
                </g>

                {/* Housing — rendered on top of the fan */}
                <circle cx={cx} cy={cy} r={7} fill="rgb(25, 25, 25)" stroke="rgba(0,0,0,0.8)" strokeWidth={0.6} />
                <circle cx={cx} cy={cy} r={4.2} fill="rgb(45, 45, 45)" />
                {/* Tiny camera aperture on the housing top (integrated RGB+depth) */}
                <circle cx={cx} cy={cy} r={1.4} fill="rgb(10, 25, 55)" />
                <circle cx={cx - 0.4} cy={cy - 0.4} r={0.35} fill="rgba(220,220,255,0.8)" />
              </g>
            );
          })}
        </g>
      )}

      {/* Cable traces — visible in open bay (solid), hidden under roof (dashed).
          All cables fade out when the bay closes (Beat 4 onwards — production robot). */}
      <g
        fill="none"
        stroke="rgba(200, 180, 80, 0.55)"
        strokeWidth={0.75}
        strokeLinecap="round"
        opacity={bayClamp}
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
        opacity={bayClamp}
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
