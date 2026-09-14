'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  SlidersHorizontal,
  ShieldAlert,
  FileCheck,
  Beaker,
  Map,
  BookOpen,
  Database,
  Globe,
  Search,
  Trophy,
  Settings,
  LogOut,
} from 'lucide-react';

const navIcons = [
  { icon: LayoutGrid, href: '/', label: 'Research Dashboard' },
  { icon: Map, href: '/gis-studio', label: 'GIS Spatial Studio' },
  { icon: SlidersHorizontal, href: '/simulation', label: 'Policy Simulation' },
  { icon: ShieldAlert, href: '/risk-triangulation', label: 'Dispute Analytics' },
  { icon: FileCheck, href: '/conclusive-titling', label: 'Conclusive Titling' },
  { icon: Globe, href: '/innovation-hub', label: 'Innovation Portal' },
  { icon: Database, href: '/data-repository', label: 'Data Repository' },
  { icon: Search, href: '/ai-search', label: 'AI Research Search' },
  { icon: BookOpen, href: '/knowledge-hub', label: 'Knowledge Hub' },
  { icon: Beaker, href: '/research-lab', label: 'Research Lab' },
  { icon: Trophy, href: '/innovation-hub', label: 'Grants & Hackathons' },
];

export function CampaignIconRail() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    // Outer wrapper: always takes w-14 in the flex layout so it never
    // displaces the main content. The inner aside absolutely positions
    // the expanded panel on top of content (overlay pattern).
    <div
      className="relative w-14 flex-shrink-0 h-screen z-40"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <aside
        className={`absolute inset-y-0 left-0 flex flex-col items-start py-3 justify-between bg-[#0d131f] text-zinc-400 border-r border-[#1a2333] shadow-2xl select-none transition-all duration-250 ease-in-out overflow-hidden ${
          isExpanded ? 'w-52 shadow-2xl shadow-black/40' : 'w-14'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-start gap-3 w-full px-2.5">
          <Link
            href="/"
            className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform flex-shrink-0"
            title="National Land Governance Platform"
          >
            <span className="tracking-tighter">ब</span>
          </Link>

          {/* Nav Items */}
          <div className="flex flex-col items-start gap-1 mt-2 w-full">
            {navIcons.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href && idx < 5;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all w-full min-w-0 ${
                    isActive
                      ? 'text-white bg-emerald-600/30 ring-1 ring-emerald-500/50'
                      : 'hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span
                    className={`text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${
                      isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom: Settings + Logout */}
        <div className="flex flex-col items-start gap-1 w-full px-2.5">
          <button
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors w-full"
            title="Settings"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span
              className={`text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
              }`}
            >
              Settings
            </span>
          </button>
          <button
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:text-rose-400 hover:bg-zinc-800/60 transition-colors w-full"
            title="Log out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span
              className={`text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
              }`}
            >
              Log Out
            </span>
          </button>
          <div className="w-2.5 h-1 rounded-full bg-emerald-400 mt-1 ml-2" />
        </div>
      </aside>
    </div>
  );
}
