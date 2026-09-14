'use client';

import React from 'react';
import { Table, RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { useSimulationStore } from '../../lib/stores/use-simulation-store';
import { TransitionMatrixRow } from '../../lib/types/simulation';

export function InertiaMatrix() {
  const { getActiveScenario, customInertiaMatrix, updateInertiaCell, resetInertiaMatrix } = useSimulationStore();
  const scenario = getActiveScenario();
  const matrix = customInertiaMatrix || scenario.inertiaMatrix;

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Cellular Automata Transition Inertia Cost Matrix
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Define probabilistic resistance factors ($0.0 \le p \le 1.0$) between land use classes
          </p>
        </div>

        {customInertiaMatrix && (
          <button
            onClick={resetInertiaMatrix}
            className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restore Defaults</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-600 dark:text-zinc-400">
              <th className="p-2.5 text-left font-semibold">From \ To</th>
              <th className="p-2.5 text-center font-semibold text-emerald-600">Agricultural</th>
              <th className="p-2.5 text-center font-semibold text-teal-600">Forest/Wetland</th>
              <th className="p-2.5 text-center font-semibold text-blue-600">Built-Up/Urban</th>
              <th className="p-2.5 text-center font-semibold text-purple-600">Industrial</th>
              <th className="p-2.5 text-center font-semibold text-amber-600">Barren</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {matrix.map((row, rIdx) => (
              <tr key={row.fromCategory} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.fromCategory}
                </td>
                {(['toAgri', 'toForest', 'toUrban', 'toIndustrial', 'toBarren'] as (keyof TransitionMatrixRow)[]).map(
                  (field) => {
                    const val = Number(row[field]);
                    const isHigh = val >= 0.5;
                    return (
                      <td key={field} className="p-1.5 text-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={val}
                          onChange={(e) => updateInertiaCell(rIdx, field, Number(e.target.value))}
                          className={`w-16 px-2 py-1 text-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none ${
                            isHigh
                              ? 'font-bold text-zinc-900 dark:text-zinc-100 bg-indigo-50/50 dark:bg-indigo-950/30'
                              : 'text-zinc-500'
                          }`}
                        />
                      </td>
                    );
                  }
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
