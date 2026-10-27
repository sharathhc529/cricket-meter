import React, { useState } from 'react';
import { CricketerProfile, CalculatedStrengthMetrics } from '../types/cricket';

interface RadarChartProps {
  player: CricketerProfile;
  metrics: CalculatedStrengthMetrics;
  comparePlayer?: CricketerProfile | null;
  compareMetrics?: CalculatedStrengthMetrics | null;
}

interface RadarAxis {
  label: string;
  icon: string;
  getValue: (p: CricketerProfile, m: CalculatedStrengthMetrics) => number;
}

const RADAR_AXES: RadarAxis[] = [
  {
    label: 'Batting Power & Strike',
    icon: '🏏',
    getValue: (p, m) => m.battingScore,
  },
  {
    label: 'Bowling Potency & Control',
    icon: '🎯',
    getValue: (p, m) => m.bowlingScore,
  },
  {
    label: 'Fielding & Reflexes',
    icon: '🧤',
    getValue: (p, m) => m.fieldingScore,
  },
  {
    label: 'Running Between Wickets',
    icon: '⚡',
    getValue: (p, m) => p.parameters.runningBetweenWickets,
  },
  {
    label: 'Clutch / Pressure Nerve',
    icon: '🧠',
    getValue: (p, m) => p.parameters.pressureHandlingClutch,
  },
  {
    label: 'Game IQ & Discipline',
    icon: '👑',
    getValue: (p, m) =>
      Math.round(
        (p.parameters.matchAwarenessIQ * 0.5 + p.parameters.extrasControlUnderPressure * 0.5)
      ),
  },
];

export const RadarChart: React.FC<RadarChartProps> = ({
  player,
  metrics,
  comparePlayer,
  compareMetrics,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 380;
  const center = size / 2;
  const radius = center - 55;
  const numAxes = RADAR_AXES.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric levels
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (value: number, index: number) => {
    // Start from top (- PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Primary player points
  const primaryPoints = RADAR_AXES.map((axis, i) => {
    const val = axis.getValue(player, metrics);
    return getCoordinates(val, i);
  });
  const primaryPolygonString = primaryPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');

  // Compare player points (if active)
  let comparePoints: { x: number; y: number }[] = [];
  let comparePolygonString = '';
  if (comparePlayer && compareMetrics) {
    comparePoints = RADAR_AXES.map((axis, i) => {
      const val = axis.getValue(comparePlayer, compareMetrics);
      return getCoordinates(val, i);
    });
    comparePolygonString = comparePoints.map((pt) => `${pt.x},${pt.y}`).join(' ');
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🕸️</span>
            <span>Skill Radar & Capability Polygon</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            6-Dimensional capability footprint across core cricket skills
          </p>
        </div>

        {comparePlayer && (
          <div className="flex items-center gap-3 text-[11px] bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {player.name}
            </span>
            <span className="text-slate-500">vs</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {comparePlayer.name}
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[360px] h-auto drop-shadow-2xl select-none"
        >
          <defs>
            {/* Emerald gradient for primary player */}
            <linearGradient id="radarGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
            </linearGradient>

            {/* Amber gradient for compare player */}
            <linearGradient id="radarGradCompare" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric Grid Polygons */}
          {levels.map((lvl) => {
            const r = (lvl / 100) * radius;
            const pts = Array.from({ length: numAxes }, (_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');

            return (
              <g key={lvl}>
                <polygon
                  points={pts}
                  fill={lvl % 40 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'transparent'}
                  stroke="rgba(71, 85, 105, 0.35)"
                  strokeWidth="1"
                  strokeDasharray={lvl < 100 ? '2,2' : 'none'}
                />
                {/* Level Number on Top Axis */}
                <text
                  x={center + 4}
                  y={center - r + 3}
                  fill="rgba(148, 163, 184, 0.6)"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Axis Spoke Lines */}
          {RADAR_AXES.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="rgba(71, 85, 105, 0.45)"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Compare Player Polygon (if active) */}
          {comparePolygonString && (
            <g>
              <polygon
                points={comparePolygonString}
                fill="url(#radarGradCompare)"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              {comparePoints.map((pt, i) => (
                <circle
                  key={`cmp-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#f59e0b"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}

          {/* Primary Player Polygon */}
          <polygon
            points={primaryPolygonString}
            fill="url(#radarGradPrimary)"
            stroke="#10b981"
            strokeWidth="2.5"
            filter="url(#glow)"
          />

          {/* Vertex Dots & Interactivity */}
          {primaryPoints.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            const axis = RADAR_AXES[i];
            const val = axis.getValue(player, metrics);

            return (
              <g
                key={i}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="#10b981"
                  stroke="#042f2e"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Score badge at vertex */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* Outer Labels */}
          {RADAR_AXES.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 28;
            const x = center + labelR * Math.cos(angle);
            const y = center + labelR * Math.sin(angle);
            const isHovered = hoveredIndex === i;
            const val = axis.getValue(player, metrics);

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={x}
                  y={y - 2}
                  textAnchor={textAnchor}
                  fill={isHovered ? '#34d399' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={isHovered ? '800' : '600'}
                  className="transition-all duration-150"
                >
                  {axis.icon} {axis.label}
                </text>
                <text
                  x={x}
                  y={y + 11}
                  textAnchor={textAnchor}
                  fill={isHovered ? '#10b981' : '#64748b'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  {val}/100
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Card */}
        {hoveredIndex !== null && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-emerald-500/50 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md text-center pointer-events-none z-10">
            <span className="text-[11px] font-bold text-slate-200">
              {RADAR_AXES[hoveredIndex].icon} {RADAR_AXES[hoveredIndex].label}
            </span>
            <div className="text-xs font-mono font-black text-emerald-400">
              {RADAR_AXES[hoveredIndex].getValue(player, metrics)} / 100
            </div>
            {comparePlayer && compareMetrics && (
              <div className="text-[10px] text-amber-400 font-mono font-bold">
                {comparePlayer.name}: {RADAR_AXES[hoveredIndex].getValue(comparePlayer, compareMetrics)} / 100
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Higher area = Greater all-round capability</span>
        <span className="text-emerald-400 font-bold font-mono">
          Avg: {Math.round((metrics.battingScore + metrics.bowlingScore + metrics.fieldingScore + metrics.athleticismScore + metrics.mentalClutchScore) / 5)}
        </span>
      </div>
    </div>
  );
};
