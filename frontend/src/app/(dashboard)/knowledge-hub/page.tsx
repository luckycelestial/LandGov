'use client';

import React, { useState } from 'react';
import { BookOpen, Search, Award, Globe, FileText, Users, ExternalLink, TrendingUp, Star, Calendar, ArrowUpRight } from 'lucide-react';

const CATEGORIES = ['All', 'Policy Briefs', 'Research Papers', 'Case Studies', 'Best Practices', 'Data Guides'] as const;

const KNOWLEDGE_ITEMS = [
  {
    title: 'DILRMP 3.0 Implementation Guide for State Revenue Departments',
    category: 'Policy Briefs',
    author: 'Department of Land Resources, DoLR',
    date: 'Aug 2024',
    reads: 12840,
    rating: 4.9,
    tags: ['DILRMP', 'implementation', 'revenue department'],
    summary: 'Comprehensive guide for state nodal agencies to execute the Digital India Land Records Modernization Programme Phase 3.0, covering workflow digitization, ULPIN adoption, and sub-registrar integration.',
  },
  {
    title: 'SVAMITVA Scheme: Outcomes & Lessons from 5 States',
    category: 'Case Studies',
    author: 'N-LRSI Policy Research Sandbox',
    date: 'Jul 2024',
    reads: 9321,
    rating: 4.7,
    tags: ['SVAMITVA', 'rural', 'property rights', 'case study'],
    summary: 'Comparative analysis of SVAMITVA implementation across MP, UP, Uttarakhand, Karnataka, and Maharashtra — documenting legal empowerment outcomes, dispute reduction, and credit access for rural households.',
  },
  {
    title: 'OGC Standards for Interoperable Land Administration Systems',
    category: 'Data Guides',
    author: 'Open Geospatial Consortium / Survey of India',
    date: 'Jun 2024',
    reads: 6102,
    rating: 4.6,
    tags: ['OGC', 'WMS', 'WFS', 'interoperability', 'GIS'],
    summary: 'Technical guide to implementing WMS, WFS, and WMTS services for cadastral data publication, ensuring compatibility with the National Spatial Data Infrastructure (NSDI) and PM GatiShakti portal.',
  },
  {
    title: 'ISO 19152 LADM Ontology for Indian Revenue Records',
    category: 'Data Guides',
    author: 'National Remote Sensing Centre (NRSC)',
    date: 'May 2024',
    reads: 4891,
    rating: 4.5,
    tags: ['LADM', 'ISO 19152', 'ontology', 'cadastral'],
    summary: 'Mapping of the Land Administration Domain Model to Indian revenue record structure including Khata, Khasra, RoR, and mutation workflows across multiple state codifications.',
  },
  {
    title: 'World Bank: Comparative Land Governance Index — South Asia 2024',
    category: 'Research Papers',
    author: 'World Bank Land Group / FAO',
    date: 'Apr 2024',
    reads: 18432,
    rating: 4.8,
    tags: ['World Bank', 'comparative', 'South Asia', 'governance index'],
    summary: 'India ranks 67th on the Global Land Governance Index 2024, with strong scores on digitization (81/100) but lower performance on dispute resolution speed (42/100) and conclusive title adoption (38/100).',
  },
  {
    title: 'Resolving Urban Land Disputes: Delhi High Court Precedents 2018–2024',
    category: 'Case Studies',
    author: 'Delhi Judicial Academy / NIC',
    date: 'Mar 2024',
    reads: 7245,
    rating: 4.4,
    tags: ['court precedents', 'Delhi', 'disputes', 'legal'],
    summary: 'Curated digest of 340 significant Delhi High Court judgments on land title disputes, adverse possession, mutations, and unauthorized construction — with key legal principles extracted for practitioner use.',
  },
];

export default function KnowledgeHubPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filtered = KNOWLEDGE_ITEMS.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchQ = !query || item.title.toLowerCase().includes(query.toLowerCase()) || item.tags.some(t => t.includes(query.toLowerCase()));
    return matchCat && matchQ;
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc] dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Knowledge Hub</h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Curated research · Policy briefs · Case studies · Best practices for land governance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded font-mono font-bold">
            Open Access
          </span>
          <span className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">
            Peer Reviewed
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Publications', value: '3,204', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Contributors', value: '847', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Case Studies', value: '412', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Cited Works', value: '18.4K', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bg} rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center gap-3`}>
              <Icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              <div>
                <div className="text-lg font-black text-zinc-800 dark:text-zinc-100">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${activeCategory === c ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-800/30">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>{item.reads.toLocaleString()} reads</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mb-2">
                  {item.author} · <span className="flex items-center gap-1 inline-flex"><Calendar className="w-2.5 h-2.5 inline" />{item.date}</span>
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">{item.summary}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">{tag}</span>
                  ))}
                </div>
              </div>
              <button className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors">
                <ExternalLink className="w-3 h-3" /> Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
