'use client';

import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Compass,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { useUIStore } from '../../lib/stores/use-ui-store';
import { LayerControl } from './layer-control';
import { formatULPIN, getTFIBadgeColor } from '../../lib/utils';

export function MapCanvas() {
  const {
    parcels,
    selectedUlpin,
    setSelectedUlpin,
    hoveredUlpin,
    setHoveredUlpin,
    activeLayers,
    mapCenter,
    zoomLevel,
    isSplitCompareActive,
    splitComparePosition,
    setSplitComparePosition,
    setSplitCompareActive,
  } = useSpatialStore();

  const { setRightDrawerTab } = useUIStore();
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [zoom, setZoom] = useState(zoomLevel);

  // SVG coordinate transformation centered around Wagholi Pune [18.5784, 73.9852]
  const centerLat = mapCenter[0];
  const centerLng = mapCenter[1];

  const projectToSVG = (lat: number, lng: number) => {
    const scale = 40000 * Math.pow(1.2, zoom - 15);
    const x = 500 + (lng - centerLng) * scale;
    const y = 350 - (lat - centerLat) * scale;
    return { x, y };
  };

  const handleParcelClick = (ulpin: string) => {
    setSelectedUlpin(ulpin);
    setRightDrawerTab('ladm_inspector');
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none flex flex-col">
      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowLayerControl(!showLayerControl)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-md shadow-lg transition-all ${
            showLayerControl
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setSplitCompareActive(!isSplitCompareActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-md shadow-lg transition-all ${
            isSplitCompareActive
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isSplitCompareActive ? 'Exit Split Screen' : 'Split Drone View'}</span>
        </button>
      </div>

      {showLayerControl && <LayerControl />}

      {/* SVG GIS Viewport */}
      <div className="relative flex-1 w-full h-full cursor-crosshair">
        <svg className="w-full h-full">
          <defs>
            {/* Grid Pattern */}
            <pattern id="gis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>

            {/* Hatched Encroachment Pattern */}
            <pattern id="encroachment-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="3" />
            </pattern>

            {/* Drone Ortho Gradient */}
            <radialGradient id="drone-mesh-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </radialGradient>

            {/* RCCMS Dispute Glow */}
            <radialGradient id="dispute-hotspot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#gis-grid)" />

          {/* Drone Ortho Base Simulation Layer */}
          {activeLayers.droneOrtho && (
            <g opacity="0.8">
              <circle cx="500" cy="350" r="300" fill="url(#drone-mesh-glow)" />
              {/* Simulated Ortho imagery blocks */}
              <rect x="340" y="220" width="340" height="280" fill="rgba(34, 197, 94, 0.04)" stroke="rgba(34, 197, 94, 0.15)" strokeDasharray="4,4" />
            </g>
          )}

          {/* RCCMS Dispute Heatmap Layer */}
          {activeLayers.rccmsDisputeHeatmap && (
            <g>
              <circle cx="490" cy="340" r="140" fill="url(#dispute-hotspot)" />
            </g>
          )}

          {/* Cadastral Parcels Layer */}
          {parcels.map((parcel) => {
            const spatial = parcel.spatialUnits[0];
            if (!spatial) return null;

            const isSelected = parcel.ulpin === selectedUlpin;
            const isHovered = parcel.ulpin === hoveredUlpin;
            const isContested = parcel.titleStatus === 'ContestedLitigation';

            const pointsString = spatial.coordinates
              .map((pt) => {
                const proj = projectToSVG(pt[0], pt[1]);
                return `${proj.x},${proj.y}`;
              })
              .join(' ');

            const centerPt = projectToSVG(spatial.coordinates[0][0], spatial.coordinates[0][1]);

            return (
              <g key={parcel.ulpin} className="cursor-pointer">
                {/* Main Cadastral Polygon */}
                {activeLayers.cadastreVector && (
                  <polygon
                    points={pointsString}
                    onClick={() => handleParcelClick(parcel.ulpin)}
                    onMouseEnter={() => setHoveredUlpin(parcel.ulpin)}
                    onMouseLeave={() => setHoveredUlpin(null)}
                    fill={
                      isSelected
                        ? isContested
                          ? 'rgba(239, 68, 68, 0.35)'
                          : 'rgba(59, 130, 246, 0.35)'
                        : isHovered
                        ? 'rgba(59, 130, 246, 0.2)'
                        : isContested
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(16, 185, 129, 0.12)'
                    }
                    stroke={
                      isSelected
                        ? '#3b82f6'
                        : isContested
                        ? '#ef4444'
                        : '#10b981'
                    }
                    strokeWidth={isSelected ? '3' : '1.5'}
                    strokeDasharray={isContested ? '5,3' : undefined}
                    className="transition-all duration-200"
                  />
                )}

                {/* Discrepancy Hatching Layer */}
                {activeLayers.encroachmentOverlay && spatial.disputeZones && (
                  spatial.disputeZones.map((zone, idx) => {
                    const zonePoints = zone
                      .map((pt) => {
                        const proj = projectToSVG(pt[0], pt[1]);
                        return `${proj.x},${proj.y}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={idx}
                        points={zonePoints}
                        fill="url(#encroachment-hatch)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                    );
                  })
                )}

                {/* Survey Number Label */}
                <text
                  x={centerPt.x + 30}
                  y={centerPt.y + 10}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md"
                >
                  Gat {spatial.surveyNumber}
                </text>

                {/* ULPIN Sub-label */}
                <text
                  x={centerPt.x + 30}
                  y={centerPt.y + 24}
                  fill={isSelected ? '#60a5fa' : '#9ca3af'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  TFI: {parcel.tfiScore.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Split Screen Divider (if active) */}
        {isSplitCompareActive && (
          <div
            className="absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize"
            style={{ left: `${splitComparePosition}%` }}
          >
            <div className="w-1 h-full bg-blue-500 shadow-lg shadow-blue-500/50 relative">
              <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar: Zoom, Lat/Lng Readout, Quick Stats */}
      <div className="px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between z-20 text-xs font-mono">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="flex items-center gap-1 text-zinc-300">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Center: {centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E</span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400">Cadastre CRS: EPSG:4326</span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400">Drone Ground Resolution: 0.05m GSD</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(12, z - 1))}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
            {zoom}x
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(20, z + 1))}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
