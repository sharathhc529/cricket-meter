import React, { useState, useEffect, useMemo } from 'react';
import { CricketerProfile, FieldSectors, PlayerParameters } from './types/cricket';
import { DEFAULT_PLAYERS } from './data/defaultPlayers';
import { calculateStrengthMetrics, PARAMETER_METADATA } from './utils/strengthCalculator';
import { Header } from './components/Header';
import { PlayerSelector } from './components/PlayerSelector';
import { OverviewCards } from './components/OverviewCards';
import { RadarChart } from './components/RadarChart';
import { WagonWheelChart } from './components/WagonWheelChart';
import { ParameterSliders } from './components/ParameterSliders';
import { ComparisonModal } from './components/ComparisonModal';
import { ExportImportModal } from './components/ExportImportModal';
import { NewPlayerModal } from './components/NewPlayerModal';
import { SectionVisibilityBar, SectionVisibilityState } from './components/SectionVisibilityBar';
import {
  Trophy,
  Lightbulb,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LayoutDashboard,
  SlidersHorizontal,
} from 'lucide-react';

const STORAGE_KEY = 'cricmeter_players_v1';
const VISIBILITY_STORAGE_KEY = 'cricmeter_visibility_v1';

export const App: React.FC = () => {
  // Load saved cricketers from localStorage or use defaults
  const [players, setPlayers] = useState<CricketerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Error reading localStorage', err);
    }
    return DEFAULT_PLAYERS;
  });

  const [activePlayerId, setActivePlayerId] = useState<string>(() => {
    return players[0]?.id || 'virat-kohli';
  });

  // Section show / hide mechanism state
  const [visibility, setVisibility] = useState<SectionVisibilityState>(() => {
    try {
      const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error reading visibility', err);
    }
    return {
      showOverview: true,
      showCharts: true,
      showStrengths: true,
      showParameters: true,
    };
  });

  // Modals state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [isNewPlayerModalOpen, setIsNewPlayerModalOpen] = useState(false);

  // Sync players to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [players]);

  // Sync visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
    } catch (err) {
      console.error('Failed to save visibility to localStorage', err);
    }
  }, [visibility]);

  // Current active player
  const activePlayer = useMemo(() => {
    return players.find((p) => p.id === activePlayerId) || players[0];
  }, [players, activePlayerId]);

  // Calculated Metrics
  const metrics = useMemo(() => {
    return calculateStrengthMetrics(activePlayer);
  }, [activePlayer]);

  // Toggle individual section
  const handleToggleSection = (key: keyof SectionVisibilityState) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Section visibility presets
  const handleSetPreset = (preset: 'all' | 'charts' | 'assessment' | 'compact') => {
    switch (preset) {
      case 'all':
        setVisibility({
          showOverview: true,
          showCharts: true,
          showStrengths: true,
          showParameters: true,
        });
        break;
      case 'charts':
        setVisibility({
          showOverview: true,
          showCharts: true,
          showStrengths: true,
          showParameters: false,
        });
        break;
      case 'assessment':
        setVisibility({
          showOverview: true,
          showCharts: false,
          showStrengths: false,
          showParameters: true,
        });
        break;
      case 'compact':
        setVisibility({
          showOverview: true,
          showCharts: true,
          showStrengths: false,
          showParameters: false,
        });
        break;
    }
  };

  // Update a parameter
  const handleChangeParameter = (key: keyof PlayerParameters, value: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== activePlayer.id) return p;
        return {
          ...p,
          parameters: {
            ...p.parameters,
            [key]: value,
          },
        };
      })
    );
  };

  // Update a field sector
  const handleChangeFieldSector = (sector: keyof FieldSectors, value: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== activePlayer.id) return p;
        return {
          ...p,
          fieldSectors: {
            ...p.fieldSectors,
            [sector]: value,
          },
        };
      })
    );
  };

  // Batch preset for a category
  const handleQuickPreset = (category: string, value: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== activePlayer.id) return p;
        const updated = { ...p.parameters };
        PARAMETER_METADATA.forEach((m) => {
          if (m.category === category) {
            updated[m.key] = value;
          }
        });
        return {
          ...p,
          parameters: updated,
        };
      })
    );
  };

  // Add new player
  const handleAddPlayer = (newPlayer: CricketerProfile) => {
    setPlayers((prev) => [newPlayer, ...prev]);
    setActivePlayerId(newPlayer.id);
  };

  // Import players from JSON
  const handleImportPlayers = (imported: CricketerProfile[], replaceAll: boolean) => {
    if (replaceAll) {
      setPlayers(imported);
      if (imported.length > 0) setActivePlayerId(imported[0].id);
    } else {
      setPlayers((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const nonDuplicate = imported.filter((p) => !existingIds.has(p.id));
        return [...prev, ...nonDuplicate];
      });
    }
  };

  // Reset to default roster
  const handleResetDefaults = () => {
    if (window.confirm('Reset cricketer roster back to original 7 default cricket legends?')) {
      setPlayers(DEFAULT_PLAYERS);
      setActivePlayerId(DEFAULT_PLAYERS[0].id);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activePlayer={activePlayer}
        totalPlayers={players.length}
        onOpenNewPlayerModal={() => setIsNewPlayerModalOpen(true)}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onOpenExportImportModal={() => setIsExportImportModalOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Cricketer Selector Roster */}
        <PlayerSelector
          players={players}
          activePlayerId={activePlayer.id}
          onSelectPlayer={(id) => setActivePlayerId(id)}
        />

        {/* Show / Hide Row Mechanism Toolbar */}
        <SectionVisibilityBar
          visibility={visibility}
          onToggleSection={handleToggleSection}
          onSetPreset={handleSetPreset}
        />

        {/* 1. Overview & Scorecard Row */}
        {visibility.showOverview && (
          <section className="space-y-2 transition-all duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Overall Capability & Pressure Analysis</span>
              </span>
              <button
                onClick={() => handleToggleSection('showOverview')}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Hide Row</span>
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
            <OverviewCards player={activePlayer} metrics={metrics} />
          </section>
        )}

        {/* 2. Visual Charts Row (Spider Radar Chart + Batting Wagon Wheel) */}
        {visibility.showCharts && (
          <section className="space-y-2 transition-all duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Visual Metrics: Skill Radar & Batting Wagon Wheel</span>
              </span>
              <button
                onClick={() => handleToggleSection('showCharts')}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Hide Graphs</span>
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarChart player={activePlayer} metrics={metrics} />
              <WagonWheelChart player={activePlayer} metrics={metrics} />
            </div>
          </section>
        )}

        {/* 3. Strengths & Development Areas Row */}
        {visibility.showStrengths && (
          <section className="space-y-2 transition-all duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Key Strengths & Coaching Development Drills</span>
              </span>
              <button
                onClick={() => handleToggleSection('showStrengths')}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Hide Strengths</span>
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top 3 Superpowers */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
                  <Trophy className="w-3.5 h-3.5" /> Top 3 Key Strengths
                </h3>
                <div className="space-y-2">
                  {metrics.topStrengths.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">{item.title}</span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        {item.value} / 100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Areas to Develop & Drills */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                  <Lightbulb className="w-3.5 h-3.5" /> Key Areas for Development & Drills
                </h3>
                <div className="space-y-2">
                  {metrics.areasToImprove.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-200">{item.title}</span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                          {item.value} / 100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        💡 <span className="font-semibold text-slate-300">Drill:</span> {item.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. 20 Parameter Sliders & Field Sectors Tuning Row */}
        {visibility.showParameters && (
          <section className="space-y-2 transition-all duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>20-Parameter Granular Tuning & Wagon Wheel Adjustments</span>
              </span>
              <button
                onClick={() => handleToggleSection('showParameters')}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Hide Sliders</span>
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
            <ParameterSliders
              player={activePlayer}
              onChangeParameter={handleChangeParameter}
              onChangeFieldSector={handleChangeFieldSector}
              onQuickPreset={handleQuickPreset}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🏏</span>
            <span className="font-bold text-slate-300">CricMeter</span>
            <span>— 20-Parameter Cricketer Strength Assessment Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Dynamic Wagon Wheel</span>
            <span>•</span>
            <span>Pressure Extras Analysis</span>
            <span>•</span>
            <span>JSON Sync Enabled</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        players={players}
        primaryPlayerId={activePlayer.id}
      />

      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        players={players}
        onImportPlayers={handleImportPlayers}
      />

      <NewPlayerModal
        isOpen={isNewPlayerModalOpen}
        onClose={() => setIsNewPlayerModalOpen(false)}
        onAddPlayer={handleAddPlayer}
        existingPlayers={players}
      />
    </div>
  );
};

export default App;
