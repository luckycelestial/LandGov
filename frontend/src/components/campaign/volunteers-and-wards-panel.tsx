'use client';

import React, { useState } from 'react';
import {
  MOCK_VOLUNTEERS,
  DELHI_DISTRICTS_DATA,
  VolunteerMember,
} from '../../lib/data/delhi-data';
import { Map, Users, CheckCircle2, Phone, Clock, MapPin, Search } from 'lucide-react';

interface VolunteersAndWardsPanelProps {
  selectedDistrict: string | null;
  onSelectDistrict: (name: string | null) => void;
}

export function VolunteersAndWardsPanel({
  selectedDistrict,
}: VolunteersAndWardsPanelProps) {
  const [activeTab, setActiveTab] = useState<'volunteers' | 'coverage'>('volunteers');
  const [searchFilter, setSearchFilter] = useState('');

  const stats = selectedDistrict ? DELHI_DISTRICTS_DATA[selectedDistrict] : null;

  const districtVolunteers = selectedDistrict
    ? MOCK_VOLUNTEERS.filter((v) => v.district === selectedDistrict)
    : MOCK_VOLUNTEERS;

  const filteredVolunteers = searchFilter.trim()
    ? districtVolunteers.filter(
        (v) =>
          v.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          v.ward.toLowerCase().includes(searchFilter.toLowerCase()) ||
          v.district.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : districtVolunteers;

  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col flex-1 min-h-[300px]">
      {/* Top Tabs */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`pb-1 text-xs font-bold uppercase tracking-wider font-mono mr-6 transition-all relative ${
            activeTab === 'volunteers'
              ? 'text-zinc-900 dark:text-zinc-100 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-amber-500'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          VOLUNTEERS
        </button>

        <button
          onClick={() => setActiveTab('coverage')}
          className={`pb-1 text-xs font-bold uppercase tracking-wider font-mono transition-all relative ${
            activeTab === 'coverage'
              ? 'text-zinc-900 dark:text-zinc-100 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-amber-500'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          COVERAGE
        </button>
      </div>

      {/* Main Tab Body */}
      {!selectedDistrict ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
          <div className="text-3xl mb-2">🗺️</div>
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Click a district on the map
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Volunteers and ward-level metrics will appear here
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* District Summary Mini Bar */}
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {selectedDistrict} District
              </span>
              <div className="text-[10px] text-zinc-400">
                {stats?.coveredWards}/{stats?.totalWards} Wards Complete ({stats?.coveragePct}%)
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.volunteersActive} Active Volunteers
              </span>
            </div>
          </div>

          {activeTab === 'volunteers' ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto">
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{vol.name}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            vol.status === 'Covered'
                              ? 'bg-emerald-500'
                              : vol.status === 'Active'
                              ? 'bg-blue-500'
                              : 'bg-zinc-400'
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{vol.ward}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] text-zinc-400">
                      <div>{vol.phone}</div>
                      <div className="text-emerald-500">{vol.lastPing}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-400 text-xs">
                  No volunteer records found for this district.
                </div>
              )}
            </div>
          ) : (
            /* Coverage Tab */
            <div className="flex-1 space-y-2 overflow-y-auto text-xs font-mono">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">District Code:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats?.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Wards:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats?.totalWards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Wards Ground-Surveyed:</span>
                  <span className="font-bold text-emerald-500">{stats?.coveredWards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Remaining Pending:</span>
                  <span className="font-bold text-amber-500">{(stats?.totalWards || 0) - (stats?.coveredWards || 0)}</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans p-1">
                Ward-level boundary polygons are dynamically georeferenced from the Delhi Municipal Corporation (MCD) index.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
