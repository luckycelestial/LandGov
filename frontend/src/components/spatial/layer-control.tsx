'use client';

import React from 'react';
import { Layers, Map, Eye, EyeOff, ShieldAlert, Sparkles, Building, Compass } from 'lucide-react';
import { useSpatialStore, ActiveLayerConfig } from '../../lib/stores/use-spatial-store';

export function LayerControl() {
  const { activeLayers, toggleLayer } = useSpatialStore();

  const layers: {
    key: keyof ActiveLayerConfig;
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      key: 'cadastreVector',
      label: 'Cadastral Boundary Vectors',
      sub: 'Revenue CTS Survey Lines (PostGIS)',
      icon: Map,
      color: 'text-blue-500',
    },
    {
      key: 'droneOrtho',
      label: 'SVAMITVA 5cm Drone Ortho',
      sub: 'SoI High-Resolution Reality Mesh',
      icon: Compass,
      color: 'text-amber-500',
    },
    {
      key: 'rccmsDisputeHeatmap',
      label: 'RCCMS Dispute Density Heatmap',
      sub: 'Revenue Court Case Clusters',
      icon: ShieldAlert,
      color: 'text-rose-500',
    },
    {
      key: 'encroachmentOverlay',
      label: 'Diffeomorphic Mismatch Overlay',
      sub: 'Red Hatched Encroachment Zones',
      icon: Sparkles,
      color: 'text-purple-500',
    },
    {
      key: 'zoningMasterPlan',
      label: 'Development Plan (DP) Zoning',
      sub: 'PMRDA Regional Master Plan 2041',
      icon: Building,
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl max-w-xs space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Spatial Layers
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          EPSG:4326
        </span>
      </div>

      <div className="space-y-1">
        {layers.map((l) => {
          const Icon = l.icon;
          const isActive = activeLayers[l.key];
          return (
            <button
              key={l.key}
              onClick={() => toggleLayer(l.key)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-3.5 h-3.5 ${l.color} flex-shrink-0`} />
                <div className="truncate">
                  <div className="text-[11px] font-semibold truncate">{l.label}</div>
                  <div className="text-[9px] text-zinc-400 truncate font-mono">{l.sub}</div>
                </div>
              </div>
              {isActive ? (
                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-1 flex-shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-zinc-400 ml-1 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
