'use client';

import React from 'react';
import {
  Scale,
  Calendar,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';

export function LitigationTimeline() {
  const { getSelectedParcel } = useSpatialStore();
  const parcel = getSelectedParcel();

  if (!parcel) return null;

  const litigations = parcel.riskProfile.litigationStream;
  const mutations = parcel.riskProfile.mutationHistory;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* RCCMS Litigation Stream */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              RCCMS Judicial Disputes & Injunctions
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
            {litigations.length} Cases Filed
          </span>
        </div>

        {litigations.length > 0 ? (
          <div className="space-y-2.5">
            {litigations.map((lit) => (
              <div
                key={lit.id}
                className="p-3 rounded-lg border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                    {lit.caseNumber}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                    {lit.currentStatus}
                  </span>
                </div>

                <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {lit.petitioner} <span className="text-zinc-400">vs.</span> {lit.respondent}
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                  {lit.docketSummary}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-rose-200/40 dark:border-rose-900/40">
                  <span>Forum: {lit.forum.replace(/_/g, ' ')}</span>
                  <span>Filed: {lit.filingDate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <span>No pending civil or revenue litigation found in RCCMS index.</span>
          </div>
        )}
      </div>

      {/* Mutation (Ferfar) History Stream */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Registered Mutation (Ferfar) Audit Trail
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
            {mutations.length} Entries
          </span>
        </div>

        <div className="space-y-2.5">
          {mutations.map((mut, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {mut.mutationNumber}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    mut.status === 'Approved'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {mut.status}
                </span>
              </div>

              <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                Type: {mut.transactionType.replace(/_/g, ' ')}
              </div>

              <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Parties: {mut.partiesInvolved}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span>Sanction: {mut.approvalAuthority}</span>
                <span>Date: {mut.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
