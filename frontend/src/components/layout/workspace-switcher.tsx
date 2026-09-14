'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown, Check, Shield, Landmark, GraduationCap } from 'lucide-react';
import { useUIStore, OperationalTier } from '../../lib/stores/use-ui-store';

interface TierOption {
  id: OperationalTier;
  name: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

const TIERS: TierOption[] = [
  {
    id: 'Central_DoLR',
    name: 'Ministry of Rural Dev / DoLR',
    sub: 'National Land Governance & DILRMP 3.0 Tier',
    icon: Landmark,
    badge: 'National Core',
  },
  {
    id: 'State_Revenue_MH',
    name: 'Dept of Revenue - Maharashtra',
    sub: 'Settlement Commissioner / Pune District',
    icon: Shield,
    badge: 'State Nodal',
  },
  {
    id: 'Academic_Research_Lab',
    name: 'N-LRSI Policy Research Sandbox',
    sub: 'Academic / Causal Econometrics Lab',
    icon: GraduationCap,
    badge: 'Researcher',
  },
];

export function WorkspaceSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeTier, setActiveTier } = useUIStore();

  const current = TIERS.find((t) => t.id === activeTier) || TIERS[1];
  const IconComponent = current.icon;

  return (
    <div className="relative p-3 border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
              {current.name}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
              {current.sub}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1.5 overflow-hidden">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Switch Operational Tier
            </div>
            {TIERS.map((tier) => {
              const TierIcon = tier.icon;
              const isSelected = tier.id === activeTier;
              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    setActiveTier(tier.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TierIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                    <div className="truncate">
                      <div className={`text-xs font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {tier.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{tier.badge}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
