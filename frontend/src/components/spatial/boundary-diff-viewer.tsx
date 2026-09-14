'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Scale,
  Maximize2,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { formatULPIN, formatArea } from '../../lib/utils';

export function BoundaryDiffViewer() {
  const { getSelectedParcel } = useSpatialStore();
  const parcel = getSelectedParcel();

  if (!parcel) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs">
        Select a parcel to inspect the diffeomorphic boundary discrepancy.
      </div>
    );
  }

  const diff = parcel.riskProfile.diffeomorphicDiscrepancy;
  const spatial = parcel.spatialUnits[0];

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 p-4 space-y-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
              ULPIN: {formatULPIN(parcel.ulpin)}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              Survey #{spatial?.surveyNumber} ({parcel.revenueVillage})
            </span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Diffeomorphic Boundary Discrepancy Engine</span>
            <span className="text-xs font-mono font-normal text-zinc-400">
              (P_cad vs P_phys)
            </span>
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border-2 border-blue-500 bg-blue-500/20" />
            <span className="text-zinc-300">Revenue Cadastre (P_cad)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-amber-500/20" />
            <span className="text-zinc-300">Drone Reality (P_phys)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-rose-500 bg-hatch-discrepancy" />
            <span className="text-rose-400 font-bold">Mismatch Area</span>
          </div>
        </div>
      </div>

      {/* Main Comparative Canvas */}
      <div className="relative flex-1 min-h-[360px] rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full p-8" viewBox="0 0 800 400">
          <defs>
            <pattern id="diff-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239, 68, 68, 0.9)" strokeWidth="3" />
            </pattern>
          </defs>

          {/* Grid lines */}
          <line x1="100" y1="0" x2="100" y2="400" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="4" />
          <line x1="300" y1="0" x2="300" y2="400" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="4" />
          <line x1="500" y1="0" x2="500" y2="400" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="4" />
          <line x1="700" y1="0" x2="700" y2="400" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="4" />

          {/* Revenue Cadastral Polygon (Blue) */}
          <polygon
            points="200,80 580,90 620,310 180,290"
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="6,4"
          />

          {/* SoI Drone Photogrammetry Polygon (Orange) */}
          <polygon
            points="210,95 560,105 660,330 190,300"
            fill="rgba(245, 158, 11, 0.15)"
            stroke="#f59e0b"
            strokeWidth="3"
          />

          {/* Overlapping Discrepancy Hatch (Red) */}
          <polygon
            points="580,90 620,310 660,330 560,105"
            fill="url(#diff-hatch)"
            stroke="#ef4444"
            strokeWidth="2"
          />

          {/* Discrepancy Annotation */}
          <circle cx="605" cy="210" r="28" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
          <text x="605" y="214" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            +{diff.encroachmentDetectedAreaSqm} m²
          </text>

          <text x="380" y="190" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
            {parcel.name}
          </text>
          <text x="380" y="215" fill="#9ca3af" fontSize="11" fontFamily="monospace" textAnchor="middle">
            Diffeomorphic Boundary Shift: Δ {diff.boundaryShiftMaxMeters}m max
          </text>
        </svg>

        {/* Floating Metrics Overlay */}
        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-md">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Revenue RoR Area</div>
            <div className="text-sm font-bold text-blue-400 font-mono">
              {diff.revenueAreaHectares} Ha
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">18,450 sq.m (Registered)</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-md">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Drone Reality Area</div>
            <div className="text-sm font-bold text-amber-400 font-mono">
              {diff.droneSurveyAreaHectares} Ha
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">17,210 sq.m (SoI 5cm ORI)</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-md">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Area Deficit Mismatch</div>
            <div className="text-sm font-bold text-rose-400 font-mono">
              {diff.overlapMismatchPct}%
            </div>
            <div className="text-[10px] text-rose-500 font-mono">Δ 1,240 sq.m shortfall</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-md">
            <div className="text-[10px] text-zinc-400 font-mono uppercase">Encroachment Plinth</div>
            <div className="text-sm font-bold text-purple-400 font-mono">
              {diff.encroachmentDetectedAreaSqm} sq.m
            </div>
            <div className="text-[10px] text-purple-500 font-mono">Canal Servitude Crossing</div>
          </div>
        </div>
      </div>
    </div>
  );
}
