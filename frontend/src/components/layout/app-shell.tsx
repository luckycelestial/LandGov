'use client';

import React from 'react';
import { CampaignIconRail } from './campaign-icon-rail';
import { CampaignTopBar } from './campaign-top-bar';
import { AppSidebar } from './app-sidebar';
import { RightInspectorPanel } from '../inspector/right-inspector-panel';
import { ChunkInspector } from '../sources/chunk-inspector';
import { UploadSourceDialog } from '../sources/upload-source-dialog';
import { useUIStore } from '../../lib/stores/use-ui-store';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { theme } = useUIStore();

  return (
    <div className={`w-screen h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="w-full h-full flex bg-[#f8fafc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
        {/* Left Icon Navigation Rail matching screenshot */}
        <CampaignIconRail />

        {/* Optional Collapsible NotebookLM Sources Sidebar */}
        <AppSidebar />

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <CampaignTopBar />
          <main className="flex-1 min-h-0 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Right Drawer: Contextual AI Copilot & ISO 19152 Inspector */}
        <RightInspectorPanel />

        {/* Global Modals */}
        <ChunkInspector />
        <UploadSourceDialog />
      </div>
    </div>
  );
}
