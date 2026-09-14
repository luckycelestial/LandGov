'use client';

import React from 'react';
import { DELHI_DISTRICTS_DATA, DelhiDistrictStats } from '../../lib/data/delhi-data';

interface DistrictCoverageListProps {
  selectedDistrict: string | null;
  onSelectDistrict: (districtName: string) => void;
}

export function DistrictCoverageList({
  selectedDistrict,
  onSelectDistrict,
}: DistrictCoverageListProps) {
  const districts = Object.values(DELHI_DISTRICTS_DATA);

  // Divide into left & right columns like the screenshot
  const leftCol = districts.filter((_, idx) => idx % 2 === 0);
  const rightCol = districts.filter((_, idx) => idx % 2 !== 0);

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
          NCT OF DELHI
        </h3>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
          OVERVIEW
        </span>
      </div>

      {/* 2-Column Progress Bars Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {districts.map((d) => {
          const isSelected = selectedDistrict === d.name;
          return (
            <div
              key={d.name}
              onClick={() => onSelectDistrict(d.name)}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-500/30'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {d.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">
                  {d.coveragePct}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    d.coveragePct === 100
                      ? 'bg-emerald-500'
                      : d.coveragePct >= 60
                      ? 'bg-amber-500'
                      : d.coveragePct >= 40
                      ? 'bg-orange-500'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${d.coveragePct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
