'use client';

import React from 'react';
import { User, Sun, Moon, Shield, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '../../lib/stores/use-ui-store';

export function NavUser() {
  const { theme, toggleTheme, activeTier } = useUIStore();

  const getRoleTitle = () => {
    switch (activeTier) {
      case 'Central_DoLR':
        return 'National Titling Director';
      case 'State_Revenue_MH':
        return 'Title Registration Officer (TRO)';
      case 'Academic_Research_Lab':
        return 'Principal Spatial Econometrician';
    }
  };

  return (
    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm shadow-blue-500/20">
          TR
        </div>
        <div className="truncate">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
            <span>Dr. S. K. Joshi</span>
          </div>
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1 font-mono">
            <Shield className="w-2.5 h-2.5 text-emerald-500" />
            <span>{getRoleTitle()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>
    </div>
  );
}
