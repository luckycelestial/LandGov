'use client';

import React from 'react';
import { WorkspaceSwitcher } from './workspace-switcher';
import { ULPINQuickSearch } from './ulpin-quick-search';
import { NavMain } from './nav-main';
import { NavSources } from '../sources/nav-sources';
import { NavUser } from './nav-user';
import { useUIStore } from '../../lib/stores/use-ui-store';

export function AppSidebar() {
  const { isSidebarOpen } = useUIStore();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-80 flex-shrink-0 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-30 transition-all">
      {/* Workspace Switcher */}
      <WorkspaceSwitcher />

      {/* 14-Digit Bhu-Aadhaar Quick Search */}
      <ULPINQuickSearch />

      {/* Workflows Navigation */}
      <NavMain />

      {/* Notebook Sources Drawer Tray */}
      <NavSources />

      {/* User Profile & Theme Settings Footer */}
      <NavUser />
    </aside>
  );
}
