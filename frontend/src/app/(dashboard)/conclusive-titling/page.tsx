'use client';

import React from 'react';
import {
  FileCheck,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  DollarSign,
  Scale,
} from 'lucide-react';
import { useSpatialStore } from '../../../lib/stores/use-spatial-store';
import { formatULPIN, getTFIBadgeColor } from '../../../lib/utils';

export default function ConclusiveTitlingPage() {
  const { parcels, selectedUlpin, setSelectedUlpin } = useSpatialStore();

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              State Land Title Guarantee Framework
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              NITI Aayog Model Land Titling Act Transition Pipeline
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Presumptive to Conclusive Titling Transition Tracker
          </h1>
        </div>
      </div>

      {/* Actuarial Title Guarantee Indemnity Fund Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span>Land Title Guarantee Fund (LTGF)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            ₹4,850 Crore
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Actuarial corpus reserve for state-backed indemnification
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span>Provisional Notification Window</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            36 Months
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Statutory objection period prior to absolute conclusive finality
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span>Title Registration Officers (TRO)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            184 Active Benches
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Authorized for boundary rectification & title conferment
          </p>
        </div>
      </div>

      {/* Transition Pipeline Stages */}
      <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Four-Stage Conclusive Titling Graduation Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400">
              <span>STAGE 1</span>
              <span className="text-blue-500">100% Complete</span>
            </div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">Presumptive Index</div>
            <p className="text-[10px] text-zinc-500">Record of Rights (7/12) & cadastral vector integration.</p>
          </div>

          <div className="p-3 rounded-lg border border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
              <span>STAGE 2</span>
              <span>In Progress (78%)</span>
            </div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">Boundary Rectification</div>
            <p className="text-[10px] text-zinc-500">SoI drone photogrammetry & diffeomorphic audit.</p>
          </div>

          <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
              <span>STAGE 3</span>
              <span>Notice Period</span>
            </div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">Provisional Title Notice</div>
            <p className="text-[10px] text-zinc-500">Gazette publication & LDRO dispute resolution window.</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <span>STAGE 4</span>
              <span>State Guaranteed</span>
            </div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">Conclusive Title Register</div>
            <p className="text-[10px] text-zinc-500">Indefeasible title backed by state guarantee fund.</p>
          </div>
        </div>
      </div>

      {/* Parcel Evaluation Table */}
      <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Pilot Batch Titling Readiness Evaluation (Pune District)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
                <th className="p-3 text-left font-semibold">ULPIN / Survey No</th>
                <th className="p-3 text-left font-semibold">Titleholder</th>
                <th className="p-3 text-left font-semibold">Current State</th>
                <th className="p-3 text-center font-semibold">TFI Score</th>
                <th className="p-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {parcels.map((parcel) => {
                const badge = getTFIBadgeColor(parcel.tfiScore);
                const isSelected = parcel.ulpin === selectedUlpin;
                return (
                  <tr
                    key={parcel.ulpin}
                    onClick={() => setSelectedUlpin(parcel.ulpin)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 font-semibold'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <td className="p-3 text-blue-600 dark:text-blue-400">
                      <div>{formatULPIN(parcel.ulpin)}</div>
                      <div className="text-[10px] text-zinc-400">{parcel.name}</div>
                    </td>
                    <td className="p-3 text-zinc-800 dark:text-zinc-200">
                      {parcel.parties[0]?.name || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                        {parcel.titleStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border} text-[10px] font-bold`}
                      >
                        {parcel.tfiScore}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-zinc-500 text-[11px]">
                        {parcel.riskProfile.recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
