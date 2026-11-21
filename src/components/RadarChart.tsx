import React, { useState, useRef, useEffect } from 'react';
import { CricketerProfile, CalculatedStrengthMetrics, PlayerParameters } from '../types/cricket';
import { Sliders, Plus, Minus, Move, Check, Sparkles } from 'lucide-react';

interface RadarChartProps {
  player: CricketerProfile;
  metrics: CalculatedStrengthMetrics;
  comparePlayer?: CricketerProfile | null;
  compareMetrics?: CalculatedStrengthMetrics | null;
  onChangeParameter?: (key: keyof PlayerParameters, value: number) => void;
}

interface RadarAxisConfig {
  key: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  paramKeys: (keyof PlayerParameters)[];
  getValue: (p: CricketerProfile, m: CalculatedStrengthMetrics) => number;
}

const RADAR_AXIS_CONFIGS: RadarAxisConfig[] = [
  {
    key: 'batting',
    label: 'Batting Power & Strike',
    shortLabel: 'Batting',
    icon: '🏏',
    description: 'Hitting power, boundary clearing, stroke timing and pace/spin mastery.',
    paramKeys: ['battingPower', 'boundaryHitting', 'battingTiming'],
    getValue: (p, m) => m.battingScore,
  },
  {
    key: 'bowling',
    label: 'Bowling Potency & Control',
    shortLabel: 'Bowling',
    icon: '🎯',
    description: 'Accuracy, breakthrough strike instinct, pace/spin weapon and extras control.',
    paramKeys: ['bowlingAccuracy', 'bowlingPaceSpin', 'wicketTakingAbility'],
    getValue: (p, m) => m.bowlingScore,
  },
  {
    key: 'fielding',
    label: 'Fielding & Reflexes',
    shortLabel: 'Fielding',
    icon: '🧤',
    description: 'High-pressure catching reliability, ground saves and flat bullet throws.',
    paramKeys: ['catchingReliability', 'groundFielding', 'throwingAccuracyPower'],
    getValue: (p, m) => m.fieldingScore,
  },
  {
    key: 'running',
    label: 'Running Between Wickets',
    shortLabel: 'Running',
    icon: '⚡',
    description: 'Sprint explosiveness, conversion of singles into twos, and aggressive running.',
    paramKeys: ['runningBetweenWickets'],
    getValue: (p) => p.parameters.runningBetweenWickets,
  },
  {
    key: 'clutch',
    label: 'Clutch & Pressure Nerve',
    shortLabel: 'Clutch',
    icon: '🧠',
    description: 'Match finishing under intense heat, body language and crisis temperament.',
    paramKeys: ['pressureHandlingClutch', 'confidenceLevel'],
    getValue: (p) => p.parameters.pressureHandlingClutch,
  },
  {
    key: 'gameIq',
    label: 'Game IQ & Discipline',
    shortLabel: 'Game IQ',
    icon: '👑',
    description: 'Tactical field awareness, situational reading and minimal extras conceded.',
    paramKeys: ['matchAwarenessIQ', 'extrasControlUnderPressure'],
    getValue: (p) =>
      Math.round((p.parameters.matchAwarenessIQ * 0.5 + p.parameters.extrasControlUnderPressure * 0.5)),
  },
];

