'use client';

import React from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  Code,
  Download,
  ExternalLink,
  Users,
  Database,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { useNotebookSources } from '../../../lib/stores/use-notebook-sources';
import { useUIStore } from '../../../lib/stores/use-ui-store';

export default function InnovationHubPage() {
  const { sources } = useNotebookSources();
  const { setUploadSourceModalOpen, setRightDrawerTab } = useUIStore();

  const HACKATHON_PROBLEMS = [
    {
      id: 'sih-26019',
      code: 'SIH-26019',
      title: 'Automated Diffeomorphic Boundary Discrepancy Detection & Spatial Injunction Mapping',
      ministry: 'Ministry of Rural Development / Dept of Land Resources (DoLR)',
      prizePool: '₹25,00,000 + Pilot Deployment Grant',
      teamsSubmitted: 142,
      category: 'Smart Land Governance & WebGIS AI',
      status: 'Active Grand Finale Evaluation',
    },
    {
      id: 'dolr-grant-02',
      code: 'DoLR-RES-2026',
      title: 'Double Machine Learning (DML) Causal Estimators for Land Value & Litigious Friction',
      ministry: 'NITI Aayog / NCAER Economic Sandbox',
      prizePool: '₹15,00,000 Academic Seed Fund',
      teamsSubmitted: 68,
      category: 'Econometrics & Land Reform Policy',
      status: 'Peer Review Stage',
    },
  ];

  const SANDBOX_DATASETS = [
    {
      title: 'Maharashtra Haveli Tehsil Vector Parcel Set (GeoParquet)',
      features: '4,120 Parcels',
      size: '48.6 MB',
      format: 'GeoParquet (EPSG:4326)',
      authority: 'Settlement Commissioner Pune',
    },
    {
      title: 'SVAMITVA 5cm Ultra-High Resolution Drone Reality Mesh',
      features: '1,890 Ortho Tiles',
      size: '1.2 GB',
      format: 'Cloud Optimized GeoTIFF (COG)',
      authority: 'Survey of India (SoI)',
    },
    {
      title: 'RCCMS 5-Year Civil Dispute Corpus & Injunction Orders',
      features: '14,800 Dockets',
      size: '64.1 MB',
      format: 'JSON / PDF Text OCR',
      authority: 'Revenue Court Case Management System',
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
              DoLR Innovation & Grants Portal
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Smart India Hackathon & Academic Research Sandbox
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Research Grants, Academic Sandboxes & Hackathon Hub
          </h1>
        </div>

        <button
          onClick={() => setRightDrawerTab('dossier_export')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Research Dossier</span>
        </button>
      </div>

      {/* Featured Hackathon Problem Statements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Smart India Hackathon (SIH 2026) Problem Statements
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">DoLR Flagship Challenge</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HACKATHON_PROBLEMS.map((prob) => (
            <div
              key={prob.id}
              className="p-5 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-50/20 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {prob.code}
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {prob.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {prob.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {prob.ministry}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 text-[10px]">Grants / Prize:</span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{prob.prizePool}</div>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px]">Submitted Prototypes:</span>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{prob.teamsSubmitted} Teams</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Open Sandboxes */}
      <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Anonymized Open Datasets for Researchers
            </h3>
          </div>
          <button
            onClick={() => setUploadSourceModalOpen(true)}
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Mount Custom Dataset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SANDBOX_DATASETS.map((ds, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2 text-xs"
            >
              <div className="font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {ds.title}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono space-y-0.5">
                <div>Count: <strong className="text-zinc-700 dark:text-zinc-300">{ds.features}</strong> ({ds.size})</div>
                <div>Format: <strong className="text-zinc-700 dark:text-zinc-300">{ds.format}</strong></div>
                <div>Origin: {ds.authority}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
