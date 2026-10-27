import React, { useState, useRef, useEffect } from 'react';
import { CricketerProfile, FieldSectors, CalculatedStrengthMetrics } from '../types/cricket';
import { FIELD_SECTOR_LABELS } from '../utils/strengthCalculator';
import { Compass, Info, Users, Eye, EyeOff, Sparkles, Sliders, Plus, Minus, Move } from 'lucide-react';

interface WagonWheelChartProps {
  player: CricketerProfile;
  metrics: CalculatedStrengthMetrics;
  onChangeFieldSector?: (sector: keyof FieldSectors, value: number) => void;
}

const DETAILED_SHOT_INFO: Record<
  keyof FieldSectors,
  { primaryShots: string; fieldingPositions: string; description: string }
> = {
  cover: {
    primaryShots: 'Classical Cover Drive, Inside-out lofted drive, back-foot punch through extra cover',
    fieldingPositions: 'Extra Cover, Cover Point, Deep Sweeper Cover',
    description: 'High-value scoring zone against full pitched deliveries outside off-stump.',
  },
  point: {
    primaryShots: 'Square cut, slash over point, back-foot punch, late dab',
    fieldingPositions: 'Backward Point, Point, Deep Point',
    description: 'Crucial sector against short and wide deliveries outside off-stump.',
  },
  thirdMan: {
    primaryShots: 'Late cut, upper cut against bouncers, ramp shot behind keeper, fly slip edge',
    fieldingPositions: 'Deep Third Man, Fly Slip, Short Third',
    description: 'Deflection and pace utilization zone behind square on the off side.',
  },
  fineLeg: {
    primaryShots: 'Glance off pads, hook shot behind square, paddle sweep, lap shot',
    fieldingPositions: 'Deep Fine Leg, Short Fine Leg, Long Stop',
    description: 'Behind-square leg-side zone relying on deflection and pace redirection.',
  },
  squareLeg: {
    primaryShots: 'Short-arm pull, slog sweep, pick-up flick over backward square leg',
    fieldingPositions: 'Square Leg, Deep Backward Square Leg, Short Leg',
    description: 'Power scoring area for cross-bat shots against short and back-of-a-length deliveries.',
  },
  midWicket: {
    primaryShots: 'Heave over cow corner, on-drive whip, helicopter shot, lofted sweep',
    fieldingPositions: 'Deep Mid-Wicket, Cow Corner, Short Mid-Wicket',
    description: 'Primary boundary target for aggressive wristy hitters and power finishers.',
  },
  longOn: {
    primaryShots: 'Straight lofted six, classical on-drive through mid-on, push down the ground',
    fieldingPositions: 'Long-On, Mid-On',
    description: 'V-shaped straight boundary zone on the on-side with minimum risk.',
  },
  longOff: {
    primaryShots: 'Classical straight off-drive, loft over mid-off, straight punch down the V',
    fieldingPositions: 'Long-Off, Mid-Off',
    description: 'The purist high-elbow straight drive zone down the V on the off-side.',
  },
};

