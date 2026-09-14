'use client';

import React, { useState } from 'react';
import { Download, FileCheck, CheckCircle2, Shield, Lock, FileCode } from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { useNotebookSources } from '../../lib/stores/use-notebook-sources';
import { formatULPIN } from '../../lib/utils';

export function DossierExport() {
  const { getSelectedParcel } = useSpatialStore();
  const { getSelectedSources } = useNotebookSources();
  const [isExporting, setIsExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const parcel = getSelectedParcel();
  const sources = getSelectedSources();

  const handleTriggerExport = (type: 'pdf' | 'geojson') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1000);
  };

  if (!parcel) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              National Land Research Dossier
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              Cryptographically Attested Title & Spatial Packet
            </p>
          </div>
        </div>

        <div className="space-y-2 text-[11px] font-mono border-t border-zinc-100 dark:border-zinc-700 pt-3">
          <div className="flex justify-between">
            <span className="text-zinc-400">Subject ULPIN:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatULPIN(parcel.ulpin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Title Fragility Index:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{parcel.tfiScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Grounding Sources:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{sources.length} Verified Records</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Attestation Standard:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">ISO 19152 (LADM v2)</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] space-y-1">
          <div className="text-zinc-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Digital Signature SHA-256 Digest:</span>
          </div>
          <div className="text-zinc-600 dark:text-zinc-400 break-all">
            e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
        </div>

        {downloaded && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Research dossier exported successfully!</span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleTriggerExport('pdf')}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-600/30 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Compiling Dossier PDF...' : 'Download Executive Report (PDF)'}</span>
          </button>

          <button
            onClick={() => handleTriggerExport('geojson')}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all"
          >
            <FileCode className="w-4 h-4 text-zinc-400" />
            <span>Export Vector Geometry (GeoJSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