export const RadarChart: React.FC<RadarChartProps> = ({
  player,
  metrics,
  comparePlayer,
  compareMetrics,
  onChangeParameter,
}) => {
  const [selectedAxisIndex, setSelectedAxisIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragAxisIndex, setDragAxisIndex] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const size = 390;
  const center = size / 2;
  const radius = center - 58;
  const numAxes = RADAR_AXIS_CONFIGS.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric levels
  const levels = [20, 40, 60, 80, 100];

  // Helper to convert value & axis index to coordinates
  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (Math.max(5, Math.min(100, value)) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Primary player points
  const primaryPoints = RADAR_AXIS_CONFIGS.map((axis, i) => {
    const val = axis.getValue(player, metrics);
    return getCoordinates(val, i);
  });
  const primaryPolygonString = primaryPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');

  // Compare player points (if active)
  let comparePoints: { x: number; y: number }[] = [];
  let comparePolygonString = '';
  if (comparePlayer && compareMetrics) {
    comparePoints = RADAR_AXIS_CONFIGS.map((axis, i) => {
      const val = axis.getValue(comparePlayer, compareMetrics);
      return getCoordinates(val, i);
    });
    comparePolygonString = comparePoints.map((pt) => `${pt.x},${pt.y}`).join(' ');
  }

  // Handle value change for an axis
  const handleUpdateAxisValue = (axisIndex: number, rawVal: number) => {
    if (!onChangeParameter) return;
    const clamped = Math.max(10, Math.min(100, Math.round(rawVal)));
    const axisConfig = RADAR_AXIS_CONFIGS[axisIndex];
    axisConfig.paramKeys.forEach((key) => {
      onChangeParameter(key, clamped);
    });
  };

  // Calculate value from mouse/pointer position along axis
  const calculateValueFromPointer = (clientX: number, clientY: number, axisIndex: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * size;
    const mouseY = ((clientY - rect.top) / rect.height) * size;

    const angle = axisIndex * angleStep - Math.PI / 2;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);

    // Vector from center
    const vx = mouseX - center;
    const vy = mouseY - center;

    // Projection along axis direction
    const projection = vx * ux + vy * uy;
    const calculatedScore = (projection / radius) * 100;
    handleUpdateAxisValue(axisIndex, calculatedScore);
  };

  // Global pointer up / move listener for drag
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isDragging && dragAxisIndex !== null) {
        calculateValueFromPointer(e.clientX, e.clientY, dragAxisIndex);
      }
    };

    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragAxisIndex(null);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, dragAxisIndex]);

  const activeAxis = RADAR_AXIS_CONFIGS[selectedAxisIndex];
  const activeValue = activeAxis.getValue(player, metrics);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🕸️</span>
            <span>Skill Radar & Capability Polygon</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              <span>Interactive & Editable</span>
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Click or drag vertices directly on the polygon to adjust capability metrics
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

      {/* SVG Canvas Area */}
      <div className="relative w-full flex items-center justify-center py-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[370px] h-auto drop-shadow-2xl select-none touch-none"
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
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
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
                  fill={lvl % 40 === 0 ? 'rgba(30, 41, 59, 0.45)' : 'transparent'}
                  stroke="rgba(71, 85, 105, 0.35)"
                  strokeWidth="1"
                  strokeDasharray={lvl < 100 ? '2,2' : 'none'}
                />
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

          {/* Axis Spoke Lines (Clickable) */}
          {RADAR_AXIS_CONFIGS.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            const isSelected = selectedAxisIndex === i;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={(e) => {
                  setSelectedAxisIndex(i);
                  calculateValueFromPointer(e.clientX, e.clientY, i);
                }}
              >
                {/* Thick invisible stroke for easier click/tap detection */}
                <line
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="20"
                />
                <line
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected || isHovered ? '#10b981' : 'rgba(71, 85, 105, 0.45)'}
                  strokeWidth={isSelected || isHovered ? '2' : '1.2'}
                  className="transition-colors duration-150"
                />
              </g>
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
            filter="url(#radarGlow)"
          />

          {/* Interactive Vertices with Drag Handles */}
          {primaryPoints.map((pt, i) => {
            const isSelected = selectedAxisIndex === i;
            const isHovered = hoveredIndex === i;
            const isThisDragging = isDragging && dragAxisIndex === i;
            const axis = RADAR_AXIS_CONFIGS[i];
            const val = axis.getValue(player, metrics);

            return (
              <g
                key={i}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedAxisIndex(i);
                  setDragAxisIndex(i);
                  setIsDragging(true);
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Large outer touch target */}
                <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />

                {/* Animated halo for active/hovered node */}
                {(isSelected || isHovered || isThisDragging) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isThisDragging ? 14 : 11}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                    className="animate-spin origin-center"
                    style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                  />
                )}

                {/* Main vertex circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected || isThisDragging ? 7.5 : isHovered ? 6.5 : 5}
                  fill={isSelected ? '#34d399' : '#10b981'}
                  stroke="#042f2e"
                  strokeWidth="2.5"
                  className="transition-all duration-150 shadow-lg"
                />

                {/* Value pill label on vertex */}
                {(isSelected || isHovered || isThisDragging) && (
                  <g>
                    <rect
                      x={pt.x - 14}
                      y={pt.y - 20}
                      width="28"
                      height="14"
                      rx="4"
                      fill="#022c22"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Outer Interactive Labels */}
          {RADAR_AXIS_CONFIGS.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 30;
            const x = center + labelR * Math.cos(angle);
            const y = center + labelR * Math.sin(angle);
            const isSelected = selectedAxisIndex === i;
            const isHovered = hoveredIndex === i;
            const val = axis.getValue(player, metrics);

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => setSelectedAxisIndex(i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={x}
                  y={y - 2}
                  textAnchor={textAnchor}
                  fill={isSelected ? '#34d399' : isHovered ? '#6ee7b7' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={isSelected || isHovered ? '800' : '600'}
                  className="transition-all duration-150"
                >
                  {axis.icon} {axis.shortLabel}
                </text>
                <text
                  x={x}
                  y={y + 11}
                  textAnchor={textAnchor}
                  fill={isSelected ? '#10b981' : isHovered ? '#34d399' : '#64748b'}
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

        {/* Hover / Drag Floating Overlay */}
        {(hoveredIndex !== null || isDragging) && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-emerald-500/50 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md text-center pointer-events-none z-10">
            <span className="text-[11px] font-bold text-slate-200">
              {RADAR_AXIS_CONFIGS[hoveredIndex ?? selectedAxisIndex].icon} {RADAR_AXIS_CONFIGS[hoveredIndex ?? selectedAxisIndex].label}
            </span>
            <div className="text-xs font-mono font-black text-emerald-400">
              {RADAR_AXIS_CONFIGS[hoveredIndex ?? selectedAxisIndex].getValue(player, metrics)} / 100
            </div>
            {isDragging && (
              <span className="text-[9px] text-emerald-300 font-semibold block animate-pulse">
                Dragging to adjust rating...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dedicated Fine-Tuning Dock Below Graph (No Overlap) */}
      <div className="w-full mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2.5">
        {/* Selected Skill Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeAxis.icon}</span>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">
                {activeAxis.label}
              </span>
              <span className="text-[10px] text-slate-400 leading-none">
                {activeAxis.description}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
              {activeValue} / 100
            </span>
          </div>
        </div>

        {/* Stepper Buttons and Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleUpdateAxisValue(selectedAxisIndex, activeValue - 5)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded border border-slate-800 transition cursor-pointer"
            title="Decrease by 5"
          >
            -5
          </button>
          <button
            onClick={() => handleUpdateAxisValue(selectedAxisIndex, activeValue - 1)}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition cursor-pointer"
            title="Decrease by 1"
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="range"
            min="10"
            max="100"
            value={activeValue}
            onChange={(e) => handleUpdateAxisValue(selectedAxisIndex, Number(e.target.value))}
            className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <button
            onClick={() => handleUpdateAxisValue(selectedAxisIndex, activeValue + 1)}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition cursor-pointer"
            title="Increase by 1"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleUpdateAxisValue(selectedAxisIndex, activeValue + 5)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded border border-slate-800 transition cursor-pointer"
            title="Increase by 5"
          >
            +5
          </button>
        </div>

        {/* Quick Skill Selector Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-900">
          {RADAR_AXIS_CONFIGS.map((axis, idx) => {
            const isSelected = selectedAxisIndex === idx;
            const val = axis.getValue(player, metrics);
            return (
              <button
                key={axis.key}
                onClick={() => setSelectedAxisIndex(idx)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{axis.icon}</span>
                <span>{axis.shortLabel}</span>
                <span className={`text-[9px] font-mono ${isSelected ? 'text-slate-900' : 'text-emerald-400'}`}>
                  {val}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-[10px]">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Drag graph nodes or use slider to tune in real-time</span>
        </span>
        <span className="text-emerald-400 font-bold font-mono">
          Avg: {Math.round((metrics.battingScore + metrics.bowlingScore + metrics.fieldingScore + metrics.athleticismScore + metrics.mentalClutchScore) / 5)}
        </span>
      </div>
    </div>
  );
};
