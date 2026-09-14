'use client';

import React from 'react';
import { ParameterSlider } from '../../../components/simulation/parameter-slider';
import { TreatmentEffects } from '../../../components/simulation/treatment-effects';
import { InertiaMatrix } from '../../../components/simulation/inertia-matrix';
import { MapCanvas } from '../../../components/spatial/map-canvas';
import { Sparkles, SlidersHorizontal, Info } from 'lucide-react';

export default function SimulationPage() {
  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
              Geo-CPSS Spatial Policy Studio
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              PLUS LEAS & CARS Framework Modules (C++/Python Runtime)
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Counterfactual Policy Simulation & Econometric Impact Engine
          </h1>
        </div>
      </div>

      {/* Top Parameter Slider Subsystem */}
      <ParameterSlider />

      {/* Split Map View & Spatial Visualizer */}
      <div className="h-[420px] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-sm">
        <MapCanvas />
      </div>

      {/* Causal Treatment Effects with Recharts */}
      <TreatmentEffects />

      {/* Transition Inertia Matrix Control */}
      <InertiaMatrix />
    </div>
  );
}
