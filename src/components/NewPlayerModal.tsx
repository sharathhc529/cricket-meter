import React, { useState } from 'react';
import {
  CricketerProfile,
  PlayerRole,
  BattingHand,
  BowlingStyle,
} from '../types/cricket';
import { X, UserPlus, Users } from 'lucide-react';

interface NewPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (player: CricketerProfile) => void;
  existingPlayers: CricketerProfile[];
  groups: string[];
}

export const NewPlayerModal: React.FC<NewPlayerModalProps> = ({
  isOpen,
  onClose,
  onAddPlayer,
  existingPlayers,
  groups,
}) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [group, setGroup] = useState(groups[0] || 'Club Squad');
  const [customGroup, setCustomGroup] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [role, setRole] = useState<PlayerRole>('pure_batsman');
  const [battingHand, setBattingHand] = useState<BattingHand>('Right-hand bat');
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle>('Right-arm fast-medium');
  const [jerseyNumber, setJerseyNumber] = useState<number>(7);
  const [cloneFromId, setCloneFromId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let baseParameters = {
      battingPower: 75,
      boundaryHitting: 75,
      battingTiming: 75,
      pacePlayingAbility: 75,
      spinPlayingAbility: 75,
      bowlingPaceSpin: 65,
      bowlingAccuracy: 65,
      wicketTakingAbility: 65,
      extrasControlUnderPressure: 70,
      deathOversExecution: 65,
      catchingReliability: 75,
      groundFielding: 75,
      throwingAccuracyPower: 75,
      runningBetweenWickets: 75,
      confidenceLevel: 80,
      pressureHandlingClutch: 75,
      matchAwarenessIQ: 75,
      staminaEndurance: 80,
      consistencyRating: 75,
      captaincyLeadership: 70,
    };

    let baseSectors = {
      thirdMan: 70,
      point: 75,
      cover: 80,
      longOff: 75,
      longOn: 75,
      midWicket: 80,
      squareLeg: 75,
      fineLeg: 70,
    };

    // If cloned
    if (cloneFromId) {
      const source = existingPlayers.find((p) => p.id === cloneFromId);
      if (source) {
        baseParameters = { ...source.parameters };
        baseSectors = { ...source.fieldSectors };
      }
    }

    const assignedGroup = isCustomGroup
      ? (customGroup.trim() || 'Club Squad')
      : group;

    const newPlayer: CricketerProfile = {
      id: `player-${Date.now()}`,
      name: name.trim(),
      country: country.trim() || 'Global',
      group: assignedGroup,
      isArchived: false,
      role,
      battingHand,
      bowlingStyle,
      jerseyNumber: jerseyNumber || undefined,
      avatarUrl: `https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80`,
      bio: `Custom assessed cricketer with strength profile modeled on ${role.replace('_', ' ')}.`,
      parameters: baseParameters,
      fieldSectors: baseSectors,
    };

    onAddPlayer(newPlayer);
    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white">Create New Cricketer Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Cricketer Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jasprit Bumrah / Club Star"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Country / Region</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India / Australia"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Jersey Number</label>
              <input
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Squad / Group Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Assign to Squad / Group
              </label>
              <button
                type="button"
                onClick={() => setIsCustomGroup(!isCustomGroup)}
                className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                {isCustomGroup ? 'Select from existing' : '+ Enter custom squad'}
              </button>
            </div>

            {isCustomGroup ? (
              <input
                type="text"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                placeholder="e.g. Mumbai Indians / Street XI"
                className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            ) : (
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold focus:outline-none focus:border-emerald-500"
              >
                {groups.map((g) => (
                  <option key={g} value={g}>
                    📁 {g}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Player Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="pure_batsman">🏏 Pure Batsman</option>
              <option value="pure_bowler">🎯 Pure Bowler</option>
              <option value="batting_allrounder">⚡ Batting All-Rounder</option>
              <option value="bowling_allrounder">🔥 Bowling All-Rounder</option>
              <option value="wicketkeeper_batsman">🧤 Wicketkeeper Batsman</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Batting Hand</label>
              <select
                value={battingHand}
                onChange={(e) => setBattingHand(e.target.value as BattingHand)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Right-hand bat">Right-hand bat</option>
                <option value="Left-hand bat">Left-hand bat</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Bowling Style</label>
              <select
                value={bowlingStyle}
                onChange={(e) => setBowlingStyle(e.target.value as BowlingStyle)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Right-arm fast">Right-arm fast</option>
                <option value="Left-arm fast">Left-arm fast</option>
                <option value="Right-arm fast-medium">Right-arm fast-medium</option>
                <option value="Left-arm fast-medium">Left-arm fast-medium</option>
                <option value="Right-arm off-break">Right-arm off-break</option>
                <option value="Right-arm leg-break">Right-arm leg-break</option>
                <option value="Left-arm orthodox">Left-arm orthodox</option>
                <option value="Does not bowl">Does not bowl</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Clone Starting Parameters From (Optional)
            </label>
            <select
              value={cloneFromId}
              onChange={(e) => setCloneFromId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Start with balanced baseline stats (75 avg)</option>
              {existingPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  Copy stats from: {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition shadow-md shadow-emerald-500/20"
            >
              Create Cricketer Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
