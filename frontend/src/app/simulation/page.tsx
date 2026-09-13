"use client";

import React, { useState, useEffect } from "react";
import { Sliders, TrendingDown, DollarSign, Clock, ShieldCheck, Play, RotateCcw, AlertCircle } from "lucide-react";

export default function PolicySimulationPage() {
  const [droneCoverage, setDroneCoverage] = useState(85);
  const [fastTrackCourts, setFastTrackCourts] = useState(65);
  const [autoMutation, setAutoMutation] = useState(true);
  const [aiBoundaryValidation, setAiBoundaryValidation] = useState(true);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/api/v1/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drone_survey_coverage_pct: droneCoverage,
          fast_track_courts_adoption_pct: fastTrackCourts,
          auto_mutation_enactment: autoMutation,
          ai_boundary_validation: aiBoundaryValidation,
          projection_years: 5,
        }),
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.warn("Using fallback simulation data:", err);
      setSimulationResult({
        summary_outcomes: {
          dispute_reduction_pct: 72.4,
          projected_dispute_rate_pct: 5.0,
          capital_unlocked_crores: 12292.5,
          avg_case_disposal_months: 4.8,
          farmer_credit_growth_pct: 30.7,
          tenure_security_index_score: 88.2,
        },
        yearly_trajectory: [
          { year: "Year 1 (2026)", dispute_rate_pct: 15.6, credit_unlocked_cr: 2458.5, cases_disposed_thousands: 25.1 },
          { year: "Year 2 (2027)", dispute_rate_pct: 12.9, credit_unlocked_cr: 4917.0, cases_disposed_thousands: 36.1 },
          { year: "Year 3 (2028)", dispute_rate_pct: 10.3, credit_unlocked_cr: 7375.5, cases_disposed_thousands: 47.2 },
          { year: "Year 4 (2029)", dispute_rate_pct: 7.6, credit_unlocked_cr: 9834.0, cases_disposed_thousands: 58.2 },
          { year: "Year 5 (2030)", dispute_rate_pct: 5.0, credit_unlocked_cr: 12292.5, cases_disposed_thousands: 69.3 },
        ],
        policy_recommendations: [
          "Prioritize Drone Cadastral Surveys in high-density rural blocks to capture an estimated ₹12,292.5 Cr in formal collateral.",
          "Establish electronic pre-litigation mediation tribunals to bring average disposal time down to under 4.8 months.",
          "Activate API integration between Revenue and Sub-Registrar offices to prevent unauthorized multi-party encumbrances.",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [droneCoverage, fastTrackCourts, autoMutation, aiBoundaryValidation]);

  const out = simulationResult?.summary_outcomes || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders size={22} className="text-purple-400" />
          Policy Reform & Economic Impact "What-If" Simulation Sandbox
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate macroeconomic multipliers, court backlog reductions, and credit growth before enacting statutory changes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Interactive Policy Levers */}
        <div className="glass-panel p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Policy Control Levers
            </h2>
            <button
              onClick={() => {
                setDroneCoverage(85);
                setFastTrackCourts(65);
                setAutoMutation(true);
                setAiBoundaryValidation(true);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Lever 1 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Drone Cadastral Survey Coverage</span>
              <span className="text-amber-400 font-bold">{droneCoverage}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={droneCoverage}
              onChange={(e) => setDroneCoverage(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-slate-500">Accelerates SVAMITVA village drone parcel mapping</p>
          </div>

          {/* Lever 2 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Fast-Track Revenue Court Adoption</span>
              <span className="text-blue-400 font-bold">{fastTrackCourts}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fastTrackCourts}
              onChange={(e) => setFastTrackCourts(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-[10px] text-slate-500">Digital summary hearings & e-Summons compliance</p>
          </div>

          {/* Toggle 1 */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Automatic Deed-to-Mutation Link</div>
              <div className="text-[10px] text-slate-500">Auto-triggers mutation on Sub-Registrar deed filing</div>
            </div>
            <input
              type="checkbox"
              checked={autoMutation}
              onChange={(e) => setAutoMutation(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Toggle 2 */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">AI Pre-Registration Boundary Check</div>
              <div className="text-[10px] text-slate-500">Prevents sale of overlapping or contested parcels</div>
            </div>
            <input
              type="checkbox"
              checked={aiBoundaryValidation}
              onChange={(e) => setAiBoundaryValidation(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right 2 Cols: Projected Outcomes & Yearly Trajectory */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown size={16} className="text-emerald-400" />
              Projected 5-Year Reform Outcomes
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              Econometric Model v4.2
            </span>
          </div>

          {/* 4 Outcome Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold">Dispute Reduction</div>
              <div className="text-xl font-black text-emerald-400">-{out.dispute_reduction_pct || 72.4}%</div>
              <div className="text-[10px] text-slate-500">Down to {out.projected_dispute_rate_pct || 5.0}%</div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold">Capital Unlocked</div>
              <div className="text-xl font-black text-amber-400">₹{out.capital_unlocked_crores || "12,292"} Cr</div>
              <div className="text-[10px] text-slate-500">Rural Credit Collateral</div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold">Avg Case Disposal</div>
              <div className="text-xl font-black text-blue-400">{out.avg_case_disposal_months || 4.8} Mo</div>
              <div className="text-[10px] text-slate-500">Down from 18 Months</div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold">Tenure Security Index</div>
              <div className="text-xl font-black text-purple-400">{out.tenure_security_index_score || 88.2} / 100</div>
              <div className="text-[10px] text-slate-500">Viksit Bharat Benchmark</div>
            </div>
          </div>

          {/* Yearly Trajectory Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase">Yearly Impact Trajectory</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Timeline</th>
                    <th className="py-2 px-3">Dispute Rate</th>
                    <th className="py-2 px-3">Cumulative Collateral</th>
                    <th className="py-2 px-3 text-right">Disposed Litigations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {(simulationResult?.yearly_trajectory || []).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 font-bold text-slate-100">{row.year}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">{row.dispute_rate_pct}%</td>
                      <td className="py-2 px-3 text-amber-400">₹{row.credit_unlocked_cr.toLocaleString()} Cr</td>
                      <td className="py-2 px-3 text-right">{row.cases_disposed_thousands}k Cases</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Policy Takeaways */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertCircle size={14} /> Strategic Reform Takeaways:
            </div>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              {(simulationResult?.policy_recommendations || []).map((rec: string, i: number) => (
                <li key={i} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
