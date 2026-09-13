"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Sparkles, UserCheck, Bell, Search, Globe, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, switchRole, personas } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "MINISTRY_OFFICIAL":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "STATE_SECRETARY":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "DISTRICT_MAGISTRATE":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "REVENUE_OFFICER":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "RESEARCHER":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-blue-600 flex items-center justify-center p-0.5 shadow-lg shadow-amber-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
              BHU
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-100 text-base tracking-tight">
              Bhu-Pravidha
            </span>
            <span className="text-xs px-2 py-0.5 font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
              SIH 26019
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Ministry of Rural Development • Department of Land Resources (DoLR)
          </p>
        </div>
      </div>

      {/* Global Controls & 1-Click Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Live Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>National Geospatial Node Live</span>
        </div>

        {/* 1-Click Persona / Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 px-2 text-xs text-slate-400 font-medium">
            <UserCheck size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Active Persona:</span>
          </div>

          <div className="relative">
            <select
              value={user.role}
              onChange={(e) => switchRole(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg px-3 py-1.5 pr-8 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
            >
              {personas.map((p) => (
                <option key={p.role} value={p.role}>
                  {p.role.replace("_", " ")} — {p.display_name.split(" ")[0]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
        </div>
      </div>
    </header>
  );
}
