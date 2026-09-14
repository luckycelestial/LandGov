'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Scale, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useSimulationStore } from '../../lib/stores/use-simulation-store';
import { formatCurrencyINR } from '../../lib/utils';

export function TreatmentEffects() {
  const { getActiveScenario } = useSimulationStore();
  const scenario = getActiveScenario();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center text-xs text-zinc-400 font-mono">
        Loading econometric projection charts...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Land Use Transition Breakdown */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              PLUS Cellular Automata Land Transition Forecast
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
            Horizon: {scenario.horizonYears} Years
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {scenario.landUseShifts.map((shift) => {
            const isNegative = shift.deltaPercent < 0;
            return (
              <div
                key={shift.category}
                className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60"
              >
                <div className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate mb-1">
                  {shift.category}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {shift.simulatedShare}%
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isNegative ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {isNegative ? '' : '+'}{shift.deltaPercent}%
                  </span>
                </div>
                <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                  Base: {shift.baselineShare}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Causal Treatment Effects Cards with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenario.causalEffects.map((effect, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {effect.metricName}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {effect.economicInterpretation}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  τ = {effect.tauEstimate > 0 ? `+${effect.tauEstimate.toLocaleString()}` : effect.tauEstimate}
                </span>
                <div className="text-[9px] font-mono text-zinc-400">
                  p-val: {effect.pVal} (p &lt; 0.01)
                </div>
              </div>
            </div>

            {/* Time Series Chart */}
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={effect.timeSeriesProjected} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-treated-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.15)" />
                  <XAxis dataKey="year" stroke="#888888" fontSize={10} font-mono tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} font-mono tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 18, 24, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="treated"
                    name="Treated (Simulated Policy)"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad-treated-${idx})`}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Counterfactual Baseline"
                    stroke="#9ca3af"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
