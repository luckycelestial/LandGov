'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Compass,
  Lock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { formatULPIN } from '../../lib/utils';

export function TriageToolbar() {
  const { getSelectedParcel } = useSpatialStore();
  const parcel = getSelectedParcel();
  const [triageActionState, setTriageActionState] = useState<string | null>(null);

  if (!parcel) return null;

  const isFastTrackEligible = parcel.tfiScore < 0.25;

  const handleAction = (actionName: string) => {
    setTriageActionState(actionName);
    setTimeout(() => {
      alert(`Title Registration Action Dispatched: "${actionName}" for parcel ${parcel.name} (${formatULPIN(parcel.ulpin)}). Attestation written to state ledger.`);
      setTriageActionState(null);
    }, 400);
  };

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Triage Recommendation:
          </span>
          <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {parcel.riskProfile.recommendation}
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
          Title Registration Officer (TRO) Administrative Authority under Section 14
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isFastTrackEligible ? (
          <button
            onClick={() => handleAction('Fast-Track for Conclusive Title')}
            disabled={!!triageActionState}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Fast-Track for Conclusive Title (TFI &lt; 0.25)</span>
          </button>
        ) : (
          <button
            onClick={() => handleAction('Route to LDRO Mediation')}
            disabled={!!triageActionState}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm shadow-rose-600/30 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Route to LDRO Mediation (TFI ≥ 0.25)</span>
          </button>
        )}

        <button
          onClick={() => handleAction('Commission SoI Ground Re-Survey')}
          disabled={!!triageActionState}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all"
        >
          <Compass className="w-3.5 h-3.5 text-zinc-400" />
          <span>Order Ground Re-Survey</span>
        </button>

        <button
          onClick={() => handleAction('Freeze Title Mutation Register')}
          disabled={!!triageActionState}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium text-xs transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Freeze Title</span>
        </button>
      </div>
    </div>
  );
}
