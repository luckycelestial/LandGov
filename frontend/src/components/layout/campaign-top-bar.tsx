'use client';

import React from 'react';
import { Shield, Sparkles, Globe } from 'lucide-react';

export function CampaignTopBar() {
  return (
    <header className="h-12 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between z-20 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Land Governance Research Platform
        </h1>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
          SIH 26019 · DoLR
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>AI-Enabled · ISO 19152 LADM</span>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            MoRD_PORTAL
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            Ministry of Rural Development
          </div>
        </div>

        <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center font-bold text-xs text-emerald-800 dark:text-emerald-300 shadow-sm font-mono">
          <Shield className="w-3.5 h-3.5" />
        </div>
      </div>
    </header>
  );
}
