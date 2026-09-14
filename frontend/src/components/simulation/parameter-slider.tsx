'use client';

import React from 'react';
import { SlidersHorizontal, Clock, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useSimulationStore } from '../../lib/stores/use-simulation-store';
import { SimulationHorizon } from '../../lib/types/simulation';

export function ParameterSlider() {
  const {
    scenarios,
    activeScenarioId,
    setActiveScenario,
    horizon,
    setHorizon,
    subsidySlider,
    setSubsidySlider,
    enforcementSlider,
    setEnforcementSlider,
    getActiveScenario,
    resetInertiaMatrix,
  } = useSimulationStore();

  const active = getActiveScenario();

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Geo-CPSS Policy Sandbox Controls
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Configure PLUS Framework Cellular Automata & Causal Econometric Drivers
          </p>
        </div>

        <button
          onClick={resetInertiaMatrix}
          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Scenario Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Target Policy Intervention
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenario(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
            {active.description}
          </p>
        </div>

        {/* Horizon Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Simulation Horizon ($t$)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: '5_years', label: '5 Yrs (2031)' },
              { id: '10_years', label: '10 Yrs (2036)' },
              { id: '20_years', label: '20 Yrs (2046)' },
            ].map((h) => {
              const isSelected = horizon === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHorizon(h.id as SimulationHorizon)}
                  className={`py-2 px-1 rounded-lg border text-center font-mono text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="text-zinc-700 dark:text-zinc-300">Survey Subsidy Rate:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{subsidySlider}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={subsidySlider}
              onChange={(e) => setSubsidySlider(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="text-zinc-700 dark:text-zinc-300">Statutory Enforcement ($k$):</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{(enforcementSlider * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={enforcementSlider}
              onChange={(e) => setEnforcementSlider(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
