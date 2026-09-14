'use client';

import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, FileText, Scale, Map, ArrowUpRight, Clock, TrendingUp, Cpu, Filter } from 'lucide-react';

const SEARCH_SUGGESTIONS = [
  'land title dispute resolution Delhi',
  'SVAMITVA scheme impact assessment',
  'cadastral digitization DILRMP 3.0',
  'climate vulnerability agricultural land',
  'urban encroachment detection satellite',
];

const SEARCH_RESULTS = [
  {
    title: 'Evaluating DILRMP 3.0 Outcomes: Cadastral Accuracy and Title Security in Urban Delhi',
    authors: 'Kumar, S., Sharma, P., Reddy, V.K.',
    source: 'Journal of Land Administration, Vol. 14(2), 2024',
    relevance: 97,
    type: 'Research Paper',
    tags: ['DILRMP', 'cadastral', 'title security'],
    excerpt: 'This study evaluates the accuracy and completeness of cadastral records digitized under DILRMP 3.0 across 11 districts of Delhi NCT, using a multi-criteria spatial verification framework...',
  },
  {
    title: 'Predicting Land Dispute Hotspots Using Machine Learning on Revenue Court Docket Data',
    authors: 'Singh, A., Mehta, R.',
    source: 'NRSA Spatial Informatics Review, 2023',
    relevance: 94,
    type: 'Research Paper',
    tags: ['disputes', 'ML', 'prediction', 'court'],
    excerpt: 'A Random Forest classifier trained on 15 years of revenue court dockets identifies spatial clusters of title dispute probability with 89% precision at the ward level...',
  },
  {
    title: 'National Land Use Policy 2023 — Key Provisions for Urban-Rural Fringe Management',
    authors: 'Department of Land Resources, MoRD',
    source: 'GoI Gazette Notification, January 2024',
    relevance: 91,
    type: 'Policy Document',
    tags: ['policy', 'land use', 'urban-rural'],
    excerpt: 'Section 4(3) mandates the establishment of buffer zoning protocols at urban-rural fringe areas to prevent unplanned agricultural land conversion exceeding 5% annually...',
  },
  {
    title: 'Detecting Unauthorized Encroachments Using Multi-temporal Sentinel-2 LULC Analysis',
    authors: 'Iyer, M., Patel, K., National Remote Sensing Centre',
    source: 'ISRO Technical Report TR/NRSC/2024-08',
    relevance: 88,
    type: 'Technical Report',
    tags: ['remote sensing', 'encroachment', 'LULC'],
    excerpt: 'Change detection analysis between 2019 and 2024 Sentinel-2 imagery reveals 12,400 hectares of suspected unauthorized encroachment across peri-urban zones of Delhi...',
  },
  {
    title: 'Women Land Rights and Inheritance Patterns in Delhi: A Longitudinal Study',
    authors: 'Rao, G., Krishnan, N., IIM Ahmedabad',
    source: 'Economic & Political Weekly, Vol. 59(18), 2024',
    relevance: 82,
    type: 'Research Paper',
    tags: ['gender', 'land rights', 'inheritance'],
    excerpt: 'Analysis of 40,000 mutation records (2010–2023) reveals that women hold only 11.3% of sole-owned land parcels in Delhi, with significant variation by district and community...',
  },
];

const TYPE_STYLES: Record<string, string> = {
  'Research Paper': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  'Policy Document': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'Technical Report': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
};

export default function AIResearchSearchPage() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (q?: string) => {
    const finalQuery = q || query;
    if (!finalQuery.trim()) return;
    setQuery(finalQuery);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc] dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">AI Research Search</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Semantic vector search across 2,847 research papers, policies, legal documents & geospatial datasets
          </p>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Ask anything about land governance, cadastral data, policy impacts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
          />
          <button
            onClick={() => handleSearch()}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Search</span>
          </button>
        </div>

        {/* Suggestions */}
        {!hasSearched && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[10px] text-zinc-400 font-mono pt-1">Try:</span>
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {!hasSearched && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Research Papers', count: '2,847', icon: BookOpen, color: 'text-blue-600' },
            { label: 'Policy Documents', count: '1,204', icon: FileText, color: 'text-amber-600' },
            { label: 'Legal Databases', count: '291', icon: Scale, color: 'text-purple-600' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{stat.count}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <div className="text-sm text-zinc-500">Running semantic vector search + RAG synthesis...</div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <Cpu className="w-3 h-3" />
            <span>Embedding query · Searching pgvector · Ranking BM25 + semantic score</span>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && !isSearching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {SEARCH_RESULTS.length} results for <em className="text-blue-600 not-italic">"{query}"</em>
              </span>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 hover:bg-zinc-50">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>

          {SEARCH_RESULTS.map((result, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${TYPE_STYLES[result.type] || ''}`}>
                      {result.type}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                      <span className="text-zinc-400">Relevance:</span>
                      <span className={`font-bold ${result.relevance > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{result.relevance}%</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                    {result.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono mb-2">{result.authors} · {result.source}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">{result.excerpt}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {result.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                    <ArrowUpRight className="w-3 h-3" /> Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
