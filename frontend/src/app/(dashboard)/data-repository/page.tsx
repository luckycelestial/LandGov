'use client';

import React, { useState } from 'react';
import { Database, Search, Filter, Download, FileText, Map, Scale, BookOpen, Tag, Calendar, Eye, ArrowUpRight } from 'lucide-react';

const DATASET_TYPES = ['All', 'Cadastral', 'Satellite', 'Policy', 'Legal', 'Socio-Economic', 'Climate'] as const;
type DatasetType = typeof DATASET_TYPES[number];

const DATASETS = [
  { id: 1, title: 'DILRMP 3.0 Cadastral Digitization Coverage — Delhi NCT', type: 'Cadastral', source: 'DoLR / MoRD', date: '2024-08', size: '2.3 GB', format: 'GeoPackage + PostGIS', views: 4821, tags: ['cadastral', 'DILRMP', 'Delhi'] },
  { id: 2, title: 'Sentinel-2 Multi-temporal LULC Stack 2019–2024 (Delhi)', type: 'Satellite', source: 'ISRO Bhuvan / ESA', date: '2024-07', size: '18.6 GB', format: 'COG GeoTIFF', views: 3142, tags: ['remote sensing', 'LULC', 'satellite'] },
  { id: 3, title: 'SVAMITVA Survey Drone Imagery — Rural Delhi Blocks', type: 'Cadastral', source: 'Survey of India', date: '2024-06', size: '41.2 GB', format: 'Orthomosaic + Shapefile', views: 2910, tags: ['SVAMITVA', 'drone', 'rural'] },
  { id: 4, title: 'Delhi Revenue Court Dispute Register 2015–2024', type: 'Legal', source: 'Delhi High Court / NIC', date: '2024-05', size: '890 MB', format: 'JSON + CSV', views: 5634, tags: ['disputes', 'legal', 'court', 'RCCMS'] },
  { id: 5, title: 'National Land Use Policy 2023 — Full Text & Clauses', type: 'Policy', source: 'MoRD / DoLR', date: '2024-01', size: '4.1 MB', format: 'PDF + XML', views: 7892, tags: ['policy', 'land use', 'national'] },
  { id: 6, title: 'Delhi Urban Heat Island & Climate Vulnerability Index', type: 'Climate', source: 'IMD / NDMA', date: '2024-03', size: '1.2 GB', format: 'NetCDF + GeoTIFF', views: 1876, tags: ['climate', 'urban heat', 'vulnerability'] },
  { id: 7, title: 'Census 2011 + SECC Land Holding Microdata — Delhi Wards', type: 'Socio-Economic', source: 'Census India / MoSPI', date: '2023-11', size: '340 MB', format: 'CSV + Parquet', views: 3250, tags: ['census', 'land holding', 'socio-economic'] },
  { id: 8, title: 'Transfer of Property Act & Registration Acts — Annotated', type: 'Legal', source: 'Ministry of Law', date: '2024-02', size: '12 MB', format: 'PDF + JSON-LD', views: 9211, tags: ['legal', 'property law', 'registration'] },
];

const TYPE_COLORS: Record<string, string> = {
  Cadastral: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Satellite: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Policy: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  Legal: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  'Socio-Economic': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
  Climate: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
};

export default function DataRepositoryPage() {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<DatasetType>('All');

  const filtered = DATASETS.filter((d) => {
    const matchType = activeType === 'All' || d.type === activeType;
    const matchQuery = !query || d.title.toLowerCase().includes(query.toLowerCase()) || d.tags.some(t => t.includes(query.toLowerCase()));
    return matchType && matchQuery;
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc] dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Centralized Data Repository</h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            National land governance datasets · Research publications · Policy documents · Geospatial archives
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-500/20 font-bold">{DATASETS.length} datasets</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">NDSAP compliant</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search datasets, tags, or sources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {DATASET_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${activeType === t ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Datasets', value: '2,847', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Geospatial Layers', value: '384', icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Policy Documents', value: '1,204', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Legal Databases', value: '291', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bg} rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center gap-3`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <div className="text-lg font-black text-zinc-800 dark:text-zinc-100">{stat.value}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((dataset) => (
          <div key={dataset.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${TYPE_COLORS[dataset.type]}`}>
                    {dataset.type}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">{dataset.format}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{dataset.size}</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {dataset.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1"><Database className="w-2.5 h-2.5" />{dataset.source}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{dataset.date}</span>
                  <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{dataset.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {dataset.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">
                      <Tag className="w-2 h-2" />{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                  <Download className="w-3 h-3" /> Access
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs hover:bg-zinc-50 transition-colors">
                  <ArrowUpRight className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No datasets match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
