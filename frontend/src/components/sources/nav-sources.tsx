'use client';

import React from 'react';
import { Plus, CheckSquare, Square, Filter } from 'lucide-react';
import { useNotebookSources } from '../../lib/stores/use-notebook-sources';
import { useUIStore } from '../../lib/stores/use-ui-store';
import { SourceCard } from './source-card';
import { SourceModality } from '../../lib/types/sources';

export function NavSources() {
  const {
    sources,
    selectedCount,
    totalTokens,
    filterModality,
    setFilterModality,
    selectAllSources,
  } = useNotebookSources();
  const { setUploadSourceModalOpen } = useUIStore();

  const allSelected = selectedCount === sources.length && sources.length > 0;

  const filteredSources = filterModality
    ? sources.filter((s) => s.modality === filterModality)
    : sources;

  return (
    <div className="flex flex-col flex-1 min-h-0 px-3 py-2 border-t border-zinc-200 dark:border-zinc-800">
      {/* Header with Title, Counter, and Add Action */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Active Notebook Sources
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
              {selectedCount}/{sources.length}
            </span>
          </div>
          <div className="text-[9px] text-zinc-400 font-mono">
            {(totalTokens / 1000).toFixed(1)}k tokens mounted in RAG context
          </div>
        </div>

        <button
          onClick={() => setUploadSourceModalOpen(true)}
          className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1 text-[10px] font-medium px-2"
          title="Add New Source"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Filter and Select All Bar */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
        <button
          onClick={() => selectAllSources(!allSelected)}
          className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>

        {/* Quick Modality Filter */}
        <div className="flex items-center gap-1">
          <select
            value={filterModality || 'all'}
            onChange={(e) => setFilterModality(e.target.value === 'all' ? null : (e.target.value as SourceModality))}
            className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-300 outline-none"
          >
            <option value="all">All Modalities</option>
            <option value="cadastre">Cadastre GIS</option>
            <option value="textual_ror">RoR 7/12</option>
            <option value="litigation">RCCMS Litigation</option>
            <option value="statute">Statute Acts</option>
            <option value="raster">EO Rasters</option>
          </select>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {filteredSources.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
}
