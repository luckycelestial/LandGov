'use client';

import React, { useState } from 'react';
import {
  Map, Layers, Satellite, Eye, EyeOff, SlidersHorizontal,
  Download, Share2, ChevronDown, AlertCircle, Globe, Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DelhiOSMMap = dynamic(
  () => import('../../../components/spatial/delhi-osm-map').then((m) => m.DelhiOSMMap),
  { ssr: false }
);

const LAYER_GROUPS = [
  {
    group: 'Cadastral & Land Records',
    layers: [
      { id: 'cadastral', label: 'Cadastral Parcels (DILRMP)', active: true, color: '#3b82f6' },
      { id: 'ror', label: 'Record of Rights (RoR)', active: true, color: '#8b5cf6' },
      { id: 'mutations', label: 'Mutation Transactions', active: false, color: '#f97316' },
    ],
  },
  {
    group: 'Land Use & Land Cover',
    layers: [
      { id: 'lulc_2024', label: 'LULC 2024 (Sentinel-2)', active: true, color: '#22c55e' },
      { id: 'lulc_2020', label: 'LULC 2020 (Change Detect.)', active: false, color: '#84cc16' },
      { id: 'encroachment', label: 'Encroachment Alerts', active: true, color: '#ef4444' },
    ],
  },
  {
    group: 'Dispute & Legal Overlay',
    layers: [
      { id: 'disputes', label: 'Active Dispute Polygons', active: true, color: '#f43f5e' },
      { id: 'courts', label: 'Revenue Court Jurisdictions', active: false, color: '#a855f7' },
    ],
  },
  {
    group: 'Climate & Environment',
    layers: [
      { id: 'flood_risk', label: 'Flood Risk Zones', active: false, color: '#06b6d4' },
      { id: 'heat_island', label: 'Urban Heat Island', active: false, color: '#f97316' },
      { id: 'green_cover', label: 'Green Cover Index', active: false, color: '#16a34a' },
    ],
  },
];

export default function GISSpatialStudio() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [layers, setLayers] = useState(LAYER_GROUPS);
  const [basemap, setBasemap] = useState<'osm' | 'satellite' | 'terrain'>('osm');

  const toggleLayer = (groupIdx: number, layerId: string) => {
    setLayers((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx
          ? { ...g, layers: g.layers.map((l) => (l.id === layerId ? { ...l, active: !l.active } : l)) }
          : g
      )
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-zinc-950">
      {/* Header */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Map className="w-4 h-4 text-emerald-600" />
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">GIS Spatial Studio</h1>
            <p className="text-[10px] text-zinc-500 font-mono">Multi-layer Cadastral & Remote Sensing Viewer · OGC WMS/WFS · Delhi NCT</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[11px] font-mono gap-0.5">
            {(['osm', 'satellite', 'terrain'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBasemap(b)}
                className={`px-2.5 py-1 rounded capitalize transition-all ${basemap === b ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                {b}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Body: Map + Layer Panel */}
      <div className="flex-1 flex min-h-0">
        {/* Layer Control Panel */}
        <div className="w-64 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
          <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Layer Manager</span>
            </div>
          </div>
          {layers.map((group, gi) => (
            <div key={group.group} className="border-b border-zinc-100 dark:border-zinc-800">
              <div className="px-4 py-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>{group.group}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              {group.layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(gi, layer.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${layer.active ? 'border-transparent' : 'border-zinc-300 dark:border-zinc-600'}`}
                    style={{ backgroundColor: layer.active ? layer.color : 'transparent' }}>
                    {layer.active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-xs leading-tight ${layer.active ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {layer.label}
                  </span>
                </button>
              ))}
            </div>
          ))}

          {/* Active Alerts */}
          <div className="p-4 space-y-2">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Spatial Alerts</div>
            {[
              { label: 'Encroachment detected — Rohini Sector 5', severity: 'high' },
              { label: 'Boundary mismatch — Dwarka Ward 84', severity: 'medium' },
              { label: 'LULC change detected — Najafgarh', severity: 'low' },
            ].map((alert, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-[10px] ${alert.severity === 'high' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400' : alert.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'}`}>
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{alert.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative">
          <DelhiOSMMap
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            isLiveTracking={false}
          />
          {/* Basemap indicator */}
          <div className="absolute top-4 right-4 z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 rounded-lg shadow text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            {basemap === 'satellite' ? <Satellite className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            <span className="capitalize">{basemap} tiles · OSM</span>
          </div>
          {/* Active layers badge */}
          <div className="absolute bottom-16 right-4 z-[1000] px-2.5 py-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 rounded-lg shadow text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            <Zap className="w-3 h-3 inline mr-1 text-emerald-500" />
            {layers.flatMap(g => g.layers).filter(l => l.active).length} layers active
          </div>
        </div>
      </div>
    </div>
  );
}
