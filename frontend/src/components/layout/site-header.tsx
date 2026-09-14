'use client';

import React from 'react';
import {
  Menu,
  ChevronRight,
  Share2,
  Download,
  PanelRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../lib/stores/use-ui-store';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { formatULPIN } from '../../lib/utils';

export function SiteHeader() {
  const { toggleSidebar, toggleRightDrawer, isRightDrawerOpen, setRightDrawerTab } = useUIStore();
  const { getSelectedParcel } = useSpatialStore();
  const selected = getSelectedParcel();

  const handleExportDossier = () => {
    setRightDrawerTab('dossier_export');
  };

  return (
    <header className="h-13 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          title="Toggle Navigation Sidebar (Cmd+B)"
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />

        {/* Dynamic Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">National</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span>Maharashtra</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span>Pune</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span>Haveli</span>
          {selected && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                {selected.name} ({formatULPIN(selected.ulpin)})
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Simulation and cadastral state serialized & copied to clipboard!')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-500" />
          <span>Share State</span>
        </button>

        <button
          onClick={handleExportDossier}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export Dossier</span>
        </button>

        <button
          onClick={toggleRightDrawer}
          title="Toggle Contextual Inspector & AI Copilot"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isRightDrawerOpen
              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline">AI Copilot</span>
          <PanelRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
