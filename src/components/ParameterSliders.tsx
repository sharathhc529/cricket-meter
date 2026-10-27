import React, { useState } from 'react';
import {
  CricketerProfile,
  FieldSectors,
  PlayerParameters,
} from '../types/cricket';
import {
  PARAMETER_METADATA,
  FIELD_SECTOR_LABELS,
} from '../utils/strengthCalculator';
import {
  Zap,
  Target,
  Shield,
  Brain,
  Crown,
  Compass,
  SlidersHorizontal,
  Flame,
  Award,
} from 'lucide-react';

interface ParameterSlidersProps {
  player: CricketerProfile;
  onChangeParameter: (key: keyof PlayerParameters, value: number) => void;
  onChangeFieldSector: (sector: keyof FieldSectors, value: number) => void;
  onQuickPreset: (category: string, value: number) => void;
}

type TabKey = 'batting' | 'bowling' | 'fielding' | 'mental' | 'reliability' | 'fieldSectors';

const TAB_CONFIG: { key: TabKey; label: string; icon: string; badgeColor: string }[] = [
  { key: 'batting', label: '🏏 Batting (5)', icon: '🏏', badgeColor: 'text-amber-400' },
  { key: 'bowling', label: '🎯 Bowling (5)', icon: '🎯', badgeColor: 'text-rose-400' },
  { key: 'fielding', label: '🧤 Fielding & Running (4)', icon: '🧤', badgeColor: 'text-emerald-400' },
  { key: 'mental', label: '🧠 Mental & Clutch (4)', icon: '🧠', badgeColor: 'text-cyan-400' },
  { key: 'reliability', label: '⚖️ Reliability (2)', icon: '⚖️', badgeColor: 'text-purple-400' },
  { key: 'fieldSectors', label: '🏟️ Wagon Wheel (8)', icon: '🏟️', badgeColor: 'text-teal-400' },
];

export const ParameterSliders: React.FC<ParameterSlidersProps> = ({
  player,
  onChangeParameter,
  onChangeFieldSector,
  onQuickPreset,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('batting');

  const getBadgeClass = (val: number) => {
    if (val >= 90) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (val >= 78) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (val >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  const getSliderTrackGradient = (val: number) => {
    if (val >= 85) return 'accent-emerald-400';
    if (val >= 70) return 'accent-cyan-400';
    if (val >= 50) return 'accent-amber-400';
    return 'accent-rose-500';
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header and Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>20 Cricketer Assessment Parameters & Field Zones</span>
          </h2>
          <p className="text-xs text-slate-400">
            Adjust metrics to calculate real-time strengths, pressure risk, and field charts for{' '}
            <span className="text-emerald-400 font-semibold">{player.name}</span>
          </p>
        </div>

        {/* Quick batch presets */}
        {activeTab !== 'fieldSectors' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Batch Preset:</span>
            <button
              onClick={() => onQuickPreset(activeTab, 95)}
              className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold cursor-pointer transition"
            >
              Elite (95)
            </button>
            <button
              onClick={() => onQuickPreset(activeTab, 82)}
              className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-800/60 text-[10px] font-bold cursor-pointer transition"
            >
              Pro (82)
            </button>
            <button
              onClick={() => onQuickPreset(activeTab, 65)}
              className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 border border-amber-800/60 text-[10px] font-bold cursor-pointer transition"
            >
              Club (65)
            </button>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-800 text-white border-emerald-500/60 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Parameters Panel */}
      {activeTab !== 'fieldSectors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARAMETER_METADATA.filter((param) => param.category === activeTab).map((param) => {
            const value = player.parameters[param.key];
            return (
              <div
                key={param.key}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition"
              >
                {/* Title & Badge */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{param.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Score badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-black border ${getBadgeClass(
                        value
                      )}`}
                    >
                      {value}
                    </span>
                    {/* Numeric Input */}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => {
                        const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                        onChangeParameter(param.key, v);
                      }}
                      className="w-12 bg-slate-900 border border-slate-700 text-center text-xs font-mono font-bold text-slate-200 rounded p-0.5 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
                  {param.description}
                </p>

                {/* Range Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono">0</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => onChangeParameter(param.key, parseInt(e.target.value))}
                    className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer ${getSliderTrackGradient(
                      value
                    )}`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">100</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 🏟️ Wagon Wheel / Field Sectors Panel */
        <div>
          <div className="mb-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-emerald-400">Batting Field Sector Strengths: </span>
            Fine-tune how proficient the batsman is at scoring in each of the 8 cricket field
            quadrants. Higher scores increase wagon wheel heat and automatically determine whether
            he is <span className="font-bold text-cyan-400">Off-Side Dominant</span> or{' '}
            <span className="font-bold text-emerald-400">Leg-Side Dominant</span>.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(FIELD_SECTOR_LABELS) as [keyof FieldSectors, { name: string; side: 'off' | 'leg'; angle: number }][]).map(
              ([secKey, info]) => {
                const val = player.fieldSectors[secKey];
                return (
                  <div
                    key={secKey}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {info.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          info.side === 'off'
                            ? 'bg-cyan-500/10 text-cyan-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {info.side}
                      </span>
                    </div>

                    <div className="flex items-center justify-between my-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getBadgeClass(
                          val
                        )}`}
                      >
                        {val}%
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={val}
                        onChange={(e) => {
                          const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          onChangeFieldSector(secKey, v);
                        }}
                        className="w-12 bg-slate-900 border border-slate-700 text-center text-xs font-mono font-bold text-slate-200 rounded p-0.5 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={val}
                      onChange={(e) => onChangeFieldSector(secKey, parseInt(e.target.value))}
                      className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer ${getSliderTrackGradient(
                        val
                      )}`}
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};
