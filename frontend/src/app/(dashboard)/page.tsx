'use client';

import React, { useState } from 'react';
import { DelhiOSMMap } from '../../components/spatial/delhi-osm-map';
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  FlaskConical,
  FileText,
  Globe,
  ArrowUpRight,
  Sparkles,
  Map,
} from 'lucide-react';

const RESEARCH_DOMAINS = [
  { name: 'New Delhi', code: 'ND', papers: 142, disputes: 312, coverage: '94%' },
  { name: 'South Delhi', code: 'SD', papers: 89, disputes: 847, coverage: '81%' },
  { name: 'North Delhi', code: 'NW', papers: 63, disputes: 523, coverage: '76%' },
  { name: 'East Delhi', code: 'ED', papers: 47, disputes: 289, coverage: '68%' },
  { name: 'West Delhi', code: 'WD', papers: 71, disputes: 401, coverage: '72%' },
  { name: 'Central Delhi', code: 'CD', papers: 58, disputes: 178, coverage: '88%' },
  { name: 'South West Delhi', code: 'SW', papers: 34, disputes: 634, coverage: '61%' },
  { name: 'North West Delhi', code: 'NW2', papers: 29, disputes: 712, coverage: '55%' },
  { name: 'Shahdara', code: 'SH', papers: 22, disputes: 445, coverage: '48%' },
  { name: 'North East Delhi', code: 'NE', papers: 18, disputes: 390, coverage: '43%' },
  { name: 'South East Delhi', code: 'SE', papers: 41, disputes: 267, coverage: '66%' },
];

export default function OverviewDashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#f8fafc] dark:bg-zinc-950">
      {/* Sub-Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Research & Policy Intelligence Dashboard
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            National Digital Land Governance Platform · DILRMP 3.0 · DoLR, MoRD · SIH 26019
          </p>
        </div>

        {/* Live Data Toggle */}
        <button
          onClick={() => setIsLiveActive(!isLiveActive)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all shadow-sm ${
            isLiveActive
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLiveActive ? 'bg-emerald-300 animate-ping' : 'bg-zinc-400'
            }`}
          />
          <span>{isLiveActive ? 'Live Feeds ON' : '• Live Feeds OFF'}</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Research Outputs */}
        <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-[#eff6ff] dark:bg-blue-950/20 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-[#1e40af] dark:text-blue-400 font-sans">
            2,847
          </div>
          <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mt-0.5">
            RESEARCH PAPERS
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Indexed & Discoverable</div>
        </div>

        {/* Active Disputes */}
        <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-[#fff1f2] dark:bg-rose-950/20 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 font-sans">
            4,998
          </div>
          <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mt-0.5">
            LAND DISPUTES
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Delhi — Active Cases</div>
        </div>

        {/* Cadastral Coverage */}
        <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-[#ecfdf5] dark:bg-emerald-950/20 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-[#065f46] dark:text-emerald-400 font-sans">
            78%
          </div>
          <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mt-0.5">
            CADASTRAL COVERAGE
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Digitized Parcels · Delhi</div>
        </div>

        {/* Policy Simulations */}
        <div className="p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-[#fffbeb] dark:bg-amber-950/20 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-[#92400e] dark:text-amber-400 font-sans">
            11 Districts
          </div>
          <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mt-0.5">
            ACTIVE DISTRICTS
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Geo-CPSS Monitored</div>
        </div>
      </div>

      {/* Main Split Screen: GIS Map + Research Domain Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[560px]">
        {/* Left: Delhi Spatial Map */}
        <div className="lg:col-span-8 h-[520px] lg:h-full min-h-[500px]">
          <DelhiOSMMap
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            isLiveTracking={isLiveActive}
          />
        </div>

        {/* Right: District Research Stats + Activity */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* District Research Coverage */}
          <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">District Coverage Index</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400">11 Districts</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 overflow-y-auto max-h-64">
              {RESEARCH_DOMAINS.map((d) => (
                <button
                  key={d.code}
                  onClick={() => setSelectedDistrict(selectedDistrict === d.name ? null : d.name)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    selectedDistrict === d.name ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          parseInt(d.coverage) > 80
                            ? 'bg-emerald-500'
                            : parseInt(d.coverage) > 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">{d.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{d.coverage}</span>
                  </div>
                  <div className="flex gap-3 mt-1 pl-3.5">
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <BookOpen className="w-2.5 h-2.5" />{d.papers} papers
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />{d.disputes} disputes
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Research Activity Feed */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">AI Research Feed</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {[
                { icon: FileText, label: 'New policy paper indexed', tag: 'DILRMP 3.0', time: '2m ago', color: 'text-blue-600' },
                { icon: TrendingUp, label: 'Encroachment alert — South Delhi', tag: 'GIS Alert', time: '8m ago', color: 'text-rose-600' },
                { icon: FlaskConical, label: 'Simulation run completed', tag: 'Geo-CPSS', time: '15m ago', color: 'text-emerald-600' },
                { icon: BookOpen, label: 'SVAMITVA survey data ingested', tag: 'Dataset', time: '34m ago', color: 'text-amber-600' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${item.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 leading-tight">{item.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500`}>{item.tag}</span>
                        <span className="text-[9px] text-zinc-400 font-mono">{item.time}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-zinc-300 flex-shrink-0 mt-0.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
