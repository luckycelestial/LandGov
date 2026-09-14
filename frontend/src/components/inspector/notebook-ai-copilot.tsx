'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  ExternalLink,
  MapPin,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useCopilotStore, CopilotCitation } from '../../lib/stores/use-copilot-store';
import { useNotebookSources } from '../../lib/stores/use-notebook-sources';
import { useSpatialStore } from '../../lib/stores/use-spatial-store';

export function NotebookAICopilot() {
  const { messages, isThinking, sendMessage, clearHistory } = useCopilotStore();
  const { selectedCount, getSelectedSources } = useNotebookSources();
  const { setSelectedUlpin } = useSpatialStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedSources = getSelectedSources();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  const handleCitationClick = (citation: CopilotCitation) => {
    if (citation.ulpinTarget) {
      setSelectedUlpin(citation.ulpinTarget);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50">
      {/* Grounding Status Bar */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">
            Grounded RAG Context
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {selectedCount} Sources Active
          </span>
        </div>

        <button
          onClick={clearHistory}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1"
          title="Reset conversation"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                  isUser
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-xl p-3.5 shadow-sm space-y-2.5 ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Citations Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 space-y-1.5">
                    <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                      Grounding Citations & Sources
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.id}
                          onClick={() => handleCitationClick(cit)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-[10px] font-mono group text-left"
                        >
                          <Paperclip className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                          <span className="font-semibold truncate max-w-[140px]">
                            {cit.sourceTitle}
                          </span>
                          {cit.pageOrClause && (
                            <span className="text-zinc-400">({cit.pageOrClause})</span>
                          )}
                          {cit.ulpinTarget && (
                            <MapPin className="w-2.5 h-2.5 text-emerald-500 ml-1 group-hover:scale-125 transition-transform" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 text-xs text-zinc-400 items-center">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center animate-spin">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span>Synthesizing legal & spatial vector chunks...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[10px] border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40">
        {[
          'Audit Gat 44/2A Title Fragility',
          'Summarize Stay Order PN-2025-884',
          'Check SoI Drone Boundary Mismatch',
        ].map((promptText) => (
          <button
            key={promptText}
            onClick={() => sendMessage(promptText)}
            className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 whitespace-nowrap transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot about legal codes, titles, mutations..."
            className="w-full bg-transparent border-none outline-none text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 px-2 font-mono"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-sm shadow-blue-600/20 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
