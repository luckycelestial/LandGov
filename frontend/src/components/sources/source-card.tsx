'use client';

import React from 'react';
import {
  Map,
  FileText,
  Scale,
  BookOpen,
  Layers,
  CheckSquare,
  Square,
  Eye,
  Trash2,
  Cpu,
} from 'lucide-react';
import { NotebookSource, SourceModality } from '../../lib/types/sources';
import { useNotebookSources } from '../../lib/stores/use-notebook-sources';

interface SourceCardProps {
  source: NotebookSource;
}

export function SourceCard({ source }: SourceCardProps) {
  const { toggleSourceSelection, setActiveChunk, removeSource } = useNotebookSources();

  const getModalityMeta = (modality: SourceModality) => {
    switch (modality) {
      case 'cadastre':
        return {
          icon: Map,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30',
          label: 'Cadastre GIS',
        };
      case 'textual_ror':
        return {
          icon: FileText,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30',
          label: 'RoR Record',
        };
      case 'litigation':
        return {
          icon: Scale,
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30',
          label: 'RCCMS Court',
        };
      case 'statute':
        return {
          icon: BookOpen,
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30',
          label: 'Statutory Act',
        };
      case 'raster':
        return {
          icon: Layers,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30',
          label: 'EO Drone Raster',
        };
    }
  };

  const meta = getModalityMeta(source.modality);
  const Icon = meta.icon;

  return (
    <div
      className={`group relative rounded-lg border p-2.5 transition-all text-left ${
        source.isSelected
          ? 'bg-white dark:bg-zinc-800/90 border-blue-500/40 shadow-sm shadow-blue-500/5'
          : 'bg-zinc-50/70 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 opacity-70 hover:opacity-100'
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Toggle Selection Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSourceSelection(source.id);
          }}
          className="mt-0.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
        >
          {source.isSelected ? (
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Square className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {/* Source Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span>{meta.label}</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0">
              {source.fileSize}
            </span>
          </div>

          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mb-1" title={source.name}>
            {source.name}
          </h4>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span>
              {source.geographicScope.tehsil || source.geographicScope.district}, {source.geographicScope.state}
            </span>
            {source.tokenCount ? (
              <span className="flex items-center gap-0.5">
                <Cpu className="w-2.5 h-2.5 text-zinc-400" />
                {(source.tokenCount / 1000).toFixed(1)}k tokens
              </span>
            ) : (
              <span>{source.featureCount} features</span>
            )}
          </div>
        </div>
      </div>

      {/* Inspect / Delete Actions on Hover */}
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <button
          onClick={() => {
            if (source.chunks && source.chunks.length > 0) {
              setActiveChunk(source.chunks[0]);
            }
          }}
          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          <span>Inspect Chunks ({source.chunks?.length || 0})</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSource(source.id);
          }}
          className="text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded transition-colors"
          title="Remove Source"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
