import React, { useState } from 'react';
import {
  Download,
  Upload,
  UserPlus,
  GitCompare,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';
import { CricketerProfile } from '../types/cricket';

interface HeaderProps {
  activePlayer: CricketerProfile;
  totalPlayers: number;
  onOpenNewPlayerModal: () => void;
  onOpenCompareModal: () => void;
  onOpenExportImportModal: () => void;
  onResetDefaults: () => void;
  onSaveAndSyncJson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePlayer,
  totalPlayers,
  onOpenNewPlayerModal,
  onOpenCompareModal,
  onOpenExportImportModal,
  onResetDefaults,
  onSaveAndSyncJson,
}) => {
  const [syncedToast, setSyncedToast] = useState(false);

  const handleQuickSave = () => {
    onSaveAndSyncJson();
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 2200);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <span className="text-2xl select-none" role="img" aria-label="cricket">🏏</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Cric<span className="text-emerald-400">Meter</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
                  Pro 20-Metric Engine
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Cricketer Strength Assessment, Wagon Wheel & Pressure Meter
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Sync Button (In-memory and LocalStorage sync, no file download) */}
          <button
            onClick={handleQuickSave}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border shadow-md transition cursor-pointer ${
              syncedToast
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-950/40'
            }`}
            title="Instantly sync and save current roster"
          >
            {syncedToast ? (
              <Check className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
            )}
            <span>{syncedToast ? 'Synced!' : 'Sync'}</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={onOpenCompareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 shadow-sm transition hover:border-slate-500 cursor-pointer"
            title="Compare two cricketers head-to-head"
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Head-to-Head</span>
          </button>

          {/* Import / Export JSON */}
          <button
            onClick={onOpenExportImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 shadow-sm transition hover:border-slate-500 cursor-pointer"
            title="Import or Export Cricketer JSON file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON Sync</span>
          </button>

          {/* Add New Cricketer */}
          <button
            onClick={onOpenNewPlayerModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 border border-emerald-400/40 transition hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>New Cricketer</span>
          </button>

          {/* Reset to Default Roster */}
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition cursor-pointer"
            title="Reset roster to original Main and Supporting players"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
