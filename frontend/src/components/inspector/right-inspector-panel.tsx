'use client';

import React from 'react';
import { Sparkles, Layers, FileCheck, X } from 'lucide-react';
import { useUIStore } from '../../lib/stores/use-ui-store';
import { NotebookAICopilot } from './notebook-ai-copilot';
import { LADMEntityInspector } from './ladm-entity-inspector';
import { DossierExport } from './dossier-export';

export function RightInspectorPanel() {
  const { isRightDrawerOpen, setRightDrawerOpen, rightDrawerTab, setRightDrawerTab } = useUIStore();

  if (!isRightDrawerOpen) return null;

  return (
    <aside className="w-96 flex-shrink-0 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-20 shadow-lg">
      {/* Top Header & Tab Switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setRightDrawerTab('copilot')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              rightDrawerTab === 'copilot'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setRightDrawerTab('ladm_inspector')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              rightDrawerTab === 'ladm_inspector'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ISO LADM</span>
          </button>

          <button
            onClick={() => setRightDrawerTab('dossier_export')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              rightDrawerTab === 'dossier_export'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>
        </div>

        <button
          onClick={() => setRightDrawerOpen(false)}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Viewports */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {rightDrawerTab === 'copilot' && <NotebookAICopilot />}
        {rightDrawerTab === 'ladm_inspector' && <LADMEntityInspector />}
        {rightDrawerTab === 'dossier_export' && <DossierExport />}
      </div>
    </aside>
  );
}
