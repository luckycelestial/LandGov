"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Share2,
  Sparkles,
  Sliders,
  FolderArchive,
  Lightbulb,
  MessageSquareCode,
  Layers,
  FileCheck2,
} from "lucide-react";

export const NAVIGATION_ITEMS = [
  {
    name: "National Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: "Core",
  },
  {
    name: "GIS Cadastral Studio",
    href: "/gis",
    icon: MapPin,
    badge: "Spatial",
  },
  {
    name: "Knowledge Graph",
    href: "/graph",
    icon: Share2,
    badge: "Neo4j",
  },
  {
    name: "AI Policy Synthesizer",
    href: "/ai-rag",
    icon: Sparkles,
    badge: "RAG AI",
  },
  {
    name: "Policy Simulation Lab",
    href: "/simulation",
    icon: Sliders,
    badge: "What-If",
  },
  {
    name: "Research & Gazettes",
    href: "/repository",
    icon: FolderArchive,
    badge: "Archive",
  },
  {
    name: "National Innovation",
    href: "/innovation",
    icon: Lightbulb,
    badge: "Grants",
  },
  {
    name: "Citizen Voice & WhatsApp",
    href: "/citizen",
    icon: MessageSquareCode,
    badge: "Bot",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between py-4 px-3 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          Ecosystem Modules
        </div>

        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/20 to-emerald-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-amber-400"
                  }`}
                />
                <span>{item.name}</span>
              </div>

              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                }`}
              >
                {item.badge}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <FileCheck2 size={15} className="text-emerald-400" />
          <span>DoLR Open Data Node</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          National Land Records Modernization Programme (DILRMP) & SVAMITVA Sync Engine
        </p>
      </div>
    </aside>
  );
}
