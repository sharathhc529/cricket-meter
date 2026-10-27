import React, { useState } from 'react';
import { CricketerProfile, PlayerRole } from '../types/cricket';
import { calculateStrengthMetrics } from '../utils/strengthCalculator';
import {
  X,
  Users,
  Archive,
  ArchiveRestore,
  Trash2,
  FolderPlus,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  Sparkles,
  Shield,
  Tag,
} from 'lucide-react';

interface RosterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: CricketerProfile[];
  groups: string[];
  onArchivePlayer: (id: string) => void;
  onUnarchivePlayer: (id: string) => void;
  onDeletePlayer: (id: string) => void;
  onChangePlayerGroup: (id: string, group: string) => void;
  onBulkArchive: (ids: string[]) => void;
  onBulkUnarchive: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkAssignGroup: (ids: string[], group: string) => void;
  onCreateGroup: (groupName: string) => void;
}

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  isOpen,
  onClose,
  players,
  groups,
  onArchivePlayer,
  onUnarchivePlayer,
  onDeletePlayer,
  onChangePlayerGroup,
  onBulkArchive,
  onBulkUnarchive,
  onBulkDelete,
  onBulkAssignGroup,
  onCreateGroup,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<CricketerProfile | null>(null);

  if (!isOpen) return null;

  // Filter logic
  const filteredPlayers = players.filter((p) => {
    const isArchived = Boolean(p.isArchived);
    if (statusFilter === 'active' && isArchived) return false;
    if (statusFilter === 'archived' && !isArchived) return false;

    if (selectedGroup !== 'all' && (p.group || 'Ungrouped') !== selectedGroup) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesCountry = p.country.toLowerCase().includes(q);
      const matchesGroup = (p.group || '').toLowerCase().includes(q);
      const matchesTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchesName && !matchesCountry && !matchesGroup && !matchesTags) return false;
    }

    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPlayers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlayers.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setIsCreatingGroup(false);
    }
  };

  const activeCount = players.filter((p) => !p.isArchived).length;
  const archivedCount = players.filter((p) => p.isArchived).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Roster & Squads Manager</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {players.length} Total
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Organize cricketers into groups/squads, archive veterans, or delete profiles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Actions Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cricketers, squad or tags..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Status Tabs (All / Active / Archived) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({players.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Active</span>
                <span className="text-[10px] opacity-80 font-mono">({activeCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'archived'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Archived</span>
                <span className="text-[10px] opacity-80 font-mono">({archivedCount})</span>
              </button>
            </div>

            {/* Group Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="all">📁 All Groups & Squads</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g} ({players.filter((p) => p.group === g).length})
                  </option>
                ))}
              </select>

              {/* Create Group Button */}
              <button
                onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="Create a new Squad Group"
              >
                <FolderPlus className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>

          {/* New Group Inline Form */}
          {isCreatingGroup && (
            <form
              onSubmit={handleCreateGroupSubmit}
              className="flex items-center gap-2 p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl animate-in fade-in"
            >
              <span className="text-xs font-bold text-purple-300">Create New Squad / Group:</span>
              <input
                type="text"
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Mumbai Indians / World Cup XI"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Add Group
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingGroup(false)}
                className="px-2.5 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-purple-500/40 text-xs">
              <span className="font-bold text-purple-300">
                {selectedIds.length} cricketer{selectedIds.length > 1 ? 's' : ''} selected
              </span>

              <div className="flex items-center gap-2">
                {/* Bulk Group Assign */}
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkAssignGroup(selectedIds, e.target.value);
                      setSelectedIds([]);
                    }
                  }}
                  className="bg-slate-950 border border-slate-700 text-[11px] font-bold text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="" disabled>
                    Move to Squad...
                  </option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                {/* Bulk Archive */}
                <button
                  onClick={() => {
                    onBulkArchive(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 rounded-lg font-bold text-[11px] transition cursor-pointer"
                >
                  <Archive className="w-3 h-3" /> Archive
                </button>

                {/* Bulk Unarchive */}
                <button
                  onClick={() => {
                    onBulkUnarchive(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 rounded-lg font-bold text-[11px] transition cursor-pointer"
                >
                  <ArchiveRestore className="w-3 h-3" /> Restore
                </button>

                {/* Bulk Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Permanently delete ${selectedIds.length} selected cricketers?`)) {
                      onBulkDelete(selectedIds);
                      setSelectedIds([]);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg font-bold text-[11px] transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cricketers Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <button onClick={handleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                    {selectedIds.length === filteredPlayers.length && filteredPlayers.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">Cricketer</th>
                <th className="py-2.5 px-3">Role & Style</th>
                <th className="py-2.5 px-3 text-center">OVR</th>
                <th className="py-2.5 px-3">Squad / Group</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlayers.map((player) => {
                const isSelected = selectedIds.includes(player.id);
                const isArchived = Boolean(player.isArchived);
                const metrics = calculateStrengthMetrics(player);

                return (
                  <tr
                    key={player.id}
                    className={`hover:bg-slate-800/40 transition ${
                      isArchived ? 'opacity-65 bg-slate-950/30' : ''
                    } ${isSelected ? 'bg-purple-950/20' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleSelect(player.id)}
                        className="cursor-pointer text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Cricketer Identity */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatarUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80'}
                          alt={player.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {player.jerseyNumber && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                #{player.jerseyNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{player.country}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Hand */}
                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-medium">
                        {player.role.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-[10px] text-slate-500">{player.battingHand}</div>
                    </td>

                    {/* OVR Score */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                        {metrics.overallRating}
                      </span>
                    </td>

                    {/* Squad / Group Assignment */}
                    <td className="py-3 px-3">
                      <select
                        value={player.group || 'Ungrouped'}
                        onChange={(e) => onChangePlayerGroup(player.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-purple-300 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value="Ungrouped">Ungrouped</option>
                        {groups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      {isArchived ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          📦 Archived
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ⚡ Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Archive / Unarchive */}
                        {isArchived ? (
                          <button
                            onClick={() => onUnarchivePlayer(player.id)}
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 transition cursor-pointer"
                            title="Unarchive and return to active roster"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onArchivePlayer(player.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/60 text-slate-400 hover:text-amber-400 border border-slate-700 transition cursor-pointer"
                            title="Archive cricketer (hides from main view without deleting)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete permanently */}
                        <button
                          onClick={() => setPlayerToDelete(player)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                          title="Permanently delete cricketer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No cricketers found for this group or status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal Sub-dialog */}
        {playerToDelete && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-extrabold text-white">
                  Permanently Delete Cricketer?
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-white">{playerToDelete.name}</span> ({playerToDelete.country})? All 20 evaluated parameters, field strengths, and records will be permanently removed.
              </p>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPlayerToDelete(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeletePlayer(playerToDelete.id);
                    setPlayerToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg shadow-rose-900/40"
                >
                  Yes, Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Tip: Archiving safely keeps ratings in storage while hiding them from the active playing XI.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
