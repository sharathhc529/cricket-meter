import React, { useState } from 'react';
import { CricketerProfile, PlayerRole } from '../types/cricket';
import { Search, Shield, Target, Zap, Award, Sparkles, Filter } from 'lucide-react';

interface PlayerSelectorProps {
  players: CricketerProfile[];
  activePlayerId: string;
  onSelectPlayer: (id: string) => void;
  onDeletePlayer?: (id: string) => void;
}

const ROLE_LABELS: Record<PlayerRole, { label: string; badgeClass: string; icon: string }> = {
  pure_batsman: { label: 'Batsman', badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: '🏏' },
  pure_bowler: { label: 'Bowler', badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30', icon: '🎯' },
  batting_allrounder: { label: 'Batting All-Rounder', badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: '⚡' },
  bowling_allrounder: { label: 'Bowling All-Rounder', badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', icon: '🔥' },
  wicketkeeper_batsman: { label: 'Keeper Batsman', badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30', icon: '🧤' },
};

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  activePlayerId,
  onSelectPlayer,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | PlayerRole>('all');

  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cricketer by name or country..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40 transition"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-slate-500" /> Filter:
          </span>
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer whitespace-nowrap ${
              roleFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            All ({players.length})
          </button>
          {(['pure_batsman', 'pure_bowler', 'batting_allrounder', 'wicketkeeper_batsman'] as PlayerRole[]).map(
            (r) => {
              const info = ROLE_LABELS[r];
              const count = players.filter((p) => p.role === r).length;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    roleFilter === r
                      ? 'bg-slate-800 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.label.split(' ')[0]}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Cricketers Roster Horizontal List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {filteredPlayers.map((player) => {
          const isActive = player.id === activePlayerId;
          const roleInfo = ROLE_LABELS[player.role];

          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={`flex flex-col items-center p-3 rounded-xl border text-center transition cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              {/* Jersey Number Tag */}
              {player.jerseyNumber && (
                <span className="absolute top-2 right-2 text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-400/80 transition">
                  #{player.jerseyNumber}
                </span>
              )}

              {/* Player Avatar */}
              <div className="relative mb-2">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                    isActive
                      ? 'border-emerald-400 shadow-md shadow-emerald-500/30 scale-105'
                      : 'border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  <img
                    src={player.avatarUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80'}
                    alt={player.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback image if unsplash is blocked
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black shadow">
                    ✓
                  </div>
                )}
              </div>

              {/* Name & Country */}
              <div className="w-full truncate">
                <span className={`block text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {player.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {player.country}
                </span>
              </div>

              {/* Role badge */}
              <div className="mt-1.5">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${roleInfo.badgeClass}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </button>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            No cricketers match your search. Try adjusting the filter or click "+ New Cricketer" to add one!
          </div>
        )}
      </div>
    </div>
  );
};
