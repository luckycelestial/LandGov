'use client';

import React, { useState } from 'react';
import { Search, MapPin, X, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { formatULPIN } from '../../lib/utils';

export function ULPINQuickSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { parcels, selectedUlpin, setSelectedUlpin } = useSpatialStore();

  const filtered = query.trim()
    ? parcels.filter(
        (p) =>
          p.ulpin.includes(query.trim()) ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.revenueVillage.toLowerCase().includes(query.toLowerCase()) ||
          p.spatialUnits.some((su) => su.surveyNumber.includes(query.trim()))
      )
    : [];

  return (
    <div className="relative px-3 py-2">
      <div
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
          isFocused
            ? 'border-blue-500 bg-white dark:bg-zinc-900 shadow-sm ring-2 ring-blue-500/20'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Lookup 14-digit Bhu-Aadhaar / Survey..."
          className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-[11px]"
        />
        {query ? (
          <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
            ⌘K
          </span>
        )}
      </div>

      {isFocused && query.trim() && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsFocused(false)} />
          <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-40 max-h-60 overflow-y-auto p-1">
            {filtered.length > 0 ? (
              filtered.map((parcel) => {
                const isSelected = parcel.ulpin === selectedUlpin;
                const isLitigated = parcel.titleStatus === 'ContestedLitigation';
                return (
                  <button
                    key={parcel.ulpin}
                    onClick={() => {
                      setSelectedUlpin(parcel.ulpin);
                      setIsFocused(false);
                      setQuery('');
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isLitigated ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          <span>{parcel.name}</span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {formatULPIN(parcel.ulpin)}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{parcel.revenueVillage}, {parcel.tehsil} | TFI: {parcel.tfiScore}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-zinc-400">
                No matching Bhu-Aadhaar parcels found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
