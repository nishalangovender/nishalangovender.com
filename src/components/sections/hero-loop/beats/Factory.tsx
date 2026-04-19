"use client";

/**
 * Top-down warehouse factory — a large 1600×900 warehouse with storage racks,
 * pallets, side rooms, floor grid, and a clear robot lane at world y=140..200
 * (dashed centre-line at y=165).
 *
 * Default world extents: x=640..2240, y=-250..650
 */

interface FactoryProps {
  /** World x of the warehouse west wall. */
  x?: number;
  /** World y of the warehouse north wall. */
  y?: number;
  /** Warehouse width in world units. */
  width?: number;
  /** Warehouse height in world units. */
  height?: number;
  /** Overall opacity for fade-in. */
  opacity?: number;
}

// Palette — theme-reactive via CSS vars declared in globals.css. Light
// mode = concrete/warehouse daylight; dark mode = dim night-shift tones.
// Forklifts keep vivid industrial-orange in both themes (no var).
const FLOOR_FILL = "var(--factory-floor)";
const GRID_STROKE = "var(--factory-grid)";
const WALL_STROKE = "var(--factory-wall)";
const RACK_FILL = "var(--factory-rack)";
const RACK_STROKE = "var(--factory-rack-edge)";
const PALLET_FILL = "var(--factory-pallet)";
const PALLET_STROKE = "var(--factory-pallet-edge)";
const PALLET_PLANK = "var(--factory-pallet-plank)";
const LANE_STROKE = "var(--factory-lane)";
const ROOM_FILL = "var(--factory-room)";
const ROOM_STROKE = "var(--factory-room-edge)";
const FORKLIFT_BODY = "rgb(230, 130, 30)";              // classic industrial orange
const FORKLIFT_DARK = "rgb(30, 30, 30)";

// Robot lane centre-line Y in world coords.
const LANE_MARK_Y = 165;

