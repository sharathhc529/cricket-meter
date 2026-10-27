import React, { useState } from 'react';
import { CricketerProfile, PlayerRole } from '../types/cricket';
import {
  Search,
  Filter,
  Users,
  Archive,
  ArchiveRestore,
  Trash2,
  Tag,
  Shield,
  Sparkles,
} from 'lucide-react';

interface PlayerSelectorProps {
  players: CricketerProfile[];
  activePlayerId: string;
  groups: string[];
  onSelectPlayer: (id: string) => void;
  onOpenRosterManager: () => void;
  onArchivePlayer: (id: string) => void;
  onUnarchivePlayer: (id: string) => void;
  onDeletePlayer: (id: string) => void;
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
  groups,
  onSelectPlayer,
  onOpenRosterManager,
  onArchivePlayer,
  onUnarchivePlayer,
  onDeletePlayer,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | PlayerRole>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeCount = players.filter((p) => !p.isArchived).length;
  const archivedCount = players.filter((p) => p.isArchived).length;

  const filteredPlayers = players.filter((p) => {
    const isArchived = Boolean(p.isArchived);
    if (statusFilter === 'active' && isArchived) return false;
    if (statusFilter === 'archived' && !isArchived) return false;

    if (groupFilter !== 'all' && (p.group || 'Ungrouped') !== groupFilter) return false;

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      (p.group || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || p.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-3">
      {/* Search, Status, and Squad Manager Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, country, squad or tags..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40 transition"
          />
        </div>

        {/* Status Filter (Active vs Archived vs All) & Squad Filter */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Active / Archived Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Playing XI / Active</span>
              <span className="text-[10px] opacity-75 font-mono">({activeCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'archived'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-3 h-3" />
              <span>Archived</span>
              <span className="text-[10px] opacity-75 font-mono">({archivedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({players.length})
            </button>
          </div>

          {/* Group / Squad Dropdown */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-purple-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all">📁 All Squads</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g} ({players.filter((p) => (statusFilter === 'all' || (statusFilter === 'active' ? !p.isArchived : p.isArchived)) && p.group === g).length})
              </option>
            ))}
          </select>

          {/* Open Squads & Roster Manager Modal Button */}
          <button
            onClick={onOpenRosterManager}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 font-bold transition cursor-pointer shadow-sm"
            title="Open Roster Manager to organize squads, bulk archive, or delete cricketers"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Squad Manager</span>
          </button>
        </div>
      </div>

      {/* Role Filters Horizontal Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-slate-800/60 pt-2.5">
        <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3 text-slate-500" /> Role:
        </span>
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer whitespace-nowrap ${
            roleFilter === 'all'
              ? 'bg-slate-800 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All Roles ({filteredPlayers.length})
        </button>
        {(['pure_batsman', 'pure_bowler', 'batting_allrounder', 'wicketkeeper_batsman'] as PlayerRole[]).map(
          (r) => {
            const info = ROLE_LABELS[r];
            const count = filteredPlayers.filter((p) => p.role === r).length;
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

      {/* Cricketers Roster Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {filteredPlayers.map((player) => {
          const isActive = player.id === activePlayerId;
          const isArchived = Boolean(player.isArchived);
          const roleInfo = ROLE_LABELS[player.role];

          return (
            <div
              key={player.id}
              className={`flex flex-col items-center p-3 rounded-xl border text-center transition relative group ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
              } ${isArchived ? 'opacity-70 border-dashed border-amber-500/40' : ''}`}
            >
              {/* Top Row: Jersey & Group Badge */}
              <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                {/* Squad/Group tag */}
                {player.group ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 truncate max-w-[70px]">
                    {player.group}
                  </span>
                ) : (
                  <span />
                )}

                {/* Jersey number */}
                {player.jerseyNumber && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-400/80 transition">
                    #{player.jerseyNumber}
                  </span>
                )}
              </div>

              {/* Main Avatar Button */}
              <button
                onClick={() => onSelectPlayer(player.id)}
                className="relative mb-2 cursor-pointer focus:outline-none"
              >
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
                {isArchived && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-black shadow" title="Archived">
                    📦
                  </div>
                )}
              </button>

              {/* Name & Country */}
              <button
                onClick={() => onSelectPlayer(player.id)}
                className="w-full truncate cursor-pointer focus:outline-none text-left"
              >
                <span className={`block text-xs font-bold truncate text-center ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {player.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate block text-center">
                  {player.country}
                </span>
              </button>

              {/* Role badge */}
              <div className="mt-1.5">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${roleInfo.badgeClass}`}
                >
                  {roleInfo.label}
                </span>
              </div>

              {/* Hover Actions Bar (Archive / Restore / Delete) */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isArchived ? (
                  <button
                    onClick={() => onUnarchivePlayer(player.id)}
                    className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 transition cursor-pointer"
                    title="Restore / Unarchive"
                  >
                    <ArchiveRestore className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => onArchivePlayer(player.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-amber-950/80 text-slate-400 hover:text-amber-400 border border-slate-700 transition cursor-pointer"
                    title="Archive Cricketer"
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={() => setDeleteConfirmId(player.id)}
                  className="p-1 rounded bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                  title="Delete Cricketer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Inline Delete Confirmation Overlay for Card */}
              {deleteConfirmId === player.id && (
                <div className="absolute inset-0 bg-slate-950/95 rounded-xl p-2 flex flex-col items-center justify-center z-20 animate-in fade-in">
                  <span className="text-[10px] font-bold text-rose-400 mb-1">Delete {player.name.split(' ')[0]}?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold cursor-pointer"
                    >
                      No
                    </button>
                    <button
                      onClick={() => {
                        onDeletePlayer(player.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            {statusFilter === 'archived'
              ? 'No archived cricketers found. Any cricketer you archive will appear here.'
              : 'No cricketers match your search or filter criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};
