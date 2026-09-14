'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Sliders, RefreshCw } from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { getTFIBadgeColor, formatULPIN } from '../../lib/utils';
import { TFIWeights } from '../../lib/types/risk';

export function TFICalculator() {
  const { getSelectedParcel } = useSpatialStore();
  const parcel = getSelectedParcel();

  const [customWeights, setCustomWeights] = useState<TFIWeights>({
    wSpatial: 0.25,
    wRccms: 0.30,
    wMutGap: 0.15,
    wMortgage: 0.15,
    wEntropy: 0.15,
  });

  if (!parcel) return null;

  const comps = parcel.riskProfile.components;

  // Calculate dynamic TFI
  const computedTFI =
    customWeights.wSpatial * comps.dSpatial +
    customWeights.wRccms * comps.lRccms +
    customWeights.wMutGap * comps.mGap +
    customWeights.wMortgage * comps.eMortgage +
    customWeights.wEntropy * comps.jEntropy;

  const badge = getTFIBadgeColor(computedTFI);

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
      {/* Formula & Overall TFI Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Title Fragility Index ($TFI$) Engine
            </h3>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
            TFI = w₁·D_spatial + w₂·L_rccms + w₃·M_gap + w₄·E_mortgage + w₅·J_entropy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase">Calculated TFI</div>
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {computedTFI.toFixed(3)}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Component Breakdown Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          {
            key: 'wSpatial',
            label: 'D_spatial (Boundary Mismatch)',
            compVal: comps.dSpatial,
            weight: customWeights.wSpatial,
            desc: 'Drone vs cadastral area deficit & boundary shift',
            color: 'text-blue-500',
          },
          {
            key: 'wRccms',
            label: 'L_rccms (RCCMS Litigation)',
            compVal: comps.lRccms,
            weight: customWeights.wRccms,
            desc: 'Active status quo stays & inheritance suits',
            color: 'text-rose-500',
          },
          {
            key: 'wMutGap',
            label: 'M_gap (Mutation Lag)',
            compVal: comps.mGap,
            weight: customWeights.wMutGap,
            desc: 'Temporal gap in Virasat & Ferfar registration',
            color: 'text-amber-500',
          },
          {
            key: 'wMortgage',
            label: 'E_mortgage (Encumbrance Lien)',
            compVal: comps.eMortgage,
            weight: customWeights.wMortgage,
            desc: 'Bank loans & collateral attachment status',
            color: 'text-purple-500',
          },
          {
            key: 'wEntropy',
            label: 'J_entropy (Claimant Entropy)',
            compVal: comps.jEntropy,
            weight: customWeights.wEntropy,
            desc: 'Heir fragmentation & multi-tier jurisdiction',
            color: 'text-teal-500',
          },
        ].map((item) => (
          <div
            key={item.key}
            className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={`font-bold ${item.color} truncate`}>{item.label}</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {(item.compVal * 100).toFixed(0)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-rose-500 rounded-full"
                style={{ width: `${item.compVal * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Weight:</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                {(item.weight * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-snug">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
