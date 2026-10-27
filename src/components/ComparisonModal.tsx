import React, { useState } from 'react';
import { CricketerProfile } from '../types/cricket';
import { calculateStrengthMetrics, PARAMETER_METADATA } from '../utils/strengthCalculator';
import { RadarChart } from './RadarChart';
import { X, GitCompare, Trophy, Zap, Check, ArrowRight } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: CricketerProfile[];
  primaryPlayerId: string;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  players,
  primaryPlayerId,
}) => {
  const [playerAId, setPlayerAId] = useState<string>(primaryPlayerId);
  const [playerBId, setPlayerBId] = useState<string>(
    players.find((p) => p.id !== primaryPlayerId)?.id || players[0]?.id
  );

  if (!isOpen) return null;

  const playerA = players.find((p) => p.id === playerAId) || players[0];
  const playerB = players.find((p) => p.id === playerBId) || players[1] || players[0];

  const metricsA = calculateStrengthMetrics(playerA);
  const metricsB = calculateStrengthMetrics(playerB);

  // Compute category head-to-head winners
  const comparisonItems = [
    { label: 'Overall Strength Rating', valA: metricsA.overallRating, valB: metricsB.overallRating },
    { label: '🏏 Batting Prowess', valA: metricsA.battingScore, valB: metricsB.battingScore },
    { label: '🎯 Bowling Potency', valA: metricsA.bowlingScore, valB: metricsB.bowlingScore },
    { label: '🧤 Fielding Hands', valA: metricsA.fieldingScore, valB: metricsB.fieldingScore },
    { label: '⚡ Athleticism & Running', valA: metricsA.athleticismScore, valB: metricsB.athleticismScore },
    { label: '🧠 Clutch & Pressure Nerve', valA: metricsA.mentalClutchScore, valB: metricsB.mentalClutchScore },
    { label: '🛡️ Extras Discipline Under Pressure', valA: metricsA.extrasPressureRiskScore, valB: metricsB.extrasPressureRiskScore },
    { label: '🔥 Chase Master Index', valA: metricsA.chaseMasterIndex, valB: metricsB.chaseMasterIndex },
  ];

  const winsA = comparisonItems.filter((i) => i.valA > i.valB).length;
  const winsB = comparisonItems.filter((i) => i.valB > i.valA).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold text-white">
              Cricketer Head-to-Head Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cricketer Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player A Select */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                Player 1 (Primary)
              </label>
              <select
                value={playerAId}
                onChange={(e) => setPlayerAId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.country}) - OVR {calculateStrengthMetrics(p).overallRating}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-400">
                {playerA.role.replace('_', ' ').toUpperCase()} • {metricsA.archetype}
              </div>
            </div>

            {/* Player B Select */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                Player 2 (Challenger)
              </label>
              <select
                value={playerBId}
                onChange={(e) => setPlayerBId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.country}) - OVR {calculateStrengthMetrics(p).overallRating}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-400">
                {playerB.role.replace('_', ' ').toUpperCase()} • {metricsB.archetype}
              </div>
            </div>
          </div>

          {/* Winner Banner */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {playerA.name} wins {winsA} categories
            </span>
            <div className="text-slate-400 font-bold">
              {winsA > winsB ? (
                <span className="text-emerald-400 font-black">🏆 {playerA.name} Dominates Overall</span>
              ) : winsB > winsA ? (
                <span className="text-amber-400 font-black">🏆 {playerB.name} Dominates Overall</span>
              ) : (
                <span className="text-cyan-400 font-black">🤝 Perfectly Balanced Matchup</span>
              )}
            </div>
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {playerB.name} wins {winsB} categories
            </span>
          </div>

          {/* Overlaid Radar Chart */}
          <div className="flex justify-center">
            <RadarChart
              player={playerA}
              metrics={metricsA}
              comparePlayer={playerB}
              compareMetrics={metricsB}
            />
          </div>

          {/* Metric Comparison Table */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 text-left">Category Metric</th>
                  <th className="py-2.5 px-4 text-center text-emerald-400">{playerA.name}</th>
                  <th className="py-2.5 px-4 text-center text-amber-400">{playerB.name}</th>
                  <th className="py-2.5 px-4 text-right">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {comparisonItems.map((item, idx) => {
                  const diff = item.valA - item.valB;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-200">{item.label}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {item.valA}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-400">
                        {item.valB}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {diff > 0 ? (
                          <span className="font-bold text-emerald-400">
                            +{diff} {playerA.name.split(' ')[0]}
                          </span>
                        ) : diff < 0 ? (
                          <span className="font-bold text-amber-400">
                            +{Math.abs(diff)} {playerB.name.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="text-slate-500">Tied</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