export const WagonWheelChart: React.FC<WagonWheelChartProps> = ({
  player,
  metrics,
  onChangeFieldSector,
}) => {
  const [activeSectorKey, setActiveSectorKey] = useState<keyof FieldSectors | null>(null);
  const [showFielders, setShowFielders] = useState<boolean>(true);
  const [showRays, setShowRays] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragSectorKey, setDragSectorKey] = useState<keyof FieldSectors | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Stance: Default to player's batting hand, allow toggle
  const isLeftHanded = player.battingHand === 'Left-hand bat';
  const [viewStance, setViewStance] = useState<'RHB' | 'LHB'>(isLeftHanded ? 'LHB' : 'RHB');

  // Keep view stance in sync when player changes
  useEffect(() => {
    setViewStance(player.battingHand === 'Left-hand bat' ? 'LHB' : 'RHB');
  }, [player.id, player.battingHand]);

  const size = 420;
  const center = size / 2;
  const groundRadius = center - 30;
  const thirtyYardRadius = groundRadius * 0.52;

  // Real cricket orientation:
  // Striker stands at bottom of pitch (center, center + 22). Bowler bowls from top (center, center - 22).
  // For RHB (facing Up/North towards bowler):
  // - OFF-SIDE is to the RIGHT (East: 0° to 180° clockwise)
  // - LEG-SIDE is to the LEFT (West: -180° to 0° counter-clockwise)
  // For LHB:
  // - OFF-SIDE is to the LEFT (West)
  // - LEG-SIDE is to the RIGHT (East)
  const isLHB = viewStance === 'LHB';

  // 8 sector configs (Angles in degrees where 0 = Top / Straight):
  const rawSectorConfigs: { key: keyof FieldSectors; startAngle: number; endAngle: number }[] = [
    // 🏏 OFF-SIDE (Right half of the field: 0° to 180° clockwise for RHB)
    { key: 'longOff', startAngle: 0, endAngle: 45 },
    { key: 'cover', startAngle: 45, endAngle: 90 },
    { key: 'point', startAngle: 90, endAngle: 135 },
    { key: 'thirdMan', startAngle: 135, endAngle: 180 },

    // 🏏 LEG-SIDE / ON-SIDE (Left half of the field: -180° to 0° counter-clockwise for RHB)
    { key: 'fineLeg', startAngle: -180, endAngle: -135 },
    { key: 'squareLeg', startAngle: -135, endAngle: -90 },
    { key: 'midWicket', startAngle: -90, endAngle: -45 },
    { key: 'longOn', startAngle: -45, endAngle: 0 },
  ];

  // If LHB, flip off-side and leg-side angles horizontally
  const sectorConfigs = rawSectorConfigs.map((sec) => {
    if (!isLHB) return sec;
    return {
      key: sec.key,
      startAngle: -sec.endAngle,
      endAngle: -sec.startAngle,
    };
  });

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    // 0 deg is straight down the ground (top of screen: -y)
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeSectorArc = (
    cx: number,
    cy: number,
    rInner: number,
    rOuter: number,
    startAngle: number,
    endAngle: number
  ) => {
    const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
    const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
    const p3 = polarToCartesian(cx, cy, rInner, endAngle);
    const p4 = polarToCartesian(cx, cy, rInner, startAngle);

    return `
      M ${p1.x} ${p1.y}
      A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y}
      L ${p3.x} ${p3.y}
      A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y}
      Z
    `;
  };

  const getStrengthColor = (val: number, isHovered: boolean) => {
    if (val >= 90) return isHovered ? '#10b981' : '#059669'; // Emerald
    if (val >= 78) return isHovered ? '#06b6d4' : '#0891b2'; // Cyan
    if (val >= 65) return isHovered ? '#f59e0b' : '#d97706'; // Amber
    return isHovered ? '#f43f5e' : '#e11d48'; // Rose
  };

  // Typical standard 11 fielding positions for a balanced field
  // RHB: Off-side on the Right (> 0°), Leg-side on the Left (< 0°)
  // LHB: Flipped horizontally
  const fieldingPositions: { name: string; short: string; angle: number; r: number; ring: 'inner' | 'deep' }[] = [
    { name: 'Wicketkeeper', short: 'WK', angle: isLHB ? -175 : 175, r: 24, ring: 'inner' },
    { name: '1st Slip', short: 'Slip', angle: isLHB ? -158 : 158, r: 35, ring: 'inner' },
    { name: 'Point', short: 'Pt', angle: isLHB ? -95 : 95, r: thirtyYardRadius * 0.85, ring: 'inner' },
    { name: 'Cover', short: 'Cov', angle: isLHB ? -60 : 60, r: thirtyYardRadius * 0.82, ring: 'inner' },
    { name: 'Mid-Off', short: 'M-Off', angle: isLHB ? -25 : 25, r: thirtyYardRadius * 0.8, ring: 'inner' },
    { name: 'Bowler', short: 'Bowl', angle: 0, r: 28, ring: 'inner' },
    { name: 'Mid-On', short: 'M-On', angle: isLHB ? 25 : -25, r: thirtyYardRadius * 0.8, ring: 'inner' },
    { name: 'Mid-Wicket', short: 'M-Wkt', angle: isLHB ? 65 : -65, r: thirtyYardRadius * 0.85, ring: 'inner' },
    { name: 'Square Leg', short: 'Sq-L', angle: isLHB ? 100 : -100, r: thirtyYardRadius * 0.8, ring: 'inner' },
    { name: 'Deep Fine Leg', short: 'D.Fine', angle: isLHB ? 145 : -145, r: groundRadius * 0.88, ring: 'deep' },
    { name: 'Deep Mid-Wicket', short: 'Cow Cnr', angle: isLHB ? 70 : -70, r: groundRadius * 0.9, ring: 'deep' },
  ];

  const activeSector = activeSectorKey
    ? {
        key: activeSectorKey,
        ...FIELD_SECTOR_LABELS[activeSectorKey],
        value: player.fieldSectors[activeSectorKey],
        ...DETAILED_SHOT_INFO[activeSectorKey],
      }
    : null;

  // Striker batting crease coordinates
  const strikerY = center + 22;
  const strikerX = center;

  // ==============================================================
  // 🖱️ DIRECT WAGON WHEEL DRAGGING / CLICK EDITING LOGIC
  // ==============================================================
  const calculateValueFromCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;

    // Distance from center
    const dx = svgX - center;
    const dy = svgY - center;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Inner radius is thirtyYardRadius * 0.72 (~67px), boundary rope is groundRadius (180px)
    const minD = thirtyYardRadius * 0.72;
    const maxD = groundRadius;
    const normalized = Math.min(99, Math.max(15, Math.round(((dist - minD) / (maxD - minD)) * 100)));
    return normalized;
  };

  const handleSectorMouseDown = (sectorKey: keyof FieldSectors, e: React.MouseEvent) => {
    if (!onChangeFieldSector) return;
    setIsDragging(true);
    setDragSectorKey(sectorKey);
    setActiveSectorKey(sectorKey);
    const val = calculateValueFromCoords(e.clientX, e.clientY);
    if (val !== null) {
      onChangeFieldSector(sectorKey, val);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragSectorKey || !onChangeFieldSector) return;
    const val = calculateValueFromCoords(e.clientX, e.clientY);
    if (val !== null) {
      onChangeFieldSector(dragSectorKey, val);
    }
  };

  const handleSvgMouseUp = () => {
    setIsDragging(false);
    setDragSectorKey(null);
  };

  // Touch support for mobile/tablets
  const handleSvgTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragSectorKey || !onChangeFieldSector || e.touches.length === 0) return;
    const touch = e.touches[0];
    const val = calculateValueFromCoords(touch.clientX, touch.clientY);
    if (val !== null) {
      onChangeFieldSector(dragSectorKey, val);
    }
  };

  // Quick adjust helpers
  const handleStepValue = (sectorKey: keyof FieldSectors, delta: number) => {
    if (!onChangeFieldSector) return;
    const current = player.fieldSectors[sectorKey];
    const next = Math.min(99, Math.max(15, current + delta));
    onChangeFieldSector(sectorKey, next);
  };

  const handleSetPresetValue = (sectorKey: keyof FieldSectors, targetVal: number) => {
    if (!onChangeFieldSector) return;
    onChangeFieldSector(sectorKey, targetVal);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
      {/* Header with Title and Stance / Fielders Toggles */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏟️</span>
            <h3 className="text-sm font-bold text-white">
              Batting Wagon Wheel & Interactive Field
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <Move className="w-2.5 h-2.5" /> Direct Editable
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Click or drag sectors directly on the ground to edit strengths in real time
          </p>
        </div>

        {/* Controls: Stance & Fielders */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          {/* Stance toggle (RHB / LHB) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewStance('RHB')}
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                viewStance === 'RHB'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RHB View
            </button>
            <button
              onClick={() => setViewStance('LHB')}
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                viewStance === 'LHB'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LHB View
            </button>
          </div>

          {/* Fielders Toggle */}
          <button
            onClick={() => setShowFielders(!showFielders)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
              showFielders
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Toggle standard 11 fielding positions"
          >
            <Users className="w-3 h-3" />
            <span className="text-[10px]">{showFielders ? '11 Fielders' : 'Fielders Off'}</span>
          </button>

          {/* Shot Rays Toggle */}
          <button
            onClick={() => setShowRays(!showRays)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold border transition cursor-pointer ${
              showRays
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Toggle dynamic wagon wheel shot trajectories"
          >
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px]">Rays</span>
          </button>
        </div>
      </div>

      {/* Cricket Ground SVG */}
      <div className="relative w-full flex items-center justify-center py-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
          onTouchMove={handleSvgTouchMove}
          onTouchEnd={handleSvgMouseUp}
          className={`w-full max-w-[400px] h-auto drop-shadow-2xl select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-default'
          }`}
        >
          <defs>
            {/* Stadium Grass Gradient */}
            <radialGradient id="grassGrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#022c22" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0b1322" stopOpacity="1" />
            </radialGradient>

            {/* Pitch Strip Gradient */}
            <linearGradient id="pitchGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Batsman Pedestal Glow */}
            <radialGradient id="batsmanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Handle Glow Filter */}
            <filter id="handleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Boundary Oval */}
          <ellipse
            cx={center}
            cy={center}
            rx={groundRadius}
            ry={groundRadius * 0.94}
            fill="url(#grassGrad2)"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="4,3"
          />

          {/* Boundary Rope White Dash Ring */}
          <ellipse
            cx={center}
            cy={center}
            rx={groundRadius - 6}
            ry={(groundRadius - 6) * 0.94}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />

          {/* 30-Yard Inner Fielding Circle */}
          <ellipse
            cx={center}
            cy={center}
            rx={thirtyYardRadius}
            ry={thirtyYardRadius * 0.94}
            fill="none"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />

          {/* Sector Arcs (Heatmap & Interactive Drag Surfaces) */}
          {sectorConfigs.map((sec) => {
            const val = player.fieldSectors[sec.key];
            const isHovered = activeSectorKey === sec.key || dragSectorKey === sec.key;
            // Radius expands outwards proportional to player strength
            const sectorRadius = thirtyYardRadius + (val / 100) * (groundRadius - thirtyYardRadius);
            const pathData = describeSectorArc(
              center,
              center,
              thirtyYardRadius * 0.72,
              sectorRadius,
              sec.startAngle,
              sec.endAngle
            );

            const midAngle = (sec.startAngle + sec.endAngle) / 2;
            const labelPos = polarToCartesian(center, center, groundRadius - 16, midAngle);
            const handlePos = polarToCartesian(center, center, sectorRadius, midAngle);

            return (
              <g
                key={sec.key}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => {
                  if (!isDragging) setActiveSectorKey(sec.key);
                }}
                onMouseLeave={() => {
                  if (!isDragging) setActiveSectorKey(null);
                }}
                onMouseDown={(e) => handleSectorMouseDown(sec.key, e)}
              >
                {/* Visual Arc Slice */}
                <path
                  d={pathData}
                  fill={getStrengthColor(val, isHovered)}
                  fillOpacity={isHovered ? 0.92 : 0.45}
                  stroke={isHovered ? '#ffffff' : 'rgba(255,255,255,0.22)'}
                  strokeWidth={isHovered ? 2.5 : 0.8}
                  className="transition-all duration-150"
                />

                {/* Score Pill in Sector */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHovered ? '#ffffff' : '#f1f5f9'}
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="800"
                  className="pointer-events-none drop-shadow"
                >
                  {val}%
                </text>

                {/* Interactive Drag Handle (shown on hovered/active sector) */}
                {isHovered && (
                  <g className="pointer-events-none" filter="url(#handleGlow)">
                    <circle
                      cx={handlePos.x}
                      cy={handlePos.y}
                      r="5.5"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <circle
                      cx={handlePos.x}
                      cy={handlePos.y}
                      r="2"
                      fill="#10b981"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Boundary Divider Spokes */}
          {sectorConfigs.map((sec) => {
            const pt = polarToCartesian(center, center, groundRadius, sec.endAngle);
            return (
              <line
                key={`spoke-${sec.key}`}
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="1"
              />
            );
          })}

          {/* Pitch Strip in Center (22 Yards) */}
          <rect
            x={center - 8}
            y={center - 28}
            width={16}
            height={56}
            rx={2}
            fill="url(#pitchGrad2)"
            stroke="#451a03"
            strokeWidth="1"
          />

          {/* Crease markings at Non-Striker end (Top) */}
          <line
            x1={center - 11}
            y1={center - 20}
            x2={center + 11}
            y2={center - 20}
            stroke="#ffffff"
            strokeWidth="1"
          />
          {/* Non-striker Wickets */}
          <circle cx={center - 2.5} cy={center - 23} r="1" fill="#fef08a" />
          <circle cx={center} cy={center - 23} r="1" fill="#fef08a" />
          <circle cx={center + 2.5} cy={center - 23} r="1" fill="#fef08a" />
          <line x1={center - 3.5} y1={center - 23} x2={center + 3.5} y2={center - 23} stroke="#fef08a" strokeWidth="1" />

          {/* Crease markings at Striker end (Bottom) */}
          <line
            x1={center - 12}
            y1={center + 20}
            x2={center + 12}
            y2={center + 20}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
          {/* Striker Wickets (3 Stumps + Bails) */}
          <circle cx={center - 2.5} cy={center + 26} r="1.2" fill="#fef08a" />
          <circle cx={center} cy={center + 26} r="1.2" fill="#fef08a" />
          <circle cx={center + 2.5} cy={center + 26} r="1.2" fill="#fef08a" />
          <line x1={center - 3.5} y1={center + 26} x2={center + 3.5} y2={center + 26} stroke="#fef08a" strokeWidth="1.2" />

          {/* WICKETKEEPER crouched behind striker stumps */}
          <g id="wicketkeeper" className="select-none">
            {/* Gloves */}
            <circle cx={center - 4} cy={center + 32} r="2" fill="#f97316" stroke="#431407" strokeWidth="0.8" />
            <circle cx={center + 4} cy={center + 32} r="2" fill="#f97316" stroke="#431407" strokeWidth="0.8" />
            {/* Keeper Helmet */}
            <circle cx={center} cy={center + 33} r="3" fill="#0284c7" stroke="#082f49" strokeWidth="0.8" />
            <text x={center} y={center + 39} textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">
              WK
            </text>
          </g>

          {/* ============================================================== */}
          {/* 🌟 PROMINENT BATSMAN ICON & STANCE GRAPHIC AT THE STRIKER CREASE */}
          {/* ============================================================== */}
          <g id="prominent-batsman" className="cursor-pointer group">
            {/* Glowing Aura Pedestal beneath the Batsman */}
            <ellipse
              cx={strikerX}
              cy={strikerY}
              rx={18}
              ry={11}
              fill="url(#batsmanGlow)"
              className="animate-pulse"
            />
            {/* Crease marker boundary */}
            <ellipse
              cx={strikerX}
              cy={strikerY}
              rx={12}
              ry={7}
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#34d399"
              strokeWidth="1"
              strokeDasharray="2,2"
            />

            {/* Batsman Stance based on RHB vs LHB */}
            {/* For RHB: Batter's bat is on the OFF-SIDE (Right) */}
            {/* For LHB: Mirrored with scale(-1, 1) so bat is on the Left */}
            <g transform={isLHB ? `scale(-1, 1) translate(${-2 * strikerX}, 0)` : undefined}>
              {/* Back Leg Pad */}
              <rect
                x={strikerX + 1}
                y={strikerY + 1}
                width="3.2"
                height="7"
                rx="1.5"
                fill="#ffffff"
                stroke="#334155"
                strokeWidth="0.8"
              />
              {/* Front Leg Pad (Forward in Stance) */}
              <rect
                x={strikerX - 1.5}
                y={strikerY - 2}
                width="3.2"
                height="7.5"
                rx="1.5"
                fill="#f8fafc"
                stroke="#334155"
                strokeWidth="0.8"
              />

              {/* Batsman Torso / Jersey */}
              <path
                d={`M ${strikerX - 2.5} ${strikerY - 1} C ${strikerX - 3} ${strikerY - 6}, ${strikerX + 4} ${strikerY - 6}, ${strikerX + 3.5} ${strikerY - 1} Z`}
                fill="#0284c7"
                stroke="#082f49"
                strokeWidth="0.8"
              />

              {/* Arms gripping bat towards the Right (Off-Side) */}
              <path
                d={`M ${strikerX + 1} ${strikerY - 5} L ${strikerX + 5} ${strikerY - 3}`}
                stroke="#0284c7"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={`M ${strikerX - 1} ${strikerY - 5} L ${strikerX + 4} ${strikerY - 2}`}
                stroke="#0284c7"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Batting Gloves */}
              <circle cx={strikerX + 5} cy={strikerY - 3} r="1.5" fill="#ffffff" stroke="#0f172a" strokeWidth="0.6" />
              <circle cx={strikerX + 4} cy={strikerY - 2} r="1.5" fill="#ffffff" stroke="#0f172a" strokeWidth="0.6" />

              {/* CRICKET BAT (Raised on the Right / Off-Side in active stance) */}
              <line
                x1={strikerX + 6}
                y1={strikerY - 3.5}
                x2={strikerX + 9}
                y2={strikerY - 5}
                stroke="#f97316"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <rect
                x={strikerX + 8}
                y={strikerY - 9}
                width="8"
                height="3.6"
                rx="1"
                transform={`rotate(28 ${strikerX + 12} ${strikerY - 7})`}
                fill="#fbbf24"
                stroke="#78350f"
                strokeWidth="1"
              />
              <line
                x1={strikerX + 9}
                y1={strikerY - 4.5}
                x2={strikerX + 14}
                y2={strikerY - 6.5}
                stroke="#ef4444"
                strokeWidth="1.2"
              />

              {/* Helmet & Visor looking up towards bowler */}
              <circle cx={strikerX + 0.5} cy={strikerY - 7.5} r="3.8" fill="#0369a1" stroke="#0c4a6e" strokeWidth="1" />
              <path
                d={`M ${strikerX} ${strikerY - 8.5} L ${strikerX + 3.5} ${strikerY - 7}`}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d={`M ${strikerX - 1} ${strikerY - 6.5} L ${strikerX + 2.5} ${strikerY - 6.5}`}
                stroke="#94a3b8"
                strokeWidth="0.8"
              />
            </g>

            {/* Prominent Batsman Label Badge */}
            <rect
              x={strikerX - 36}
              y={strikerY + 13}
              width="72"
              height="14"
              rx="4"
              fill="#0f172a"
              stroke="#10b981"
              strokeWidth="1"
              className="drop-shadow-lg"
            />
            <text
              x={strikerX}
              y={strikerY + 23}
              textAnchor="middle"
              fill="#34d399"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="JetBrains Mono, monospace"
            >
              🏏 {viewStance} BATTER
            </text>
          </g>

          {/* ============================================================== */}
          {/* DYNAMIC SHOT TRAJECTORY RAYS (WAGON WHEEL SHOT LINES) */}
          {/* ============================================================== */}
          {showRays && (
            <g id="shot-trajectories" className="pointer-events-none">
              {sectorConfigs.map((sec) => {
                const val = player.fieldSectors[sec.key];
                const isHovered = activeSectorKey === sec.key;
                if (!isHovered && activeSectorKey !== null) return null; // focus on hovered

                const midAngle = (sec.startAngle + sec.endAngle) / 2;
                const boundaryPt = polarToCartesian(center, center, groundRadius - 8, midAngle);
                const sweetSpotX = strikerX + (isLHB ? -8 : 8);
                const sweetSpotY = strikerY - 4;

                const rayColor = getStrengthColor(val, true);

                return (
                  <g key={`ray-${sec.key}`} opacity={isHovered ? 1 : 0.45}>
                    {/* Main trajectory shot line */}
                    <line
                      x1={sweetSpotX}
                      y1={sweetSpotY}
                      x2={boundaryPt.x}
                      y2={boundaryPt.y}
                      stroke={rayColor}
                      strokeWidth={isHovered ? 2.5 : 1.2}
                      strokeDasharray={val >= 85 ? 'none' : '4,2'}
                    />
                    {/* Boundary Impact Dot */}
                    <circle
                      cx={boundaryPt.x}
                      cy={boundaryPt.y}
                      r={isHovered ? 4.5 : 2.5}
                      fill={rayColor}
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ============================================================== */}
          {/* 11 REALISTIC FIELDING POSITIONS OVERLAY */}
          {/* ============================================================== */}
          {showFielders && (
            <g id="fielding-positions" className="pointer-events-none">
              {fieldingPositions.map((pos, idx) => {
                const pt = polarToCartesian(center, center, pos.r, pos.angle);
                return (
                  <g key={`fielder-${idx}`} className="transition-transform duration-300">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pos.ring === 'deep' ? 5 : 4.2}
                      fill="#0284c7"
                      stroke="#e0f2fe"
                      strokeWidth="1"
                      className="drop-shadow"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 6}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      className="drop-shadow"
                    >
                      {pos.short}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Accurate Off-Side and Leg-Side Watermark Text */}
          {/* For RHB: Right side is OFF-SIDE, Left side is LEG-SIDE */}
          {/* For LHB: Left side is OFF-SIDE, Right side is LEG-SIDE */}
          <text
            x={isLHB ? center - groundRadius + 20 : center + groundRadius - 20}
            y={center - 4}
            fill="#38bdf8"
            fontSize="11"
            fontWeight="900"
            textAnchor={isLHB ? 'start' : 'end'}
            letterSpacing="1"
          >
            OFF-SIDE
          </text>
          <text
            x={isLHB ? center + groundRadius - 20 : center - groundRadius + 20}
            y={center - 4}
            fill="#34d399"
            fontSize="11"
            fontWeight="900"
            textAnchor={isLHB ? 'end' : 'start'}
            letterSpacing="1"
          >
            LEG-SIDE
          </text>

          {/* Straight / Bowler Runup Arrow Indicator at Top */}
          <text
            x={center}
            y={center - groundRadius + 18}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="7.5"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            ▲ BOWLER RUN-UP (STRAIGHT)
          </text>
        </svg>

        {/* Hover / Active Sector Details & Direct Tuning HUD Card */}
        {activeSector && (
          <div className="absolute bottom-2 left-3 right-3 bg-slate-950/95 border border-emerald-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md transition-all z-10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                {activeSector.name} ({activeSector.side.toUpperCase()})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  Drag on field or tune:
                </span>
                <span className="font-mono text-emerald-400 text-sm font-black bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  {activeSector.value}%
                </span>
              </div>
            </div>

            {/* Direct Quick Slider & Stepper Controls */}
            {onChangeFieldSector && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                {/* Minus 5% */}
                <button
                  type="button"
                  onClick={() => handleStepValue(activeSector.key, -5)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title="Decrease 5%"
                >
                  <Minus className="w-3 h-3" />
                </button>

                {/* Direct Slider */}
                <input
                  type="range"
                  min="15"
                  max="99"
                  value={activeSector.value}
                  onChange={(e) => onChangeFieldSector(activeSector.key, parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />

                {/* Plus 5% */}
                <button
                  type="button"
                  onClick={() => handleStepValue(activeSector.key, 5)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title="Increase 5%"
                >
                  <Plus className="w-3 h-3" />
                </button>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => handleSetPresetValue(activeSector.key, 95)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition cursor-pointer"
                  >
                    95%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetValue(activeSector.key, 75)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 transition cursor-pointer"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetValue(activeSector.key, 50)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900 transition cursor-pointer"
                  >
                    50%
                  </button>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-300 leading-tight">
              <span className="text-emerald-400 font-semibold">Key Shots:</span> {activeSector.primaryShots}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>🖱️ Click & drag any sector on the field to dynamically resize</span>
        </span>
        <span className="font-bold text-white">
          Dominance: <span className="text-emerald-400">{metrics.fieldStrengthSide}</span>
        </span>
      </div>
    </div>
  );
};
