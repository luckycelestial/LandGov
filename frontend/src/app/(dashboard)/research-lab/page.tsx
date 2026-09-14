'use client';

import React, { useState } from 'react';
import { Beaker, Users, Plus, Globe, FileText, Play, Clock, CheckCircle2, BarChart3, FolderOpen, GitBranch } from 'lucide-react';

const WORKSPACES = [
  {
    id: 'ws-001',
    title: 'DILRMP 3.0 Coverage Gap Analysis — Delhi NCT',
    team: ['S. Kumar', 'P. Sharma', 'V. Reddy'],
    status: 'active',
    type: 'Research Notebook',
    lastUpdated: '2h ago',
    progress: 72,
    datasets: 4,
    description: 'Spatial econometric analysis of cadastral digitization completeness across 11 Delhi districts using ULPIN-tagged parcel data.',
  },
  {
    id: 'ws-002',
    title: 'Urban Encroachment Prediction Model — Sentinel-2 ML Pipeline',
    team: ['M. Iyer', 'K. Patel'],
    status: 'active',
    type: 'ML Experiment',
    lastUpdated: '5h ago',
    progress: 54,
    datasets: 7,
    description: 'Random Forest classifier trained on multi-temporal LULC change vectors to predict unauthorized encroachment probability at ward level.',
  },
  {
    id: 'ws-003',
    title: 'Comparative Revenue Court Efficiency Index — Indian States',
    team: ['A. Singh', 'R. Mehta', 'G. Rao'],
    status: 'review',
    type: 'Policy Analysis',
    lastUpdated: '1d ago',
    progress: 91,
    datasets: 3,
    description: 'Benchmarking time-to-resolution metrics across 28 state revenue court systems using RCCMS docket data from 2015–2024.',
  },
  {
    id: 'ws-004',
    title: 'SVAMITVA Property Card Impact on Rural Credit Access',
    team: ['N. Krishnan', 'S. Iyer'],
    status: 'completed',
    type: 'Research Notebook',
    lastUpdated: '3d ago',
    progress: 100,
    datasets: 5,
    description: 'Panel data regression analysis of agricultural credit uptake before and after SVAMITVA property card issuance in 6 states.',
  },
  {
    id: 'ws-005',
    title: 'Climate Vulnerability Zoning — Delhi Agricultural Fringe',
    team: ['V. Nair', 'B. Singh'],
    status: 'paused',
    type: 'Geo-Analysis',
    lastUpdated: '1w ago',
    progress: 38,
    datasets: 9,
    description: 'Multi-criteria spatial analysis combining flood risk, heat island index, and soil health maps to produce composite vulnerability scores.',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20', dot: 'bg-emerald-500' },
  review: { label: 'Under Review', color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-500/20', dot: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200', dot: 'bg-zinc-400' },
  paused: { label: 'Paused', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20', dot: 'bg-amber-500' },
};

const TYPE_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  'Research Notebook': FileText,
  'ML Experiment': Beaker,
  'Policy Analysis': BarChart3,
  'Geo-Analysis': Globe,
};

export default function ResearchLabPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'review' | 'completed'>('all');

  const filtered = WORKSPACES.filter((w) => filter === 'all' || w.status === filter);

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc] dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Collaborative Research Lab</h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Virtual research workspaces · Shared computational notebooks · Multi-agency collaboration
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-colors">
          <Plus className="w-4 h-4" /> New Workspace
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Workspaces', value: WORKSPACES.filter(w => w.status === 'active').length, icon: Beaker, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'Collaborators', value: '124', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Completed Studies', value: WORKSPACES.filter(w => w.status === 'completed').length, icon: CheckCircle2, color: 'text-zinc-600', bg: 'bg-zinc-100 dark:bg-zinc-800' },
          { label: 'Datasets Linked', value: WORKSPACES.reduce((s, w) => s + w.datasets, 0), icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bg} rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center gap-3`}>
              <Icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              <div>
                <div className="text-xl font-black text-zinc-800 dark:text-zinc-100">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'active', 'review', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
          >
            {f === 'all' ? 'All Workspaces' : f}
          </button>
        ))}
      </div>

      {/* Workspace Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((ws) => {
          const statusCfg = STATUS_CONFIG[ws.status];
          const TypeIcon = TYPE_ICONS[ws.type] || FileText;
          return (
            <div key={ws.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-800/30">
                  <TypeIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${statusCfg.color}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusCfg.dot} mr-1 align-middle`} />
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{ws.type}</span>
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1"><FolderOpen className="w-2.5 h-2.5" />{ws.datasets} datasets</span>
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{ws.lastUpdated}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{ws.description}</p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-zinc-400">Progress</span>
                      <span className="text-[10px] font-bold font-mono text-zinc-700 dark:text-zinc-300">{ws.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${ws.status === 'completed' ? 'bg-zinc-400' : 'bg-indigo-500'}`}
                        style={{ width: `${ws.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {ws.team.map((member, mi) => (
                        <div key={mi} className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[9px] font-bold -ml-1 first:ml-0 border border-white dark:border-zinc-900 ring-1 ring-white/20">
                          {member.split(' ')[0][0]}{member.split(' ')[1]?.[0] || ''}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{ws.team.join(', ')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors">
                    <Play className="w-3 h-3" /> Open
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs hover:bg-zinc-50 transition-colors">
                    <GitBranch className="w-3 h-3" /> Fork
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
