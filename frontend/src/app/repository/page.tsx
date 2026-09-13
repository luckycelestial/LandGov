"use client";

import React, { useState, useEffect } from "react";
import { FolderArchive, FileText, Download, Search, Tag, BookOpen, ExternalLink, Filter } from "lucide-react";

export default function RepositoryPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"papers" | "policies">("papers");
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8001/api/v1/repository/papers")
      .then((res) => res.json())
      .then((data) => setPapers(data))
      .catch((err) => {
        console.warn("Using fallback research papers:", err);
        setPapers([
          {
            id: 1,
            title: "AI-Enabled Cadastral Boundary Extraction from Very High-Resolution Drone Imagery",
            authors: "Dr. Arishta Sen, Prof. K. Ramanathan",
            institution: "IIT Delhi & National Remote Sensing Centre (NRSC)",
            domain: "Geospatial AI",
            abstract: "This paper introduces a DeepLabV3+ with geometric regularization tailored for extracting agricultural field bunds from sub-decimeter drone surveys, reducing surveyor manual digitization time by 82%.",
            keywords: "Deep Learning, Cadastral Maps, SVAMITVA, Drone Surveys, Remote Sensing",
            publication_date: "2025-12-10",
            citation_count: 48,
            read_time_minutes: 12
          },
          {
            id: 2,
            title: "Evaluating the Macroeconomic Multiplier of Land Record Modernization in Rural India",
            authors: "Dr. M. R. Deshmukh, Vandana Chawla",
            institution: "NITI Aayog & Indira Gandhi Institute of Development Research",
            domain: "Land Law Economics",
            abstract: "Empirical analysis demonstrating that digital property titles increase formal agricultural credit disbursement by 24.3% and lower land litigation costs by 31% over a 3-year post-digitization horizon.",
            keywords: "Land Tenure, Rural Credit, Agricultural GDP, DILRMP, Economic Impact",
            publication_date: "2025-08-24",
            citation_count: 73,
            read_time_minutes: 15
          },
          {
            id: 3,
            title: "Climate Vulnerability Mapping for Sustainable Agro-Ecological Land Zoning",
            authors: "S. K. Verma, Dr. Elizabeth Thomas",
            institution: "Indian Institute of Science (IISc) Bengaluru",
            domain: "Climate Adaptation",
            abstract: "A spatial multi-criteria decision framework integrating 30-year IMD precipitation anomalies, soil degradation indices, and aquifer depletion rates to generate climate-resilient land zoning guidelines.",
            keywords: "Climate Resilience, LULC, Spatial Modeling, Agro-Ecology, Groundwater",
            publication_date: "2026-02-14",
            citation_count: 29,
            read_time_minutes: 10
          }
        ]);
      });

    fetch("http://localhost:8001/api/v1/repository/policies")
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch((err) => {
        console.warn("Using fallback policies:", err);
        setPolicies([
          {
            id: 1, policy_code: "SVAMITVA-2.0", title: "National Abadi Land Survey & Property Card Issuance",
            focus_domain: "SVAMITVA", status: "Enacted", target_year: 2026,
            description: "Drone-based spatial mapping across 6.5 lakh Indian villages to provide institutional credit access.",
            target_metric: "6,50,000 Villages", achieved_metric: "4,92,400 Villages (75.7%)", compliance_score: 92.4
          },
          {
            id: 2, policy_code: "DILRMP-INTEG", title: "Digital India Land Records Modernization Programme (Core)",
            focus_domain: "Cadastral Modernization", status: "Enacted", target_year: 2026,
            description: "100% computerization of RoR (Record of Rights), cadastral map digitization, and sub-registrar integration.",
            target_metric: "100% Cadastral Digitization", achieved_metric: "94.2% Nationwide", compliance_score: 88.0
          }
        ]);
      });
  }, []);

  const filteredPapers = papers.filter((p) => {
    const matchDomain = selectedDomain === "All" || p.domain === selectedDomain;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.keywords.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderArchive size={22} className="text-amber-400" />
            Centralized Land Research & Gazette Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Open-access repository for land administration research papers, policy briefs, gazettes, and cadastral case studies
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab("papers")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "papers" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400"
            }`}
          >
            Research Publications
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "policies" ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-slate-400"
            }`}
          >
            Statutory Gazettes & Reforms
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by title, keywords, authors, scheme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Research Domain:</span>
          {["All", "Geospatial AI", "Land Law Economics", "Climate Adaptation"].map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                selectedDomain === dom
                  ? "bg-slate-700 text-white border border-slate-600"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      {activeTab === "papers" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {paper.domain}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{paper.publication_date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-snug">{paper.title}</h3>
                <p className="text-xs text-slate-400 font-medium">By {paper.authors}</p>
                <p className="text-[11px] text-emerald-400 font-semibold">{paper.institution}</p>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mt-2">{paper.abstract}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Citations: {paper.citation_count}</span>
                <button
                  onClick={() => alert(`Downloading: ${paper.title}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((p) => (
            <div key={p.id} className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400">{p.policy_code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    {p.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{p.description}</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-right min-w-[200px]">
                <div className="text-[10px] text-slate-400 font-semibold">National Progress</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">{p.achieved_metric}</div>
                <div className="text-[10px] text-slate-500">Target: {p.target_metric}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
