'use client';

import React from 'react';
import { BoundaryDiffViewer } from '../../../components/spatial/boundary-diff-viewer';
import { TFICalculator } from '../../../components/risk/tfi-calculator';
import { LitigationTimeline } from '../../../components/risk/litigation-timeline';
import { TriageToolbar } from '../../../components/risk/triage-toolbar';
import { ShieldAlert, Sparkles, Scale } from 'lucide-react';
import { useSpatialStore } from '../../../lib/stores/use-spatial-store';

export default function RiskTriangulationPage() {
  const { parcels, selectedUlpin, setSelectedUlpin } = useSpatialStore();

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
              Bhu-Nyaya Engine v2.4
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Diffeomorphic Boundary Discrepancy & Title Fragility Index
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Spatial Boundary Discrepancy & Judicial Risk Triangulation
          </h1>
        </div>

        {/* Parcel Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">Active Parcel:</span>
          <select
            value={selectedUlpin || ''}
            onChange={(e) => setSelectedUlpin(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
          >
            {parcels.map((p) => (
              <option key={p.ulpin} value={p.ulpin}>
                {p.name} (TFI: {p.tfiScore})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diffeomorphic Boundary Diff Viewer */}
      <div className="h-[440px] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <BoundaryDiffViewer />
      </div>

      {/* Title Fragility Index (TFI) Calculator */}
      <TFICalculator />

      {/* Judicial Disputes & Mutation Timeline Stream */}
      <LitigationTimeline />

      {/* TRO Triage Toolbar */}
      <TriageToolbar />
    </div>
  );
}
