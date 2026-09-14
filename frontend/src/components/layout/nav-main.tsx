'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  SlidersHorizontal,
  ShieldAlert,
  FileCheck,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Research Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'DILRMP 3.0 KPIs, cadastral coverage & land governance scoreboard',
  },
  {
    title: 'GIS Spatial Studio',
    href: '/gis-studio',
    icon: SlidersHorizontal,
    badge: 'OGC WMS',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    description: 'Multi-layer cadastral, LULC & remote sensing viewer',
  },
  {
    title: 'Policy Simulation',
    href: '/simulation',
    icon: SlidersHorizontal,
    badge: 'Geo-CPSS',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    description: 'Cellular automata & Causal DML policy scenario sandbox',
  },
  {
    title: 'Dispute Analytics',
    href: '/risk-triangulation',
    icon: ShieldAlert,
    badge: 'TFI Engine',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    description: 'Land title fragility index & RCCMS litigation stream',
  },
  {
    title: 'Conclusive Titling',
    href: '/conclusive-titling',
    icon: FileCheck,
    badge: 'State Guarantee',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    description: 'Presumptive-to-conclusive title transition & indemnity fund',
  },
  {
    title: 'Data Repository',
    href: '/data-repository',
    icon: Trophy,
    badge: 'NDSAP',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    description: 'Centralized datasets, cadastral archives & policy documents',
  },
  {
    title: 'AI Research Search',
    href: '/ai-search',
    icon: Trophy,
    badge: 'RAG',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    description: 'Semantic vector search across 2,847 research publications',
  },
  {
    title: 'Knowledge Hub',
    href: '/knowledge-hub',
    icon: Trophy,
    badge: 'Open Access',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    description: 'Curated research, policy briefs & global case studies',
  },
  {
    title: 'Research Lab',
    href: '/research-lab',
    icon: Trophy,
    badge: 'Collab',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    description: 'Collaborative workspaces, notebooks & shared experiments',
  },
  {
    title: 'Innovation Portal',
    href: '/innovation-hub',
    icon: Trophy,
    badge: 'Grants',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    description: 'DoLR hackathons, research grants & pilot project incubators',
  },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <div className="px-3 py-2">
      <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
        <span>Platform Modules</span>
        <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
          <Sparkles className="w-2.5 h-2.5" />
          ISO 19152 LADM
        </span>
      </div>
      <nav className="mt-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                  }`}
                />
                <div className="min-w-0">
                  <div className="truncate">{item.title}</div>
                  {!isActive && (
                    <div className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate font-normal mt-0.5 leading-tight">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-white/20 text-white border-0' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
