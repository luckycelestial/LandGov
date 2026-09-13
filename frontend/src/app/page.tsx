"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Scale,
  ShieldCheck,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function OverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8001/api/v1/analytics/summary")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Using fallback analytics data:", err);
        setStats({
          kpi_metrics: {
            national_digitization_rate: 94.2,
            svamitva_coverage_pct: 75.7,
            dispute_density_index: 18.2,
            clear_title_pct: 81.8,
            total_parcels_indexed: 6,
            active_disputes_count: 2,
            disposed_disputes_count: 1,
            total_litigation_value_crores: 8.7,
            research_publications_count: 3,
            active_policy_reforms: 4,
            avg_dispute_resolution_months: 14.2
          },
          state_performance_ranking: [
            { state: "Maharashtra", digitization_pct: 98.4, svamitva_villages: 42100, dispute_rate: 4.1, score: 96 },
            { state: "Gujarat", digitization_pct: 97.8, svamitva_villages: 18200, dispute_rate: 4.8, score: 94 },
            { state: "Karnataka", digitization_pct: 96.5, svamitva_villages: 28900, dispute_rate: 5.2, score: 92 },
            { state: "Madhya Pradesh", digitization_pct: 95.9, svamitva_villages: 51000, dispute_rate: 6.1, score: 90 },
            { state: "Delhi (NCT)", digitization_pct: 94.2, svamitva_villages: 320, dispute_rate: 7.4, score: 88 },
            { state: "Uttar Pradesh", digitization_pct: 94.1, svamitva_villages: 92000, dispute_rate: 8.3, score: 87 },
          ],
          dispute_trend_monthly: [
            { month: "Oct 2025", filed: 1420, disposed: 1180 },
            { month: "Nov 2025", filed: 1390, disposed: 1250 },
            { month: "Dec 2025", filed: 1210, disposed: 1320 },
            { month: "Jan 2026", filed: 1150, disposed: 1410 },
            { month: "Feb 2026", filed: 1080, disposed: 1490 },
            { month: "Mar 2026", filed: 980, disposed: 1540 },
          ],
          land_use_breakdown: [
            { type: "Agricultural", area_pct: 54.2, color: "#10B981" },
            { type: "Forest & Ridge", area_pct: 21.8, color: "#059669" },
            { type: "Residential / Abadi", area_pct: 12.4, color: "#3B82F6" },
            { type: "Commercial / Industrial", area_pct: 7.1, color: "#F59E0B" },
            { type: "Wetlands & Waterbodies", area_pct: 4.5, color: "#06B6D4" },
          ]
        });
        setLoading(false);
      });
  }, []);

  const kpis = stats?.kpi_metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Department of Land Resources (DoLR)
              </span>
              <span className="text-xs text-slate-400">SIH 26019 Flagship Platform</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              National Land Governance & Policy Intelligence Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Real-time monitoring of <strong className="text-emerald-400">DILRMP</strong> cadastral digitization,{" "}
              <strong className="text-amber-400">SVAMITVA</strong> drone surveys, and AI-enabled dispute reduction modeling across India.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
            <ShieldCheck size={28} className="text-emerald-400" />
            <div>
              <div className="text-[11px] text-slate-400">Security & Integrity</div>
              <div className="text-xs font-bold text-slate-100">Bhu-Aadhaar ULPIN Synced</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>DILRMP Cadastral Digitization</span>
            <Building2 size={16} className="text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">
              {kpis.national_digitization_rate || 94.2}%
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> +2.4% YoY
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${kpis.national_digitization_rate || 94.2}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Computerized Record of Rights (RoR)</p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>SVAMITVA Village Coverage</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">
              {kpis.svamitva_coverage_pct || 75.7}%
            </span>
            <span className="text-[11px] font-bold text-emerald-400">4,92,400 Villages</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${kpis.svamitva_coverage_pct || 75.7}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Drone Survey & Property Cards Issued</p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Dispute Density Index</span>
            <Scale size={16} className="text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">
              {kpis.dispute_density_index || 18.2}%
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              <TrendingUp size={12} className="mr-0.5 rotate-180" /> -4.1% Drop
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${kpis.dispute_density_index || 18.2}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Active litigations per 1,000 parcels</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 space-y-2 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Dispute Disposal Velocity</span>
            <Clock size={16} className="text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">
              {kpis.avg_dispute_resolution_months || 14.2} Mo
            </span>
            <span className="text-[11px] font-bold text-emerald-400">Down from 24 Mo</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: "70%" }}></div>
          </div>
          <p className="text-[11px] text-slate-400">Average time to judgment / mediation</p>
        </div>
      </div>

      {/* Main Grid: State Rankings & Dispute Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Performance Leaderboard */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                State-Wise Land Governance Performance Index (2026)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated on RoR digitization, SVAMITVA village rollout, and dispute resolution speed
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
              National Ranking
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Rank & State</th>
                  <th className="py-2.5 px-3">Digitization</th>
                  <th className="py-2.5 px-3">SVAMITVA Villages</th>
                  <th className="py-2.5 px-3">Dispute Rate</th>
                  <th className="py-2.5 px-3 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {(stats?.state_performance_ranking || []).map((st: any, idx: number) => (
                  <tr key={st.state} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 flex items-center gap-2 font-bold text-slate-100">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                        idx === 1 ? "bg-slate-300/20 text-slate-200 border border-slate-300/40" :
                        idx === 2 ? "bg-amber-700/20 text-amber-400 border border-amber-700/40" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                      {st.state}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span>{st.digitization_pct}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${st.digitization_pct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">{st.svamitva_villages.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-amber-400">{st.dispute_rate}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {st.score} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Land Use & Ecological Zoning Breakdown */}
        <div className="glass-panel p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-400" />
              National Land Use (LULC)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Satellite Remote Sensing Ingestion</p>
          </div>

          <div className="space-y-3 pt-2">
            {(stats?.land_use_breakdown || []).map((lu: any) => (
              <div key={lu.type} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{lu.type}</span>
                  <span className="text-slate-100">{lu.area_pct}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${lu.area_pct}%`, backgroundColor: lu.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>AI Satellite Feed:</strong> 12,400 hectares of unauthorized agricultural-to-industrial conversions flagged in NCR buffer zones this month.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
