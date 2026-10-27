import React from 'react';
import {
  CricketerProfile,
  CalculatedStrengthMetrics,
} from '../types/cricket';
import {
  ShieldAlert,
  Flame,
  Zap,
  Target,
  Trophy,
  Compass,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Swords,
} from 'lucide-react';

interface OverviewCardsProps {
  player: CricketerProfile;
  metrics: CalculatedStrengthMetrics;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ player, metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Overall Strength & Archetype Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Overall Cricketer Rating
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              OVR / 100
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {/* OVR Score Ring */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-slate-900 border-2 border-emerald-400/50 shadow-inner shadow-emerald-500/30">
              <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow">
                {metrics.overallRating}
              </span>
              <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                Rating
              </div>
            </div>

            <div className="flex-1">
              <div className={`text-sm font-extrabold ${metrics.tierColor}`}>
                {metrics.tierName}
              </div>
              <div className="text-xs text-white font-bold mt-0.5">
                {player.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {player.battingHand} • {player.bowlingStyle}
              </div>
            </div>
          </div>

          {/* Dynamic Archetype Tag */}
          <div className="mt-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Specialist Archetype</div>
            <div className="text-xs font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{metrics.archetype}</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-400 block">Batting</span>
            <span className="font-mono font-bold text-amber-400 text-xs">{metrics.battingScore}</span>
          </div>
          <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-400 block">Bowling</span>
            <span className="font-mono font-bold text-rose-400 text-xs">{metrics.bowlingScore}</span>
          </div>
          <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-400 block">Clutch IQ</span>
            <span className="font-mono font-bold text-cyan-400 text-xs">{metrics.mentalClutchScore}</span>
          </div>
        </div>
      </div>

      {/* 2. "Does He Give Extras With Pressure?" Meter Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Pressure Extras Meter
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Discipline 0-100</span>
          </div>

          <div className="text-xs text-slate-300 font-semibold mb-2">
            Does he concede extras (wides/no-balls) under match pressure?
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                metrics.extrasPressureRiskScore >= 80
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : metrics.extrasPressureRiskScore >= 65
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : metrics.extrasPressureRiskScore >= 50
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.extrasPressureRiskLabel}</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {metrics.extrasPressureRiskScore}/100 Control
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 mb-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.extrasPressureRiskScore >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : metrics.extrasPressureRiskScore >= 60
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${metrics.extrasPressureRiskScore}%` }}
            />
          </div>

          {/* Explanatory text */}
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 mt-2">
            {metrics.extrasAnalysisText}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Clutch Resilience:</span>
          <span className="font-mono font-bold text-emerald-400">{metrics.clutchFactor}%</span>
        </div>
      </div>

      {/* 3. Batting Field Side Strength & Wagon Wheel Summary */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Field Side Strength
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Wagon Wheel</span>
          </div>

          <div className="text-xs text-slate-300 font-semibold mb-2">
            Which side of the field is his strength in batting?
          </div>

          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span className="text-emerald-400">Leg-Side {metrics.legSidePercentage}%</span>
            <span className="text-cyan-400">Off-Side {metrics.offSidePercentage}%</span>
          </div>

          {/* Dual Color Segment Bar: Matches Ground (Left = Leg-Side, Right = Off-Side) */}
          <div className="w-full bg-slate-950 rounded-full h-3 mb-2 flex overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${metrics.legSidePercentage}%` }}
            />
            <div
              className="bg-cyan-500 h-full rounded-r-full transition-all duration-500"
              style={{ width: `${metrics.offSidePercentage}%` }}
            />
          </div>

          {/* Field Side Verdict Badge */}
          <div className="mt-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Dominance Verdict</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {metrics.fieldStrengthSide}
            </span>
          </div>
        </div>

        {/* Strongest & Weakest Sectors */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Power Zone:</span>
            <span className="font-bold text-emerald-400">
              {metrics.strongestSector.name} ({metrics.strongestSector.value})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Targeting Hole:</span>
            <span className="font-bold text-amber-400">
              {metrics.weakestSector.name} ({metrics.weakestSector.value})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Match Capability & Scenarios Index */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Match Scenarios IQ
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Simulations</span>
          </div>

          <div className="space-y-2.5">
            {/* Chase Master Index */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Chase Master Index
                </span>
                <span className="font-mono font-bold text-amber-400">{metrics.chaseMasterIndex}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${metrics.chaseMasterIndex}%` }}
                />
              </div>
            </div>

            {/* Powerplay Dominance */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> Powerplay Dominance
                </span>
                <span className="font-mono font-bold text-cyan-400">{metrics.powerplayDominance}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${metrics.powerplayDominance}%` }}
                />
              </div>
            </div>

            {/* Death Overs Execution */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Swords className="w-3 h-3 text-rose-400" /> Death Overs Impact
                </span>
                <span className="font-mono font-bold text-rose-400">{metrics.deathOversImpact}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full"
                  style={{ width: `${metrics.deathOversImpact}%` }}
                />
              </div>
            </div>

            {/* Running & Athleticism */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Running & Agility
                </span>
                <span className="font-mono font-bold text-emerald-400">{metrics.athleticismScore}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${metrics.athleticismScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Clutch Factor:</span>
          <span className="font-mono font-bold text-amber-300">{metrics.clutchFactor}/100</span>
        </div>
      </div>
    </div>
  );
};
