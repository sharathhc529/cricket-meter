import React, { useState } from 'react';
import { CricketerProfile } from '../types/cricket';
import { X, Download, Upload, Copy, Check, FileJson, AlertCircle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: CricketerProfile[];
  onImportPlayers: (imported: CricketerProfile[], replaceAll: boolean) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  players,
  onImportPlayers,
}) => {
  const [activeMode, setActiveMode] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(players, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cricmeter_players_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setImportJsonText(text);
        setImportError(null);
      } catch (err: any) {
        setImportError('Failed to read file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const executeImport = (replaceAll: boolean) => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      const array = Array.isArray(parsed) ? parsed : [parsed];

      // Validate basic shape
      const validated: CricketerProfile[] = array.map((item, idx) => {
        if (!item.name || !item.parameters || !item.fieldSectors) {
          throw new Error(`Item #${idx + 1} is missing name, parameters, or fieldSectors.`);
        }
        return {
          id: item.id || `custom-${Date.now()}-${idx}`,
          name: String(item.name),
          country: item.country || 'Global',
          role: item.role || 'pure_batsman',
          battingHand: item.battingHand || 'Right-hand bat',
          bowlingStyle: item.bowlingStyle || 'Right-arm fast-medium',
          parameters: item.parameters,
          fieldSectors: item.fieldSectors,
          avatarUrl: item.avatarUrl,
          bio: item.bio,
        };
      });

      onImportPlayers(validated, replaceAll);
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportError('Invalid JSON format: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold text-white">
              Cricketer JSON Database Sync
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-3">
          <button
            onClick={() => setActiveMode('export')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export Database ({players.length} Cricketers)
          </button>
          <button
            onClick={() => setActiveMode('import')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'import'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Import JSON
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeMode === 'export' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Save current cricketers to a reusable JSON file or copy to clipboard:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-300 max-h-80 overflow-y-auto select-all leading-relaxed">
                <pre>{jsonString}</pre>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label className="text-xs text-slate-300 font-semibold block mb-2">
                  Choose a JSON file or paste JSON code below:
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "id": "custom-1", "name": "Player Name", "parameters": { ... }, "fieldSectors": { ... } } ]'
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />

              {importError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Database successfully imported and applied!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => executeImport(false)}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold rounded-lg text-xs cursor-pointer transition"
                >
                  Merge into Existing Roster
                </button>
                <button
                  onClick={() => executeImport(true)}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition"
                >
                  Replace All Cricketers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
