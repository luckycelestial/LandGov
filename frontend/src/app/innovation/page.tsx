"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, Trophy, Calendar, Users, ArrowRight, PlusCircle, CheckCircle } from "lucide-react";

export default function InnovationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8001/api/v1/innovation/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => {
        console.warn("Using fallback innovation items:", err);
        setItems([
          {
            id: 1,
            item_type: "HACKATHON",
            title: "SIH 26019: National Land Governance AI Innovation Challenge",
            prize_amount: "₹ 10,00,000",
            deadline: "2026-11-30",
            status: "Open",
            description: "National software competition inviting student and start-up teams to build predictive dispute models and digital twin simulators.",
            eligibility: "Indian University Students, Startups & Research Scholars",
            submissions_count: 142
          },
          {
            id: 2,
            item_type: "RESEARCH_GRANT",
            title: "DoLR Applied Research Grant on Geospatial Policy 2026",
            prize_amount: "₹ 25,00,000 per Project",
            deadline: "2026-12-15",
            status: "Open",
            description: "Competitive research grants for academic institutions developing automated boundary conflict resolution and tenure security metrics.",
            eligibility: "Accredited Academic Institutions & Think Tanks",
            submissions_count: 38
          },
          {
            id: 3,
            item_type: "PILOT_PROJECT",
            title: "Smart Patwari Field Assistant - Multilingual Voice Pilot",
            prize_amount: "Pilot Stage (Phase II)",
            deadline: "2026-10-01",
            status: "Under Review",
            description: "Voice-first mobile interface testing across 50 tehsils in Rajasthan and Madhya Pradesh for field survey record updates.",
            eligibility: "State Revenue Departments in Collaboration with NIC",
            submissions_count: 12
          }
        ]);
      });
  }, []);

  const filteredItems = items.filter((item) => filter === "All" || item.item_type === filter);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DoLR Innovation Cell
            </span>
            <span className="text-xs text-slate-400">Smart Automation & Research Ecosystem</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            National Land Governance Innovation Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Accelerating breakthroughs in cadastral GIS, legal dispute NLP, and rural land tenure security through hackathons and research grants.
          </p>
        </div>

        <button
          onClick={() => alert("Application Portal: Please login with Institutional Credentials to submit grant proposal.")}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 hover:opacity-95"
        >
          <PlusCircle size={16} /> Submit Grant / Project Proposal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["All", "HACKATHON", "RESEARCH_GRANT", "PILOT_PROJECT"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div key={item.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.item_type.replace("_", " ")}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> {item.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Funding / Prize:</span>
                  <span className="font-bold text-amber-400">{item.prize_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-mono text-slate-200">{item.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Teams:</span>
                  <span className="font-bold text-blue-400">{item.submissions_count} Submissions</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert(`Opening registration for: ${item.title}`)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Guidelines & Register</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
