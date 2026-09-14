'use client';

import React from 'react';
import { X, MapPin, Cpu, BookOpen, ExternalLink } from 'lucide-react';
import { useNotebookSources } from '../../lib/stores/use-notebook-sources';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';

export function ChunkInspector() {
  const { activeChunk, setActiveChunk, sources } = useNotebookSources();
  const { setMapCenter } = useSpatialStore();

  if (!activeChunk) return null;

  const parentSource = sources.find((s) => s.id === activeChunk.sourceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Dynamic Chunk Inspector
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-md">
                Source: {parentSource?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveChunk(null)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
              {activeChunk.title}
            </span>
            {activeChunk.pageOrClause && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {activeChunk.pageOrClause}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-zinc-400" />
              {activeChunk.tokenAllocation} tokens
            </span>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 font-mono">
              Tokenized Text & Extraction Payload
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif whitespace-pre-wrap">
              {activeChunk.preview}
            </p>
          </div>

          {activeChunk.coordinates && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-700 dark:text-blue-300">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Georeferenced Point: [{activeChunk.coordinates[0].toFixed(5)}, {activeChunk.coordinates[1].toFixed(5)}]</span>
              </div>
              <button
                onClick={() => {
                  if (activeChunk.coordinates) {
                    setMapCenter(activeChunk.coordinates, 17);
                    setActiveChunk(null);
                  }
                }}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm"
              >
                <span>Jump to Map</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {parentSource?.metadata && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div><strong className="font-semibold text-zinc-700 dark:text-zinc-300">Authority:</strong> {parentSource.metadata.sourceAuthority}</div>
              <div><strong className="font-semibold text-zinc-700 dark:text-zinc-300">Ingestion Date:</strong> {new Date(parentSource.metadata.ingestionTimestamp).toLocaleString()}</div>
              <div><strong className="font-semibold text-zinc-700 dark:text-zinc-300">CRS / Georeference:</strong> {parentSource.metadata.crs || 'N/A (Text/Legal Code)'}</div>
              <div><strong className="font-semibold text-zinc-700 dark:text-zinc-300">Verification Checksum:</strong> <span className="font-mono">{parentSource.metadata.checksum}</span></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex justify-end">
          <button
            onClick={() => setActiveChunk(null)}
            className="px-4 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