export function Factory({
  x = 640,
  y = -250,
  width = 1600,
  height = 900,
  opacity = 1,
}: FactoryProps) {
  const right = x + width;
  const bottom = y + height;

  // Floor grid — 40-unit cells across the full warehouse.
  const GRID_SIZE = 40;
  const verticalLines: number[] = [];
  const horizontalLines: number[] = [];
  for (let gx = x; gx <= right; gx += GRID_SIZE) verticalLines.push(gx);
  for (let gy = y; gy <= bottom; gy += GRID_SIZE) horizontalLines.push(gy);

  // Top-wall racks: 12 racks, 100 wide × 40 tall, spaced 130 apart.
  // World y: (y+10)..(y+50) = -240..-200. Well above lane corridor (135..200). ✓
  const TOP_RACK_Y = y + 10;
  const TOP_RACK_H = 40;
  const topRacks: number[] = Array.from({ length: 12 }, (_, i) => x + 10 + i * 130);

  // Bottom-wall racks: 12 racks. World y: (y+850)..(y+890) = 600..640. Well below lane. ✓
  const BOT_RACK_Y = bottom - 50;
  const BOT_RACK_H = 40;
  const botRacks: number[] = Array.from({ length: 12 }, (_, i) => x + 10 + i * 130);

  // Robot clearance corridor: world y=65..260 (accommodates 180×115 industrial
  // chassis rotated ~10° at its end position near y=165).
  // North-facing items must end (bottom edge) above y=65.
  // South-facing items must start (top edge) below y=260.

  // Side rooms (north side): world y range approx -60..-10 — ends well above 65. ✓
  const sideRoomsNorth = [
    { rx: x + 20,   ry: y + 190 }, // world y: -60..-10
    { rx: x + 120,  ry: y + 200 },
    { rx: x + 220,  ry: y + 180 },
    { rx: x + 400,  ry: y + 190 },
    { rx: x + 600,  ry: y + 175 },
    { rx: x + 800,  ry: y + 185 },
    { rx: x + 1000, ry: y + 195 },
    { rx: x + 1200, ry: y + 180 },
  ];

  // Side rooms (south side): world y range approx 270..320 — starts below 260. ✓
  const sideRoomsSouth = [
    { rx: x + 20,   ry: y + 520 }, // world y: 270..320
    { rx: x + 180,  ry: y + 525 },
    { rx: x + 360,  ry: y + 520 },
    { rx: x + 540,  ry: y + 530 },
    { rx: x + 720,  ry: y + 520 },
    { rx: x + 900,  ry: y + 525 },
    { rx: x + 1080, ry: y + 530 },
    { rx: x + 1260, ry: y + 525 },
  ];

  // Pallets (30×30): must clear world y=65..260.
  // North group: bottom edge at world py+30 < 65 → py_world < 35 → py_offset < 285.
  // South group: top edge at world py > 260 → py_offset > 510.
  const pallets: { px: number; py: number }[] = [
    // North of lane (world y 0..30)
    { px: x + 50,   py: y + 250 }, // world y=0..30
    { px: x + 200,  py: y + 245 },
    { px: x + 350,  py: y + 255 }, // world y=5..35 borderline
    { px: x + 500,  py: y + 240 },
    { px: x + 650,  py: y + 250 },
    { px: x + 800,  py: y + 235 },
    { px: x + 950,  py: y + 245 },
    { px: x + 1100, py: y + 250 },
    { px: x + 1250, py: y + 240 },
    { px: x + 1400, py: y + 245 },
    // Far north
    { px: x + 150,  py: y + 100 },
    { px: x + 450,  py: y + 120 },
    { px: x + 750,  py: y + 110 },
    { px: x + 1050, py: y + 100 },
    { px: x + 1350, py: y + 115 },
    // South of lane (world y 260..290)
    { px: x + 80,   py: y + 520 }, // world y=270..300
    { px: x + 250,  py: y + 525 },
    { px: x + 420,  py: y + 520 },
    { px: x + 600,  py: y + 525 },
    { px: x + 770,  py: y + 515 },
    { px: x + 940,  py: y + 520 },
    { px: x + 1110, py: y + 525 },
    { px: x + 1300, py: y + 520 },
    { px: x + 1450, py: y + 525 },
    // Far south
    { px: x + 150,  py: y + 640 },
    { px: x + 450,  py: y + 650 },
    { px: x + 750,  py: y + 640 },
    { px: x + 1050, py: y + 655 },
    { px: x + 1350, py: y + 645 },
  ];

  return (
    <g opacity={opacity}>
      {/* Floor */}
      <rect x={x} y={y} width={width} height={height} fill={FLOOR_FILL} />

      {/* Floor grid */}
      <g stroke={GRID_STROKE} strokeWidth={0.5} fill="none">
        {verticalLines.map((vx, i) => (
          <line key={`v-${i}`} x1={vx} y1={y} x2={vx} y2={bottom} />
        ))}
        {horizontalLines.map((vy, i) => (
          <line key={`h-${i}`} x1={x} y1={vy} x2={right} y2={vy} />
        ))}
      </g>

      {/* Walls */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke={WALL_STROKE}
        strokeWidth={2}
      />

      {/* Side rooms — north side */}
      {sideRoomsNorth.map((r, i) => (
        <rect
          key={`room-n-${i}`}
          x={r.rx}
          y={r.ry}
          width={80}
          height={50}
          fill={ROOM_FILL}
          stroke={ROOM_STROKE}
          strokeWidth={0.75}
        />
      ))}

      {/* Side rooms — south side */}
      {sideRoomsSouth.map((r, i) => (
        <rect
          key={`room-s-${i}`}
          x={r.rx}
          y={r.ry}
          width={80}
          height={50}
          fill={ROOM_FILL}
          stroke={ROOM_STROKE}
          strokeWidth={0.75}
        />
      ))}

      {/* Storage racks — top wall */}
      {topRacks.map((rx, i) => (
        <rect
          key={`rack-top-${i}`}
          x={rx}
          y={TOP_RACK_Y}
          width={100}
          height={TOP_RACK_H}
          fill={RACK_FILL}
          stroke={RACK_STROKE}
          strokeWidth={0.8}
        />
      ))}

      {/* Storage racks — bottom wall */}
      {botRacks.map((rx, i) => (
        <rect
          key={`rack-bot-${i}`}
          x={rx}
          y={BOT_RACK_Y}
          width={100}
          height={BOT_RACK_H}
          fill={RACK_FILL}
          stroke={RACK_STROKE}
          strokeWidth={0.8}
        />
      ))}

      {/* Pallets — scattered in non-lane areas, with visible plank lines */}
      {pallets.map((p, i) => (
        <g key={`pallet-${i}`}>
          <rect
            x={p.px}
            y={p.py}
            width={30}
            height={30}
            fill={PALLET_FILL}
            stroke={PALLET_STROKE}
            strokeWidth={0.7}
          />
          {/* Horizontal planks — 3 across */}
          <line x1={p.px} y1={p.py + 10} x2={p.px + 30} y2={p.py + 10} stroke={PALLET_PLANK} strokeWidth={0.5} />
          <line x1={p.px} y1={p.py + 20} x2={p.px + 30} y2={p.py + 20} stroke={PALLET_PLANK} strokeWidth={0.5} />
          {/* Fork slots — two small dark gaps on the edges */}
          <rect x={p.px + 5} y={p.py} width={3} height={30} fill="rgba(30,20,10,0.35)" />
          <rect x={p.px + 22} y={p.py} width={3} height={30} fill="rgba(30,20,10,0.35)" />
        </g>
      ))}

      {/* Forklift #1 — parked in the south clear band (world y ~430..490),
          facing north. Mast flush with body top; forks project upward from it. */}
      {(() => {
        const fx = x + 360;   // world x ≈ 1000
        const fy = y + 680;   // body top at world y=430; body spans y=430..490
        return (
          <g>
            {/* Wheels — 4 corners, drawn under the body */}
            <rect x={fx - 3} y={fy + 4} width={5} height={10} fill={FORKLIFT_DARK} />
            <rect x={fx + 38} y={fy + 4} width={5} height={10} fill={FORKLIFT_DARK} />
            <rect x={fx - 3} y={fy + 46} width={5} height={10} fill={FORKLIFT_DARK} />
            <rect x={fx + 38} y={fy + 46} width={5} height={10} fill={FORKLIFT_DARK} />
            {/* Body (top-down rect) */}
            <rect x={fx} y={fy} width={40} height={60} rx={3} fill={FORKLIFT_BODY} stroke={FORKLIFT_DARK} strokeWidth={1} />
            {/* Driver cage */}
            <rect x={fx + 6} y={fy + 12} width={28} height={26} fill="rgba(0,0,0,0.2)" stroke={FORKLIFT_DARK} strokeWidth={0.5} />
            {/* Steering wheel */}
            <circle cx={fx + 20} cy={fy + 25} r={3} fill="none" stroke={FORKLIFT_DARK} strokeWidth={0.8} />
            {/* Mast — horizontal bar flush with body top (front edge) */}
            <rect x={fx + 4} y={fy - 4} width={32} height={4} fill={FORKLIFT_DARK} />
            {/* Forks — extend FROM the mast outward (continuous with mast) */}
            <rect x={fx + 9} y={fy - 20} width={3} height={16} fill="rgb(90, 90, 90)" stroke={FORKLIFT_DARK} strokeWidth={0.3} />
            <rect x={fx + 28} y={fy - 20} width={3} height={16} fill="rgb(90, 90, 90)" stroke={FORKLIFT_DARK} strokeWidth={0.3} />
          </g>
        );
      })()}

      {/* Forklift #2 — further east in the south clear band, facing south.
          Mast flush with body bottom; forks project downward. */}
      {(() => {
        const fx = x + 860;   // world x ≈ 1500 (clear of far-south pallets)
        const fy = y + 730;   // body top at world y=480; body spans y=480..540
        return (
          <g>
            {/* Wheels */}
            <rect x={fx - 3} y={fy + 4} width={5} height={10} fill={FORKLIFT_DARK} />
            <rect x={fx + 38} y={fy + 4} width={5} height={10} fill={FORKLIFT_DARK} />
            <rect x={fx - 3} y={fy + 46} width={5} height={10} fill={FORKLIFT_DARK} />
            <rect x={fx + 38} y={fy + 46} width={5} height={10} fill={FORKLIFT_DARK} />
            {/* Body */}
            <rect x={fx} y={fy} width={40} height={60} rx={3} fill={FORKLIFT_BODY} stroke={FORKLIFT_DARK} strokeWidth={1} />
            {/* Driver cage (lower half since facing south) */}
            <rect x={fx + 6} y={fy + 22} width={28} height={26} fill="rgba(0,0,0,0.2)" stroke={FORKLIFT_DARK} strokeWidth={0.5} />
            {/* Steering wheel */}
            <circle cx={fx + 20} cy={fy + 35} r={3} fill="none" stroke={FORKLIFT_DARK} strokeWidth={0.8} />
            {/* Mast — flush with body bottom */}
            <rect x={fx + 4} y={fy + 60} width={32} height={4} fill={FORKLIFT_DARK} />
            {/* Forks — extend FROM the mast outward (downward) */}
            <rect x={fx + 9} y={fy + 64} width={3} height={16} fill="rgb(90, 90, 90)" stroke={FORKLIFT_DARK} strokeWidth={0.3} />
            <rect x={fx + 28} y={fy + 64} width={3} height={16} fill="rgb(90, 90, 90)" stroke={FORKLIFT_DARK} strokeWidth={0.3} />
          </g>
        );
      })()}

      {/* Robot lane marking — dashed yellow centre-line at world y=165 */}
      <line
        x1={x}
        y1={LANE_MARK_Y}
        x2={right}
        y2={LANE_MARK_Y}
        stroke={LANE_STROKE}
        strokeWidth={2}
        strokeDasharray="12 8"
        fill="none"
      />
    </g>
  );
}
