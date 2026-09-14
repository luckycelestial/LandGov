'use client';

import React, { useState } from 'react';
import { Upload, X, Map, FileText, Scale, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../../lib/stores/use-ui-store';
import { useNotebookSources } from '../../lib/stores/use-notebook-sources';
import { SourceModality } from '../../lib/types/sources';

export function UploadSourceDialog() {
  const { isUploadSourceModalOpen, setUploadSourceModalOpen } = useUIStore();
  const { addSource } = useNotebookSources();

  const [name, setName] = useState('');
  const [modality, setModality] = useState<SourceModality>('cadastre');
  const [stateName, setStateName] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [tehsil, setTehsil] = useState('Haveli');
  const [authority, setAuthority] = useState('DoLR State Land Portal');
  const [description, setDescription] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isUploadSourceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSimulating(true);
    setTimeout(() => {
      addSource({
        name: name.trim(),
        modality,
        geographicScope: {
          state: stateName,
          district,
          tehsil,
        },
        fileSize: '18.4 MB',
        tokenCount: modality === 'raster' ? undefined : 45000,
        featureCount: modality === 'cadastre' ? 850 : undefined,
        metadata: {
          sourceAuthority: authority,
          ingestionTimestamp: new Date().toISOString(),
          crs: modality === 'cadastre' ? 'EPSG:4326' : undefined,
          checksum: `sha256:${Math.random().toString(36).substring(2, 12)}...`,
          description,
        },
        chunks: [
          {
            id: `chk-custom-${Date.now()}`,
            sourceId: '',
            title: `${name} - Extracted Section 1`,
            preview: description || 'Ingested geographic dataset verified and indexed into active RAG session.',
            tokenAllocation: 250,
          },
        ],
      });

      setIsSimulating(false);
      setUploadSourceModalOpen(false);
      setName('');
      setDescription('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Mount New Research Source
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Ground the platform AI Copilot & GIS engine in verified datasets
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadSourceModalOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Source Modality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cadastre', label: 'Cadastre GIS', icon: Map },
                { id: 'textual_ror', label: 'RoR (7/12)', icon: FileText },
                { id: 'litigation', label: 'RCCMS Dockets', icon: Scale },
                { id: 'statute', label: 'Statute / Act', icon: BookOpen },
                { id: 'raster', label: 'Drone / COG', icon: Layers },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = modality === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModality(m.id as SourceModality)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              File / Dataset Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pune_Haveli_Survey_47_Mutation_Extract.json"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">State</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Tehsil</label>
              <input
                type="text"
                value={tehsil}
                onChange={(e) => setTehsil(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Source Authority / Origin
            </label>
            <input
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Brief Description / Abstract
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context regarding parcel mutations, court stay, or georeferencing quality..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setUploadSourceModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSimulating}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/30 disabled:opacity-50"
            >
              {isSimulating ? (
                <span>Indexing Vector Chunks...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mount & Index Source</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
