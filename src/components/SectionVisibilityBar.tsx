import React from 'react';
import {
  Eye,
  EyeOff,
  LayoutDashboard,
  BarChart3,
  Trophy,
  SlidersHorizontal,
  Check,
  Maximize2,
} from 'lucide-react';

export interface SectionVisibilityState {
  showOverview: boolean;
  showCharts: boolean;
  showStrengths: boolean;
  showParameters: boolean;
}

interface SectionVisibilityBarProps {
  visibility: SectionVisibilityState;
  onToggleSection: (key: keyof SectionVisibilityState) => void;
  onSetPreset: (preset: 'all' | 'charts' | 'assessment' | 'compact') => void;
}

export const SectionVisibilityBar: React.FC<SectionVisibilityBarProps> = ({
  visibility,
  onToggleSection,
  onSetPreset,
}) => {
  const sections: {
    key: keyof SectionVisibilityState;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'showOverview',
      label: 'Scorecard & Pressure',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
    },
    {
      key: 'showCharts',
      label: 'Radar & Wagon Wheel',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
    },
    {
      key: 'showStrengths',
      label: 'Strengths & Drills',
      icon: <Trophy className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
    },
    {
      key: 'showParameters',
      label: '20 Parameter Sliders',
      icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
    },
  ];

  const allVisible =
    visibility.showOverview &&
    visibility.showCharts &&
    visibility.showStrengths &&
    visibility.showParameters;

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Title & Section Toggles */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Display Rows:</span>
        </span>

        {sections.map((sec) => {
          const isVisible = visibility[sec.key];
          return (
            <button
              key={sec.key}
              onClick={() => onToggleSection(sec.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isVisible
                  ? 'bg-slate-800 text-white border-emerald-500/50 shadow-sm shadow-emerald-950/40 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700 opacity-70'
              }`}
              title={`Click to ${isVisible ? 'hide' : 'show'} ${sec.label}`}
            >
              <span className={isVisible ? sec.color : 'text-slate-500'}>
                {sec.icon}
              </span>
              <span>{sec.label}</span>
              <span className="ml-1 text-[10px] font-mono">
                {isVisible ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-500" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preset View Modes */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-slate-500 text-[11px] font-medium mr-1 hidden sm:inline">
          View Presets:
        </span>
        <button
          onClick={() => onSetPreset('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
            allVisible
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Show All
        </button>
        <button
          onClick={() => onSetPreset('charts')}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/60 text-cyan-400 border border-slate-800 hover:bg-slate-800 hover:border-cyan-800 transition cursor-pointer"
        >
          Charts Focus
        </button>
        <button
          onClick={() => onSetPreset('assessment')}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/60 text-purple-400 border border-slate-800 hover:bg-slate-800 hover:border-purple-800 transition cursor-pointer"
        >
          Tuning Mode
        </button>
      </div>
    </div>
  );
};
