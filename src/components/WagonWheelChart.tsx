import React, { useState } from 'react';
import { CricketerProfile, FieldSectors, CalculatedStrengthMetrics } from '../types/cricket';
import { FIELD_SECTOR_LABELS } from '../utils/strengthCalculator';
import { Compass, Info, Zap } from 'lucide-react';

interface WagonWheelChartProps {
  player: CricketerProfile;
  metrics: CalculatedStrengthMetrics;
}

const SHOT_SUGGESTIONS: Record<keyof FieldSectors, string> = {
  cover: 'Cover Drive, Inside-out lofted drive, punch through extra cover',
  point: 'Square cut, back-foot punch, slash over point',
  thirdMan: 'Late cut, edge guide, upper cut, ramp behind keeper',
  fineLeg: 'Flick off pads, hook shot, lap sweep, glance',
  squareLeg: 'Short-arm pull, slog sweep, pick-up flick over square leg',
  midWicket: 'Heave over cow corner, whip across the line, helicopter shot',
  longOn: 'Straight lofted six, on-drive through mid-on',
  longOff: 'Classical off-drive, loft over mid-off, straight push',
};

export const WagonWheelChart: React.FC<WagonWheelChartProps> = ({ player, metrics }) => {
  const [activeSectorKey, setActiveSectorKey] = useState<keyof FieldSectors | null>(null);

  const size = 380;
  const center = size / 2;
  const groundRadius = center - 25;
  const thirtyYardRadius = groundRadius * 0.52;

  // Sectors ordered clockwise starting from top (Long-Off / Long-On)
  // Let's arrange 8 slices of 45 degrees:
  // 0 deg = top (Straight / Long-off & Long-on border)
  const sectorConfigs: { key: keyof FieldSectors; startAngle: number; endAngle: number }[] = [
    { key: 'longOff', startAngle: -45, endAngle: 0 },
    { key: 'cover', startAngle: -90, endAngle: -45 },
    { key: 'point', startAngle: -135, endAngle: -90 },
    { key: 'thirdMan', startAngle: -180, endAngle: -135 },
    { key: 'fineLeg', startAngle: 135, endAngle: 180 },
    { key: 'squareLeg', startAngle: 90, endAngle: 135 },
    { key: 'midWicket', startAngle: 45, endAngle: 90 },
    { key: 'longOn', startAngle: 0, endAngle: 45 },
  ];

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    // 0 deg is straight down the ground (top of screen: -y)
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeSectorArc = (cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) => {
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
    if (val >= 90) {
      return isHovered ? '#10b981' : '#059669'; // Emerald
    } else if (val >= 78) {
      return isHovered ? '#06b6d4' : '#0891b2'; // Cyan
    } else if (val >= 65) {
      return isHovered ? '#f59e0b' : '#d97706'; // Amber
    } else {
      return isHovered ? '#f43f5e' : '#e11d48'; // Rose
    }
  };

  const activeSector = activeSectorKey ? {
    key: activeSectorKey,
    ...FIELD_SECTOR_LABELS[activeSectorKey],
    value: player.fieldSectors[activeSectorKey],
    shot: SHOT_SUGGESTIONS[activeSectorKey],
  } : null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🏟️</span>
            <span>Batting Wagon Wheel & Field Zones</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Interactive strength heat map across all 8 field sectors
          </p>
        </div>

        {/* Off vs Leg Badge */}
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            Off: {metrics.offSidePercentage}%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            Leg: {metrics.legSidePercentage}%
          </span>
        </div>
      </div>

      {/* Cricket Ground SVG */}
      <div className="relative w-full flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[360px] h-auto drop-shadow-2xl select-none"
        >
          <defs>
            {/* Stadium Grass Gradient */}
            <radialGradient id="grassGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#022c22" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
            </radialGradient>

            {/* Pitch Strip Gradient */}
            <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Outer Boundary Oval */}
          <ellipse
            cx={center}
            cy={center}
            rx={groundRadius}
            ry={groundRadius * 0.94}
            fill="url(#grassGrad)"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="4,3"
          />

          {/* 30-Yard Circle */}
          <ellipse
            cx={center}
            cy={center}
            rx={thirtyYardRadius}
            ry={thirtyYardRadius * 0.94}
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />

          {/* Sector Arcs (Heatmap) */}
          {sectorConfigs.map((sec) => {
            const val = player.fieldSectors[sec.key];
            const isHovered = activeSectorKey === sec.key;
            // Radius expands outwards proportional to player strength
            const sectorRadius = thirtyYardRadius + (val / 100) * (groundRadius - thirtyYardRadius);
            const pathData = describeSectorArc(
              center,
              center,
              thirtyYardRadius * 0.75,
              sectorRadius,
              sec.startAngle,
              sec.endAngle
            );

            const midAngle = (sec.startAngle + sec.endAngle) / 2;
            const labelPos = polarToCartesian(center, center, groundRadius - 16, midAngle);

            return (
              <g
                key={sec.key}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setActiveSectorKey(sec.key)}
                onMouseLeave={() => setActiveSectorKey(null)}
              >
                <path
                  d={pathData}
                  fill={getStrengthColor(val, isHovered)}
                  fillOpacity={isHovered ? 0.85 : 0.45}
                  stroke={isHovered ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isHovered ? 2 : 0.8}
                  className="transition-all duration-200"
                />

                {/* Score Pill in Sector */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHovered ? '#ffffff' : '#e2e8f0'}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="800"
                  className="pointer-events-none drop-shadow"
                >
                  {val}%
                </text>
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
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
            );
          })}

          {/* Pitch Strip in Center */}
          <rect
            x={center - 8}
            y={center - 22}
            width={16}
            height={44}
            rx={2}
            fill="url(#pitchGrad)"
            stroke="#451a03"
            strokeWidth="1"
          />

          {/* Crease lines */}
          <line
            x1={center - 11}
            y1={center - 14}
            x2={center + 11}
            y2={center - 14}
            stroke="#ffffff"
            strokeWidth="1"
          />
          <line
            x1={center - 11}
            y1={center + 14}
            x2={center + 11}
            y2={center + 14}
            stroke="#ffffff"
            strokeWidth="1"
          />

          {/* Wickets */}
          <circle cx={center} cy={center - 17} r="1.5" fill="#fef08a" />
          <circle cx={center} cy={center + 17} r="1.5" fill="#fef08a" />

          {/* Batsman Marker icon at striker crease */}
          <circle
            cx={center}
            cy={center + 9}
            r="3.5"
            fill="#38bdf8"
            stroke="#0f172a"
            strokeWidth="1.2"
          />

          {/* Off / Leg labels on borders */}
          <text
            x={center - groundRadius + 18}
            y={center}
            fill="#38bdf8"
            fontSize="10"
            fontWeight="bold"
            textAnchor="start"
          >
            OFF-SIDE
          </text>
          <text
            x={center + groundRadius - 18}
            y={center}
            fill="#34d399"
            fontSize="10"
            fontWeight="bold"
            textAnchor="end"
          >
            LEG-SIDE
          </text>
        </svg>

        {/* Hover / Active Sector Details Banner */}
        {activeSector && (
          <div className="absolute bottom-2 left-4 right-4 bg-slate-950/95 border border-emerald-500/50 rounded-xl p-2.5 shadow-2xl backdrop-blur-md transition-all">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {activeSector.name} ({activeSector.side.toUpperCase()})
              </span>
              <span className="font-mono text-emerald-400 text-sm">
                {activeSector.value} / 100
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              <span className="text-slate-400 font-semibold">Key Shots:</span> {activeSector.shot}
            </p>
          </div>
        )}
      </div>

      {/* Quick Footnote */}
      <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-500" /> Hover any slice to inspect field zone shots
        </span>
        <span className="font-semibold text-white">
          Dominance: <span className="text-emerald-400">{metrics.fieldStrengthSide}</span>
        </span>
      </div>
    </div>
  );
};
