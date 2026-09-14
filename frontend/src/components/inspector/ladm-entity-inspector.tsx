'use client';

import React from 'react';
import {
  Users,
  ShieldAlert,
  FileCheck,
  Scale,
  MapPin,
  Calendar,
  AlertTriangle,
  Building,
  DollarSign,
} from 'lucide-react';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';
import { formatULPIN, formatArea, getTFIBadgeColor } from '../../lib/utils';

export function LADMEntityInspector() {
  const { getSelectedParcel } = useSpatialStore();
  const parcel = getSelectedParcel();

  if (!parcel) {
    return (
      <div className="p-6 text-center text-zinc-400 text-xs flex flex-col items-center justify-center h-full">
        <MapPin className="w-8 h-8 mb-2 text-zinc-300 dark:text-zinc-700" />
        <p>No parcel selected.</p>
        <p className="text-[11px] text-zinc-500 mt-1">
          Click any cadastral boundary on the canvas or look up a Bhu-Aadhaar in the search bar.
        </p>
      </div>
    );
  }

  const tfiBadge = getTFIBadgeColor(parcel.tfiScore);
  const spatialUnit = parcel.spatialUnits[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
      {/* Top Identity Card */}
      <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/90 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
            ULPIN: {formatULPIN(parcel.ulpin)}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tfiBadge.bg} ${tfiBadge.text} ${tfiBadge.border} font-bold`}
          >
            TFI: {parcel.tfiScore.toFixed(3)}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {parcel.name}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            Village: {parcel.revenueVillage}, Tehsil: {parcel.tehsil}, {parcel.district} ({parcel.state})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-700 text-[11px] font-mono">
          <div>
            <span className="text-zinc-400">Title Status:</span>{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{parcel.titleStatus}</strong>
          </div>
          <div>
            <span className="text-zinc-400">Last Ferfar:</span>{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{parcel.lastMutationNumber}</strong>
          </div>
        </div>
      </div>

      {/* ISO 19152: LA_Party Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>LA_Party (Registered Stakeholders)</span>
        </div>
        <div className="space-y-1.5">
          {parcel.parties.map((party) => (
            <div
              key={party.id}
              className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 flex items-start justify-between"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  {party.name}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Role: {party.role} {party.sharePercentage ? `(${party.sharePercentage}% Share)` : ''}
                </div>
                <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                  ID: {party.nationalIdMasked} | {party.jurisdiction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ISO 19152: LA_RRR (Rights, Restrictions, Responsibilities) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5 text-indigo-500" />
          <span>LA_RRR (Rights, Restrictions & Liens)</span>
        </div>
        <div className="space-y-1.5">
          {parcel.rrrs.map((rrr) => {
            const isRestriction = rrr.type === 'Restriction';
            const isResponsibility = rrr.type === 'Responsibility';
            return (
              <div
                key={rrr.id}
                className={`p-2.5 rounded-lg border text-xs ${
                  isRestriction
                    ? 'border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20'
                    : isResponsibility
                    ? 'border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      isRestriction
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : isResponsibility
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {rrr.type}: {rrr.code}
                  </span>
                  {rrr.timeSpec?.startDate && (
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rrr.timeSpec.startDate}
                    </span>
                  )}
                </div>
                <p className="text-zinc-800 dark:text-zinc-200 text-[11px] leading-relaxed">
                  {rrr.description}
                </p>
                {rrr.encumbranceAmount && (
                  <div className="mt-1 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Lien Amount: {rrr.encumbranceAmount}
                  </div>
                )}
                {rrr.statutoryReference && (
                  <div className="mt-0.5 text-[9px] font-mono text-zinc-400">
                    Statute Ref: {rrr.statutoryReference}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ISO 19152: LA_SpatialUnit Diffeomorphism */}
      {spatialUnit && (
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              LA_SpatialUnit Geometry Audit
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Survey #{spatialUnit.surveyNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-zinc-400">Revenue RoR Area:</span>
              <div className="font-bold text-zinc-800 dark:text-zinc-200">
                {formatArea(spatialUnit.declaredAreaSqM)}
              </div>
            </div>
            <div>
              <span className="text-zinc-400">Drone Vector Area:</span>
              <div className="font-bold text-zinc-800 dark:text-zinc-200">
                {formatArea(spatialUnit.gisCalculatedAreaSqM)}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400">Boundary Discrepancy:</span>
            <span
              className={`font-bold ${
                spatialUnit.areaDiscrepancyPercentage > 3 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {spatialUnit.areaDiscrepancyPercentage}% mismatch
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
